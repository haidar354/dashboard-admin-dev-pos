<script setup lang="ts">
import { VBtn } from 'vuetify/components/VBtn'
import { VIcon } from 'vuetify/components/VIcon'
import { VAutocomplete, VCardText, VTable, VTextField } from 'vuetify/lib/components/index.mjs'
import { useItemCreate } from '../../../../composables/product/useItemCreate'
import CreateItemDialogComponent from '@/views/pages/inventory/items/CreateItemDialogComponent.vue'
import { useItemStore } from '@/stores/product/itemStore'
import { useMaterialStore } from '@/stores/inventory/materialStore'

defineProps<{
  readonly?: boolean
}>()

const {
  form,
  formErrors,

  outlets,
  isLoadingFetchDataOutlets,
  itemCategories,
  isLoadingFetchDataItemCategories,
  units,
  isLoadingFetchDataUnits,

  // Methods
  fetchAllMaterials,
  generateVariants,
  addBlankVariantGroup,
  addBlankVariantGroupOption,
  removeVariantGroup,
  removeVariantGroupOption,

  // unit methods
  addNewBlankUnit,
  onUpdateUnit,
  removeUnit,

  addNewBlankRecipe,
  removeRecipe,
  onUpdateRecipe,
} = useItemCreate()

const itemStore = useItemStore()
const { generateRandomCodeFor } = itemStore

const materialStore = useMaterialStore()
const { openCreateDialog } = materialStore
const { data: materials, isLoadingFetchData: isLoadingFetchDataMaterials } = storeToRefs(materialStore)

watch(() => form.value.hasRecipes, value => {
  if (value)
    fetchAllMaterials()
})

onMounted(async () => {
})
</script>

<template>
  <CreateItemDialogComponent />

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
              Informasi Dasar Produk
            </VCardTitle>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol cols="12">
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Daftar Outlet <span class="text-error">*</span>
                </label>
                <VAutocomplete
                  v-model="form.outletIds"
                  :items="outlets"
                  item-title="name"
                  item-value="outletId"
                  :rules="[requiredValidator]"
                  :error-messages="formErrors?.outletIds"
                  :loading="isLoadingFetchDataOutlets"
                  multiple
                  counter
                  maxlength="100"
                  prepend-inner-icon="tabler-building-store"
                  variant="outlined"
                  placeholder="Pilih outlet untuk produk ini"
                />
              </VCol>

              <VCol
                cols="12"
                lg="6"
                md="7"
              >
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Nama Produk <span class="text-error">*</span>
                </label>
                <AppTextField
                  v-model="form.name"
                  :rules="[requiredValidator]"
                  :error-messages="formErrors?.name"
                  counter
                  maxlength="100"
                  prepend-inner-icon="tabler-file-text"
                  :readonly="readonly"
                  placeholder="Masukkan nama produk"
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
                  v-model="form.itemCategoryId"
                  :items="itemCategories"
                  item-title="name"
                  item-value="itemCategoryId"
                  :rules="[requiredValidator]"
                  :error-messages="formErrors?.itemCategoryId"
                  prepend-inner-icon="tabler-list-numbers"
                  :readonly="readonly"
                  :loading="isLoadingFetchDataItemCategories"
                  variant="outlined"
                  placeholder="Pilih kategori produk"
                />
              </VCol>

              <VCol cols="12">
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Deskripsi Produk
                </label>
                <AppTextarea
                  v-model="form.description"
                  :error-messages="formErrors?.description"
                  counter
                  maxlength="5000"
                  prepend-inner-icon="tabler-file-text"
                  :readonly="readonly"
                  placeholder="Masukkan deskripsi produk"
                />
              </VCol>

              <VCol cols="12">
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  Foto Produk
                </label>
                <MultipleImageUploadCard v-model="form.itemImages" />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Product Settings Section -->
        <VCard
          class="mb-6"
          elevation="2"
        >
          <VCardItem>
            <VCardTitle class="text-h6 d-flex align-center">
              <VIcon
                icon="tabler-settings"
                class="me-2"
                color="primary"
              />
              Pengaturan Produk
            </VCardTitle>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="3"
              >
                <VCard
                  variant="outlined"
                  class="pa-4 h-100"
                >
                  <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                    Tampil aplikasi POS? <span class="text-error">*</span>
                  </label>
                  <VSwitch
                    v-model="form.showInPos"
                    :rules="[requiredValidator]"
                    :error-messages="formErrors?.showInPos"
                    :readonly="readonly"
                    :label="form.showInPos ? 'Ya, tampil' : 'Tidak tampil'"
                    :true-value="true"
                    :false-value="false"
                    color="success"
                    inset
                  />
                </VCard>
              </VCol>

              <VCol
                cols="12"
                md="3"
              >
                <VCard
                  variant="outlined"
                  class="pa-4 h-100"
                >
                  <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                    Tambahkan ke daftar favorit? <span class="text-error">*</span>
                  </label>
                  <VSwitch
                    v-model="form.isFavorite"
                    :rules="[requiredValidator]"
                    :error-messages="formErrors?.isFavorite"
                    :readonly="readonly"
                    :label="form.isFavorite ? 'Ya, ditambahkan' : 'Tidak ditambahkan'"
                    :true-value="true"
                    :false-value="false"
                    color="warning"
                    inset
                  />
                </VCard>
              </VCol>

              <VCol
                cols="12"
                md="3"
              >
                <VCard
                  variant="outlined"
                  class="pa-4 h-100"
                >
                  <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                    Kelola Persediaan? <span class="text-error">*</span>
                  </label>
                  <VSwitch
                    v-model="form.manageStock"
                    :rules="[requiredValidator]"
                    :error-messages="formErrors?.manageStock"
                    :readonly="readonly"
                    :label="form.manageStock ? 'Ya, dikelola' : 'Tidak dikelola'"
                    :true-value="true"
                    :false-value="false"
                    color="warning"
                    inset
                  />
                </VCard>
              </VCol>

              <VCol
                cols="12"
                md="3"
              >
                <VCard
                  variant="outlined"
                  class="pa-4 h-100"
                >
                  <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                    Memiliki Tambahan (Topping)? <span class="text-error">*</span>
                  </label>
                  <VSwitch
                    v-model="form.hasModifiers"
                    :rules="[requiredValidator]"
                    :error-messages="formErrors?.hasModifiers"
                    :readonly="readonly"
                    :label="form.hasModifiers ? 'Ya, memiliki' : 'Tidak memiliki'"
                    :true-value="true"
                    :false-value="false"
                    color="warning"
                    inset
                  />
                </VCard>
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
              Harga dan Satuan
            </VCardTitle>
            <VCardSubtitle>
              Atur satuan yang digunakan untuk produk ini
            </VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VCard
              variant="outlined"
              class="pa-4 h-100"
            >
              <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                Memiliki banyak satuan? <span class="text-error">*</span>
              </label>
              <VSwitch
                v-model="form.hasMultipleUnits"
                :rules="[requiredValidator]"
                :error-messages="formErrors?.hasMultipleUnits"
                :readonly="readonly"
                :label="form.hasMultipleUnits ? 'Ya, memiliki banyak satuan' : 'Tidak memiliki banyak satuan'"
                :true-value="true"
                :false-value="false"
                color="warning"
                inset
                :disabled="form.hasVariants"
              />
              <div class="d-flex align-center mt-2">
                <VIcon
                  icon="tabler-info-circle"
                  class="me-1"
                />
                <div class="text-caption">
                  Multi Satuan tidak berlaku jika produk memiliki varian
                </div>
              </div>
            </VCard>
          </VCardText>
          <VCardText>
            <div v-if="(form.units?.length || 0) > 0">
              <VRow
                v-for="(unit, index) in form.units"
                :key="index"
                class="mb-4"
              >
                <VCol cols="12">
                  <VCard variant="outlined">
                    <VCardItem>
                      <VCardTitle class="text-h6 font-weight-medium">
                        Satuan {{ index === 0 ? 'Utama' : 'Tambahan' }}
                      </VCardTitle>
                      <template #append>
                        <VBtn
                          v-if="!unit.isDefault"
                          variant="outlined"
                          color="error"
                          icon="tabler-trash"
                          size="small"
                          @click="removeUnit(index)"
                        />
                      </template>
                    </VCardItem>
                    <VCardText>
                      <VRow>
                        <VCol
                          cols="12"
                          md="6"
                        >
                          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                            Satuan <span class="text-error">*</span>
                          </label>
                          <VCombobox
                            v-model="unit.unitIdOrName"
                            :items="units.map(u => (u.name))"
                            item-title="name"
                            item-value="unitId"
                            :rules="[requiredValidator]"
                            :loading="isLoadingFetchDataUnits"
                            variant="outlined"
                            placeholder="Pilih satuan"
                            density="compact"
                            @update:model-value="onUpdateUnit(index)"
                          />
                        </VCol>

                        <VCol
                          cols="12"
                          md="6"
                        >
                          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                            SKU <span class="text-error">*</span>
                          </label>
                          <VTextField
                            v-model="unit.sku"
                            type="text"
                            :rules="[requiredValidator]"
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
                        </VCol>

                        <VCol
                          cols="12"
                          md="6"
                        >
                          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                            Konversi <span
                              v-if="!unit.isDefault"
                              class="text-error"
                            >*</span>
                          </label>
                          <VTextField
                            v-model="unit.conversion"
                            type="number"
                            :rules="[requiredValidator]"
                            :disabled="unit.isDefault"
                            :min="1"
                            variant="outlined"
                            placeholder="Masukkan nilai konversi"
                          >
                            <template #append-inner>
                              <span
                                v-if="!unit.isDefault"
                                class="text-caption text-disabled"
                              >
                                {{ form.units?.find(u => u.isDefault)?.baseUnitName || 'satuan utama' }}
                              </span>
                            </template>
                          </VTextField>
                        </VCol>

                        <VCol
                          cols="12"
                          md="6"
                        >
                          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                            Min. Penjualan <span class="text-error">*</span>
                          </label>
                          <VTextField
                            v-model="unit.minSalesQty"
                            type="number"
                            :rules="[requiredValidator]"
                            :min="1"
                            variant="outlined"
                            placeholder="Masukkan nilai min. pembelian"
                          />
                        </VCol>

                        <VCol
                          cols="12"
                          md="6"
                        >
                          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                            Harga Penjualan <span class="text-error">*</span>
                          </label>
                          <AppTextFieldRupiah
                            v-model="unit.salePrice"
                            :rules="[requiredValidator]"
                            :min="1"
                            variant="outlined"
                            placeholder="Masukkan nilai harga penjualan"
                          />
                        </VCol>

                        <VCol
                          cols="12"
                          md="6"
                        >
                          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                            Harga Pembelian <span
                              v-if="form.manageStock"
                              class="text-error"
                            >*</span>
                          </label>
                          <AppTextFieldRupiah
                            v-model="unit.purchasePrice"
                            :rules="[requiredValidator]"
                            :min="1"
                            variant="outlined"
                            placeholder="Masukkan nilai harga pembelian"
                            :disabled="!form.manageStock"
                          />
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <VBtn
                v-if="form.hasMultipleUnits"
                variant="outlined"
                color="primary"
                prepend-icon="tabler-plus"
                block
                :disabled="(form.units?.length || 0) >= 5 || !form.units?.[0]?.unitIdOrName"
                @click="addNewBlankUnit(form.units?.length === 0)"
              >
                Tambah Satuan Lain
              </VBtn>
            </div>
          </VCardText>
        </VCard>

        <!-- Variant Section -->
        <VCard
          class="mb-6"
          elevation="2"
        >
          <VCardItem>
            <VCardTitle class="text-h6 d-flex align-center">
              <VIcon
                icon="tabler-chef-hat"
                class="me-2"
                color="warning"
              />
              Varian Produk
            </VCardTitle>
            <VCardSubtitle>
              Tentukan apakah produk ini memiliki varian
            </VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol cols="12">
                <VCard
                  variant="outlined"
                  class="pa-4 mb-4"
                >
                  <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                    Apakah produk ini memiliki varian? <span class="text-error">*</span>
                  </label>
                  <VSwitch
                    v-model="form.hasVariants"
                    :rules="[requiredValidator]"
                    :error-messages="formErrors?.hasVariants"
                    :readonly="readonly"
                    :label="form.hasVariants ? 'Ya, memiliki varian' : 'Tidak memiliki varian'"
                    :true-value="true"
                    :false-value="false"
                    color="warning"
                    inset
                  />
                </VCard>
              </VCol>

              <VCol
                v-if="form.hasVariants"
                cols="12"
              >
                <div v-if="(form.variant?.groups?.length || 0) > 0">
                  <VRow
                    v-for="(group, index) in form.variant.groups"
                    :key="index"
                    class="mb-4"
                  >
                    <VCol cols="12">
                      <VCard
                        variant="outlined"
                        class="pa-4"
                      >
                        <VRow align="center">
                          <VCol cols="12">
                            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                              Tipe Varian {{ index + 1 }} <span class="text-error">*</span>
                            </label>
                            <VTextField
                              v-model="group.name"
                              :rules="[requiredValidator]"
                              type="text"
                              variant="outlined"
                              placeholder="Masukkan tipe varian"
                              @keyup="generateVariants"
                            >
                              <template #append-inner>
                                <VBtn
                                  variant="text"
                                  color="error"
                                  icon="tabler-trash"
                                  size="small"
                                  @click="removeVariantGroup(index)"
                                />
                              </template>
                            </VTextField>
                          </VCol>
                          <VCol
                            v-for="(option, optionIndex) in group.options"
                            :key="optionIndex"
                            cols="12"
                            md="3"
                          >
                            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                              Opsi {{ optionIndex + 1 }} <span class="text-error">*</span>
                            </label>
                            <VTextField
                              v-model="option.name"
                              :rules="[requiredValidator]"
                              type="text"
                              variant="outlined"
                              @keyup="generateVariants"
                            >
                              <template #append-inner>
                                <VBtn
                                  variant="text"
                                  color="error"
                                  icon="tabler-trash"
                                  size="small"
                                  @click="removeVariantGroupOption(index, optionIndex)"
                                />
                              </template>
                            </VTextField>
                          </VCol>

                          <VCol>
                            <div class="h-100 d-flex flex-column justify-end">
                              <VBtn
                                variant="outlined"
                                color="primary"
                                icon="tabler-plus"
                                size="small"
                                @click="addBlankVariantGroupOption(index)"
                              />
                            </div>
                          </VCol>
                        </VRow>
                      </VCard>
                    </VCol>
                  </VRow>
                </div>
                <div>
                  <VBtn
                    variant="outlined"
                    color="primary"
                    prepend-icon="tabler-plus"
                    size="small"
                    block
                    @click="addBlankVariantGroup"
                  >
                    Tambah Tipe Varian
                  </VBtn>
                </div>
                <VDivider class="my-5" />
                <div class="mt-5">
                  <div class="text-h6 font-weight-bold">
                    Daftar Varian
                  </div>
                  <VTable class="mt-5 w-100">
                    <thead>
                      <tr>
                        <th class="text-start">
                          Pilihan Varian
                        </th>
                        <th class="text-start">
                          Harga Beli
                        </th>
                        <th class="text-start">
                          Harga Jual
                        </th>
                        <th class="text-start">
                          SKU
                        </th>
                        <th
                          class="text-start"
                          width="5%"
                        >
                          Tampil di POS
                        </th>
                        <th
                          class="text-start"
                          width="5%"
                        >
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(variant, index) in form.variant?.variants"
                        :key="index"
                      >
                        <td>
                          <template v-for="(value, key) in variant.attributesBySlug">
                            <VChip
                              v-if="value"
                              :key="key"
                              class="me-1"
                              color="primary"
                            >
                              {{ key }}: {{ value }}
                            </VChip>
                          </template>
                        </td>
                        <td>
                          <AppTextFieldRupiah
                            v-model="variant.purchasePrice"
                            disabled
                          />
                        </td>
                        <td>
                          <AppTextFieldRupiah
                            v-model="variant.price"
                            :rules="[requiredValidator]"
                            :error-messages="formErrors?.variants?.[index]?.price"
                            :readonly="readonly"
                          />
                        </td>
                        <td>
                          <AppTextField
                            v-model="variant.sku"
                            :rules="[requiredValidator]"
                            :error-messages="formErrors?.variants?.[index]?.sku"
                            :readonly="readonly"
                            placeholder="Masukkan SKU"
                          >
                            <template #append-inner>
                              <VIcon
                                icon="tabler-dice"
                                @click="generateRandomCodeFor(variant, 'sku')"
                              />
                            </template>
                          </AppTextField>
                        </td>
                        <td>
                          <VSwitch
                            v-model="variant.showInPos"
                            :rules="[requiredValidator]"
                            :error-messages="formErrors?.variants?.[index]?.showInPos"
                            :readonly="readonly"
                            :true-value="true"
                            :false-value="false"
                            color="success"
                            inset
                          />
                        </td>
                        <td>
                          <VBtn
                            variant="text"
                            color="error"
                            icon="tabler-trash"
                            @click="removeVariantGroup(index)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </VTable>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Recipe Section -->
        <VCard
          class="mb-6"
          elevation="2"
        >
          <VCardItem>
            <VCardTitle class="text-h6 d-flex align-center">
              <VIcon
                icon="tabler-chef-hat"
                class="me-2"
                color="warning"
              />
              Resep Produk
            </VCardTitle>
            <VCardSubtitle>
              Tentukan apakah produk ini memerlukan resep dan bahan baku
            </VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol cols="12">
                <VCard
                  variant="outlined"
                  class="pa-4 mb-4"
                >
                  <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                    Apakah produk ini butuh resep? <span class="text-error">*</span>
                  </label>
                  <VSwitch
                    v-model="form.hasRecipes"
                    :rules="[requiredValidator]"
                    :error-messages="formErrors?.hasRecipes"
                    :readonly="readonly"
                    :label="form.hasRecipes ? 'Ya, butuh resep' : 'Tidak butuh resep'"
                    :true-value="true"
                    :false-value="false"
                    color="warning"
                    inset
                  />
                </VCard>
              </VCol>

              <VCol
                v-if="form.hasRecipes"
                cols="12"
              >
                <VAlert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  <VAlertTitle>Informasi Resep</VAlertTitle>
                  Tambahkan bahan baku yang diperlukan untuk membuat produk ini. Pastikan semua bahan sudah terdaftar dalam sistem.
                </VAlert>

                <div v-if="(form.recipe?.lines?.length || 0) > 0">
                  <VRow
                    v-for="(recipe, index) in form.recipe.lines"
                    :key="index"
                    class="mb-4"
                  >
                    <VCol cols="12">
                      <VCard
                        variant="outlined"
                        class="pa-4"
                      >
                        <VRow align="center">
                          <VCol
                            cols="12"
                            md="5"
                          >
                            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                              Bahan Baku <span class="text-error">*</span>
                            </label>
                            <VAutocomplete
                              v-model="recipe.materialItemId"
                              :items="materials"
                              item-title="name"
                              item-value="itemId"
                              :rules="[requiredValidator]"
                              :loading="isLoadingFetchDataMaterials"
                              variant="outlined"
                              placeholder="Pilih bahan baku"
                              @update:model-value="onUpdateRecipe(index)"
                            >
                              <template #append>
                                <VBtn
                                  variant="outlined"
                                  color="primary"
                                  prepend-icon="tabler-plus"
                                  size="small"
                                  @click="openCreateDialog(form.outletIds)"
                                >
                                  Tambah Bahan
                                </VBtn>
                              </template>
                            </VAutocomplete>
                          </VCol>

                          <VCol
                            cols="12"
                            md="3"
                          >
                            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                              Jumlah Takaran <span class="text-error">*</span>
                            </label>
                            <VTextField
                              v-model="recipe.quantity"
                              :rules="[requiredValidator]"
                              type="number"
                              variant="outlined"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </VCol>

                          <VCol
                            cols="12"
                            md="3"
                          >
                            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                              Satuan
                            </label>
                            <VTextField
                              :model-value="recipe.materialUnitName || ' - '"
                              disabled
                              variant="outlined"
                              placeholder="Pilih bahan terlebih dahulu"
                            />
                          </VCol>

                          <VCol
                            cols="12"
                            md="1"
                            class="d-flex justify-center"
                          >
                            <VBtn
                              variant="outlined"
                              color="error"
                              icon="tabler-trash"
                              size="small"
                              @click="removeRecipe(index)"
                            />
                          </VCol>
                        </VRow>
                      </VCard>
                    </VCol>
                  </VRow>
                </div>

                <VBtn
                  variant="outlined"
                  color="primary"
                  prepend-icon="tabler-plus"
                  block
                  @click="addNewBlankRecipe"
                >
                  Tambah Bahan Baku
                </VBtn>
              </VCol>
            </VRow>
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
