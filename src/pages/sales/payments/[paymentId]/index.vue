<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { usePaymentStore } from '@/stores/sales/paymentStore'
import { showToast } from '@/utils/toaster'
import VoidPaymentDialog from '@/components/sales/payments/VoidPaymentDialog.vue'
import RefundCreateModal from '@/components/dialogs/RefundCreateModal.vue'

definePage({
  meta: {
    name: 'Detail Pembayaran',
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
const paymentStore = usePaymentStore()
const paymentId = route.params.paymentId as string

const payment = ref<any>(null)
const isLoading = ref(false)

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

const formatDateTime = (date: string) => {
  return dayjs(date).format('DD MMMM YYYY HH:mm')
}

const fetchPayment = async () => {
  isLoading.value = true
  try {
    const response = await paymentStore.fetchPaymentDetail(paymentId, {
      include:
        'invoice.order.salesOrder,invoice.order.customer,invoice.order.outlet,createdByUser,voidedByUser,refunds',
    })

    payment.value = response
  }
  catch (error) {
    console.error('Failed to fetch payment:', error)
    showToast('Gagal memuat data pembayaran', 'error')
  }
  finally {
    isLoading.value = false
  }
}

const downloadPDF = () => {
  // TODO: Implement download PDF
  console.log('Download PDF', paymentId)
  showToast('Fitur download PDF akan segera tersedia', 'info')
}

// Dialog states
const isVoidDialogOpen = ref(false)
const isRefundDialogOpen = ref(false)

const handleDialogSuccess = () => {
  fetchPayment() // Refresh data after void/refund
}

const printReceipt = (size: 'small' | 'large' = 'small') => {
  if (!payment.value)
    return

  const p = payment.value

  // Helper to format currency
  const fmtMoney = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Template Dot Matrix (Universal untuk Thermal & A4)
  const contentHtml = `
    <div class="header">
      <div class="title">${p.invoice?.order?.outlet?.name || 'BAKOELKU'}</div>
      ${
        p.invoice?.order?.outlet?.address
          ? `<div class="subtitle">${p.invoice.order.outlet.address}</div>`
          : ''
      }
      ${
        p.invoice?.order?.outlet?.phone
          ? `<div class="subtitle">Telp: ${p.invoice.order.outlet.phone}</div>`
          : ''
      }
    </div>
    
    <div class="divider">================================================================</div>
    <div class="title" style="margin: 5px 0; text-align: center;">BUKTI PEMBAYARAN</div>
    <div class="divider">================================================================</div>
    
    <div class="content-wrapper">
      <div class="col-left">
        <div class="info-row left-align">
          <span class="label">Kode</span>
          <span>: ${p.paymentCode || '-'}</span>
        </div>
        <div class="info-row left-align">
          <span class="label">No. Ref</span>
          <span>: ${p.referenceNumber || '-'}</span>
        </div>
        <div class="info-row left-align">
          <span class="label">Tanggal</span>
          <span>: ${formatDate(p.paymentDate)}</span>
        </div>
        <div class="info-row left-align">
          <span class="label">Waktu</span>
          <span>: ${dayjs(p.createdAt).format('HH:mm:ss')}</span>
        </div>
        <div class="info-row left-align">
          <span class="label">Metode</span>
          <span style="text-transform: capitalize;">: ${
            p.paymentMethod?.replace(/_/g, ' ').toLowerCase() || '-'
          }</span>
        </div>
        <div class="info-row left-align">
          <span class="label">Kasir</span>
          <span>: ${p.createdByUser?.name || '-'}</span>
        </div>
      </div>

      <div class="col-right">
        ${
          p.invoice
            ? `
        <div class="info-section">
          <div class="info-row left-align">
            <span class="label">No. Inv</span>
            <span>: ${p.invoice.invoiceNumber}</span>
          </div>
          <div class="info-row left-align">
            <span class="label">Cust</span>
            <span>: ${p.invoice.customerName || '-'}</span>
          </div>
        </div>
        `
            : ''
        }
        
        <div class="divider-small">--------------------------------</div>
        
        <div class="info-row left-align total-row">
          <span class="label">TOTAL</span>
          <span>: ${fmtMoney(p.amount)}</span>
        </div>
      </div>
    </div>
    
    <div class="divider">================================================================</div>
    
    <div class="footer">
      <div>Terima Kasih</div>
      <div>Simpan struk ini sebagai bukti pembayaran</div>
      <div style="margin-top: 5px;">Dicetak: ${dayjs().format(
        'DD/MM/YYYY HH:mm',
      )}</div>
    </div>

    <div class="signature-section">
      <div class="sig-box">
        <div class="sig-title">Penyetor</div>
        <div class="sig-line">(${p.invoice?.customerName || 'Customer'})</div>
      </div>
      <div class="sig-box">
        <div class="sig-title">Penerima</div>
        <div class="sig-line">(${p.createdByUser?.name || 'Admin'})</div>
      </div>
    </div>
  `

  // Create hidden iframe for printing if not exists
  let iframe = document.getElementById(
    'receipt-print-frame',
  ) as HTMLIFrameElement
  if (!iframe) {
    iframe = document.createElement('iframe')
    iframe.id = 'receipt-print-frame'
    iframe.style.position = 'absolute'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
  }

  const doc = iframe.contentWindow?.document
  if (doc) {
    const isSmall = size === 'small'

    // CSS Configuration
    const pageSize = isSmall ? '80mm auto' : 'A4 portrait'
    const bodyWidth = isSmall ? '70mm' : '100%' // A4 full width
    const fontSize = isSmall ? '10pt' : '12pt' // Larger font for A4
    const labelWidth = isSmall ? '65px' : '80px' // Wider label for A4
    const padding = isSmall ? '5mm' : '20mm' // More padding for A4

    // Layout CSS
    const layoutCss = isSmall
      ? `
      .content-wrapper { display: block; }
      .divider-small { white-space: nowrap; overflow: hidden; margin: 5px 0; }
      .signature-section { display: none; }
    `
      : `
      .content-wrapper { display: flex; justify-content: space-between; align-items: flex-start; margin: 20px 0; }
      .col-left, .col-right { width: 48%; }
      .divider-small { display: none; }
      .signature-section { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
      .sig-box { width: 200px; }
      .sig-title { margin-bottom: 60px; }
      .sig-line { border-top: 1px solid #000; padding-top: 5px; }
    `

    // Watermark CSS (Only for A4)
    const watermarkCss = isSmall
      ? ''
      : `
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 80pt;
        color: rgba(0, 0, 0, 0.15);
        font-weight: bold;
        text-transform: uppercase;
        z-index: 9999;
        pointer-events: none;
        border: 5px solid rgba(0, 0, 0, 0.15);
        padding: 10px 20px;
      }
    `

    const watermarkHtml
      = !isSmall && p.isVoided ? '<div class="watermark">DIBATALKAN</div>' : ''

    // Inject VOID status text for small paper
    let finalContentHtml = contentHtml
    if (p.isVoided) {
      finalContentHtml = finalContentHtml.replace(
        'BUKTI PEMBAYARAN</div>',
        'BUKTI PEMBAYARAN</div><div style="text-align: center; font-weight: bold; margin-top: 5px;">[ DIBATALKAN ]</div>',
      )
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Print Bukti Pembayaran</title>
  <style>
    @page { size: ${pageSize}; margin: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: ${fontSize};
      line-height: 1.3;
      margin: 0;
      padding: ${padding};
      width: ${bodyWidth};
      box-sizing: border-box;
    }
    .header { text-align: center; margin-bottom: 10px; }
    .title { font-size: 1.1em; text-transform: uppercase; text-align: center; font-weight: bold; }
    .subtitle { font-size: 0.9em; }
    .divider { white-space: nowrap; overflow: hidden; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
    .info-row.left-align { justify-content: flex-start; }
    .label { width: ${labelWidth}; flex-shrink: 0; }
    .total-row { font-weight: bold; font-size: 1.1em; margin: 5px 0; }
    .footer { text-align: center; margin-top: 10px; font-size: 0.9em; }
    ${layoutCss}
    ${watermarkCss}
  </style>
</head>
<body>
  ${watermarkHtml}
  ${finalContentHtml}
</body>
</html>`

    doc.open()
    doc.write(html)
    doc.close()

    // Wait for content to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      }, 500)
    }
  }
}

onMounted(() => {
  fetchPayment()
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
        Memuat data pembayaran...
      </p>
    </VCard>

    <div v-else-if="payment">
      <!-- Header -->
      <VCard>
        <VCardText class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
          <div class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              @click="router.push('/sales/payments')"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div class="ms-3">
              <h2 class="text-h5">
                Detail Pembayaran
              </h2>
              <div class="d-flex align-center gap-2">
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ payment.paymentCode || "-" }}
                </p>
                <VChip
                  v-if="payment.isVoided"
                  color="error"
                  size="small"
                  class="text-uppercase"
                >
                  Dibatalkan
                </VChip>
                <VChip
                  v-else-if="payment.refundStatus === 'FULLY_REFUNDED'"
                  color="warning"
                  size="small"
                  class="text-uppercase"
                >
                  Refund Penuh
                </VChip>
                <VChip
                  v-else-if="payment.refundStatus === 'PARTIALLY_REFUNDED'"
                  color="warning"
                  size="small"
                  class="text-uppercase"
                >
                  Refund Sebagian
                </VChip>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VRow class="mt-4">
        <!-- Left Column - Payment Info -->
        <VCol
          cols="12"
          md="8"
        >
          <VCard>
            <VCardTitle>Informasi Pembayaran</VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Kode Pembayaran
                    </div>
                    <div class="text-h6">
                      {{ payment.paymentCode || "-" }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Tanggal Pembayaran
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(payment.paymentDate) }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Metode Pembayaran
                    </div>
                    <div class="text-body-1 text-capitalize">
                      {{
                        payment.paymentMethod?.replace(/_/g, " ").toLowerCase()
                      }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Nomor Referensi
                    </div>
                    <div class="text-body-1">
                      {{ payment.referenceNumber || "-" }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Jumlah Pembayaran
                    </div>
                    <div class="text-h6 text-success">
                      {{ formatCurrency(payment.amount) }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Diterima Oleh
                    </div>
                    <div class="text-body-1">
                      {{ payment.createdByUser?.name || "-" }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Waktu Pencatatan
                    </div>
                    <div class="text-body-1">
                      {{ formatDateTime(payment.createdAt) }}
                    </div>
                  </div>
                </VCol>
              </VRow>

              <VDivider class="my-4" />

              <div v-if="payment.notes">
                <div class="text-caption text-medium-emphasis mb-2">
                  Catatan
                </div>
                <div class="text-body-1">
                  {{ payment.notes }}
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Invoice Info -->
          <VCard
            v-if="payment.invoice"
            class="mt-4"
          >
            <VCardTitle>Invoice Terkait</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Nomor Invoice
                </div>
                <RouterLink
                  :to="`/sales/invoices/${payment.invoice.invoiceId}`"
                  class="text-h6 text-primary"
                >
                  {{ payment.invoice.invoiceNumber }}
                </RouterLink>
              </div>
              <div
                v-if="payment.invoice.order?.salesOrder"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Sales Order
                </div>
                <RouterLink
                  :to="`/sales/sales-orders/${payment.invoice.order.salesOrder.salesOrderId}`"
                  class="text-body-1 text-primary"
                >
                  {{ payment.invoice.order.orderCode }}
                </RouterLink>
              </div>
              <VDivider class="my-3" />
              <div class="d-flex justify-space-between mb-2">
                <span>Total Invoice:</span>
                <strong>{{
                  formatCurrency(payment.invoice.grandTotal)
                }}</strong>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span>Sudah Dibayar:</span>
                <strong class="text-success">{{
                  formatCurrency(payment.invoice.paidAmount)
                }}</strong>
              </div>
              <div class="d-flex justify-space-between">
                <span>Sisa Tagihan:</span>
                <strong class="text-error">{{
                  formatCurrency(payment.invoice.dueAmount)
                }}</strong>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column - Actions -->
        <!-- Right Column - Actions -->
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
                  color="primary"
                  variant="outlined"
                  prepend-icon="tabler-download"
                  block
                  @click="paymentStore.downloadPDF(paymentId)"
                >
                  Download PDF
                </VBtn>
                <VMenu>
                  <template #activator="{ props }">
                    <VBtn
                      color="secondary"
                      variant="outlined"
                      prepend-icon="tabler-printer"
                      block
                      v-bind="props"
                    >
                      Print Struk
                    </VBtn>
                  </template>
                  <VList>
                    <VListItem @click="printReceipt('small')">
                      <template #prepend>
                        <VIcon
                          icon="tabler-receipt"
                          size="small"
                        />
                      </template>
                      <VListItemTitle>Kecil (Thermal 80mm)</VListItemTitle>
                    </VListItem>
                    <VListItem @click="printReceipt('large')">
                      <template #prepend>
                        <VIcon
                          icon="tabler-printer"
                          size="small"
                        />
                      </template>
                      <VListItemTitle>Besar (A4)</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>

                <template
                  v-if="
                    !payment.isVoided
                      && payment.refundStatus !== 'FULLY_REFUNDED'
                  "
                >
                  <VDivider class="my-2" />
                  <VBtn
                    color="warning"
                    variant="outlined"
                    prepend-icon="tabler-receipt-refund"
                    block
                    @click="isRefundDialogOpen = true"
                  >
                    Refund Pembayaran
                  </VBtn>
                  <VBtn
                    v-if="
                      !payment.refundStatus || payment.refundStatus === 'NORMAL'
                    "
                    color="error"
                    variant="outlined"
                    prepend-icon="tabler-ban"
                    block
                    @click="isVoidDialogOpen = true"
                  >
                    Batalkan Pembayaran
                  </VBtn>
                </template>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- Void Dialog Component -->
    <VoidPaymentDialog
      v-model="isVoidDialogOpen"
      :payment-id="paymentId"
      @success="handleDialogSuccess"
    />

    <!-- Refund Create Modal -->
    <RefundCreateModal
      v-model="isRefundDialogOpen"
      :payment-id="paymentId"
      @success="handleDialogSuccess"
    />
  </div>
</template>
