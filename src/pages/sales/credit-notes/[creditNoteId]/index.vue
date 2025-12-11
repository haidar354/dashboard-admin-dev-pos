<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import { useCreditNoteStore } from '@/stores/sales/creditNoteStore'
import { CreditNoteStatus } from '@/types/models/sales/credit-note'
import { formatCurrency, translateStatus } from '@/utils/common'

definePage({
  meta: {
    name: 'Detail Credit Note',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const route = useRoute()
const router = useRouter()
const creditNoteStore = useCreditNoteStore()
const confirmDialogStore = useConfirmDialogStore()

const { selectedCreditNote, isLoadingFetchDetail, isLoadingUpdate, isLoadingDelete, isLoadingDownload } = storeToRefs(creditNoteStore)
const creditNoteId = route.params.creditNoteId as string

const statusColor = computed(() => {
  switch (selectedCreditNote.value.status) {
    case CreditNoteStatus.DRAFT: return 'secondary'
    case CreditNoteStatus.APPROVED: return 'success'
    case CreditNoteStatus.USED: return 'info'
    case CreditNoteStatus.VOID: return 'error'
    default: return 'default'
  }
})

const formatDate = (date: string) => {
  return dayjs(date).format('DD MMMM YYYY')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('DD MMMM YYYY HH:mm')
}

const downloadPDF = async () => {
  if (!selectedCreditNote.value)
    return
  await creditNoteStore.downloadPdf(selectedCreditNote.value)
}

const canEdit = computed(() => selectedCreditNote.value.status === CreditNoteStatus.DRAFT)
const canApprove = computed(() => selectedCreditNote.value.status === CreditNoteStatus.DRAFT)
const canVoid = computed(() => [CreditNoteStatus.DRAFT, CreditNoteStatus.APPROVED].includes(selectedCreditNote.value.status as CreditNoteStatus))
const canDelete = computed(() => selectedCreditNote.value.status === CreditNoteStatus.DRAFT)

const availableAmount = computed(() => {
  return (selectedCreditNote.value.amount || 0) - (selectedCreditNote.value.usedAmount || 0)
})

onMounted(async () => {
  if (creditNoteId)
    await creditNoteStore.fetchDetail(creditNoteId)
})

const handleApprove = async () => {
  const confirmed = await confirmDialogStore.openDialog(
    'Konfirmasi Approve',
    'Apakah Anda yakin ingin approve credit note ini?',
  )

  if (confirmed) {
    try {
      await creditNoteStore.approveCreditNote(creditNoteId)
    }
    catch (error) {
      console.error('Failed to approve credit note:', error)
    }
  }
}

const handleVoid = async () => {
  const confirmed = await confirmDialogStore.openDialog(
    'Konfirmasi Void',
    'Apakah Anda yakin ingin membatalkan (void) credit note ini?',
  )

  if (confirmed) {
    try {
      await creditNoteStore.voidCreditNote(creditNoteId, 'Dibatalkan oleh user')
    }
    catch (error) {
      console.error('Failed to void credit note:', error)
    }
  }
}

const handleDelete = async () => {
  const confirmed = await confirmDialogStore.openDialog(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus credit note "${selectedCreditNote.value.creditNoteNumber}"?`,
  )

  if (confirmed) {
    const success = await creditNoteStore.deleteCreditNote(creditNoteId)
    if (success)
      router.push('/sales/credit-notes')
  }
}
</script>

<template>
  <div>
    <VRow>
      <!-- Header -->
      <VCol cols="12">
        <VCard>
          <VCardText class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
            <div class="d-flex align-center">
              <VBtn
                icon
                variant="text"
                @click="router.push('/sales/credit-notes')"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
              <div class="ms-3">
                <h2 class="text-h5">
                  {{ selectedCreditNote.creditNoteNumber }}
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Detail Credit Note
                </p>
              </div>
            </div>

            <div class="d-flex gap-2">
              <VBtn
                color="primary"
                variant="tonal"
                prepend-icon="tabler-download"
                :loading="isLoadingDownload"
                @click="downloadPDF"
              >
                Download PDF
              </VBtn>

              <VBtn
                v-if="canDelete"
                color="error"
                variant="tonal"
                prepend-icon="tabler-trash"
                :loading="isLoadingDelete"
                @click="handleDelete"
              >
                Hapus
              </VBtn>
              <VBtn
                v-if="canVoid"
                color="warning"
                variant="tonal"
                prepend-icon="tabler-x"
                :loading="isLoadingUpdate"
                @click="handleVoid"
              >
                Void
              </VBtn>
              <VBtn
                v-if="canApprove"
                color="success"
                prepend-icon="tabler-check"
                :loading="isLoadingUpdate"
                @click="handleApprove"
              >
                Approve
              </VBtn>
              <VBtn
                v-if="canEdit"
                color="primary"
                prepend-icon="tabler-edit"
                :to="`/sales/credit-notes/${creditNoteId}/edit`"
              >
                Edit
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Loading State -->
      <VCol
        v-if="isLoadingFetchDetail"
        cols="12"
      >
        <VCard>
          <VCardText>
            <VSkeletonLoader type="article, actions" />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Content -->
      <template v-else-if="selectedCreditNote.creditNoteId">
        <!-- Main Info Card -->
        <VCol
          cols="12"
          md="8"
        >
          <VCard>
            <VCardTitle>Informasi Credit Note</VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Nomor Credit Note
                  </div>
                  <div class="text-h6 font-weight-bold">
                    {{ selectedCreditNote.creditNoteNumber }}
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Tanggal
                  </div>
                  <div class="text-body-1">
                    {{ dayjs(selectedCreditNote.creditNoteDate).format('DD MMMM YYYY') }}
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Status
                  </div>
                  <VChip
                    :color="statusColor"
                    size="small"
                    class="mt-1 text-uppercase"
                  >
                    {{ translateStatus(selectedCreditNote.status) }}
                  </VChip>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Dibuat Oleh
                  </div>
                  <div class="text-body-1">
                    {{ selectedCreditNote.createdBy?.name || '-' }}
                  </div>
                </VCol>
              </VRow>

              <VDivider class="my-4" />

              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Pelanggan
                  </div>
                  <div class="text-h6">
                    {{ selectedCreditNote.customer?.name || '-' }}
                  </div>
                  <div class="text-caption">
                    {{ selectedCreditNote.customer?.email || '-' }}
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Invoice Reference
                  </div>
                  <div class="text-body-1">
                    <template v-if="selectedCreditNote.invoice">
                      <VBtn
                        size="small"
                        variant="text"
                        :to="`/sales/invoices/${selectedCreditNote.invoice.invoiceId}`"
                      >
                        {{ selectedCreditNote.invoice.invoiceNumber }}
                      </VBtn>
                    </template>
                    <template v-else>
                      -
                    </template>
                  </div>
                </VCol>
              </VRow>

              <VDivider class="my-4" />

              <VRow>
                <VCol cols="12">
                  <div class="text-caption text-medium-emphasis">
                    Alasan
                  </div>
                  <div class="text-body-1">
                    {{ selectedCreditNote.reason || '-' }}
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Amount Summary Card -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardTitle>Ringkasan Jumlah</VCardTitle>
            <VCardText>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-medium-emphasis">Total Amount:</span>
                <span class="text-h6 font-weight-bold">{{ formatCurrency(selectedCreditNote.amount) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-medium-emphasis">Terpakai:</span>
                <span class="text-error">{{ formatCurrency(selectedCreditNote.usedAmount) }}</span>
              </div>
              <VDivider class="my-2" />
              <div class="d-flex justify-space-between">
                <span class="font-weight-bold">Sisa:</span>
                <span class="text-h6 font-weight-bold text-success">{{ formatCurrency(availableAmount) }}</span>
              </div>
            </VCardText>
          </VCard>

          <!-- Timeline Card -->
          <VCard class="mt-4">
            <VCardTitle>Timeline</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Dibuat
                </div>
                <div class="text-body-2">
                  {{ dayjs(selectedCreditNote.createdAt).format('DD MMM YYYY HH:mm') }}
                </div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis">
                  Terakhir Diupdate
                </div>
                <div class="text-body-2">
                  {{ dayjs(selectedCreditNote.updatedAt).format('DD MMM YYYY HH:mm') }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </template>
    </VRow>
  </div>
</template>
