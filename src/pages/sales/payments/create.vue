<script setup lang="ts">
import dayjs from 'dayjs'
import { useInvoiceStore } from '@/stores/sales/invoiceStore'
import type { Invoice } from '@/types/models/sales/invoice'
import { showToast } from '@/utils/toaster'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()

const invoiceId = ref<string | undefined>(undefined)
const invoice = ref<Invoice | null>(null)
const isLoading = ref(false)
const isFromRoute = ref(false)
const invoiceOptions = ref<Invoice[]>([])

const paymentMethods = [
  { title: 'Cash', value: 'CASH' },
  { title: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { title: 'Credit Card', value: 'CREDIT_CARD' },
  { title: 'Debit Card', value: 'DEBIT_CARD' },
  { title: 'QRIS', value: 'QRIS' },
  { title: 'E-Wallet', value: 'E_WALLET' },
  { title: 'Check', value: 'CHECK' },
  { title: 'Other', value: 'OTHER' },
]

const form = ref({
  paymentCode: '',
  paymentDate: dayjs().format('YYYY-MM-DD'),
  amount: 0,
  paymentMethod: 'CASH',
  referenceNumber: '',
  notes: '',
})

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

const fetchInvoiceOptions = async () => {
  try {
    // Fetch invoices that are not fully paid (OPEN, PARTIAL, SENT, UNPAID, PARTIALLY_PAID)
    // We can filter by status. Let's try to fetch all active invoices first.
    // The store supports 'status' filter.
    // Common statuses for unpaid invoices: SENT, UNPAID, PARTIALLY_PAID, OVERDUE.
    // We might need to fetch multiple statuses or just fetch all and filter client side if backend doesn't support multiple status filter in one query.
    // Assuming backend supports comma separated or we just fetch recent ones.
    // Let's try fetching with a broad filter or just recent ones.

    await invoiceStore.fetchPaginatedData({
      page: 1,
      perPage: 100,
      orderField: 'createdAt',
      orderDirection: 'desc',

      // status: "SENT,UNPAID,PARTIALLY_PAID,OVERDUE", // Try this if backend supports it
    })

    // Filter client side to be safe and ensure we only show payable invoices
    const payableStatuses = ['SENT', 'UNPAID', 'PARTIALLY_PAID', 'OVERDUE']

    invoiceOptions.value = (invoiceStore.paginateData.data || []).filter(
      inv => payableStatuses.includes(inv.status) && inv.dueAmount > 0,
    )
  }
  catch (error) {
    console.error('Failed to fetch invoice options', error)
  }
}

const fetchInvoice = async () => {
  if (!invoiceId.value)
    return

  isLoading.value = true
  try {
    await invoiceStore.fetchDetail(invoiceId.value, {
      include: 'order,order.customer,payments',
    })
    invoice.value = invoiceStore.selectedInvoice

    if (!invoice.value)
      throw new Error('Invoice not found')

    // Add to options if not exists
    const exists = invoiceOptions.value.some(
      o => o.invoiceId === invoice.value?.invoiceId,
    )

    if (!exists)
      invoiceOptions.value.push(invoice.value)

    // Set default amount to due amount
    form.value.amount = invoice.value.dueAmount
  }
  catch (error) {
    console.error('Failed to fetch Invoice', error)
    showToast('Gagal memuat Invoice', 'error')
  }
  finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!invoice.value)
    return

  if (form.value.amount <= 0) {
    showToast('Jumlah pembayaran harus lebih dari 0', 'error')

    return
  }

  if (form.value.amount > invoice.value.dueAmount) {
    showToast(
      `Jumlah pembayaran melebihi sisa tagihan (${formatCurrency(
        invoice.value.dueAmount,
      )})`,
      'error',
    )

    return
  }

  try {
    const payload = {
      invoice_id: invoiceId.value,
      payment_code: form.value.paymentCode || null,
      payment_date: form.value.paymentDate,
      amount: form.value.amount,
      payment_method: form.value.paymentMethod,
      reference_number: form.value.referenceNumber || null,
      notes: form.value.notes || null,
    }

    const success = await invoiceStore.recordPayment(invoiceId.value!, payload)

    if (success) {
      // Go back or to invoice detail
      router.push('/sales/payments')
    }
  }
  catch (error) {
    console.error('Failed to record payment:', error)
  }
}

watch(invoiceId, newVal => {
  if (newVal) {
    fetchInvoice()
  }
  else {
    invoice.value = null
    form.value.amount = 0
    form.value.referenceNumber = ''
    form.value.bankName = ''
    form.value.accountNumber = ''
    form.value.notes = ''
  }
})

onMounted(async () => {
  await fetchInvoiceOptions()

  const queryId = route.query.invoiceId as string
  if (queryId) {
    invoiceId.value = queryId
    isFromRoute.value = true
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <VBtn
            icon="tabler-arrow-left"
            variant="text"
            @click="router.back()"
          />
          <span>Buat Pembayaran Faktur</span>
        </div>
      </VCardTitle>
      <VCardText>
        <VAutocomplete
          v-model="invoiceId"
          :items="invoiceOptions"
          item-title="invoiceNumber"
          item-value="invoiceId"
          label="Pilih Invoice"
          placeholder="Cari Invoice..."
          :disabled="isFromRoute || isLoading"
          clearable
          no-data-text="Tidak ada Invoice yang perlu dibayar"
          persistent-placeholder
        >
          <template #item="{ props, item }">
            <VListItem
              v-bind="props"
              :subtitle="item.raw.customerName"
              :title="item.raw.invoiceNumber"
            >
              <template #append>
                <div class="d-flex flex-column align-end">
                  <VChip
                    size="x-small"
                    color="primary"
                    class="mb-1"
                  >
                    {{ item.raw.status }}
                  </VChip>
                  <span class="text-caption text-error">
                    Sisa: {{ formatCurrency(item.raw.dueAmount) }}
                  </span>
                </div>
              </template>
            </VListItem>
          </template>
        </VAutocomplete>
      </VCardText>
    </VCard>

    <!-- Loading State -->
    <VCard
      v-if="isLoading"
      class="text-center py-8"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
      <p class="mt-4">
        Memuat data Invoice...
      </p>
    </VCard>

    <!-- Main Content -->
    <div v-else-if="invoice">
      <VRow>
        <!-- Left Column - Invoice Info -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardTitle>Informasi Invoice</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-3">
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Nomor Invoice
                  </div>
                  <div class="font-weight-medium">
                    {{ invoice.invoiceNumber }}
                  </div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Customer
                  </div>
                  <div class="font-weight-medium">
                    {{ invoice.customerName || "-" }}
                  </div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Tanggal Invoice
                  </div>
                  <div>{{ formatDate(invoice.invoiceDate) }}</div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Jatuh Tempo
                  </div>
                  <div
                    :class="
                      dayjs(invoice.dueDate).isBefore(dayjs())
                        ? 'text-error'
                        : ''
                    "
                  >
                    {{ formatDate(invoice.dueDate) }}
                  </div>
                </div>
                <VDivider />
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Total Tagihan</span>
                  <span class="font-weight-medium">{{
                    formatCurrency(invoice.grandTotal)
                  }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Sudah Dibayar</span>
                  <span class="text-success">{{
                    formatCurrency(invoice.paidAmount)
                  }}</span>
                </div>
                <VDivider />
                <div class="d-flex justify-space-between align-center">
                  <span class="text-h6">Sisa Tagihan</span>
                  <span class="text-h6 text-error">{{
                    formatCurrency(invoice.dueAmount)
                  }}</span>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column - Payment Form -->
        <VCol
          cols="12"
          md="8"
        >
          <VCard>
            <VCardTitle>Detail Pembayaran</VCardTitle>
            <VCardText>
              <VForm @submit.prevent="handleSubmit">
                <VRow>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="form.paymentCode"
                      label="Kode Pembayaran (Opsional)"
                      placeholder="Kosongkan untuk auto-generate"
                      hint="Format: PAY-YYYYMMDD-XXX. Kosongkan untuk generate otomatis"
                      persistent-hint
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppDateTimePicker
                      v-model="form.paymentDate"
                      label="Tanggal Pembayaran"
                      placeholder="Pilih tanggal"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VSelect
                      v-model="form.paymentMethod"
                      :items="paymentMethods"
                      label="Metode Pembayaran"
                      placeholder="Pilih metode pembayaran"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="form.referenceNumber"
                      label="Nomor Referensi (Opsional)"
                      placeholder="No. Ref / Bukti Transfer"
                    />
                  </VCol>

                  <VCol cols="12">
                    <VTextField
                      v-model.number="form.amount"
                      label="Jumlah Pembayaran"
                      type="number"
                      prefix="Rp"
                      :max="invoice.dueAmount"
                      :rules="[
                        (v) => !!v || 'Jumlah pembayaran wajib diisi',
                        (v) => v > 0 || 'Jumlah harus lebih dari 0',
                        (v) =>
                          v <= invoice.dueAmount
                          || 'Jumlah melebihi sisa tagihan',
                      ]"
                    />
                    <div class="text-caption text-medium-emphasis mt-1">
                      Maksimal pembayaran:
                      {{ formatCurrency(invoice.dueAmount) }}
                    </div>
                  </VCol>

                  <VCol cols="12">
                    <VTextarea
                      v-model="form.notes"
                      label="Catatan"
                      placeholder="Catatan tambahan..."
                      rows="3"
                    />
                  </VCol>
                </VRow>

                <VDivider class="my-4" />

                <div class="d-flex justify-space-between align-center">
                  <VBtn
                    variant="outlined"
                    prepend-icon="tabler-arrow-left"
                    @click="router.back()"
                  >
                    Batal
                  </VBtn>
                  <VBtn
                    type="submit"
                    color="primary"
                    prepend-icon="tabler-cash"
                    :loading="invoiceStore.isLoadingUpdate"
                    :disabled="
                      form.amount <= 0 || form.amount > invoice.dueAmount
                    "
                  >
                    Simpan Pembayaran
                  </VBtn>
                </div>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>
</template>
