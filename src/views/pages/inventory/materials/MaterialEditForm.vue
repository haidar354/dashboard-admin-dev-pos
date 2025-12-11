<script setup lang="ts">
import { VIcon } from 'vuetify/components/VIcon'
import { VAutocomplete, VCardText, VTable, VTextField } from 'vuetify/lib/components/index.mjs'
import { useMaterialEdit } from '@/composables/inventory/useMaterialEdit'

defineProps<{
  readonly?: boolean
}>()

const {
  editForm,
  editFormErrors,

  outlets,
  isLoadingFetchDataOutlets,
  itemCategories,
  isLoadingFetchDataItemCategories,
  units,
  isLoadingFetchDataUnits,
  defaultUnit,

  // unit methods
  addNewBlankUnit,
  onUnitChange,
} = useMaterialEdit()

onMounted(async () => {
})
</script>

<template>
  <div class="item-form">
    <!-- Form Content with Fade Transition -->
    <VFadeTransition>
      <div class="form-content">
        <!-- Basic Information Section -->
        <VCard
          class="mb-6"
          elevation="2"
        >
          <VCardItem>
            <VCardTitle class="text-h6 d-flex align-center">
              <VIcon
                icon="tabler-info-circle"
                class="me-2"
                color="primary"
              />
              Informasi Dasar Bahan
            </VCardTitle>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="6"
                lg="8"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Daftar Outlet <span class="text-error">*</span>
                </label>
                <VAutocomplete
                  v-model="editForm.outletIds"
                  :items="outlets"
                  item-title="name"
                  item-value="outletId"
                  :rules="[requiredValidator]"
                  :error-messages="editFormErrors?.outletIds"
                  :loading="isLoadingFetchDataOutlets"
                  multiple
                  clearable
                  counter
                  maxlength="100"
                  prepend-inner-icon="tabler-building-store"
                  variant="outlined"
                  placeholder="Pilih outlet untuk bahan ini"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
                lg="4"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Pengaturan Harga Produk <span class="text-error">*</span>
                </label>

                <VSelect
                  v-model="editForm.useSameConfig"
                  :items="[
                    { title: 'Sama untuk semua outlet', value: true },
                    { title: 'Berbeda untuk setiap outlet (coming soon)', value: false, disabled: true },
                  ]"
                  item-title="title"
                  item-value="value"
                  :item-props="(item) => ({ disabled: item.value === false })"
                  :rules="[requiredValidator]"
                  hint="Pilih apakah produk ini memiliki pengaturan harga yang sama untuk semua outlet atau berbeda untuk setiap outlet"
                  persistent-hint
                />
              </VCol>

              <VCol
                cols="12"
                lg="6"
                md="7"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Nama Bahan <span class="text-error">*</span>
                </label>
                <AppTextField
                  v-model="editForm.name"
                  :rules="[requiredValidator]"
                  :error-messages="editFormErrors?.name"
                  counter
                  clearable
                  maxlength="100"
                  prepend-inner-icon="tabler-file-text"
                  :readonly="readonly"
                  placeholder="Masukkan nama bahan"
                />
              </VCol>

              <VCol
                cols="12"
                lg="6"
                md="5"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Kategori <span class="text-error">*</span>
                </label>
                <VAutocomplete
                  v-model="editForm.itemCategoryId"
                  :items="itemCategories"
                  item-title="name"
                  item-value="itemCategoryId"
                  clearable
                  :rules="[requiredValidator]"
                  :error-messages="editFormErrors?.itemCategoryId"
                  prepend-inner-icon="tabler-list-numbers"
                  :loading="isLoadingFetchDataItemCategories"
                  variant="outlined"
                  placeholder="Pilih kategori bahan"
                />
              </VCol>

              <VCol cols="12">
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Deskripsi Bahan
                </label>
                <AppTextarea
                  v-model="editForm.description"
                  :error-messages="editFormErrors?.description"
                  counter
                  maxlength="5000"
                  prepend-inner-icon="tabler-file-text"
                  :readonly="readonly"
                  placeholder="Masukkan deskripsi bahan"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Units Section -->
        <VCard
          class="mb-6"
          elevation="2"
        >
          <VCardItem>
            <VCardTitle class="text-h6 d-flex align-center">
              <VIcon
                icon="tabler-scale"
                class="me-2"
                color="primary"
              />
              Pengaturan Produk
            </VCardTitle>
            <VCardSubtitle>
              Pengaturan untuk bahan ini
            </VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="6"
                lg="4"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Status
                </label>
                <VSwitch
                  v-model="editForm.itemConfigs[0].isActive"
                  :label="editForm.itemConfigs[0].isActive ? 'Aktif' : 'Tidak aktif'"
                  :true-value="true"
                  :false-value="false"
                  color="success"
                  inset
                />
              </VCol>
              <VCol
                v-if="editForm.useSameConfig"
                cols="12"
                md="6"
                lg="4"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Monitor Persediaan?
                </label>
                <VSwitch
                  v-model="editForm.itemConfigs[0].manageStock"
                  :label="editForm.itemConfigs[0].manageStock ? 'Ya, monitor' : 'Tidak monitor'"
                  :true-value="true"
                  :false-value="false"
                  color="success"
                  inset
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
                lg="4"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Perbolehkan Stok Minus <span class="text-error">*</span>
                </label>
                <VSwitch
                  v-model="editForm.itemConfigs[0].allowNegativeStock"
                  :label="editForm.itemConfigs[0].allowNegativeStock ? 'Ya, perbolehkan' : 'Tidak perbolehkan'"
                  :true-value="true"
                  :false-value="false"
                  color="success"
                  inset
                  :disabled="!editForm.itemConfigs[0].manageStock"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
                lg="4"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Pengingat Min. Stok
                </label>
                <AppTextField
                  v-model="editForm.itemConfigs[0].minStockAlert"
                  type="number"
                  placeholder="Masukkan pengingat min. stok"
                  :disabled="!editForm.itemConfigs[0].manageStock"
                  prepend-inner-icon="tabler-bell"
                >
                  <template #append-inner>
                    <span>{{ defaultUnit?.unit?.code }}</span>
                  </template>
                </AppTextField>
              </VCol>

              <VCol
                cols="12"
                md="6"
                lg="4"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Maks. Perubahan Harga oleh Kasir (%)
                </label>
                <AppTextField
                  v-model="editForm.itemConfigs[0].cashierMaxPriceChangePct"
                  type="number"
                  placeholder="Masukkan maks. perubahan harga"
                  prepend-inner-icon="tabler-discount"
                >
                  <template #append-inner>
                    <span>%</span>
                  </template>
                </AppTextField>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Units Section -->
        <VCard
          class="mb-6"
          elevation="2"
        >
          <VCardItem>
            <VCardTitle class="text-h6 d-flex align-center">
              <VIcon
                icon="tabler-scale"
                class="me-2"
                color="primary"
              />
              Kemasan / Satuan
            </VCardTitle>
            <VCardSubtitle>
              Atur kemasan atau satuan yang digunakan untuk bahan ini
            </VCardSubtitle>
            <template #append>
              <VBtn
                color="primary"
                variant="outlined"
                size="small"
                @click="addNewBlankUnit(editForm.itemUnits.length ? (editForm.itemUnits[editForm.itemUnits.length - 1]?.conversion + 1) : 2)"
              >
                Tambah
              </VBtn>
            </template>
          </VCardItem>

          <VCardText>
            <VTable>
              <thead>
                <tr>
                  <td>
                    Satuan <span class="text-error">*</span>
                  </td>
                  <td width="15%">
                    Konversi <span class="text-error">*</span>
                  </td>
                  <td width="20%">
                    Harga Beli <span
                      v-if="editForm.itemConfigs[0]?.manageStock"
                      class="text-error"
                    >*</span>
                  </td>
                  <td width="20%">
                    SKU
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(unit, index) in editForm.itemUnits"
                  :key="index"
                >
                  <td>
                    <VAutocomplete
                      v-if="unit.isBase"
                      v-model="unit.unitId"
                      :items="units"
                      item-title="name"
                      item-value="unitId"
                      disabled
                    />
                    <VAutocomplete
                      v-else
                      v-model="unit.unitId"
                      :items="units"
                      item-title="name"
                      item-value="unitId"
                      :rules="[requiredValidator]"
                      :loading="isLoadingFetchDataUnits"
                      variant="outlined"
                      placeholder="Pilih satuan"
                      @update:model-value="onUnitChange(units, index)"
                    />
                  </td>
                  <td>
                    <AppTextField
                      v-model.number="unit.conversion"
                      type="number"
                      :rules="[requiredValidator]"
                      variant="outlined"
                      placeholder="Masukkan Konversi"
                      :disabled="unit.isBase"
                      :min="editForm.itemUnits.length ? (editForm.itemUnits[index - 1]?.conversion + 1) : 1"
                    >
                      <template #append-inner>
                        <span>{{ defaultUnit?.unit?.code }}</span>
                      </template>
                    </AppTextField>
                  </td>
                  <td>
                    <AppTextFieldRupiah
                      v-if="unit.itemCosts"
                      v-model="unit.itemCosts[0].cost"
                      :rules="[requiredValidator]"
                      variant="outlined"
                      placeholder="Masukkan Harga Pokok Pembelian"
                      :disabled="!editForm.itemConfigs[0]?.manageStock"
                    />
                  </td>
                  <td>
                    <VTextField
                      v-model="unit.sku"
                      label="SKU"
                      variant="outlined"
                      placeholder="Masukkan SKU"
                    >
                      <template #append-inner>
                        <VIcon
                          icon="tabler-dice"
                          @click="generateRandomCodeFor(unit, 'sku')"
                        />
                      </template>
                    </VTextField>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </div>
    </VFadeTransition>
  </div>
</template>

<style lang="scss" scoped>
.item-form {
  .v-card {
    border-radius: 12px;

    &.elevation-2 {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .v-card-title {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .v-card-subtitle {
    opacity: 0.7;
    font-size: 0.875rem;
  }

  label {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 500;
  }

  .v-text-field,
  .v-autocomplete {
    .v-field {
      border-radius: 8px;
    }
  }

  .v-switch {
    .v-selection-control__wrapper {
      margin-inline-start: 0;
    }
  }

  .v-btn {
    border-radius: 8px;
    font-weight: 500;

    &.v-btn--size-large {
      min-height: 48px;
    }
  }

  .v-alert {
    border-radius: 8px;
  }

  .v-chip {
    font-weight: 500;
  }
}

.no-wrap-text {
  flex-shrink: 0;
  white-space: nowrap;
}

// Loading animations
.form-loading {
  animation: fadeIn 0.3s ease-in-out;
}

.form-content {
  animation: slideUp 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Skeleton loader customization
:deep(.v-skeleton-loader) {
  background: transparent;

  .v-skeleton-loader__bone {
    background: linear-gradient(90deg,
      rgba(var(--v-theme-surface-variant), 0.1) 25%,
      rgba(var(--v-theme-surface-variant), 0.2) 50%,
      rgba(var(--v-theme-surface-variant), 0.1) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
