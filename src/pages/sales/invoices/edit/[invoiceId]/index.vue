<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useInvoiceStore } from '@/stores/sales/invoiceStore'
import { useSalesOrderStore } from '@/stores/sales/salesOrderStore'
import ItemSkuSelectModal from '@/components/dialogs/ItemSkuSelectModal.vue'
import { showToast } from '@/utils/toaster'
import { customDebounce } from '@/utils/common'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const salesOrderStore = useSalesOrderStore()
const invoiceId = route.params.invoiceId as string

// Loading States
const isLoadingInvoice = ref(true)
const isSubmitting = ref(false)

// Mode Selection
const invoiceMode = ref<'standalone' | 'from_order'>('standalone')
const isLoadingSO = ref(false)

// Sales Order Selection
const selectedSalesOrderId = ref<string | null>(null)
const salesOrderSearch = ref('')
const salesOrderOptions = ref<any[]>([])
const isLoadingSalesOrders = ref(false)

// Form Data
const form = ref({
  invoiceNumber: '',
  invoiceDate: dayjs().format('YYYY-MM-DD'),
  dueDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  customerId: null as string | null,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  notes: '',
  paymentTerms: 'NET_30',
  type: 'FULL',
  lines: [] as any[],
})

// Item Modal
const isItemModalOpen = ref(false)

// Computed Totals
const subtotal = computed(() => {
  return form.value.lines.reduce((sum, line) => {
    return sum + line.quantity * line.unitPrice
  }, 0)
})

const discountTotal = computed(() => {
  return form.value.lines.reduce((sum, line) => {
    return sum + (line.discount || 0)
  }, 0)
})

const taxTotal = computed(() => {
  return form.value.lines.reduce((sum, line) => {
    const lineAmount = line.quantity * line.unitPrice - (line.discount || 0)

    return sum + (lineAmount * (line.taxRate || 0)) / 100
  }, 0)
})

const grandTotal = computed(() => {
  return subtotal.value - discountTotal.value + taxTotal.value
})

// Load existing invoice data
const loadInvoiceData = async () => {
  isLoadingInvoice.value = true
  try {
    await invoiceStore.fetchDetail(invoiceId, {
      include: 'lines,order,order.lines,order.customer',
    })

    const invoice = invoiceStore.selectedInvoice

    // Check if invoice is DRAFT
    if (invoice.status !== 'DRAFT') {
      showToast('Hanya invoice dengan status DRAFT yang bisa diubah', 'error')
      router.push(`/sales/invoices/${invoiceId}`)

      return
    }

    // Fill form with existing data
    form.value.invoiceNumber = invoice.invoiceNumber || ''
    form.value.invoiceDate = dayjs(invoice.invoiceDate).format('YYYY-MM-DD')
    form.value.dueDate = dayjs(invoice.dueDate).format('YYYY-MM-DD')
    form.value.customerName = invoice.customerName || ''
    form.value.customerEmail = invoice.customerEmail || ''
    form.value.customerPhone = invoice.customerPhone || ''
    form.value.customerAddress = invoice.customerAddress || ''
    form.value.notes = invoice.notes || ''
    form.value.paymentTerms = invoice.paymentTerms || 'NET_30'
    form.value.type = invoice.type || 'FULL'
    form.value.customerId = invoice.customerId || null

    // Determine mode based on whether there's an order
    if (invoice.orderId) {
      invoiceMode.value = 'from_order'
      selectedSalesOrderId.value = invoice.orderId
    }
    else {
      invoiceMode.value = 'standalone'
    }

    // Fill lines
    form.value.lines = (invoice.lines || []).map((line: any) => ({
      invoiceLineId: line.invoiceLineId,
      orderLineId: line.orderLineId || null,
      itemSkuId: line.itemSkuId,
      itemName: line.itemName,
      itemSku: line.itemSku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discount: line.discount || 0,
      taxRate: line.taxRate || 0,
      notes: line.notes || '',
    }))
  }
  catch (error) {
    console.error('Error loading invoice:', error)
    showToast('Gagal memuat data invoice', 'error')
    router.push('/sales/invoices')
  }
  finally {
    isLoadingInvoice.value = false
  }
}

// Watch mode change
watch(invoiceMode, newMode => {
  if (newMode === 'standalone')
    selectedSalesOrderId.value = null
  else if (newMode === 'from_order')
    loadInitialSalesOrders()
})

// Watch payment terms and invoice date to auto-calculate due date
watch(
  [() => form.value.paymentTerms, () => form.value.invoiceDate],
  ([terms, date]) => {
    if (!date)
      return

    const baseDate = dayjs(date)
    let daysToAdd = 0

    switch (terms) {
      case 'NET_7':
        daysToAdd = 7
        break
      case 'NET_14':
        daysToAdd = 14
        break
      case 'NET_30':
        daysToAdd = 30
        break
      case 'NET_60':
        daysToAdd = 60
        break
      case 'NET_90':
        daysToAdd = 90
        break
      case 'COD':
        daysToAdd = 0
        break
      default:
        return
    }

    form.value.dueDate = baseDate.add(daysToAdd, 'day').format('YYYY-MM-DD')
  },
)

// Methods
const fetchSalesOrders = async (query?: string) => {
  if (query && query.length < 2)
    return

  isLoadingSalesOrders.value = true
  try {
    const queryParams: any = {
      perPage: 10,
      include: 'order',
    }

    if (query)
      queryParams.search = query

    const response = await salesOrderStore.baseQuery(queryParams).get()

    if (response.data) {
      salesOrderOptions.value = response.data.map((item: any) => ({
        ...item,
        orderNumber: item.order?.orderCode || item.salesOrderId || 'N/A',
        customerName: item.order?.customerName || '',
        grandTotal: item.order?.grandTotal || 0,
      }))
    }
    else {
      salesOrderOptions.value = []
    }
  }
  catch (error) {
    console.error('Failed to fetch sales orders', error)
    salesOrderOptions.value = []
  }
  finally {
    isLoadingSalesOrders.value = false
  }
}

const loadInitialSalesOrders = async () => {
  await fetchSalesOrders()
}

const onItemSelected = (item: any) => {
  const existing = form.value.lines.find(l => l.itemSkuId === item.itemSkuId)
  if (existing) {
    existing.quantity += 1

    return
  }

  form.value.lines.push({
    invoiceLineId: null,
    orderLineId: null,
    itemSkuId: item.itemSkuId,
    itemName: item.name,
    itemSku: item.sku,
    quantity: 1,
    unitPrice: item.price || 0,
    discount: 0,
    taxRate: 0,
    notes: '',
  })
}

const removeLine = (index: number) => {
  form.value.lines.splice(index, 1)
}

const handleSubmit = async (isDraft: boolean = true) => {
  // Validation
  if (invoiceMode.value === 'standalone' && !form.value.customerName) {
    showToast('Nama customer harus diisi', 'error')

    return
  }
  if (form.value.lines.length === 0) {
    showToast('Tambahkan minimal satu item', 'error')

    return
  }

  isSubmitting.value = true

  try {
    const payload: any = {
      invoiceNumber: form.value.invoiceNumber || undefined,
      invoiceDate: form.value.invoiceDate,
      invoiceDueDate: form.value.dueDate,
      notes: form.value.notes,
      paymentTerms: form.value.paymentTerms,
      type: form.value.type,
      status: isDraft ? 'DRAFT' : undefined, // Keep as DRAFT or allow backend to change status
      lines: form.value.lines.map(l => ({
        invoiceLineId: l.invoiceLineId || undefined,
        orderLineId: l.orderLineId,
        itemSkuId: l.itemSkuId,
        itemName: l.itemName,
        itemSku: l.itemSku,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discount: l.discount,
        taxRate: l.taxRate,
        notes: l.notes,
      })),
    }

    // Add customer info for standalone
    if (invoiceMode.value === 'standalone') {
      payload.customerName = form.value.customerName
      payload.customerEmail = form.value.customerEmail
      payload.customerPhone = form.value.customerPhone
      payload.customerAddress = form.value.customerAddress
    }

    const success = await invoiceStore.updateInvoice(invoiceId, payload)

    if (success) {
      // If not draft, confirm the invoice
      if (!isDraft)
        await invoiceStore.confirmInvoice(invoiceId)

      showToast(
        isDraft
          ? 'Invoice berhasil diperbarui sebagai draft'
          : 'Invoice berhasil diperbarui dan dikirim',
        'success',
      )
      router.push(`/sales/invoices/${invoiceId}`)
    }
  }
  catch (error: any) {
    showToast(error.data?.message || 'Gagal memperbarui invoice', 'error')
  }
  finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(
  salesOrderSearch,
  customDebounce(val => {
    const existingOption = salesOrderOptions.value.find(
      opt => opt.orderNumber === val,
    )

    if (!existingOption)
      fetchSalesOrders(val)
  }, 500),
)

onMounted(() => {
  loadInvoiceData()
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const invoiceTypes = [
  { title: 'Full Invoice', value: 'FULL' },
  { title: 'Down Payment', value: 'DOWN_PAYMENT' },
  { title: 'Termin', value: 'TERMIN' },
  { title: 'Final Payment', value: 'FINAL' },
]
</script>

<template>
  <div>
    <VCard
      v-if="isLoadingInvoice"
      class="mb-4"
    >
      <VCardText class="text-center py-8">
        <VProgressCircular
          indeterminate
          color="primary"
        />
        <p class="mt-4">
          Memuat data invoice...
        </p>
      </VCardText>
    </VCard>

    <template v-else>
      <VCard class="mb-4">
        <VCardText class="d-flex align-center">
          <VBtn
            icon
            variant="text"
            @click="router.back()"
          >
            <VIcon icon="tabler-arrow-left" />
          </VBtn>
          <div class="ms-3">
            <h2 class="text-h5">
              Edit Faktur Penjualan
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Edit faktur yang masih berstatus draft
            </p>
          </div>
        </VCardText>
      </VCard>

      <VRow>
        <!-- Left Column: Mode & Source Selection -->
        <VCol
          cols="12"
          md="4"
        >
          <!-- Customer Info (standalone mode is locked when editing) -->
          <VCard
            v-if="invoiceMode === 'standalone'"
            title="Informasi Customer"
            class="mb-4"
          >
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="form.customerName"
                    label="Nama Customer *"
                    placeholder="PT. Contoh"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.customerEmail"
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.customerPhone"
                    label="Telepon"
                    placeholder="08123456789"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextarea
                    v-model="form.customerAddress"
                    label="Alamat"
                    rows="2"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Faktur Details -->
          <VCard title="Detail Faktur Penjualan">
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="form.invoiceNumber"
                    label="Nomor Faktur (Opsional)"
                    placeholder="Contoh: INV-20251201-001"
                    hint="Jika tidak diisi, nomor faktur akan di-generate otomatis"
                    persistent-hint
                    persistent-placeholder
                  />
                </VCol>
                <VCol cols="12">
                  <VSelect
                    v-model="form.type"
                    label="Tipe Faktur"
                    :items="invoiceTypes"
                  />
                </VCol>

                <VCol cols="12">
                  <VSelect
                    v-model="form.paymentTerms"
                    label="Termin Pembayaran"
                    :items="['COD', 'NET_7', 'NET_14', 'NET_30', 'NET_60']"
                  />
                </VCol>
                <VCol cols="12">
                  <AppDateTimePicker
                    v-model="form.invoiceDate"
                    label="Tanggal Faktur"
                    :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
                  />
                </VCol>

                <VCol cols="12">
                  <AppDateTimePicker
                    v-model="form.dueDate"
                    label="Jatuh Tempo"
                    :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextarea
                    v-model="form.notes"
                    label="Catatan"
                    rows="3"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column: Items -->
        <VCol
          cols="12"
          md="8"
        >
          <VCard title="Item Faktur Penjualan">
            <template #append>
              <VBtn
                v-if="invoiceMode === 'standalone'"
                prepend-icon="tabler-plus"
                variant="tonal"
                @click="isItemModalOpen = true"
              >
                Tambah Item
              </VBtn>
            </template>

            <VCardText>
              <VTable class="text-no-wrap">
                <thead>
                  <tr>
                    <th scope="col">
                      Item
                    </th>
                    <th
                      scope="col"
                      style="width: 150px"
                    >
                      Qty
                    </th>
                    <th
                      scope="col"
                      style="width: 150px"
                    >
                      Harga
                    </th>
                    <th
                      scope="col"
                      style="width: 120px"
                    >
                      Diskon
                    </th>
                    <th
                      scope="col"
                      class="text-end"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      style="width: 10px"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(line, index) in form.lines"
                    :key="index"
                  >
                    <td>
                      <div class="font-weight-medium">
                        {{ line.itemName }}
                      </div>
                      <div class="text-caption text-disabled">
                        {{ line.itemSku }}
                      </div>
                    </td>
                    <td>
                      <VTextField
                        v-model.number="line.quantity"
                        type="number"
                        density="compact"
                        hide-details
                        min="1"
                      />
                    </td>
                    <td>
                      <VTextField
                        v-model.number="line.unitPrice"
                        type="number"
                        density="compact"
                        hide-details
                        prefix="Rp"
                      />
                    </td>
                    <td>
                      <VTextField
                        v-model.number="line.discount"
                        type="number"
                        density="compact"
                        hide-details
                        prefix="Rp"
                      />
                    </td>
                    <td class="text-end font-weight-bold">
                      {{
                        formatCurrency(
                          line.quantity * line.unitPrice - (line.discount || 0),
                        )
                      }}
                    </td>
                    <td>
                      <VBtn
                        icon="tabler-trash"
                        variant="text"
                        color="error"
                        size="small"
                        @click="removeLine(index)"
                      />
                    </td>
                  </tr>
                  <tr v-if="form.lines.length === 0">
                    <td
                      colspan="6"
                      class="text-center py-4 text-medium-emphasis"
                    >
                      Belum ada item. Klik "Tambah Item" untuk memulai.
                    </td>
                  </tr>
                </tbody>
              </VTable>

              <VDivider class="my-4" />

              <div class="d-flex justify-end">
                <div style="width: 300px">
                  <div class="d-flex justify-space-between mb-2">
                    <span>Subtotal</span>
                    <span class="font-weight-medium">{{
                      formatCurrency(subtotal)
                    }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>Diskon Total</span>
                    <span class="text-error">- {{ formatCurrency(discountTotal) }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>Pajak</span>
                    <span>{{ formatCurrency(taxTotal) }}</span>
                  </div>
                  <VDivider class="my-2" />
                  <div class="d-flex justify-space-between text-h6 text-primary">
                    <span>Grand Total</span>
                    <span>{{ formatCurrency(grandTotal) }}</span>
                  </div>
                </div>
              </div>
            </VCardText>

            <VCardActions class="justify-end pa-4">
              <VBtn
                variant="outlined"
                color="secondary"
                @click="router.back()"
              >
                Batal
              </VBtn>
              <VBtn
                variant="outlined"
                color="primary"
                :disabled="form.lines.length === 0"
                :loading="isSubmitting"
                @click="handleSubmit(true)"
              >
                Simpan sebagai Draft
              </VBtn>
              <VBtn
                variant="elevated"
                color="primary"
                :disabled="form.lines.length === 0"
                :loading="isSubmitting"
                @click="handleSubmit(false)"
              >
                Simpan & Kirim
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>

      <ItemSkuSelectModal
        v-if="invoiceMode === 'standalone'"
        v-model:is-visible="isItemModalOpen"
        @select="onItemSelected"
      />
    </template>
  </div>
</template>
