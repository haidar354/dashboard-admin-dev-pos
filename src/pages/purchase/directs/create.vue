<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { useDirectPurchaseCreate } from '@/composables/purchase/useDirectPurchaseCreate'
import { formatRupiah } from '@/utils/common'
import SelectItemSkuModal from '@/views/pages/purchase/direct-purchases/SelectItemSkuModal.vue'

definePage({
  meta: {
    name: 'Tambah Pembelian Langsung',
    rules: [{ action: 'manage', subject: 'default' }],
  },
})

dayjs.locale(id)

const {
  // State
  form,
  formErrors,
  outlets,
  suppliers,
  documentPreview,
  isItemModalVisible,

  // Computed
  outletId,
  totalAmount,
  filteredPurchaseRequests,

  // Loading states
  isLoadingCreate,
  isLoadingFetchDataOutlets,
  isLoadingFetchDataSuppliers,
  isLoadingFetchDataPurchaseRequests,

  // Methods
  initializeForm,
  handleFilePreview,
  showItemModal,
  removeItem,
  handleSubmit,
  handleCancel,
  addSelectedItemOutlet,
} = useDirectPurchaseCreate()

// Initialize form
onMounted(initializeForm)

// Watch file changes
watch(() => form.value.documentAttachment, () => {
  if (form.value.documentAttachment)
    handleFilePreview(form.value.documentAttachment)
  else
    documentPreview.value = ''
}, { deep: true })

// Watch outlet changes
watch(() => form.value.outletId, () => {
  form.value.purchaseRequisitionId = undefined
})

// Watch supplier changes
watch(() => form.value.supplierId, () => {
  form.value.purchaseRequisitionId = undefined
})
</script>

<!-- Keep the existing template code unchanged -->

<template>
  <div>
    <VCard elevation="2">
      <VCardText>
        <div class="d-flex align-center mb-6">
          <VIcon
            icon="tabler-shopping-cart-plus"
            class="me-3"
            color="primary"
            size="32"
          />
          <div>
            <div class="text-h5 font-weight-bold">
              Tambah Pembelian Langsung
            </div>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Buat pembelian langsung baru tanpa Pemesanan Pembelian (PO)
            </p>
          </div>
        </div>

        <VForm @submit.prevent="handleSubmit('COMPLETED')">
          <VRow>
            <!-- Basic Information -->
            <VCol cols="12">
              <VCard
                variant="outlined"
                class="mb-6"
              >
                <VCardText class="d-flex align-center">
                  <VIcon
                    icon="tabler-info-circle"
                    class="me-2"
                    color="primary"
                  />
                  Informasi Dasar
                </VCardText>
                <VCardText>
                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <label for="purchasedAt">Tanggal Pembelian <span class="text-error">*</span></label>
                      <AppDateTimePicker
                        v-model="form.purchasedAt"
                        type="date"
                        prepend-inner-icon="tabler-calendar"
                        variant="outlined"
                        :error-messages="formErrors.purchasedAt"
                        required
                        :config="{
                          dateFormat: 'Y-m-d H:i',
                          allowInput: true,
                          enableTime: true,
                          time_24hr: true,
                          altFormat: 'Y-m-d H:i',
                          altInput: true,
                        }"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <label for="outletId">Outlet <span class="text-error">*</span></label>
                      <VAutocomplete
                        v-model="form.outletId"
                        :items="outlets"
                        item-title="name"
                        item-value="outletId"
                        prepend-inner-icon="tabler-building-store"
                        variant="outlined"
                        :loading="isLoadingFetchDataOutlets"
                        :error-messages="formErrors.outletId"
                        required
                        clearable
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <label for="supplierId">Supplier (opsional)</label>
                      <VAutocomplete
                        v-model="form.supplierId"
                        :items="suppliers"
                        item-title="name"
                        item-value="supplierId"
                        prepend-inner-icon="tabler-truck"
                        variant="outlined"
                        :loading="isLoadingFetchDataSuppliers"
                        :error-messages="formErrors.supplierId"
                        required
                        clearable
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <label for="purchaseRequisitionId">Permintaan Pembelian/ PR (Opsional)</label>
                      <VAutocomplete
                        v-model="form.purchaseRequisitionId"
                        :items="filteredPurchaseRequests"
                        item-title="supplierName"
                        item-value="purchaseRequestId"
                        prepend-inner-icon="tabler-shopping-cart-question"
                        variant="outlined"
                        :loading="isLoadingFetchDataPurchaseRequests"
                        :error-messages="formErrors.purchaseRequisitionId"
                        clearable
                        :disabled="!form.outletId || !form.supplierId"
                      >
                        <template #item="{ props, item }">
                          <VListItem
                            v-bind="props"
                            :title="`PR - ${dayjs(item.raw.requestedAt).format('DD/MM/YYYY')}`"
                            :subtitle="`Total: ${formatRupiah(item.raw.totalAmount)}`"
                          />
                        </template>
                        <template #selection="{ item }">
                          <span>PR - {{ dayjs(item.raw.requestedAt).format('DD/MM/YYYY') }}</span>
                        </template>
                      </VAutocomplete>
                    </VCol>
                    <VCol cols="12">
                      <label for="note">Catatan (opsional)</label>
                      <AppTextarea
                        v-model="form.note"
                        prepend-inner-icon="tabler-note"
                        variant="outlined"
                        :error-messages="formErrors.note"
                        rows="3"
                      />
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Document Upload -->
            <VCol cols="12">
              <VCard
                variant="outlined"
                class="mb-6"
              >
                <VCardTitle class="d-flex align-center">
                  <VIcon
                    icon="tabler-file-upload"
                    class="me-2"
                    color="primary"
                  />
                  Dokumen Pendukung
                </VCardTitle>
                <VCardText>
                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <label for="invoiceNumber">No. Invoice (opsional)</label>
                      <VTextField
                        v-model="form.invoiceNumber"
                        prepend-inner-icon="tabler-file-invoice"
                        variant="outlined"
                        :error-messages="formErrors.invoiceNumber"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <label for="document">Dokumen Pendukung (opsional)</label>
                      <VFileInput
                        v-model="form.documentAttachment"
                        prepend-inner-icon="tabler-file"
                        variant="outlined"
                        accept="image/*,.pdf"
                        :error-messages="formErrors.documentAttachment"
                        show-size
                        clearable
                      />
                      <div
                        v-if="documentPreview"
                        class="mt-4"
                      >
                        <VImg
                          v-if="form.documentAttachment?.type?.startsWith('image/')"
                          :src="documentPreview"
                          max-height="200"
                          contain
                          class="border rounded"
                        />
                        <VChip
                          v-else
                          color="primary"
                          variant="outlined"
                          prepend-icon="tabler-file"
                        >
                          {{ form.documentAttachment?.name }}
                        </VChip>
                      </div>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Items -->
            <VCol cols="12">
              <VCard variant="outlined">
                <VCardTitle class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <VIcon
                      icon="tabler-package"
                      class="me-2"
                      color="primary"
                    />
                    Produk Pembelian
                  </div>
                  <VBtn
                    color="primary"
                    variant="elevated"
                    prepend-icon="tabler-plus"
                    :disabled="!!form.purchaseRequisitionId"
                    @click="showItemModal"
                  >
                    Tambah Produk
                  </VBtn>
                </VCardTitle>
                <VCardText>
                  <div
                    v-if="form.items?.length === 0"
                    class="text-center py-8"
                  >
                    <VIcon
                      icon="tabler-package-off"
                      size="64"
                      color="disabled"
                      class="mb-4"
                    />
                    <h6 class="text-h6 mb-2">
                      Belum ada item
                    </h6>
                    <p class="text-body-2 text-medium-emphasis">
                      Pilih Purchase Request atau tambah produk manual
                    </p>
                  </div>

                  <div
                    v-else
                    class="overflow-x-auto"
                  >
                    <VDataTable
                      :headers="[
                        { title: 'No', value: 'no', align: 'center', width: '5%' },
                        { title: 'Nama Produk', value: 'itemName', align: 'start', minWidth: '200px' },
                        { title: 'Jumlah', value: 'qty', align: 'end', width: '100px' },
                        { title: 'Satuan', value: 'itemUnitId', align: 'center', width: '100px' },
                        { title: 'Harga Beli', value: 'unitPrice', align: 'end', width: '200px' },
                        { title: 'Subtotal', value: 'subtotal', align: 'end', width: '200px' },
                        { title: 'Aksi', value: 'actions', align: 'center', width: '5%' },
                      ]"
                      :items="form.items"
                      :items-per-page="-1"
                      hide-default-footer
                    >
                      <template #item.no="{ index }">
                        <div class="text-center">
                          {{ index + 1 }}
                        </div>
                      </template>
                      <template #item.itemName="{ item }">
                        <div class="d-flex align-center">
                          <VAvatar
                            size="32"
                            color="primary"
                            class="me-3"
                          >
                            <VIcon
                              icon="tabler-package"
                              size="16"
                            />
                          </VAvatar>
                          <div>
                            <div class="font-weight-medium">
                              {{ item.itemName }}
                            </div>
                            <div class="text-caption text-medium-emphasis">
                              {{ item.itemCode }}
                            </div>
                          </div>
                        </div>
                      </template>
                      <template #item.qty="{ item }">
                        <AppTextField
                          v-model.number="item.qty"
                          type="number"
                          variant="outlined"
                          density="compact"
                          min="0"
                          step="0.01"
                          hide-details
                          class="w-100"
                        />
                      </template>
                      <template #item.itemUnitId="{ item }">
                        <div class="text-center">
                          {{ item.itemUnitName }}
                        </div>
                      </template>
                      <template #item.unitPrice="{ item }">
                        <AppTextFieldRupiah
                          v-model.number="item.unitPrice"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="w-100"
                        />
                      </template>
                      <template #item.subtotal="{ item }">
                        <div class="text-end font-weight-medium">
                          {{ formatRupiah((item.qty || 0) * (item.unitPrice || 0)) }}
                        </div>
                      </template>
                      <template #item.actions="{ item, index }">
                        <VBtn
                          color="error"
                          variant="text"
                          icon="tabler-trash"
                          size="small"
                          :disabled="!!item.purchaseRequisitionId"
                          @click="removeItem(index)"
                        />
                      </template>
                    </VDataTable>

                    <VCard
                      class="mt-4"
                      variant="outlined"
                    >
                      <VCardText class="d-flex justify-end">
                        <div class="font-weight-medium">
                          Total: {{ formatRupiah(totalAmount || 0) }}
                        </div>
                      </VCardText>
                    </VCard>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Form Actions -->
            <VCol cols="12">
              <div class="d-flex justify-space-between gap-4">
                <VBtn
                  type="button"
                  color="secondary"
                  variant="elevated"
                  :loading="isLoadingCreate"
                  :disabled="form.items?.length === 0 || isLoadingCreate"
                  @click="handleSubmit('DRAFT')"
                >
                  <VIcon
                    start
                    icon="tabler-device-floppy"
                  />
                  Simpan Draf
                </VBtn>
                <div class="d-flex flex-wrap gap-4 justify-end">
                  <VBtn
                    color="error"
                    variant="outlined"
                    :disabled="isLoadingCreate"
                    @click="handleCancel"
                  >
                    Batal
                  </VBtn>
                  <VBtn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    :loading="isLoadingCreate"
                    :disabled="form.items?.length === 0"
                  >
                    <VIcon
                      start
                      icon="tabler-device-floppy"
                    />
                    Simpan
                  </VBtn>
                </div>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <SelectItemSkuModal
      v-if="form.outletId"
      :key="form.outletId"
      v-model:is-item-modal-visible="isItemModalVisible"
      :purchase-direct-items="form.items || []"
      :outlet-id="outletId"
      @submit="addSelectedItemOutlet"
    />
  </div>
</template>
