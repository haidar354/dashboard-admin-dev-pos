<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { translateStatus } from '@/utils/common'
import { useInvoiceStore } from '@/stores/sales/invoiceStore'

definePage({
  meta: {
    name: 'Detail Invoice',
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
const invoiceId = route.params.invoiceId as string

const invoiceStore = useInvoiceStore()

const { selectedInvoice, isLoadingFetchDetail, isLoadingDownload }
  = storeToRefs(invoiceStore)

const statusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return 'success'
    case 'PARTIALLY_PAID':
      return 'warning'
    case 'UNPAID':
      return 'error'
    case 'SENT':
      return 'info'
    case 'OVERDUE':
      return 'error'
    case 'DRAFT':
      return 'secondary'
    case 'CANCELLED':
    case 'VOID':
      return 'secondary'
    default:
      return 'default'
  }
}

const fetchInvoice = async () => {
  try {
    await invoiceStore.fetchDetail(invoiceId, {
      include: ['lines', 'order.salesOrder', 'order.customer', 'payments', 'outlet'],
    })
  }
  catch (error) {
    console.error(error)
    showToast('Gagal memuat data invoice', 'error')
    router.back()
  }
}

const downloadPDF = async () => {
  if (!selectedInvoice.value)
    return
  await invoiceStore.downloadPdf(selectedInvoice.value)
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD MMMM YYYY')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('DD MMMM YYYY HH:mm')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const isPaymentDialogOpen = ref(false)

const isDraft = computed(() => {
  return selectedInvoice.value?.status === 'DRAFT'
})

const isVoidDialogOpen = ref(false)
const isEmailDialogOpen = ref(false)

const paymentForm = ref({
  paymentDate: dayjs().format('YYYY-MM-DD'),
  amount: 0,
  paymentMethod: 'CASH',
  referenceNumber: '',
  notes: '',
})

const voidReason = ref('')

const emailForm = ref({
  recipientEmail: '',
  subject: '',
  message: '',
})

const remainingAfterPayment = computed(() => {
  if (!selectedInvoice.value)
    return 0
  const currentDue = selectedInvoice.value.dueAmount
  const payment = paymentForm.value.amount || 0

  return Math.max(0, currentDue - payment)
})

const openPaymentDialog = () => {
  if (!selectedInvoice.value)
    return
  paymentForm.value = {
    paymentDate: dayjs().format('YYYY-MM-DD'),
    amount: selectedInvoice.value.dueAmount,
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: '',
  }
  isPaymentDialogOpen.value = true
}

const submitPayment = async () => {
  const success = await invoiceStore.recordPayment(invoiceId, {
    payment_date: paymentForm.value.paymentDate,
    amount: paymentForm.value.amount,
    payment_method: paymentForm.value.paymentMethod,
    reference_number: paymentForm.value.referenceNumber,
    notes: paymentForm.value.notes,
  })

  if (success)
    isPaymentDialogOpen.value = false
}

const openVoidDialog = () => {
  voidReason.value = ''
  isVoidDialogOpen.value = true
}

const submitVoid = async () => {
  if (!voidReason.value)
    return
  const success = await invoiceStore.voidInvoice(invoiceId, voidReason.value)
  if (success)
    isVoidDialogOpen.value = false
}

const isDeleteDialogOpen = ref(false)

const openDeleteDialog = () => {
  isDeleteDialogOpen.value = true
}

const submitDelete = async () => {
  const success = await invoiceStore.deleteInvoice(invoiceId)
  if (success) {
    isDeleteDialogOpen.value = false
    router.push('/sales/invoices')
  }
}

const isConfirmDialogOpen = ref(false)

const openConfirmDialog = () => {
  isConfirmDialogOpen.value = true
}

const submitConfirm = async () => {
  const success = await invoiceStore.confirmInvoice(invoiceId)
  if (success)
    isConfirmDialogOpen.value = false
}

const openEmailDialog = () => {
  if (!selectedInvoice.value)
    return
  emailForm.value = {
    recipientEmail: selectedInvoice.value.customerEmail || '',
    subject: `Invoice ${selectedInvoice.value.invoiceNumber}`,
    message: '',
  }
  isEmailDialogOpen.value = true
}

const submitEmail = async () => {
  const success = await invoiceStore.sendEmail(
    invoiceId,
    emailForm.value.recipientEmail,
    emailForm.value.subject,
    emailForm.value.message,
  )

  if (success)
    isEmailDialogOpen.value = false
}

const printDotMatrix = () => {
  if (!selectedInvoice.value)
    return

  const invoice = selectedInvoice.value
  const width = 80 // A4 portrait width in characters

  // Helper functions
  const separator = '='.repeat(width)
  const dash = '-'.repeat(width)

  const centerText = (text: string) => {
    const len = text.length
    if (len >= width)
      return text.substring(0, width)
    const padding = Math.floor((width - len) / 2)

    return ' '.repeat(padding) + text
  }

  const formatLine = (label: string, value: string) => {
    const labelWidth = 20
    const paddedLabel = label.padEnd(labelWidth)
    const truncatedValue = value.substring(0, width - labelWidth - 2)

    return `${paddedLabel}: ${truncatedValue}`
  }

  const formatAmount = (label: string, amount: number) => {
    const formatted = `Rp ${formatCurrency(amount).replace('Rp', '').trim()}`
    const spaces = width - label.length - formatted.length

    return label + ' '.repeat(Math.max(1, spaces)) + formatted
  }

  // Build content
  let content = ''

  // Header
  const companyName
    = invoice.outlet?.name || invoice.order?.outlet?.name || 'Nama Outlet'

  content += `${centerText(companyName)}\n`

  const outletAddress
    = invoice.outlet?.address || invoice.order?.outlet?.address

  if (outletAddress)
    content += `${centerText(outletAddress)}\n`

  const outletPhone = invoice.outlet?.phone || invoice.order?.outlet?.phone
  if (outletPhone)
    content += `${centerText(`Telp: ${outletPhone}`)}\n`

  content += `${separator}\n`
  content += `${centerText('INVOICE')}\n`
  content += `${separator}\n\n`

  // Invoice details
  content += `${formatLine('No. Invoice', invoice.invoiceNumber)}\n`
  content += `${formatLine('Tanggal', formatDate(invoice.invoiceDate))}\n`
  content += `${formatLine('Jatuh Tempo', formatDate(invoice.dueDate))}\n`

  if (invoice.order)
    content += `${formatLine('Ref. Order', invoice.order.orderCode)}\n`

  content += `${formatLine('Status', translateStatus(invoice.status))}\n`
  content += `${dash}\n`

  // Customer info
  content += 'Kepada:\n'
  content += `${invoice.customerName}\n`

  if (invoice.customerPhone)
    content += `Telp: ${invoice.customerPhone}\n`

  if (invoice.customerAddress)
    content += `${invoice.customerAddress.substring(0, width)}\n`

  content += `${dash}\n\n`

  // Items header
  content
    += `${'Item'.padEnd(45)
    + 'Qty'.padStart(8)
    + 'Harga'.padStart(12)
    + 'Total'.padStart(15)
     }\n`
  content += `${dash}\n`

  // Items
  invoice.lines?.forEach((line: any) => {
    const itemName = line.itemName.substring(0, 45)

    content += itemName.padEnd(45)
    content += String(line.quantity).padStart(8)

    const price = new Intl.NumberFormat('id-ID').format(line.unitPrice)

    content += price.padStart(12)

    const total = new Intl.NumberFormat('id-ID').format(line.lineTotal)

    content += `${total.padStart(15)}\n`

    if (line.itemSku)
      content += `  SKU: ${line.itemSku}\n`

    if (line.discount > 0) {
      const discount = new Intl.NumberFormat('id-ID').format(line.discount)

      content += `  Diskon: -Rp ${discount}\n`
    }
  })

  content += `${dash}\n`

  // Totals
  content += `${formatAmount('Subtotal', invoice.subtotal)}\n`

  if (invoice.discountTotal > 0)
    content += `${formatAmount('Diskon', -invoice.discountTotal)}\n`

  if (invoice.taxTotal > 0)
    content += `${formatAmount('Pajak', invoice.taxTotal)}\n`

  content += `${separator}\n`
  content += `${formatAmount('TOTAL', invoice.grandTotal)}\n`
  content += `${separator}\n`

  // Payment info
  if (invoice.paidAmount > 0) {
    content += `${formatAmount('Dibayar', invoice.paidAmount)}\n`
    content += `${formatAmount('Sisa Tagihan', invoice.dueAmount)}\n`
    content += `${dash}\n`
  }

  // Payment history
  if (invoice.payments && invoice.payments.length > 0) {
    content += '\nRiwayat Pembayaran:\n'
    content += `${dash}\n`
    invoice.payments.forEach((payment: any) => {
      const date = formatDate(payment.paymentDate)
      const method = payment.paymentMethod.replace(/_/g, ' ').toUpperCase()
      const amount = new Intl.NumberFormat('id-ID').format(payment.amount)

      content += `${date} - ${method}\n`
      content += `Jumlah: Rp ${amount}\n`
      if (payment.referenceNumber)
        content += `Ref: ${payment.referenceNumber}\n`

      content += '\n'
    })
    content += `${dash}\n`
  }

  // Notes
  if (invoice.notes) {
    content += '\nCatatan:\n'
    content += `${invoice.notes.substring(0, width * 3)}\n`
    content += `${dash}\n`
  }

  // Payment terms
  if (invoice.paymentTerms) {
    content += '\nTermin Pembayaran:\n'
    content += `${invoice.paymentTerms.substring(0, width)}\n`
    content += `${dash}\n`
  }

  // Footer
  content += '\n'
  content += `${centerText('Terima Kasih Atas Kepercayaan Anda')}\n`
  content
    += `${centerText(`Dicetak pada: ${dayjs().format('DD/MM/YYYY HH:mm')}`)}\n`
  content += `${separator}\n`

  // Create print window
  const printWindow = window.open('', '_blank')

  if (printWindow) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title> <\/title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      line-height: 1.2;
      margin: 1cm;
      padding: 0;
      color: #000;
    }
    .container {
      width: 100%;
      max-width: 80ch;
      margin: 0 auto;
    }
    pre {
      margin: 0;
      padding: 0;
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      white-space: pre;
      overflow: visible;
    }
    @media print {
      body {
        background: white;
        margin: 1cm;
      }
      .no-print {
        display: none;
      }
      /* Hide browser print header/footer */
      @page {
        margin: 0;
      }
    }
    .print-button {
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 10px 20px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      z-index: 1000;
    }
    .print-button:hover {
      background: #2980b9;
    }
  <\/style>
<\/head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print<\/button>
  <div class="container">
    <pre>${content}<\/pre>
  <\/div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  <\/script>
<\/body>
<\/html>`

    printWindow.document.write(html)
    printWindow.document.close()
  }
}

const sendEmail = () => {
  openEmailDialog()
}

onMounted(() => {
  fetchInvoice()
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
        Memuat data invoice...
      </p>
    </VCard>

    <div v-else-if="selectedInvoice">
      <!-- Header -->
      <VCard>
        <VCardText class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
          <div class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              @click="router.push('/sales/invoices')"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div class="ms-3">
              <h2 class="text-h5">
                Detail Faktur Penjualan
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ selectedInvoice.invoiceNumber }}
              </p>
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
          <!-- Invoice Info -->
          <VCard>
            <VCardTitle class="d-flex align-center justify-space-between">
              <span>Informasi Faktur</span>
              <VChip
                :color="statusColor(selectedInvoice.status)"
                size="small"
                class="text-uppercase"
              >
                {{ translateStatus(selectedInvoice.status) }}
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
                      Nomor Faktur
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ selectedInvoice.invoiceNumber }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Tanggal Faktur
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(selectedInvoice.invoiceDate) }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Jatuh Tempo
                    </div>
                    <div
                      class="text-body-1"
                      :class="{
                        'text-error':
                          selectedInvoice.status === 'OVERDUE'
                          || (selectedInvoice.dueAmount > 0
                            && new Date(selectedInvoice.dueDate) < new Date()),
                      }"
                    >
                      {{ formatDate(selectedInvoice.dueDate) }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Referensi Order (SO)
                    </div>
                    <div
                      v-if="selectedInvoice.order"
                      class="text-body-1 text-primary cursor-pointer"
                      @click="
                        router.push(
                          `/sales/sales-orders/${selectedInvoice.order.salesOrder?.salesOrderId}`,
                        )
                      "
                    >
                      {{ selectedInvoice.order.orderCode }}
                    </div>
                    <div
                      v-else
                      class="text-body-1"
                    >
                      -
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Tipe
                    </div>
                    <div class="text-body-1 text-capitalize">
                      {{ selectedInvoice.type }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Termin Pembayaran
                    </div>
                    <div class="text-body-1">
                      {{ selectedInvoice.paymentTerms || "-" }}
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Customer Info -->
          <VCard class="mt-4">
            <VCardTitle>Informasi Pelanggan</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Nama
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ selectedInvoice.customerName || "-" }}
                </div>
              </div>
              <div
                v-if="selectedInvoice.customerPhone"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Telepon
                </div>
                <div class="text-body-1">
                  {{ selectedInvoice.customerPhone }}
                </div>
              </div>
              <div
                v-if="selectedInvoice.customerAddress"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Alamat
                </div>
                <div class="text-body-1">
                  {{ selectedInvoice.customerAddress }}
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Items -->
          <VCard class="mt-4">
            <VCardTitle>Item Tagihan</VCardTitle>
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
                      Diskon
                    </th>
                    <th class="text-end">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="line in selectedInvoice.lines"
                    :key="line.invoiceLineId"
                  >
                    <td>
                      <div>
                        <strong>{{ line.itemName }}</strong>
                        <div
                          v-if="line.itemSku"
                          class="text-caption text-medium-emphasis"
                        >
                          {{ line.itemSku }}
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      {{ line.quantity }}
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(line.unitPrice) }}
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(line.discount || 0) }}
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(line.lineTotal) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Payment History -->
          <VCard
            v-if="
              selectedInvoice.payments && selectedInvoice.payments.length > 0
            "
            class="mt-4"
          >
            <VCardTitle>Riwayat Pembayaran</VCardTitle>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Metode</th>
                    <th>Referensi</th>
                    <th class="text-end">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="payment in selectedInvoice.payments"
                    :key="payment.paymentId"
                  >
                    <td>{{ formatDate(payment.paymentDate) }}</td>
                    <td class="text-capitalize">
                      {{ payment.paymentMethod }}
                    </td>
                    <td>{{ payment.referenceNumber || "-" }}</td>
                    <td class="text-end">
                      {{ formatCurrency(payment.amount) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Notes -->
          <VCard
            v-if="selectedInvoice.notes || selectedInvoice.internalNotes"
            class="mt-4"
          >
            <VCardTitle>Catatan</VCardTitle>
            <VCardText>
              <div
                v-if="selectedInvoice.notes"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Catatan Invoice
                </div>
                <div class="text-body-1">
                  {{ selectedInvoice.notes }}
                </div>
              </div>
              <div
                v-if="selectedInvoice.internalNotes"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Catatan Internal
                </div>
                <div class="text-body-1">
                  {{ selectedInvoice.internalNotes }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column - Sidebar -->
        <VCol
          cols="12"
          md="4"
        >
          <!-- Actions -->
          <VCard>
            <VCardTitle>Aksi</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-2">
                <VBtn
                  v-if="isDraft"
                  color="primary"
                  prepend-icon="tabler-edit"
                  block
                  @click="router.push(`/sales/invoices/edit/${invoiceId}`)"
                >
                  Edit Invoice
                </VBtn>

                <VBtn
                  v-if="
                    !isDraft
                      && selectedInvoice.dueAmount > 0
                      && selectedInvoice.status !== 'VOID'
                      && selectedInvoice.status !== 'CANCELLED'
                  "
                  color="success"
                  prepend-icon="tabler-cash"
                  block
                  @click="openPaymentDialog"
                >
                  Catat Pembayaran
                </VBtn>

                <VBtn
                  color="primary"
                  variant="outlined"
                  prepend-icon="tabler-download"
                  :loading="isLoadingDownload"
                  block
                  :disabled="isDraft"
                  @click="downloadPDF"
                >
                  Download PDF
                </VBtn>

                <VBtn
                  color="secondary"
                  variant="outlined"
                  prepend-icon="tabler-printer"
                  block
                  :disabled="isDraft"
                  @click="printDotMatrix"
                >
                  Print Dot Matrix
                </VBtn>

                <VBtn
                  :color="isDraft ? 'primary' : 'info'"
                  :variant="isDraft ? 'elevated' : 'outlined'"
                  :prepend-icon="isDraft ? 'tabler-send' : 'tabler-mail'"
                  block
                  @click="isDraft ? openConfirmDialog() : openEmailDialog()"
                >
                  {{ isDraft ? "Konfirmasi & Kirim Invoice" : "Kirim Email" }}
                </VBtn>

                <VBtn
                  v-if="
                    !isDraft
                      && ['SENT', 'UNPAID', 'PARTIALLY_PAID'].includes(
                        selectedInvoice.status,
                      )
                  "
                  color="error"
                  variant="outlined"
                  prepend-icon="tabler-ban"
                  block
                  @click="openVoidDialog"
                >
                  Batalkan (Void)
                </VBtn>

                <VBtn
                  v-if="isDraft"
                  color="error"
                  variant="outlined"
                  prepend-icon="tabler-trash"
                  block
                  @click="openDeleteDialog"
                >
                  Hapus Invoice
                </VBtn>

                <VAlert
                  v-if="selectedInvoice.status === 'PAID'"
                  type="success"
                  variant="tonal"
                  density="compact"
                  icon="tabler-check"
                >
                  Invoice sudah lunas
                </VAlert>

                <VAlert
                  v-if="selectedInvoice.status === 'VOID'"
                  type="error"
                  variant="tonal"
                  density="compact"
                  icon="tabler-ban"
                >
                  Invoice dibatalkan
                </VAlert>
              </div>
            </VCardText>
          </VCard>

          <!-- Summary -->
          <VCard class="mt-4">
            <VCardTitle>Ringkasan Pembayaran</VCardTitle>
            <VCardText>
              <div class="d-flex justify-space-between mb-2">
                <span>Subtotal:</span>
                <strong>{{ formatCurrency(selectedInvoice.subtotal) }}</strong>
              </div>
              <div
                v-if="selectedInvoice.discountTotal > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span>Diskon:</span>
                <strong class="text-error">- {{ formatCurrency(selectedInvoice.discountTotal) }}</strong>
              </div>
              <div
                v-if="selectedInvoice.taxTotal > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span>Pajak:</span>
                <strong>{{ formatCurrency(selectedInvoice.taxTotal) }}</strong>
              </div>
              <VDivider class="my-3" />
              <div class="d-flex justify-space-between mb-2">
                <span class="text-h6">Total:</span>
                <strong class="text-h6 text-primary">
                  {{ formatCurrency(selectedInvoice.grandTotal) }}
                </strong>
              </div>
              <div
                v-if="selectedInvoice.paidAmount > 0"
                class="mt-3"
              >
                <div class="d-flex justify-space-between mb-2">
                  <span>Sudah Dibayar:</span>
                  <strong class="text-success">{{
                    formatCurrency(selectedInvoice.paidAmount)
                  }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Sisa Tagihan:</span>
                  <strong class="text-warning">
                    {{ formatCurrency(selectedInvoice.dueAmount) }}
                  </strong>
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Timeline -->
          <VCard class="mt-4">
            <VCardTitle>Timeline</VCardTitle>
            <VCardText>
              <VTimeline
                density="compact"
                align="start"
                side="end"
              >
                <VTimelineItem
                  dot-color="primary"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(selectedInvoice.createdAt) }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    Faktur Dibuat
                  </div>
                </VTimelineItem>

                <VTimelineItem
                  v-if="selectedInvoice.sentAt"
                  dot-color="info"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(selectedInvoice.sentAt) }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    Faktur Dikirim
                  </div>
                </VTimelineItem>

                <VTimelineItem
                  v-if="selectedInvoice.paidAt"
                  dot-color="success"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(selectedInvoice.paidAt) }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    Invoice Lunas
                  </div>
                </VTimelineItem>

                <VTimelineItem
                  v-if="selectedInvoice.voidedAt"
                  dot-color="error"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(selectedInvoice.voidedAt) }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    Invoice Dibatalkan (Void)
                  </div>
                  <div
                    v-if="selectedInvoice.voidReason"
                    class="text-caption"
                  >
                    Alasan: {{ selectedInvoice.voidReason }}
                  </div>
                </VTimelineItem>
              </VTimeline>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VCard
      v-else
      class="text-center py-8"
    >
      <VIcon
        icon="tabler-alert-circle"
        size="64"
        color="error"
      />
      <p class="mt-4">
        Data invoice tidak ditemukan
      </p>
      <VBtn
        color="primary"
        class="mt-2"
        @click="router.push('/sales/invoices')"
      >
        Kembali ke Daftar
      </VBtn>
    </VCard>

    <!-- Payment Dialog -->
    <VDialog
      v-model="isPaymentDialogOpen"
      max-width="500"
    >
      <VCard title="Catat Pembayaran">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="paymentForm.paymentDate"
                label="Tanggal Pembayaran"
                type="date"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model.number="paymentForm.amount"
                label="Jumlah Pembayaran"
                type="number"
                prefix="Rp"
              />
              <div class="d-flex justify-space-between mt-1 px-1">
                <span class="text-caption text-medium-emphasis">Total Tagihan:
                  {{ formatCurrency(selectedInvoice?.dueAmount || 0) }}</span>
                <span
                  class="text-caption"
                  :class="
                    remainingAfterPayment > 0 ? 'text-warning' : 'text-success'
                  "
                >
                  Sisa: {{ formatCurrency(remainingAfterPayment) }}
                </span>
              </div>
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="paymentForm.paymentMethod"
                label="Metode Pembayaran"
                :items="[
                  'CASH',
                  'BANK_TRANSFER',
                  'CREDIT_CARD',
                  'DEBIT_CARD',
                  'QRIS',
                  'E_WALLET',
                  'CHECK',
                  'OTHER',
                ]"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="paymentForm.referenceNumber"
                label="Nomor Referensi"
                placeholder="Contoh: No. Transaksi Bank"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="paymentForm.notes"
                label="Catatan"
                rows="3"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isPaymentDialogOpen = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            variant="elevated"
            :loading="invoiceStore.isLoadingUpdate"
            @click="submitPayment"
          >
            Simpan
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Void Dialog -->
    <VDialog
      v-model="isVoidDialogOpen"
      max-width="500"
    >
      <VCard title="Batalkan Invoice (Void)">
        <VCardText>
          <p class="text-body-2 text-warning mb-4">
            Apakah Anda yakin ingin membatalkan invoice ini? Tindakan ini tidak
            dapat dibatalkan.
          </p>
          <VTextarea
            v-model="voidReason"
            label="Alasan Pembatalan"
            placeholder="Masukkan alasan pembatalan invoice..."
            rows="3"
            :rules="[(v) => !!v || 'Alasan wajib diisi']"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isVoidDialogOpen = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="error"
            variant="elevated"
            :loading="invoiceStore.isLoadingUpdate"
            @click="submitVoid"
          >
            Batalkan Invoice
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Email Dialog -->
    <VDialog
      v-model="isEmailDialogOpen"
      max-width="600"
    >
      <VCard title="Kirim Invoice via Email">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="emailForm.recipientEmail"
                label="Email Penerima"
                type="email"
                placeholder="customer@example.com"
                :rules="[
                  (v) => !!v || 'Email wajib diisi',
                  (v) => /.+@.+\..+/.test(v) || 'Email tidak valid',
                ]"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="emailForm.subject"
                label="Subject Email"
                placeholder="Invoice #INV-001"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="emailForm.message"
                label="Pesan Tambahan (Opsional)"
                placeholder="Tambahkan pesan khusus untuk pelanggan..."
                rows="4"
              />
            </VCol>
            <VCol cols="12">
              <VAlert
                type="info"
                variant="tonal"
                density="compact"
              >
                Invoice akan dikirim sebagai attachment PDF
              </VAlert>
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isEmailDialogOpen = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            variant="elevated"
            prepend-icon="tabler-send"
            :loading="invoiceStore.isLoadingUpdate"
            @click="submitEmail"
          >
            Kirim Email
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
    <!-- Delete Dialog -->
    <VDialog
      v-model="isDeleteDialogOpen"
      max-width="500"
    >
      <VCard title="Hapus Invoice">
        <VCardText>
          Apakah Anda yakin ingin menghapus invoice ini? Tindakan ini tidak
          dapat dibatalkan.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="text"
            @click="isDeleteDialogOpen = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="error"
            variant="elevated"
            :loading="isLoadingDelete"
            @click="submitDelete"
          >
            Hapus
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Confirm Dialog -->
    <VDialog
      v-model="isConfirmDialogOpen"
      max-width="500"
    >
      <VCard title="Kirim Invoice">
        <VCardText>
          Apakah Anda yakin ingin mengirim invoice ini? Status akan berubah
          menjadi UNPAID dan siap untuk pembayaran.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="text"
            @click="isConfirmDialogOpen = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            variant="elevated"
            :loading="invoiceStore.isLoadingUpdate"
            @click="submitConfirm"
          >
            Ya, Kirim
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
