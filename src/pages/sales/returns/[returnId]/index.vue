<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReturnStore } from '@/stores/sales/returnStore'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import type { OrderReturn } from '@/types/models/sales/order-return'
import { formatCurrency, formatDateTime, translateStatus } from '@/utils/common'

const route = useRoute()
const router = useRouter()
const returnStore = useReturnStore()
const confirmDialogStore = useConfirmDialogStore()

const returnId = route.params.returnId as string
const returnData = ref<OrderReturn | null>(null)
const isLoading = ref(false)

// Dialog states
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showCompleteDialog = ref(false)
const rejectReason = ref('')
const rejectNotes = ref('')

const loadReturn = async () => {
  isLoading.value = true
  try {
    returnData.value = await returnStore.fetchReturnById(returnId)
  }
  catch (error) {
    console.error('Failed to load return:', error)
  }
  finally {
    isLoading.value = false
  }
}

// Computed
const canApprove = computed(() => returnData.value?.status === 'PENDING')
const canReject = computed(() => ['PENDING', 'APPROVED'].includes(returnData.value?.status || ''))
const canCancel = computed(() => ['PENDING', 'APPROVED'].includes(returnData.value?.status || ''))
const canComplete = computed(() => ['APPROVED', 'RECEIVED', 'INSPECTED'].includes(returnData.value?.status || ''))
const canDelete = computed(() => ['PENDING', 'CANCELLED', 'REJECTED'].includes(returnData.value?.status || ''))

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'info',
    RECEIVED: 'info',
    INSPECTED: 'info',
    COMPLETED: 'success',
    REJECTED: 'error',
    CANCELLED: 'secondary',
  }

  return colors[status] || 'secondary'
}

const getReasonLabel = (reason: string) => {
  const map: Record<string, string> = {
    DAMAGED: 'Barang Rusak',
    WRONG_ITEM: 'Salah Barang',
    EXPIRED: 'Kadaluarsa',
    CUSTOMER_REQUEST: 'Permintaan Pelanggan',
    OTHER: 'Lainnya',
  }

  return map[reason] || reason
}

const getConditionLabel = (condition: string) => {
  const map: Record<string, string> = {
    GOOD: 'Baik',
    DAMAGED: 'Rusak',
    OPENED: 'Terbuka',
    EXPIRED: 'Kadaluarsa',
  }

  return map[condition] || condition
}

// Actions
const handleApprove = async () => {
  showApproveDialog.value = false
  isLoading.value = true
  try {
    await returnStore.approveReturn(returnId)
    await loadReturn()
  }
  catch (error: any) {
    alert(error.message || 'Gagal menyetujui retur')
  }
  finally {
    isLoading.value = false
  }
}

const handleReject = async () => {
  if (!rejectReason.value) {
    alert('Mohon isi alasan penolakan')

    return
  }

  showRejectDialog.value = false
  isLoading.value = true
  try {
    await returnStore.rejectReturn(returnId, {
      reason: rejectReason.value,
      notes: rejectNotes.value || undefined,
    })
    await loadReturn()
    rejectReason.value = ''
    rejectNotes.value = ''
  }
  catch (error: any) {
    alert(error.message || 'Gagal menolak retur')
  }
  finally {
    isLoading.value = false
  }
}

const handleCancel = async () => {
  const confirmed = await confirmDialogStore.openGenericDialog(
    'Apakah Anda yakin ingin membatalkan retur ini?',
    {
      title: 'Batalkan Retur',
      confirmText: 'Ya, Batalkan',
      cancelText: 'Tidak',
      color: 'warning',
    },
  )

  if (!confirmed)
    return

  isLoading.value = true
  try {
    await returnStore.cancelReturn(returnId)
    await loadReturn()
  }
  catch (error: any) {
    alert(error.message || 'Gagal membatalkan retur')
  }
  finally {
    isLoading.value = false
  }
}

const handleComplete = async () => {
  showCompleteDialog.value = false
  isLoading.value = true
  try {
    await returnStore.completeReturn(returnId)
    await loadReturn()
  }
  catch (error: any) {
    alert(error.message || 'Gagal menyelesaikan retur')
  }
  finally {
    isLoading.value = false
  }
}

const handleDelete = async () => {
  const confirmed = await confirmDialogStore.openGenericDialog(
    'Apakah Anda yakin ingin menghapus retur ini? Tindakan ini tidak dapat dibatalkan.',
    {
      title: 'Hapus Retur',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      color: 'error',
    },
  )

  if (!confirmed)
    return

  isLoading.value = true
  try {
    await returnStore.deleteReturn(returnId)
    router.push('/sales/returns')
  }
  catch (error: any) {
    alert(error.message || 'Gagal menghapus retur')
    isLoading.value = false
  }
}

onMounted(() => {
  loadReturn()
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="text-center pa-6"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>

    <!-- Content -->
    <div v-else-if="returnData">
      <!-- Header -->
      <VCard class="mb-6">
        <VCardText class="d-flex justify-space-between align-center pa-5">
          <div>
            <div class="d-flex align-center gap-3 mb-2">
              <VBtn
                icon="tabler-arrow-left"
                variant="text"
                @click="router.push('/sales/returns')"
              />
              <h3 class="text-h4 font-weight-bold">
                {{ returnData.returnNumber }}
              </h3>
              <VChip
                :color="getStatusColor(returnData.status)"
                size="small"
              >
                {{ translateStatus(returnData.status) }}
              </VChip>
            </div>
            <div class="text-body-2 text-medium-emphasis me-12">
              Dibuat pada {{ formatDateTime(returnData.createdAt) }}
            </div>
          </div>
        </VCardText>
      </VCard>

      <VRow>
        <!-- Left Col: Info & Items -->
        <VCol
          cols="12"
          md="9"
        >
          <!-- Return Info Card -->
          <VCard class="mb-6">
            <VCardTitle>Informasi Retur</VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Kode Order
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ returnData.order?.orderCode || '-' }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Alasan
                    </div>
                    <div class="text-body-1">
                      {{ returnData.reason ? getReasonLabel(returnData.reason) : '-' }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Dibuat Oleh
                    </div>
                    <div class="text-body-1">
                      {{ returnData.createdByUser?.name || '-' }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Total Refund
                    </div>
                    <div class="text-body-1 font-weight-bold text-primary">
                      {{ formatCurrency(returnData.refundAmount || 0) }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Status Refund
                    </div>
                    <div class="text-body-1">
                      <VChip size="small">
                        {{ translateStatus(returnData.refundStatus) }}
                      </VChip>
                    </div>
                  </div>
                  <div
                    v-if="returnData.approvedAt"
                    class="mb-4"
                  >
                    <div class="text-caption text-medium-emphasis">
                      Disetujui Pada
                    </div>
                    <div class="text-body-1">
                      {{ formatDateTime(returnData.approvedAt) }}
                    </div>
                  </div>
                  <div
                    v-if="returnData.completedAt"
                    class="mb-4"
                  >
                    <div class="text-caption text-medium-emphasis">
                      Diselesaikan Pada
                    </div>
                    <div class="text-body-1">
                      {{ formatDateTime(returnData.completedAt) }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  v-if="returnData.notes"
                  cols="12"
                >
                  <div class="text-caption text-medium-emphasis">
                    Catatan
                  </div>
                  <div class="text-body-1">
                    {{ returnData.notes }}
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Return Lines Table -->
          <VCard>
            <VCardTitle>Barang Retur</VCardTitle>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th class="text-end">
                      Diretur
                    </th>
                    <th class="text-end">
                      Masuk Stok
                    </th>
                    <th class="text-end">
                      Rusak
                    </th>
                    <th>Kondisi</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="line in returnData.lines"
                    :key="line.returnLineId"
                  >
                    <td>
                      <div class="font-weight-medium">
                        {{ line.orderLine?.itemName || '-' }}
                      </div>
                    </td>
                    <td class="text-end">
                      {{ line.quantityReturned }}
                    </td>
                    <td class="text-end">
                      <span class="text-success">{{ line.quantityRestockable }}</span>
                    </td>
                    <td class="text-end">
                      <span class="text-error">{{ line.quantityDamaged }}</span>
                    </td>
                    <td>
                      <VChip size="small">
                        {{ getConditionLabel(line.condition) }}
                      </VChip>
                    </td>
                    <td class="text-medium-emphasis">
                      {{ line.notes || '-' }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Col: Actions -->
        <VCol
          cols="12"
          md="3"
        >
          <VCard>
            <VCardTitle>Aksi</VCardTitle>
            <VCardText class="d-flex flex-column gap-2">
              <VBtn
                v-if="canApprove"
                color="success"
                prepend-icon="tabler-check"
                block
                @click="showApproveDialog = true"
              >
                Setujui
              </VBtn>
              <VBtn
                v-if="canReject"
                color="error"
                prepend-icon="tabler-x"
                block
                variant="tonal"
                @click="showRejectDialog = true"
              >
                Tolak
              </VBtn>
              <VBtn
                v-if="canComplete"
                color="primary"
                prepend-icon="tabler-check"
                block
                @click="showCompleteDialog = true"
              >
                Selesaikan
              </VBtn>
              <VBtn
                v-if="canCancel"
                color="warning"
                prepend-icon="tabler-ban"
                block
                variant="outlined"
                @click="handleCancel"
              >
                Batalkan
              </VBtn>
              <VBtn
                v-if="canDelete"
                color="error"
                prepend-icon="tabler-trash"
                variant="outlined"
                block
                @click="handleDelete"
              >
                Hapus
              </VBtn>
              <div
                v-if="!canApprove && !canReject && !canComplete && !canCancel && !canDelete"
                class="text-center text-medium-emphasis py-4"
              >
                Tidak ada aksi tersedia
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- Approve Dialog -->
    <VDialog
      v-model="showApproveDialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle>Setujui Retur</VCardTitle>
        <VCardText>
          <p>Apakah Anda yakin ingin menyetujui retur ini?</p>
          <VAlert
            type="info"
            class="mt-4"
            variant="tonal"
            icon="tabler-info-circle"
          >
            Tindakan ini akan memproses retur ke tahap selanjutnya (Diterima/Diperiksa).
          </VAlert>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showApproveDialog = false">
            Batal
          </VBtn>
          <VBtn
            color="success"
            @click="handleApprove"
          >
            Setujui
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Reject Dialog -->
    <VDialog
      v-model="showRejectDialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle>Tolak Retur</VCardTitle>
        <VCardText>
          <VTextField
            v-model="rejectReason"
            label="Alasan Penolakan *"
            required
            class="mb-4"
          />
          <VTextarea
            v-model="rejectNotes"
            label="Catatan Tambahan"
            rows="3"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showRejectDialog = false">
            Batal
          </VBtn>
          <VBtn
            color="error"
            @click="handleReject"
          >
            Tolak
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Complete Dialog -->
    <VDialog
      v-model="showCompleteDialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle>Selesaikan Retur</VCardTitle>
        <VCardText>
          <p>Apakah Anda yakin ingin menyelesaikan retur ini?</p>
          <VAlert
            type="warning"
            class="mt-4"
            variant="tonal"
            icon="tabler-alert-triangle"
          >
            Barang "Masuk Stok" akan dikembalikan ke inventaris toko secara otomatis. Tindakan ini tidak dapat dibatalkan.
          </VAlert>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showCompleteDialog = false">
            Batal
          </VBtn>
          <VBtn
            color="primary"
            @click="handleComplete"
          >
            Selesaikan
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
