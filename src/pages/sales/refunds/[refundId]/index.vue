<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { formatCurrency } from '@/utils/common'
import CompleteRefundDialog from '@/components/sales/refunds/CompleteRefundDialog.vue'
import CancelRefundDialog from '@/components/sales/refunds/CancelRefundDialog.vue'

definePage({
  meta: {
    name: 'Detail Refund',
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
const refundId = route.params.refundId as string

const refund = ref<any>(null)
const isLoading = ref(false)
const isCompleting = ref(false)
const isCancelling = ref(false)
const isCancelDialogOpen = ref(false)

const statusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 'success'
    case 'OPEN':
      return 'info'
    case 'DRAFT':
      return 'warning'
    case 'CANCELLED':
      return 'error'
    default:
      return 'default'
  }
}

const statusText = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 'Selesai'
    case 'OPEN':
      return 'Belum Diproses'
    case 'DRAFT':
      return 'Draft'
    case 'CANCELLED':
      return 'Dibatalkan'
    default:
      return status
  }
}

const fetchRefund = async () => {
  isLoading.value = true
  try {
    const response = await $salesAPI<any>(`refunds/${refundId}`)

    refund.value = response.data
  }
  catch (error) {
    console.error('Failed to fetch refund:', error)
    showToast('Gagal memuat data refund', 'error')
    router.back()
  }
  finally {
    isLoading.value = false
  }
}

const isCompleteDialogOpen = ref(false)

const openCompleteDialog = () => {
  isCompleteDialogOpen.value = true
}

const handleComplete = async () => {
  isCompleting.value = true
  try {
    await $salesAPI(`refunds/${refundId}/complete`, {
      method: 'POST',
    })
    showToast('Refund berhasil diselesaikan', 'success')
    isCompleteDialogOpen.value = false
    await fetchRefund()
  }
  catch (error: any) {
    console.error('Failed to complete refund:', error)

    const errorMessage
      = error?.response?._data?.message
      || error?.response?.data?.message
      || error?.message
      || 'Gagal menyelesaikan refund'

    showToast(errorMessage, 'error')
  }
  finally {
    isCompleting.value = false
  }
}

const openCancelDialog = () => {
  isCancelDialogOpen.value = true
}

const handleCancel = async (reason: string) => {
  isCancelling.value = true
  try {
    await $salesAPI(`refunds/${refundId}/cancel`, {
      method: 'POST',
      body: {
        cancelReason: reason,
      },
    })
    showToast('Refund berhasil dibatalkan', 'success')
    isCancelDialogOpen.value = false
    await fetchRefund()
  }
  catch (error: any) {
    console.error('Failed to cancel refund:', error)

    const errorMessage
      = error?.response?._data?.message
      || error?.response?.data?.message
      || error?.message
      || 'Gagal membatalkan refund'

    showToast(errorMessage, 'error')
  }
  finally {
    isCancelling.value = false
  }
}

const canComplete = computed(() => {
  return refund.value?.status === 'OPEN' || refund.value?.status === 'DRAFT'
})

const canCancel = computed(() => {
  return (
    refund.value?.status !== 'CANCELLED' && refund.value?.status !== 'COMPLETED'
  )
})

onMounted(() => {
  fetchRefund()
})
</script>

<template>
  <div>
    <VCard
      v-if="isLoading"
      class="text-center py-8"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
      <p class="mt-4">
        Memuat data refund...
      </p>
    </VCard>

    <div v-else-if="refund">
      <!-- Header -->
      <VCard>
        <VCardText class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
          <div class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              @click="router.push('/sales/refunds')"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div class="ms-3">
              <h2 class="text-h5">
                Detail Refund
              </h2>
              <div class="d-flex align-center gap-2">
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ refund.refundCode }}
                </p>
                <VChip
                  :color="statusColor(refund.status)"
                  size="small"
                  class="text-uppercase"
                >
                  {{ statusText(refund.status) }}
                </VChip>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VRow class="mt-4">
        <!-- Left Column -->
        <VCol
          cols="12"
          md="8"
        >
          <!-- Refund Info -->
          <VCard>
            <VCardTitle>Informasi Refund</VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Kode Refund
                    </div>
                    <div class="text-h6">
                      {{ refund.refundCode }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Tanggal Refund
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(refund.refundDate) }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Metode Refund
                    </div>
                    <div class="text-body-1 text-capitalize">
                      {{
                        refund.refundMethod?.replace(/_/g, " ").toLowerCase()
                      }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Nomor Referensi
                    </div>
                    <div class="text-body-1">
                      {{ refund.referenceNumber || "-" }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Jumlah Refund
                    </div>
                    <div class="text-h6 text-error">
                      - {{ formatCurrency(refund.amount) }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Dibuat Oleh
                    </div>
                    <div class="text-body-1">
                      {{ refund.createdByUser?.name || "-" }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Waktu Dibuat
                    </div>
                    <div class="text-body-1">
                      {{ dayjs(refund.createdAt).format("DD MMMM YYYY HH:mm") }}
                    </div>
                  </div>
                </VCol>
              </VRow>

              <VDivider class="my-4" />

              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  Alasan Refund
                </div>
                <div class="text-body-1">
                  {{ refund.reason }}
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Payment Info -->
          <VCard
            v-if="refund.payment"
            class="mt-4"
          >
            <VCardTitle>Payment Terkait</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Kode Payment
                </div>
                <RouterLink
                  :to="`/sales/payments/${refund.payment.paymentId}`"
                  class="text-h6 text-primary"
                >
                  {{ refund.payment.paymentCode }}
                </RouterLink>
              </div>
              <VDivider class="my-3" />
              <div class="d-flex justify-space-between mb-2">
                <span>Jumlah Payment:</span>
                <strong class="text-success">{{
                  formatCurrency(refund.payment.amount)
                }}</strong>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span>Metode Payment:</span>
                <strong class="text-capitalize">
                  {{
                    refund.payment.paymentMethod
                      ?.replace(/_/g, " ")
                      .toLowerCase()
                  }}
                </strong>
              </div>
            </VCardText>
          </VCard>

          <!-- Invoice Info -->
          <VCard
            v-if="refund.invoice"
            class="mt-4"
          >
            <VCardTitle>Invoice Terkait</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Nomor Invoice
                </div>
                <RouterLink
                  :to="`/sales/invoices/${refund.invoice.invoiceId}`"
                  class="text-h6 text-primary"
                >
                  {{ refund.invoice.invoiceNumber }}
                </RouterLink>
              </div>
              <div
                v-if="refund.invoice.order?.salesOrder"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Sales Order
                </div>
                <RouterLink
                  :to="`/sales/sales-orders/${refund.invoice.order.salesOrder.salesOrderId}`"
                  class="text-body-1 text-primary"
                >
                  {{ refund.invoice.order.orderCode }}
                </RouterLink>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column - Actions -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardTitle>Aksi</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-2">
                <VBtn
                  v-if="canComplete"
                  color="success"
                  variant="elevated"
                  prepend-icon="tabler-check"
                  block
                  @click="openCompleteDialog"
                >
                  Selesaikan Refund
                </VBtn>

                <VBtn
                  v-if="canCancel"
                  color="error"
                  variant="outlined"
                  prepend-icon="tabler-ban"
                  block
                  @click="openCancelDialog"
                >
                  Batalkan Refund
                </VBtn>

                <VAlert
                  v-if="refund.status === 'COMPLETED'"
                  type="success"
                  variant="tonal"
                  density="compact"
                  icon="tabler-check"
                >
                  Refund sudah diselesaikan
                </VAlert>

                <VAlert
                  v-if="refund.status === 'CANCELLED'"
                  type="error"
                  variant="tonal"
                  density="compact"
                  icon="tabler-ban"
                >
                  Refund dibatalkan
                </VAlert>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- Complete Refund Dialog -->
    <CompleteRefundDialog
      v-model="isCompleteDialogOpen"
      :refund="refund"
      :loading="isCompleting"
      @confirm="handleComplete"
    />

    <!-- Cancel Dialog -->
    <CancelRefundDialog
      v-model="isCancelDialogOpen"
      :refund="refund"
      :loading="isCancelling"
      @confirm="handleCancel"
    />
  </div>
</template>
