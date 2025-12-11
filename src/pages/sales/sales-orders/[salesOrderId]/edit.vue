<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOutletStore } from '@/stores/outletStore'
import { useSalesOrderStore } from '@/stores/sales/salesOrderStore'
import type { ItemSkuView } from '@/types/models/product/item'
import type { Customer } from '@/types/models/sales/customer'
import type { CreateSalesOrderRequest } from '@/types/models/sales/sales-order'

definePage({
  meta: {
    name: 'Edit Pesanan Penjualan (SO)',
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

const { isLoadingUpdate, isLoadingFetchDetail, selectedSalesOrder }
  = storeToRefs(salesOrderStore)

const { data: outlets } = storeToRefs(outletStore)

const salesOrderId = computed(() => route.params.salesOrderId as string)

// Form state
const form = ref<CreateSalesOrderRequest & { outletId?: string }>({
  outletId: undefined,
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

const formErrors = ref<Record<string, string>>({})
const showItemModal = ref(false)

// Computed

const selectedOutlet = computed(() => {
  if (!form.value.outletId)
    return null

  return outlets.value.find((o: any) => o.outletId === form.value.outletId)
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

// Methods
function loadFormData() {
  if (!selectedSalesOrder.value || !selectedSalesOrder.value.order)
    return

  const so = selectedSalesOrder.value

  form.value = {
    outletId: so.order?.outletId,
    customerId: so.order?.customerId || undefined,
    customerName: so.order?.customerName || '',
    customerEmail: '',
    customerPhone: so.order?.customerPhone || '',
    orderDate:
      so.orderDate?.split('T')[0]
      || so.order?.openedAt?.split('T')[0]
      || new Date().toISOString().split('T')[0],
    deliveryDate: so.deliveryDate?.split('T')[0],
    deliveryAddress: so.deliveryAddress || '',
    paymentMethod: 'CASH',
    paymentTerm: so.paymentTerms || 'COD',
    notes: so.order?.notes || '',
    lines:
      so.order?.lines?.map((line: any) => ({
        itemSkuId: line.itemSkuId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount || 0,
        taxRate: line.taxRate || 0,
        notes: line.notes || '',

        // For display
        itemName: line.itemName || line.itemSku?.skuName || '',
        skuCode: line.itemSku?.skuCode || '',
      })) || [],
  }
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

async function handleSubmit() {
  if (!validateForm())
    return

  try {
    const payload = {
      customerId: form.value.customerId,
      customerName: form.value.customerName,
      customerEmail: form.value.customerEmail,
      customerPhone: form.value.customerPhone,
      orderDate: form.value.orderDate,
      deliveryDate: form.value.deliveryDate,
      deliveryAddress: form.value.deliveryAddress,
      paymentMethod: form.value.paymentMethod,
      paymentTerm: form.value.paymentTerm,
      notes: form.value.notes,
      lines: form.value.lines.map(line => ({
        itemSkuId: line.itemSkuId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount,
        taxRate: line.taxRate,
        notes: line.notes,
      })),
    }

    await salesOrderStore.updateSalesOrder(salesOrderId.value, payload)
    router.push(`/sales/sales-orders/${salesOrderId.value}`)
  }
  catch (error: any) {
    console.error('Error updating sales order:', error)
    if (error.response?.data?.errors)
      formErrors.value = error.response.data.errors
  }
}

function cancel() {
  router.push(`/sales/sales-orders/${salesOrderId.value}`)
}

onMounted(async () => {
  await outletStore.fetchAllData()
  await salesOrderStore.fetchDetail(salesOrderId.value, {
    include: ['order', 'order.lines', 'order.lines.itemSku', 'order.customer'],
  })
  loadFormData()
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
            <div class="ms-3">
              <h2 class="text-h5">
                Edit Pesanan Penjualan (SO)
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Edit pesanan penjualan #{{ selectedSalesOrder?.orderNumber }}
              </p>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow
      v-if="!isLoadingFetchDetail"
      class="mt-4"
    >
      <!-- Customer Information -->
      <VCol
        cols="12"
        md="8"
      >
        <!-- Outlet Display (Read-only) -->
        <VCard>
          <VCardTitle>Outlet</VCardTitle>
          <VCardText>
            <VAlert
              type="info"
              variant="tonal"
            >
              <div class="d-flex align-center">
                <VIcon
                  icon="tabler-building-store"
                  class="me-2"
                />
                <div>
                  <div class="font-weight-medium">
                    {{ selectedOutlet?.name || "Loading..." }}
                  </div>
                  <div class="text-caption">
                    Outlet tidak dapat diubah setelah pesanan dibuat
                  </div>
                </div>
              </div>
            </VAlert>
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
                  :model-value="selectedSalesOrder?.order?.customer || undefined"
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
              v-if="formErrors.lines"
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
              :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
              :error-messages="formErrors.orderDate"
            />
            <AppDateTimePicker
              v-model="form.deliveryDate"
              label="Tanggal Pengiriman"
              :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
              class="mt-4"
            />
            <VTextarea
              v-model="form.deliveryAddress"
              label="Alamat Pengiriman"
              rows="3"
              class="mt-4"
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
              :loading="isLoadingUpdate"
              @click="handleSubmit"
            >
              <VIcon
                icon="tabler-check"
                class="me-2"
              />
              Update Pesanan Penjualan
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

    <!-- Loading State -->
    <VRow
      v-else
      class="mt-4"
    >
      <VCol
        cols="12"
        class="text-center"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
        <p class="mt-4">
          Memuat data pesanan penjualan...
        </p>
      </VCol>
    </VRow>

    <!-- Item Select Modal -->
    <ItemSkuSelectModal
      v-if="form.outletId"
      v-model="showItemModal"
      :outlet-id="form.outletId"
      multiple
      @item-selected="onProductsSelect"
    />
  </div>
</template>
