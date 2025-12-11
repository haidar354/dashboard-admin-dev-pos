<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ItemSkuSelectModal from '@/components/dialogs/ItemSkuSelectModal.vue'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { useOutletStore } from '@/stores/outletStore'
import { useSalesQuotationStore } from '@/stores/sales/salesQuotationStore'
import type { ItemSkuView } from '@/types/models/product/item'
import type { Customer } from '@/types/models/sales/customer'

definePage({
  meta: {
    name: 'Buat Penawaran (SQ)',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const quotationStore = useSalesQuotationStore()
const outletStore = useOutletStore()
const outletSidebarStore = useOutletSidebarStore()

const { form, formErrors, isLoadingCreate, subtotal, grandTotal }
  = storeToRefs(quotationStore)

const { data: outlets, isLoadingFetchData: loadingOutlets }
  = storeToRefs(outletStore)

const isItemModalOpen = ref(false)

// Fetch outlets
const fetchOutlets = async () => {
  await outletStore.fetchAllData()
}

// Handle outlet selection
const onOutletSelect = (outletId: string) => {
  form.value.outletId = outletId || undefined
}

// Handle customer selection
const onCustomerSelect = (customer: Customer | undefined) => {
  if (customer) {
    form.value.customerName = customer.name
    form.value.customerEmail = customer.email || ''
    form.value.customerPhone = customer.phone || ''
    form.value.customerAddress = customer.address || ''
  }
}

// Open modal for adding items
const openItemModal = () => {
  isItemModalOpen.value = true
}

// Handle products selection from modal (multiple)
const onProductsSelect = (items: ItemSkuView[]) => {
  console.log('Selected items from modal:', items)
  items.forEach(item => {
    console.log('Processing item:', {
      itemSkuId: item.itemSkuId,
      displayName: item.displayName,
      code: item.code,
      barcode: item.barcode,
      price: item.price,
      prices: item.prices,
      fullItem: item,
    })

    quotationStore.addItem()

    const lastIndex = form.value.items.length - 1

    const itemData = {
      itemSkuId: item.itemSkuId,
      productName: item.displayName || '',
      productSku: item.code || item.barcode || '',
      price: item.price?.price || item.prices?.[0]?.price || 0,
      quantity: 1,
    }

    console.log('Updating item with data:', itemData)
    quotationStore.updateItem(lastIndex, itemData)
    console.log('Form items after update:', form.value.items)
  })
}

// Calculate item subtotal
const getItemSubtotal = (item: any) => {
  return item.price * item.quantity - item.discount
}

// Submit form
const submit = async (status: 'draft' | 'sent' = 'draft') => {
  if (form.value.items.length === 0) {
    showToast('Tambahkan minimal 1 item', 'error')

    return
  }

  try {
    await quotationStore.create(status)
    router.push({ name: 'sales-quotations' })
  }
  catch (error) {
    // Error handling sudah di store
  }
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// Initialize
onMounted(() => {
  quotationStore.resetForm()
  fetchOutlets()

  // Auto-select outlet from sidebar if available
  const selectedOutletId = outletSidebarStore.getSelectedOutletId
  if (selectedOutletId)
    form.value.outletId = selectedOutletId
})
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center py-4">
        <VBtn
          icon
          variant="text"
          size="small"
          class="me-2"
          @click="router.back()"
        >
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
        <span>Buat Penawaran (SQ) Baru</span>
      </VCardTitle>
      <VDivider />
      <VCardText>
        <VForm @submit.prevent="submit('sent')">
          <VRow>
            <!-- Outlet Selection -->
            <VCol
              cols="12"
              md="6"
            >
              <VAutocomplete
                v-model="form.outletId"
                :items="outlets"
                :loading="loadingOutlets"
                item-title="name"
                item-value="outletId"
                label="Pilih Outlet *"
                placeholder="Pilih outlet..."
                :error-messages="formErrors.outletId"
                required
                clearable
                prepend-inner-icon="tabler-building-store"
                hint="Outlet untuk scope data produk"
                persistent-hint
                @update:model-value="onOutletSelect"
              >
                <template #item="{ props, item }">
                  <VListItem
                    v-bind="props"
                    :title="item.raw.name"
                    :subtitle="item.raw.address || 'Tidak ada alamat'"
                  >
                    <template #prepend>
                      <VAvatar
                        :color="item.raw.isCentral ? 'primary' : 'secondary'"
                        variant="tonal"
                        size="40"
                      >
                        <VIcon
                          :icon="
                            item.raw.isCentral
                              ? 'tabler-building-warehouse'
                              : 'tabler-building-store'
                          "
                        />
                      </VAvatar>
                    </template>
                  </VListItem>
                </template>
              </VAutocomplete>
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="form.quotationNumber"
                label="Nomor Penawaran (SQ)"
                placeholder="Contoh: SQ-20251130-001"
                :error-messages="formErrors.quotationNumber"
                hint="Jika kosong akan diisi otomatis oleh sistem"
                persistent-hint
                persistent-placeholder
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <SalesChannelSelectModal
                v-model:selected-id="form.salesChannelId"
                :multiple="false"
                :return-object="false"
                label="Pilih Saluran Penjualan (opsional)"
                placeholder="Pilih saluran penjualan..."
                hint="Pilih saluran penjualan untuk pesanan ini (jika ada)"
                persistent-hint
                persistent-placeholder
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model="form.quotationDate"
                label="Tanggal *"
                type="date"
                :error-messages="formErrors.quotationDate"
                required
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model="form.validUntil"
                label="Berlaku Hingga *"
                type="date"
                :error-messages="formErrors.validUntil"
                required
              />
            </VCol>

            <!-- Customer Selection -->
            <VCol cols="12">
              <VDivider class="my-2" />
              <h3 class="text-h6 mb-4">
                Informasi Pelanggan
              </h3>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <!-- Customer Select Modal (reusable dialog) -->
              <CustomerSelectModal
                v-model:selected-id="form.customerId"
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
                required
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="form.customerEmail"
                label="Email"
                type="email"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="form.customerPhone"
                label="Telepon"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="form.customerAddress"
                label="Alamat"
              />
            </VCol>

            <!-- Items -->
            <VCol cols="12">
              <VDivider class="my-2" />
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6">
                  Item Penawaran (SQ)
                </h3>
                <VBtn
                  color="primary"
                  prepend-icon="tabler-plus"
                  :disabled="!form.outletId"
                  @click="openItemModal"
                >
                  Tambah Item
                </VBtn>
              </div>
              <VAlert
                v-if="!form.outletId"
                type="warning"
                variant="tonal"
                class="mb-4"
              >
                Pilih outlet terlebih dahulu untuk menambahkan item
              </VAlert>
            </VCol>

            <VCol
              v-if="form.items.length === 0"
              cols="12"
            >
              <VAlert
                type="info"
                variant="tonal"
                class="text-center"
              >
                Belum ada item. Klik "Tambah Item" untuk memilih produk.
              </VAlert>
            </VCol>

            <VCol
              v-else
              cols="12"
            >
              <VTable>
                <thead>
                  <tr>
                    <th style="width: 30%">
                      Produk
                    </th>
                    <th style="width: 15%">
                      SKU
                    </th>
                    <th style="width: 10%">
                      Qty
                    </th>
                    <th style="width: 15%">
                      Harga
                    </th>
                    <th style="width: 15%">
                      Diskon
                    </th>
                    <th style="width: 15%">
                      Subtotal
                    </th>
                    <th style="width: 5%" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in form.items"
                    :key="index"
                  >
                    <td>
                      <div class="font-weight-medium">
                        {{ item.productName }}
                      </div>
                    </td>
                    <td>
                      <span class="text-caption">{{ item.productSku }}</span>
                    </td>
                    <td>
                      <VTextField
                        v-model.number="item.quantity"
                        type="number"
                        density="compact"
                        hide-details
                        min="0.01"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <AppTextFieldRupiah
                        v-model.number="item.price"
                        density="compact"
                        hide-details
                        min="0"
                      />
                    </td>
                    <td>
                      <AppTextFieldRupiah
                        v-model.number="item.discount"
                        density="compact"
                        hide-details
                        min="0"
                      />
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(getItemSubtotal(item)) }}
                    </td>
                    <td>
                      <VBtn
                        icon
                        variant="text"
                        color="error"
                        size="x-small"
                        @click="quotationStore.removeItem(index)"
                      >
                        <VIcon icon="tabler-trash" />
                      </VBtn>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCol>

            <!-- Item Select Modal -->
            <ItemSkuSelectModal
              v-if="form.outletId"
              v-model="isItemModalOpen"
              :outlet-id="form.outletId"
              multiple
              @select="onProductsSelect"
            />

            <!-- Totals -->
            <VCol
              cols="12"
              md="8"
            >
              <VTextarea
                v-model="form.notes"
                label="Catatan"
                rows="3"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VCard variant="outlined">
                <VCardText>
                  <div class="d-flex justify-space-between mb-2">
                    <span>Subtotal:</span>
                    <strong>{{ formatCurrency(subtotal) }}</strong>
                  </div>
                  <VTextField
                    v-model.number="form.taxAmount"
                    label="Pajak"
                    type="number"
                    hide-details
                    class="mb-2"
                  />
                  <VTextField
                    v-model.number="form.discountAmount"
                    label="Diskon"
                    type="number"
                    hide-details
                    class="mb-2"
                  />
                  <VDivider class="my-2" />
                  <div class="d-flex justify-space-between">
                    <strong>Total Akhir:</strong>
                    <strong class="text-h6">{{
                      formatCurrency(grandTotal)
                    }}</strong>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Actions -->
            <VCol cols="12">
              <div class="d-flex gap-4 justify-end">
                <VBtn
                  variant="outlined"
                  color="error"
                  @click="router.back()"
                >
                  Batal
                </VBtn>
                <VBtn
                  variant="outlined"
                  color="secondary"
                  :loading="isLoadingCreate"
                  @click="submit('draft')"
                >
                  Simpan Draft
                </VBtn>
                <VBtn
                  color="primary"
                  :loading="isLoadingCreate"
                  @click="submit('sent')"
                >
                  Kirim
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>
