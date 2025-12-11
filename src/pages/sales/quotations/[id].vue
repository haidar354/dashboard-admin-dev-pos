<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useSalesQuotationStore } from '@/stores/sales/salesQuotationStore'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import { translateStatus } from '@/utils/common'

definePage({
  meta: {
    name: 'Detail Penawaran (SQ)',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const route = useRoute()
const quotationId = route.params.id as string

const quotationStore = useSalesQuotationStore()

const { selectedQuotation, isLoadingFetchDetail, isLoadingConvert }
  = storeToRefs(quotationStore)

const statusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'secondary'
    case 'sent':
      return 'info'
    case 'accepted':
      return 'success'
    case 'rejected':
      return 'error'
    case 'converted':
      return 'primary'
    case 'expired':
      return 'warning'
    default:
      return 'default'
  }
}

const fetchQuotation = async () => {
  try {
    await quotationStore.fetchDetail(quotationId, {
      include: ['items', 'customer', 'createdBy', 'outlet'],
    })
  }
  catch (error) {
    console.error(error)
    showToast('Gagal memuat data penawaran (SQ)', 'error')
    router.back()
  }
}

const convertToSalesOrder = async () => {
  const isConfirmed = await useConfirmDialogStore().openGenericDialog(
    `Yakin ingin mengkonversi penawaran (SQ) "${selectedQuotation.value.quotationNumber}" ini menjadi Pesanan Penjualan (SO)?`,
    {
      title: 'Konfirmasi Konversi',
      confirmText: 'Ya, Konversi',
      cancelText: 'Batal',
      color: 'primary',
      icon: 'tabler-file-export',
    },
  )

  if (!isConfirmed)
    return

  try {
    await quotationStore.convertToSalesOrder(quotationId)
    await fetchQuotation() // Refresh data
  }
  catch (error) {
    // Error handling sudah di store
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD MMMM YYYY')
}

const updateStatus = async (status: string) => {
  const confirmMessage
    = status === 'void'
      ? 'Yakin ingin membatalkan penawaran ini?'
      : status === 'sent'
        ? 'Yakin ingin menandai penawaran ini sebagai Terkirim?'
        : 'Yakin ingin mengubah status penawaran ini?'

  const isConfirmed = await useConfirmDialogStore().openGenericDialog(
    confirmMessage,
    {
      title: 'Konfirmasi Ubah Status',
      confirmText: 'Ya, Lanjutkan',
      cancelText: 'Batal',
      color: status === 'void' ? 'error' : 'primary',
    },
  )

  if (!isConfirmed)
    return

  try {
    await quotationStore.updateStatus(quotationId, status)
    await fetchQuotation() // Refresh data
  }
  catch (error) {
    // Error handled in store
  }
}

onMounted(() => {
  fetchQuotation()
})
</script>

<template>
  <div>
    <VCard
      v-if="isLoadingFetchDetail"
      class="text-center py-8"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
      <p class="mt-4">
        Memuat data...
      </p>
    </VCard>

    <div v-else-if="selectedQuotation.quotationId">
      <!-- Header -->
      <VCard>
        <VCardText class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
          <div class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              @click="router.push('/sales/quotations')"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div class="ms-3">
              <h2 class="text-h5">
                <VIcon
                  icon="tabler-file-text"
                  class="me-2"
                />
                {{ selectedQuotation.quotationNumber }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Detail Penawaran (SQ)
              </p>
            </div>
          </div>

          <VBtn
            color="primary"
            variant="tonal"
            prepend-icon="tabler-download"
            :loading="quotationStore.isLoadingDownload"
            @click="quotationStore.downloadPdf(selectedQuotation)"
          >
            Download PDF
          </VBtn>
        </VCardText>
      </VCard>

      <VRow class="mt-4">
        <!-- Left Column -->
        <VCol
          cols="12"
          md="8"
        >
          <!-- Quotation Information -->
          <VCard>
            <VCardTitle class="d-flex align-center justify-space-between">
              <span>Informasi Penawaran</span>
              <VChip
                :color="statusColor(selectedQuotation.status)"
                size="small"
                class="text-uppercase"
              >
                {{ translateStatus(selectedQuotation.status) }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Nomor Penawaran
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ selectedQuotation.quotationNumber }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Tanggal Penawaran
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(selectedQuotation.quotationDate) }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Berlaku Hingga
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(selectedQuotation.validUntil) }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div
                    v-if="selectedQuotation.outlet"
                    class="mb-4"
                  >
                    <div class="text-caption text-medium-emphasis">
                      Outlet
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ selectedQuotation.outlet.name }}
                    </div>
                    <div
                      v-if="selectedQuotation.outlet.address"
                      class="text-body-2 text-medium-emphasis"
                    >
                      {{ selectedQuotation.outlet.address }}
                    </div>
                  </div>
                  <div
                    v-if="selectedQuotation.createdBy"
                    class="mb-4"
                  >
                    <div class="text-caption text-medium-emphasis">
                      Dibuat Oleh
                    </div>
                    <div class="text-body-1">
                      {{ selectedQuotation.createdBy.name }}
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Customer Information -->
          <VCard class="mt-4">
            <VCardTitle>Informasi Pelanggan</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Nama Pelanggan
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ selectedQuotation.customerName }}
                </div>
              </div>
              <div
                v-if="selectedQuotation.customerEmail"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Email
                </div>
                <div class="text-body-1">
                  {{ selectedQuotation.customerEmail }}
                </div>
              </div>
              <div
                v-if="selectedQuotation.customerPhone"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Telepon
                </div>
                <div class="text-body-1">
                  {{ selectedQuotation.customerPhone }}
                </div>
              </div>
              <div
                v-if="selectedQuotation.customerAddress"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Alamat
                </div>
                <div class="text-body-1">
                  {{ selectedQuotation.customerAddress }}
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Items -->
          <VCard class="mt-4">
            <VCardTitle>Item Penawaran</VCardTitle>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-center">
                      Qty
                    </th>
                    <th class="text-end">
                      Harga
                    </th>
                    <th class="text-end">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in selectedQuotation.items"
                    :key="item.quotationItemId"
                  >
                    <td>
                      <div>
                        <strong>{{ item.productName }}</strong>
                        <div
                          v-if="item.productSku"
                          class="text-caption text-medium-emphasis"
                        >
                          {{ item.productSku }}
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      {{ item.quantity }}
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(item.price) }}
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Notes -->
          <VCard
            v-if="selectedQuotation.notes"
            class="mt-4"
          >
            <VCardTitle>Catatan</VCardTitle>
            <VCardText>
              <div class="text-body-1">
                {{ selectedQuotation.notes }}
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column -->
        <VCol
          cols="12"
          md="4"
        >
          <!-- Actions Card -->
          <VCard>
            <VCardTitle>Aksi</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-2">
                <!-- Draft Actions -->
                <template v-if="selectedQuotation.status === 'draft'">
                  <VBtn
                    color="primary"
                    prepend-icon="tabler-send"
                    block
                    :loading="quotationStore.isLoadingUpdate"
                    @click="updateStatus('sent')"
                  >
                    Kirim Ke Pelanggan
                  </VBtn>
                  <VBtn
                    color="success"
                    prepend-icon="tabler-file-export"
                    block
                    :loading="isLoadingConvert"
                    @click="convertToSalesOrder"
                  >
                    Konversi ke SO
                  </VBtn>
                  <VBtn
                    color="error"
                    variant="outlined"
                    prepend-icon="tabler-ban"
                    block
                    :loading="quotationStore.isLoadingUpdate"
                    @click="updateStatus('void')"
                  >
                    Batalkan (Void)
                  </VBtn>
                </template>

                <!-- Sent Actions -->
                <template v-if="selectedQuotation.status === 'sent'">
                  <VBtn
                    color="success"
                    prepend-icon="tabler-file-export"
                    block
                    :loading="isLoadingConvert"
                    @click="convertToSalesOrder"
                  >
                    Konversi ke SO
                  </VBtn>
                  <VBtn
                    color="error"
                    variant="outlined"
                    prepend-icon="tabler-ban"
                    block
                    :loading="quotationStore.isLoadingUpdate"
                    @click="updateStatus('void')"
                  >
                    Batalkan (Void)
                  </VBtn>
                </template>

                <!-- Void Status -->
                <VAlert
                  v-if="selectedQuotation.status === 'void'"
                  type="error"
                  variant="tonal"
                  density="compact"
                >
                  Penawaran ini telah dibatalkan (Void)
                </VAlert>

                <!-- Converted Status -->
                <VAlert
                  v-if="selectedQuotation.status === 'converted'"
                  type="success"
                  variant="tonal"
                  density="compact"
                >
                  Penawaran ini telah dikonversi menjadi Sales Order
                </VAlert>

                <!-- Other Status -->
                <VAlert
                  v-if="
                    !['draft', 'sent', 'void', 'converted'].includes(
                      selectedQuotation.status,
                    )
                  "
                  type="info"
                  variant="tonal"
                  density="compact"
                >
                  Tidak ada aksi tersedia untuk status ini
                </VAlert>
              </div>
            </VCardText>
          </VCard>

          <!-- Summary Card -->
          <VCard class="mt-4">
            <VCardTitle>Ringkasan Penawaran</VCardTitle>
            <VCardText>
              <div class="d-flex justify-space-between mb-2">
                <span>Subtotal:</span>
                <strong>{{
                  formatCurrency(selectedQuotation.subtotal)
                }}</strong>
              </div>
              <div
                v-if="selectedQuotation.discountAmount > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span>Diskon:</span>
                <strong class="text-error">-
                  {{ formatCurrency(selectedQuotation.discountAmount) }}</strong>
              </div>
              <div
                v-if="selectedQuotation.taxAmount > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span>Pajak:</span>
                <strong>{{
                  formatCurrency(selectedQuotation.taxAmount)
                }}</strong>
              </div>
              <VDivider class="my-3" />
              <div class="d-flex justify-space-between">
                <span class="text-h6">Total:</span>
                <strong class="text-h6 text-primary">
                  {{ formatCurrency(selectedQuotation.totalAmount) }}
                </strong>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>
</template>
