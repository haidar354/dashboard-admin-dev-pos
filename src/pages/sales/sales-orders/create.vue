<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SalesChannelSelectModal from '@/components/dialogs/SalesChannelSelectModal.vue'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { useOutletStore } from '@/stores/outletStore'
import { useSalesOrderStore } from '@/stores/sales/salesOrderStore'
import { useSalesQuotationStore } from '@/stores/sales/salesQuotationStore'
import type { ItemSkuView } from '@/types/models/product/item'
import type { Customer } from '@/types/models/sales/customer'
import type { SalesQuotation } from '@/types/models/sales/quotation'
import type { CreateSalesOrderRequest } from '@/types/models/sales/sales-order'

definePage({
  meta: {
    name: 'Buat Pesanan Penjualan (SO)',
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
const salesOrderStore = useSalesOrderStore()
const outletStore = useOutletStore()
const outletSidebarStore = useOutletSidebarStore()
const quotationStore = useSalesQuotationStore()

const { isLoadingCreate } = storeToRefs(salesOrderStore)

const { data: outlets, isLoadingFetchData: loadingOutlets }
  = storeToRefs(outletStore)

const { selectedSidebarOutlet } = storeToRefs(outletSidebarStore)

const { paginateData: quotations, isLoadingFetchData: loadingQuotations }
  = storeToRefs(quotationStore)

// Source type
const sourceType = ref<'direct' | 'quotation'>('direct')
const selectedQuotationId = ref<string | undefined>(undefined)

// Form state
const form = ref<
  CreateSalesOrderRequest & { outletId?: string; quotationId?: string }
>({
  outletId: undefined,
  quotationId: undefined,
  customerId: undefined,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  orderDate: new Date().toISOString().split('T')[0],
  deliveryDate: undefined,
  deliveryAddress: '',
  paymentMethod: 'CASH',
  paymentTerm: 'COD',
  notes: '',
  lines: [],
})

// Channel from query (e.g. POS)
const channelFromQuery = (route.query.channel || '')?.toString() || ''
const isPosChannel = ref(channelFromQuery.toUpperCase() === 'POS')
const selectedSalesChannelId = ref<string | undefined>(undefined)
const selectedQuotation = ref<SalesQuotation | undefined>(undefined)
const formErrors = ref<Record<string, string>>({})
const showItemModal = ref(false)

// Computed

const availableQuotations = computed(() => {
  return quotations.value.data || []
})

const subtotal = computed(() => {
  return form.value.lines.reduce((sum, line) => {
    return sum + line.quantity * line.unitPrice
  }, 0)
})

const totalDiscount = computed(() => {
  return form.value.lines.reduce((sum, line) => {
    return sum + (line.discount || 0) * line.quantity
  }, 0)
})

const totalTax = computed(() => {
  return form.value.lines.reduce((sum, line) => {
    const lineSubtotal
      = line.quantity * line.unitPrice - (line.discount || 0) * line.quantity

    return sum + (lineSubtotal * (line.taxRate || 0)) / 100
  }, 0)
})

const grandTotal = computed(() => {
  return subtotal.value - totalDiscount.value + totalTax.value
})

const fetchQuotations = async (outletId?: string) => {
  const filters: any = {
    // Exclude converted quotations - only show draft and sent
    status: 'draft,sent',
  }

  if (outletId)
    filters.outlet_id = outletId

  await quotationStore.fetchPaginatedData({
    page: 1,
    perPage: 100,
    ...filters,
  })
}

// Watch source type change
watch(sourceType, newType => {
  if (newType === 'direct') {
    selectedQuotationId.value = undefined
    form.value.quotationId = undefined
  }
})

// Watch outlet change to refetch quotations
watch(
  () => form.value.outletId,
  outletId => {
    if (sourceType.value === 'quotation' && outletId)
      fetchQuotations(outletId)

    // Reset quotation when outlet changes
    selectedQuotationId.value = undefined
  },
)

// Watch quotation selection
watch(selectedQuotationId, async quotationId => {
  if (!quotationId)
    return

  try {
    // Fetch quotation detail
    await quotationStore.fetchDetail(quotationId, {
      include: ['items', 'customer', 'salesChannel'],
    })

    const quotation = quotationStore.selectedQuotation

    selectedQuotation.value = quotation
    if (!quotation)
      return

    // Auto-populate form from quotation
    form.value.quotationId = quotationId
    form.value.salesChannelId = quotation.salesChannelId
    form.value.customerId = quotation.customerId
    form.value.customerName = quotation.customerName || ''
    form.value.customerEmail = quotation.customerEmail || ''
    form.value.customerPhone = quotation.customerPhone || ''
    form.value.deliveryAddress = quotation.deliveryAddress || ''
    form.value.notes = quotation.notes || ''

    // Populate items
    form.value.lines
      = quotation.items?.map((item: any) => ({
        itemSkuId: item.itemSkuId,
        quantity: Number(item.quantity),
        unitPrice: item.price,
        discount: item.discount || 0,
        taxRate: 0,
        notes: '',

        // For display
        itemName: item.productName || '',
        skuCode: item.productSku || '',
      })) || []

    showToast('Data dari penawaran berhasil dimuat', 'success')
  }
  catch (error) {
    console.error('Error loading quotation:', error)
    showToast('Gagal memuat data penawaran', 'error')
  }
})

const fetchOutlets = async () => {
  await outletStore.fetchAllData()
}

const onOutletSelect = (outletId: string) => {
  form.value.outletId = outletId || undefined
}

const onCustomerSelect = (customer: Customer | undefined) => {
  if (customer) {
    form.value.customerName = customer.name
    form.value.customerEmail = customer.email || ''
    form.value.customerPhone = customer.phone || ''
  }
}

function openItemModal() {
  if (!form.value.outletId) {
    formErrors.value.outletId = 'Silakan pilih outlet terlebih dahulu'

    return
  }
  showItemModal.value = true
}

function onProductsSelect(items: ItemSkuView[]) {
  console.log('Selected items:', items)
  items.forEach(item => {
    const lineItem = {
      itemSkuId: item.itemSkuId,
      quantity: 1,
      unitPrice: item.price?.price || item.prices?.[0]?.price || 0,
      discount: 0,
      taxRate: 0,
      notes: '',

      // For display
      itemName: item.displayName || '',
      skuCode: item.code || item.barcode || '',
    }

    form.value.lines.push(lineItem)
  })

  showItemModal.value = false
}

function removeLine(index: number) {
  form.value.lines.splice(index, 1)
}

function validateForm(): boolean {
  formErrors.value = {}
  let isValid = true

  if (!form.value.outletId) {
    formErrors.value.outletId = 'Outlet wajib dipilih'
    isValid = false
  }

  if (sourceType.value === 'quotation' && !selectedQuotationId.value) {
    formErrors.value.quotationId = 'Penawaran (SQ) wajib dipilih'
    isValid = false
  }

  if (!form.value.customerName.trim()) {
    formErrors.value.customerName = 'Nama pelanggan wajib diisi'
    isValid = false
  }

  if (!form.value.orderDate) {
    formErrors.value.orderDate = 'Tanggal pesanan wajib diisi'
    isValid = false
  }

  if (form.value.lines.length === 0) {
    formErrors.value.lines = 'Minimal harus ada 1 item'
    isValid = false
  }

  return isValid
}

async function handleSubmit(status: 'DRAFT' | 'OPEN' = 'OPEN') {
  if (!validateForm())
    return

  try {
    const payload = {
      outletId: form.value.outletId,
      quotationId:
        sourceType.value === 'quotation' ? form.value.quotationId : undefined,
      customerId: form.value.customerId,
      customerName: form.value.customerName,
      customerEmail: form.value.customerEmail,
      customerPhone: form.value.customerPhone,
      orderDate: form.value.orderDate,
      deliveryDate: form.value.deliveryDate,
      deliveryAddress: form.value.deliveryAddress,
      paymentTerms: form.value.paymentTerm,
      notes: form.value.notes,

      // include channel if present (POS)
      ...(channelFromQuery ? { channel: channelFromQuery } : {}),
      ...(selectedSalesChannelId.value ? { salesChannelId: selectedSalesChannelId.value } : {}),
      status, // Add status to payload
      items: form.value.lines.map(line => ({
        itemSkuId: line.itemSkuId,
        itemName: line.itemName || '',
        code: line.skuCode || '',
        quantity: Number(line.quantity),
        unitPrice: line.unitPrice,
        discount: line.discount,
        taxRate: line.taxRate,
        notes: line.notes,
      })),
    }

    await salesOrderStore.createSalesOrder(payload)
    showToast(
      `Sales Order berhasil disimpan sebagai ${
        status === 'DRAFT' ? 'Draft' : 'Belum Diproses'
      }`,
      'success',
    )
    router.push('/sales/sales-orders')
  }
  catch (error: any) {
    console.error('Error creating sales order:', error)
    if (error.response?.data?.errors)
      formErrors.value = error.response.data.errors

    showToast('Gagal menyimpan Sales Order', 'error')
  }
}

function saveAsDraft() {
  handleSubmit('DRAFT')
}

function saveAsOpen() {
  handleSubmit('OPEN')
}

function cancel() {
  router.push('/sales/sales-orders')
}

onMounted(async () => {
  await fetchOutlets()
  await fetchQuotations()

  // Auto-select outlet from sidebar
  if (selectedSidebarOutlet.value?.outletId)
    form.value.outletId = selectedSidebarOutlet.value.outletId

  // POS defaults when opened from POS flow
  if (isPosChannel.value) {
    // sensible defaults for POS quick checkout
    form.value.paymentMethod = 'CASH'
    form.value.paymentTerm = 'COD'
    sourceType.value = 'direct'

    if (selectedSalesChannelId.value)
      Object.assign(form.value, { salesChannelId: selectedSalesChannelId.value })
  }
})
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardText class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              @click="cancel"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div class="ms-3 d-flex align-center gap-3">
              <div>
                <h2 class="text-h5 mb-0">
                  Buat Pesanan Penjualan (SO)
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Buat pesanan penjualan baru
                </p>
              </div>
              <div v-if="isPosChannel">
                <VChip
                  size="small"
                  color="success"
                  variant="tonal"
                >
                  POS
                </VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mt-4">
      <!-- Customer Information -->
      <VCol
        cols="12"
        md="8"
      >
        <!-- Outlet Selection -->
        <VCard>
          <VCardTitle>Outlet *</VCardTitle>
          <VCardText>
            <VAutocomplete
              :model-value="form.outletId"
              :items="outlets"
              item-title="name"
              item-value="outletId"
              label="Pilih Outlet *"
              :loading="loadingOutlets"
              :error-messages="formErrors.outletId"
              @update:model-value="onOutletSelect"
            />
            <VAlert
              v-if="!form.outletId"
              type="info"
              variant="tonal"
              class="mt-2"
            >
              Silakan pilih outlet untuk melanjutkan
            </VAlert>
          </VCardText>
        </VCard>

        <!-- Source Type Selection -->
        <VCard class="mt-4">
          <VCardTitle>Sumber Pesanan</VCardTitle>
          <VCardText>
            <VRadioGroup
              v-model="sourceType"
              inline
            >
              <VRadio
                label="Tanpa Referensi (Buat Baru)"
                value="direct"
              />
              <VRadio
                label="Dari Penawaran (SQ)"
                value="quotation"
              />
            </VRadioGroup>

            <VAutocomplete
              v-if="sourceType === 'quotation'"
              v-model="selectedQuotationId"
              :items="availableQuotations"
              item-title="quotationNumber"
              item-value="quotationId"
              label="Pilih Penawaran (SQ) *"
              :loading="loadingQuotations"
              :error-messages="formErrors.quotationId"
              :disabled="!form.outletId"
              class="mt-4"
            >
              <template #item="{ props, item }">
                <VListItem v-bind="props">
                  <template #title>
                    <div class="d-flex justify-space-between align-center">
                      <span>{{ item.raw.quotationNumber }}</span>
                      <VChip
                        size="x-small"
                        :color="
                          item.raw.status === 'sent'
                            ? 'warning'
                            : item.raw.status === 'converted'
                              ? 'success'
                              : 'secondary'
                        "
                      >
                        {{
                          item.raw.status === "sent"
                            ? "Belum Diproses"
                            : item.raw.status === "converted"
                              ? "Sudah Dikonversi"
                              : item.raw.status === "draft"
                                ? "Draft"
                                : item.raw.status
                        }}
                      </VChip>
                    </div>
                  </template>
                  <template #subtitle>
                    <div>{{ item.raw.customerName }}</div>
                    <div class="text-caption">
                      Total: Rp
                      {{ (item.raw.totalAmount || 0).toLocaleString("id-ID") }}
                    </div>
                  </template>
                </VListItem>
              </template>
            </VAutocomplete>

            <VAlert
              v-if="sourceType === 'quotation' && !form.outletId"
              type="info"
              variant="tonal"
              class="mt-2"
            >
              Silakan pilih outlet terlebih dahulu
            </VAlert>

            <VAlert
              v-if="
                sourceType === 'quotation'
                  && form.outletId
                  && availableQuotations.length === 0
              "
              type="warning"
              variant="tonal"
              class="mt-2"
            >
              Tidak ada penawaran (SQ) yang belum diproses untuk outlet ini
            </VAlert>

            <VAlert
              v-if="sourceType === 'quotation' && selectedQuotationId"
              type="success"
              variant="tonal"
              class="mt-2"
            >
              <div class="d-flex align-center">
                <VIcon
                  icon="tabler-check-circle"
                  class="me-2"
                />
                <div>
                  <div class="font-weight-medium">
                    Data dari penawaran akan dimuat otomatis
                  </div>
                  <div class="text-caption">
                    Customer dan item akan terisi dari penawaran yang dipilih
                  </div>
                </div>
              </div>
            </VAlert>

            <div class="mt-4">
              <SalesChannelSelectModal
                v-model:selected-id="form.salesChannelId"
                :model-value="selectedQuotation?.salesChannel"
                :multiple="false"
                :return-object="false"
                label="Pilih Saluran Penjualan (opsional)"
                placeholder="Pilih saluran penjualan..."
                hint="Pilih saluran penjualan untuk pesanan ini (jika ada)"
                persistent-hint
                persistent-placeholder
              />
            </div>
          </VCardText>
        </VCard>

        <!-- Customer Information -->
        <VCard class="mt-4">
          <VCardTitle>Informasi Pelanggan</VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <CustomerSelectModal
                  v-model:selected-id="form.customerId"
                  :model-value="selectedQuotation?.customer"
                  :multiple="false"
                  :return-object="false"
                  label="Pilih Pelanggan (opsiional)"
                  placeholder="Pilih pelanggan..."
                  hint="Pilih pelanggan untuk penawaran"
                  persistent-hint
                  persistent-placeholder
                  @item-selected="onCustomerSelect"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="form.customerName"
                  label="Nama Pelanggan *"
                  :error-messages="formErrors.customerName"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="form.customerEmail"
                  label="Email"
                  type="email"
                  :error-messages="formErrors.customerEmail"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="form.customerPhone"
                  label="Telepon"
                  :error-messages="formErrors.customerPhone"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Order Items -->
        <VCard class="mt-4">
          <VCardTitle class="d-flex justify-space-between align-center">
            <span>Item Pesanan</span>
            <VBtn
              color="primary"
              size="small"
              :disabled="!form.outletId"
              @click="openItemModal"
            >
              <VIcon
                icon="tabler-plus"
                class="me-1"
              />
              Tambah Item
            </VBtn>
          </VCardTitle>
          <VCardText>
            <VAlert
              v-if="formErrors.lines && !form.lines.length"
              type="error"
              class="mb-4"
            >
              {{ formErrors.lines }}
            </VAlert>

            <VTable v-if="form.lines.length > 0">
              <thead>
                <tr>
                  <th style="min-width: 170px;">
                    Item
                  </th>
                  <th class="text-end">
                    Qty
                  </th>
                  <th class="text-end">
                    Harga
                  </th>
                  <th class="text-end">
                    Diskon @
                  </th>
                  <th class="text-end">
                    Pajak %
                  </th>
                  <th class="text-end">
                    Subtotal
                  </th>
                  <th class="text-center">
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
                    <div>
                      <strong>{{ line.itemName }}</strong>
                      <div class="text-caption text-medium-emphasis">
                        {{ line.skuCode }}
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <VTextField
                      v-model.number="line.quantity"
                      min="1"
                      density="compact"
                      style="width: 80px"
                      :rules="[
                        value => (value >= 1) || 'Minimal 1',
                      ]"
                    />
                  </td>
                  <td class="text-end">
                    <AppTextFieldRupiah
                      v-model="line.unitPrice"
                      min="0"
                      density="compact"
                      hide-details
                      style="width: 120px"
                    />
                  </td>
                  <td class="text-end">
                    <AppTextFieldRupiah
                      v-model="line.discount"
                      min="0"
                      density="compact"
                      hide-details
                      style="width: 120px"
                    />
                  </td>
                  <td class="text-end">
                    <VTextField
                      v-model.number="line.taxRate"
                      min="0"
                      max="100"
                      density="compact"
                      style="min-width: 55px"
                      :rules="[
                        value => (value >= 0 && value <= 100) || 'Harus antara 0-100',
                      ]"
                    />
                  </td>
                  <td class="text-end">
                    {{
                      (
                        line.quantity * line.unitPrice
                        - (line.discount || 0) * line.quantity
                      ).toLocaleString("id-ID")
                    }}
                  </td>
                  <td class="text-center">
                    <VBtn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeLine(index)"
                    >
                      <VIcon icon="tabler-trash" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>

            <VAlert
              v-else
              type="info"
              variant="tonal"
            >
              Belum ada item. Klik "Tambah Item" untuk memulai.
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Order Summary & Details -->
      <VCol
        cols="12"
        md="4"
      >
        <!-- Order Details -->
        <VCard>
          <VCardTitle>Detail Pesanan</VCardTitle>
          <VCardText>
            <AppDateTimePicker
              v-model="form.orderDate"
              label="Tanggal Pesanan *"
              inline-label
              :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
              :error-messages="formErrors.orderDate"
              class="mb-4"
              :rules="[requiredValidator]"
            />
            <AppDateTimePicker
              v-model="form.deliveryDate"
              label="Tanggal Pengiriman *"
              inline-label
              :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
              :rules="[requiredValidator]"
            />
            <VTextarea
              v-model="form.deliveryAddress"
              label="Alamat Pengiriman *"
              rows="3"
              class="mt-4"
              :rules="[requiredValidator]"
            />
            <VSelect
              v-model="form.paymentTerm"
              :items="['COD', 'NET_7', 'NET_14', 'NET_30', 'NET_60', 'NET_90']"
              label="Termin Pembayaran"
              class="mt-4"
            />
            <VTextarea
              v-model="form.notes"
              label="Catatan"
              rows="3"
              class="mt-4"
            />
          </VCardText>
        </VCard>

        <!-- Order Summary -->
        <VCard class="mt-4">
          <VCardTitle>Ringkasan Pesanan</VCardTitle>
          <VCardText>
            <div class="d-flex justify-space-between mb-2">
              <span>Total Item:</span>
              <strong>{{ form.lines.length || 0 }}</strong>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Subtotal:</span>
              <strong>Rp {{ subtotal.toLocaleString("id-ID") }}</strong>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Diskon:</span>
              <strong class="text-error">- Rp {{ totalDiscount.toLocaleString("id-ID") }}</strong>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Pajak:</span>
              <strong>Rp {{ totalTax.toLocaleString("id-ID") }}</strong>
            </div>
            <VDivider class="my-3" />
            <div class="d-flex justify-space-between">
              <span class="text-h6">Total:</span>
              <strong class="text-h6 text-primary">
                Rp {{ grandTotal.toLocaleString("id-ID") }}
              </strong>
            </div>
          </VCardText>
        </VCard>

        <!-- Actions -->
        <VCard class="mt-4">
          <VCardText>
            <VBtn
              block
              color="primary"
              size="large"
              :loading="isLoadingCreate"
              :disabled="!form.outletId"
              @click="saveAsOpen"
            >
              <VIcon
                icon="tabler-check"
                class="me-2"
              />
              Simpan
            </VBtn>
            <VBtn
              block
              color="secondary"
              variant="tonal"
              size="large"
              class="mt-2"
              :loading="isLoadingCreate"
              :disabled="!form.outletId"
              @click="saveAsDraft"
            >
              <VIcon
                icon="tabler-file"
                class="me-2"
              />
              Simpan sebagai Draft
            </VBtn>
            <VBtn
              block
              variant="outlined"
              class="mt-2"
              @click="cancel"
            >
              Batal
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Item Select Modal -->
    <ItemSkuSelectModal
      v-if="form.outletId"
      v-model="showItemModal"
      :outlet-id="form.outletId"
      multiple
      @select="onProductsSelect"
    />
  </div>
</template>
