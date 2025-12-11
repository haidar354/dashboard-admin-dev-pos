<script setup lang="ts">
import { VAutocomplete, VForm, VTextField } from 'vuetify/lib/components/index.mjs'

import ItemTypeRadioComponent from './ItemTypeRadioComponent.vue'
import { useUnitStore } from '@/stores/global/unitStore'
import { useMaterialStore } from '@/stores/inventory/materialStore'
import { useOutletStore } from '@/stores/outletStore'
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'

defineProps<{
  readonly?: boolean
}>()

const materialStore = useMaterialStore()
const { form, formErrors, data: items, isLoadingFetchData: isLoadingFetchDataItems } = storeToRefs(materialStore)
const { generateRandomCode } = materialStore

const refVForm = ref<VForm>()
const isLoadingSubmit = ref(false)

const onSubmit = async () => {
  refVForm.value?.validate()
    .then(async ({ valid: isValid }) => {
      if (isValid) {
        await materialStore.create().then(() => {
          materialStore.closeCreateDialog()
          materialStore.fetchAllData()
        })
      }

      else { showToast('Pastikan semua form wajib terisi dan sesuai', 'error') }
    })
}

const outletStore = useOutletStore()
const { data: outlets, isLoadingFetchData: isLoadingFetchDataOutlet } = storeToRefs(outletStore)

const itemCategoryStore = useItemCategoryStore()
const { data: itemCategories, isLoadingFetchData: isLoadingFetchDataItemCategory } = storeToRefs(itemCategoryStore)

const unitStore = useUnitStore()
const { data: units, isLoadingFetchData: isLoadingFetchDataUnit } = storeToRefs(unitStore)

const { newBlankRecipe, removeRecipe, newBlankUnit, removeUnit, openCreateDialog } = materialStore

const onUpdateRecipe = (index: number) => {
  const recipe = form.value.recipes?.[index]

  if (!recipe)
    return

  const ingredientItem = items.value.find(item => item.itemCategoryId === recipe.ingredientItemId)

  recipe.ingredientItemName = ingredientItem?.name
  recipe.ingredientUnitName = units.value.find(unit => unit.unitId === recipe.ingredientUnitId)?.name
}

const onUpdateUnit = (index: number) => {
  const unit = form.value.units?.[index]

  if (!unit)
    return

  const unitData = units.value.find(unitValue => unit.unitId === unitValue.unitId)

  unit.unitName = unitData?.name
}

watch(() => form.value.hasRecipe, value => {
  if (value)
    materialStore.fetchAllData()
})

onMounted(async () => {
  itemCategoryStore.fetchAllData()
  unitStore.fetchAllData()
})
</script>

<template>
  <VDialog
    v-model="materialStore.isCreateDialogVisible"
    persistent
    :overlay="false"
    max-width="900px"
    transition="dialog-transition"
  >
    <DialogCloseBtn
      :disabled="isLoadingSubmit"
      @click="materialStore.closeCreateDialog()"
    />
    <VForm
      ref="refVForm"
      @submit.prevent="onSubmit"
    >
      <VSkeletonLoader
        v-if="materialStore.isLoadingFetchData"
        class="mx-auto w-100"
        elevation="2"
        type="article, table-row-divider@6, actions"
        boilerplate
      />
      <VCard
        v-else
        title="Tambah Bahan Baku"
      >
        <VCardText>
          <div>
            <VRow>
              <VCol cols="12">
                <label>Tipe Bahan Baku <span class="text-error">*</span></label>
                <ItemTypeRadioComponent
                  v-model="form.type"
                  :rules="[requiredValidator]"
                  :error-messages="formErrors?.type"
                  :items="itemTypes.filter(item => item.value !== 'finished')"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <label>Pilih Outlet <span class="text-error">*</span></label>
                <VAutocomplete
                  v-model="form.outletIds"
                  :items="outlets"
                  item-title="name"
                  item-value="outletId"
                  :rules="[requiredValidator]"
                  :error-messages="formErrors?.outletIds"
                  :loading="isLoadingFetchDataOutlet"
                  multiple
                  counter
                  maxlength="100"
                  prepend-inner-icon="tabler-building-store"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <label>Nama Bahan Baku <span class="text-error">*</span></label>
                <AppTextField
                  v-model="form.name"
                  :rules="[requiredValidator]"
                  :error-messages="formErrors?.name"
                  counter
                  maxlength="100"
                  prepend-inner-icon="tabler-file-text"
                  :readonly="readonly"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <label>SKU <span class="text-error">*</span></label>
                <div class="d-flex gap-3">
                  <AppTextField
                    v-model="form.code"
                    :rules="[requiredValidator]"
                    :error-messages="formErrors?.code"
                    counter
                    maxlength="100"
                    prepend-inner-icon="tabler-number"
                    :readonly="readonly"
                  />
                  <VBtn
                    variant="outlined"
                    color="primary"
                    prepend-icon="tabler-dice"
                    @click="generateRandomCode"
                  >
                    Kode Acak
                  </VBtn>
                </div>
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <label>Kategori <span class="text-error">*</span></label>
                <VAutocomplete
                  v-model="form.itemCategoryId"
                  :items="itemCategories"
                  item-title="name"
                  item-value="itemCategoryId"
                  :rules="[requiredValidator]"
                  :error-messages="formErrors?.itemCategoryId"
                  prepend-inner-icon="tabler-list-numbers"
                  :readonly="readonly"
                  :loading="isLoadingFetchDataItemCategory"
                />
              </VCol>
              <VCol cols="12">
                <VRow>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <label>Bisa langsung dijual?<span class="text-error">*</span></label>
                    <VSwitch
                      v-model="form.isSellable"
                      :rules="[requiredValidator]"
                      :error-messages="formErrors?.isSellable"
                      prepend-inner-icon="tabler-shopping-cart"
                      :readonly="readonly"
                      :label="form.isSellable ? 'Ya' : 'Tidak'"
                      :disabled="form.type === 'consumable' || form.type === 'raw'"
                      :true-value="true"
                      :false-value="false"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <label>Apakah produk ini topping?<span class="text-error">*</span></label>
                    <VSwitch
                      v-model="form.isTopping"
                      :rules="[requiredValidator]"
                      :error-messages="formErrors?.isTopping"
                      prepend-inner-icon="tabler-shopping-cart"
                      :readonly="readonly"
                      :label="form.isTopping ? 'Ya' : 'Bukan'"
                      :disabled="form.type === 'consumable' || form.type === 'raw'"
                      :true-value="true"
                      :false-value="false"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <label>Status<span class="text-error">*</span></label>
                    <VSwitch
                      v-model="form.isActive"
                      :rules="[requiredValidator]"
                      :error-messages="formErrors?.isActive"
                      prepend-inner-icon="tabler-shopping-cart"
                      :readonly="readonly"
                      :label="form.isActive ? 'Aktif' : 'Tidak Aktif'"
                      :true-value="true"
                      :false-value="false"
                    />
                  </VCol>
                </VRow>
              </VCol>

              <VCol cols="12">
                <VRow>
                  <VCol
                    cols="12"
                    class="text-primary"
                  >
                    <div class="d-flex my-auto mt-5">
                      <div class="font-weight-bold no-wrap-text">
                        Satuan
                      </div>
                      <VDivider
                        class="ms-3 my-auto"
                        thickness="1"
                        color="primary"
                      />
                    </div>
                  </VCol>
                  <VCol
                    v-if="form.units?.length > 0"
                    cols="12"
                  >
                    <div>Pilih satuan:</div>
                    <VRow
                      v-for="(unit, index) in form.units"
                      :key="index"
                    >
                      <VCol cols="11">
                        <VRow>
                          <VCol
                            cols="12"
                            md="6"
                          >
                            <label>Satuan <span class="text-error">*</span></label>
                            <VAutocomplete
                              v-model="unit.unitId"
                              :items="units"
                              item-title="name"
                              item-value="unitId"
                              :rules="[requiredValidator]"
                              :loading="isLoadingFetchDataUnit"
                              @update:model-value="onUpdateUnit(index)"
                            >
                              <template #append-inner>
                                <div
                                  v-if="unit.isDefault"
                                  class="d-flex gap-1"
                                >
                                  <VIcon
                                    icon="tabler-check"
                                    color="primary"
                                  />
                                  Utama
                                </div>
                                <div
                                  v-else
                                  class="d-flex gap-1"
                                >
                                  Tambahan
                                </div>
                              </template>
                            </VAutocomplete>
                          </VCol>
                          <VCol
                            cols="12"
                            md="6"
                          >
                            <label>Konversi <span
                              v-if="!unit.isDefault"
                              class="text-error"
                            >*</span></label>
                            <VTextField
                              v-model="unit.conversion"
                              type="number"
                              :rules="[requiredValidator]"
                              :disabled="unit.isDefault"
                              :min="1"
                            >
                              <template #append-inner>
                                <div
                                  v-if="!unit.isDefault"
                                  class="d-flex gap-1"
                                >
                                  {{ form.units.find(unit => unit.unitId === unit.unitId)?.unitName }}
                                </div>
                              </template>
                            </VTextField>
                          </VCol>
                        </VRow>
                      </VCol>
                      <VCol cols="1">
                        <VBtn
                          v-if="!unit.isDefault"
                          variant="outlined"
                          color="error"
                          icon="tabler-trash"
                          rounded
                          class="mt-5"
                          @click="removeUnit(index)"
                        />
                      </VCol>
                      <VDivider />
                    </VRow>
                  </VCol>
                  <VCol
                    v-if="form.units?.length > 0"
                    cols="12"
                  >
                    <VBtn
                      variant="outlined"
                      color="primary"
                      prepend-icon="tabler-plus"
                      block
                      :disabled="form.units?.length >= 5 || !form.units?.[0]?.unitId"
                      @click="newBlankUnit(form.units?.length === 0)"
                    >
                      Tambah Satuan
                    </vbtn>
                  </VCol>
                </VRow>
              </VCol>

              <VCol
                v-if="form.type !== 'raw'"
                cols="12"
              >
                <VRow>
                  <VCol cols="12">
                    <div class="d-flex my-auto mt-5">
                      <div class="font-weight-bold no-wrap-text">
                        Penjualan
                      </div>
                      <VDivider
                        class="ms-3 my-auto"
                        thickness="1"
                      />
                    </div>
                  </VCol>
                  <VCol cols="12">
                    <label>Harga Jual <span class="text-error">*</span></label>
                    <AppTextFieldRupiah
                      v-model="form.sellingPrice"
                      :rules="[requiredValidator]"
                      :error-messages="formErrors?.sellingPrice"
                    />
                  </VCol>
                </VRow>
              </VCol>

              <VCol
                v-if="form.type !== 'raw'"
                cols="12"
              >
                <VRow>
                  <VCol cols="12">
                    <div class="d-flex my-auto">
                      <div class="font-weight-bold no-wrap-text">
                        Resep
                      </div>
                      <VDivider
                        class="ms-3 my-auto"
                        thickness="1"
                      />
                    </div>
                  </VCol>
                  <VCol cols="12">
                    <label>Apakah produk ini butuh resep?<span class="text-error">*</span></label>
                    <VSwitch
                      v-model="form.hasRecipe"
                      :rules="[requiredValidator]"
                      :error-messages="formErrors?.hasRecipe"
                      prepend-inner-icon="tabler-shopping-cart"
                      :readonly="readonly"
                      :label="form.hasRecipe ? 'Ya' : 'Tidak'"
                      :true-value="true"
                      :false-value="false"
                    />
                  </VCol>
                  <VCol
                    v-if="form.hasRecipe"
                    cols="12"
                  >
                    <div>Pilih bahan baku:</div>
                    <VRow
                      v-for="(recipe, index) in form.recipes"
                      :key="index"
                    >
                      <VCol cols="11">
                        <VRow>
                          <VCol cols="12">
                            <label>Bahan Baku <span class="text-error">*</span></label>
                            <VAutocomplete
                              v-model="recipe.ingredientItemId"
                              :items="items"
                              item-title="name"
                              item-value="itemId"
                              :rules="[requiredValidator]"
                              :loading="isLoadingFetchDataItems"
                              @update:model-value="onUpdateRecipe(index)"
                            >
                              <template #append>
                                <VBtn
                                  variant="outlined"
                                  color="primary"
                                  prepend-icon="tabler-plus"
                                  @click="openCreateDialog"
                                >
                                  Tambah Bahan Baku
                                </VBtn>
                              </template>
                            </VAutocomplete>
                          </VCol>
                          <VCol
                            cols="12"
                            md="6"
                          >
                            <label>Jumlah <span class="text-error">*</span></label>
                            <VTextField
                              v-model="recipe.quantity"
                              :rules="[requiredValidator]"
                              type="number"
                            />
                          </VCol>
                          <VCol
                            cols="12"
                            md="6"
                          >
                            <label>Satuan</label>
                            <VTextField
                              :model-value="recipe.ingredientUnitName"
                              disabled
                            />
                          </VCol>
                        </VRow>
                      </VCol>
                      <VCol cols="1">
                        <VBtn
                          variant="outlined"
                          color="error"
                          icon="tabler-trash"
                          rounded
                          class="mt-5"
                          @click="removeRecipe(index)"
                        />
                      </VCol>
                      <VDivider />
                    </VRow>
                  </VCol>
                  <VCol
                    v-if="form.hasRecipe"
                    cols="12"
                  >
                    <VBtn
                      variant="outlined"
                      color="primary"
                      prepend-icon="tabler-plus"
                      block
                      @click="newBlankRecipe"
                    >
                      Tambah Resep
                    </vbtn>
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
          </div>
        </VCardText>

        <VCardText class="d-flex justify-center gap-4">
          <VBtn
            type="button"
            color="secondary"
            :disabled="materialStore.isLoadingSubmit"
            @click="materialStore.closeCreateDialog()"
          >
            Tutup
          </VBtn>
          <VBtn
            type="submit"
            color="primary"
            :loading="materialStore.isLoadingSubmit"
          >
            Simpan
          </VBtn>
        </VCardText>
      </VCard>
    </VForm>
  </VDialog>
</template>

<style lang="scss" scoped>
.no-wrap-text {
  /* Prevents text from wrapping */
  flex-shrink: 0;
  white-space: nowrap;

  /* Prevents the text from shrinking */
}
</style>
