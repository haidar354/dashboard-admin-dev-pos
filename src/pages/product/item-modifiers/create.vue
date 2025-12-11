<script setup lang="ts">
import { VAutocomplete, VForm, VTable, VTextField } from 'vuetify/lib/components/index.mjs'

import { VBtn } from 'vuetify/components/VBtn'
import { useMaterialStore } from '@/stores/inventory/materialStore'
import { useModifierStore } from '@/stores/product/modifierStore'
import type { Material } from '@/types/models/inventory/material'
import type { ModifierOptionCreate } from '@/types/models/product/item-modifier/modifier-create'

definePage({
  meta: {
    name: 'Tambah Produk',
    navActiveLink: 'product-items',
    rules: [
      {
        action: 'manage',
        subject: 'Tambah Produk',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const modifierStore = useModifierStore()
const { isLoadingCreate, createForm, createFormErrors } = storeToRefs(modifierStore)
const isOptionHasLimit = ref(false)
const refVForm = ref<VForm>()

const materialStore = useMaterialStore()
const { data: materials, isLoadingFetchData: isLoadingFetchDataMaterials } = storeToRefs(materialStore)

const materialsById = computed(() => {
  const map = new Map<string, Material>()
  for (const m of materials.value ?? []) map.set(m.itemId, m)

  return map
})

const unitOptions = (itemId?: string) => {
  if (!itemId)
    return []

  return materialsById.value.get(itemId)?.itemUnits ?? []
}

const getCostPriceByItemId = (itemId?: string, itemUnitId?: string) => {
  const def = itemId ? materialsById.value.get(itemId)?.itemUnits?.find(p => p.itemUnitId === itemUnitId) : undefined

  return def?.itemCost?.cost ?? 0
}

const onMaterialIdChange = (optionIndex: number, componentIndex: number, itemId: string) => {
  nextTick(() => {
    const comp = createForm.value.options?.[optionIndex]?.components?.[componentIndex]
    if (!comp)
      return

    // set default unit setiap kali material berubah
    const def = materialsById.value.get(itemId)?.itemUnits?.find(p => p.isBase)

    comp.componentUnitId = def?.itemUnitId || ''
  })
}

watch(() => createForm.value.multiple, isMultiple => {
  if (!isMultiple) {
    createForm.value.minSelect = 1
    createForm.value.maxSelect = 1
  }
})

const backToIndex = () => {
  router.push({
    name: 'product-item-modifiers',
  })
}

const SubmitData = async () => {
  await modifierStore.create().then(() => {
    backToIndex()
  })
}

const onSubmit = async () => {
  refVForm.value?.validate()
    .then(async ({ valid: isValid, errors }) => {
      console.log(errors)
      if (isValid)
        await SubmitData()
      else
        showToast('Pastikan semua form wajib terisi dan sesuai', 'error')
    })
}

const initializeForm = () => {
  createForm.value = {
    name: '',
    type: 'extra',
    multiple: false,
    minSelect: 1,
    maxSelect: 1,
    isActive: true,
    options: [
      {
        name: '',
        salesPrice: 0,
        isDefault: false,
        components: [],
        hasComponent: false,
      },
    ],
  }
}

const newOption = () => {
  createForm.value.options.push({
    name: '',
    priceDelta: 0,
    isDefault: false,
    components: [],
    hasComponent: false,
  } as ModifierOptionCreate)
}

const removeOption = (index: number) => {
  createForm.value?.options?.splice(index, 1)
}

const newOptionComponent = (optionIndex: number) => {
  createForm.value.options[optionIndex].components.push({
    componentItemId: '',
    componentUnitId: '',
    quantity: 1,
    wastagePercent: 0,
  })
}

const removeOptionComponent = (optionIndex: number, componentIndex: number) => {
  createForm.value.options[optionIndex].components.splice(componentIndex, 1)
}

const onOptionComponentChange = async (optionIndex: number) => {
  await nextTick()
  if (createForm.value.options[optionIndex].hasComponent === true)
    newOptionComponent(optionIndex)
  else
    createForm.value.options[optionIndex].components = []
}

onMounted(() => {
  initializeForm()
  materialStore.fetchAllData({
    include: [
      'itemUnits.unit',
      'itemUnits.itemCost',
    ],
  })
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle class="text-h5 font-weight-bold">
        Tambah Produk Ekstra
      </VCardTitle>
      <VCardSubtitle class="text-body-1">
        Tambah data produk ekstra baru
      </VCardSubtitle>
    </VCardItem>
  </VCard>
  <VForm
    ref="refVForm"
    class="mt-5"
    @submit.prevent="onSubmit"
  >
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
          Informasi Produk Ekstra
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <label for="">Nama Produk Ekstra <span class="text-error">*</span></label>
            <VTextField
              v-model="createForm.name"
              :rules="[requiredValidator]"
              :error-messages="createFormErrors?.name"
              maxlength="100"
              counter
            />
          </VCol>
          <VCol cols="12">
            <label for="">Cara pilih <span class="text-error">*</span></label>
            <VRadioGroup
              v-model="createForm.multiple"
              inline
            >
              <VRadio
                label="Pilih Salah Satu"
                :value="false"
              />
              <VRadio
                label="Pilih Beberapa"
                :value="true"
              />
            </VRadioGroup>
          </VCol>
          <VCol
            v-if="createForm.multiple"
            cols="12"
          >
            <VRow>
              <VCol
                cols="12"
                md="4"
                sm="6"
              >
                <label for="">Batasi Jumlah Pilihan</label>
                <VSwitch
                  v-model="isOptionHasLimit"
                  :true-value="true"
                  :false-value="false"
                  hint="Pilihan ekstra dapat dibatasi minimal dan maksimal"
                  persistent-hint
                  true-icon="tabler-check"
                  false-icon="tabler-x"
                />
              </VCol>
              <VCol
                v-if="isOptionHasLimit"
                cols="12"
                md="4"
                sm="6"
              >
                <label for="">Minimal Pilih</label>
                <VTextField
                  v-model.number="createForm.minSelect"
                  :rules="[requiredValidator]"
                  :error-messages="createFormErrors?.minSelect"
                  type="number"
                />
              </VCol>
              <VCol
                v-if="isOptionHasLimit"
                cols="12"
                md="4"
                sm="6"
              >
                <label for="">Maksimal Pilih </label>
                <VTextField
                  v-model="createForm.maxSelect"
                  :rules="[requiredValidator]"
                  :error-messages="createFormErrors?.maxSelect"
                  type="number"
                />
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="12">
            <label for="">Status <span class="text-error">*</span></label>
            <VSwitch
              v-model="createForm.isActive"
              :error-messages="createFormErrors?.isActive"
              :true-value="true"
              :false-value="false"
              hint="Tampilkan kategori pada aplikasi kasir"
              persistent-hint
              true-icon="tabler-check"
              false-icon="tabler-x"
            />
          </VCol>
          <VCol cols="12">
            <label for="">Pilihan <span class="text-error">*</span></label>

            <VRow
              v-for="(option, optionIndex) in createForm.options"
              :key="optionIndex"
              class="mt-0"
            >
              <VCol cols="12">
                <VCard variant="outlined">
                  <VCardItem>
                    <VCardTitle class="text-h6 font-weight-medium">
                      Pilihan {{ optionIndex + 1 }}
                    </VCardTitle>
                    <template #append>
                      <VBtn
                        v-if="createForm.options.length > 1"
                        variant="outlined"
                        color="error"
                        icon="tabler-trash"
                        size="small"
                        rounded
                        @click="removeOption(optionIndex)"
                      />
                    </template>
                  </VCardItem>
                  <VCardText>
                    <VRow>
                      <VCol cols="12">
                        <label for="">Asal Produk <span class="text-error">*</span></label>
                        <VRadioGroup
                          v-model="option.hasComponent"
                          inline
                          @change="onOptionComponentChange(optionIndex)"
                        >
                          <VRadio
                            label="Buat Baru"
                            :value="false"
                          />
                          <VRadio
                            label="Pilih Dari Inventori"
                            :value="true"
                          />
                        </VRadioGroup>
                      </VCol>
                      <VCol
                        cols="12"
                        md="6"
                      >
                        <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                          Nama Pilihan <span class="text-error">*</span>
                        </label>
                        <VTextField
                          v-model="option.name"
                          :rules="[requiredValidator]"
                          variant="outlined"
                          placeholder="Masukkan nama pilihan"
                        />
                      </VCol>
                      <VCol
                        cols="12"
                        md="6"
                      >
                        <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                          Harga Jual <span class="text-error">*</span>
                        </label>
                        <AppTextFieldRupiah
                          v-model="option.salesPrice"
                          :rules="[requiredValidator]"
                          variant="outlined"
                          placeholder="Masukkan harga jual"
                        />
                      </VCol>
                      <VCol
                        v-if="option.hasComponent"
                        cols="12"
                      >
                        <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                          Daftar Bahan Baku <span class="text-error">*</span>
                        </label>
                        <VTable>
                          <thead>
                            <tr>
                              <th style="min-width: 180px;">
                                Nama Bahan Baku
                              </th>
                              <th
                                style="
                                min-width:
                                180px;"
                              >
                                Harga Modal @
                              </th>
                              <th style="min-width: 150px;">
                                Takaran
                              </th>
                              <th style="min-width: 180px;">
                                Kemasan
                              </th>
                              <th width="50" />
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(component, componentIndex) in option.components"
                              :key="componentIndex"
                            >
                              <td>
                                <VAutocomplete
                                  v-model="component.componentItemId"
                                  :items="materials"
                                  item-title="name"
                                  item-value="itemId"
                                  :rules="[requiredValidator]"
                                  :loading="isLoadingFetchDataMaterials"
                                  variant="outlined"
                                  placeholder="Pilih bahan baku"
                                  :return-object="false"
                                  @update:model-value="id => onMaterialIdChange(optionIndex, componentIndex, id)"
                                />
                              </td>
                              <td>
                                <VTextField
                                  :value="formatRupiah(getCostPriceByItemId(component.componentItemId, component.componentUnitId))"
                                  variant="outlined"
                                  disabled
                                />
                              </td>
                              <td>
                                <VTextField
                                  v-model.number="component.quantity"
                                  type="number"
                                  :rules="[requiredValidator]"
                                  variant="outlined"
                                  placeholder="Masukkan takaran"
                                />
                              </td>
                              <td>
                                <VSelect
                                  v-model="component.componentUnitId"
                                  :items="unitOptions(component.componentItemId)"
                                  item-title="unit.name"
                                  item-value="itemUnitId"
                                  :rules="[requiredValidator]"
                                  variant="outlined"
                                  placeholder="Pilih kemasan"
                                />
                              </td>
                              <td>
                                <VBtn
                                  icon
                                  variant="text"
                                  @click="removeOptionComponent(optionIndex, componentIndex)"
                                >
                                  <VIcon>tabler-trash</VIcon>
                                </VBtn>
                              </td>
                            </tr>
                            <tr>
                              <td colspan="5">
                                <div class="d-flex flex-column justify-center gap-3 align-center py-5">
                                  <div
                                    v-if="!option.components.length"
                                    class="my-3"
                                  >
                                    Belum ada bahan baku yang ditambahkan
                                  </div>
                                  <VBtn
                                    variant="outlined"
                                    color="success"
                                    block
                                    prepend-icon="tabler-plus"
                                    @click="newOptionComponent(optionIndex)"
                                  >
                                    Tambah Bahan Baku
                                  </VBtn>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </VTable>
                      </VCol>
                    </VRow>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>

            <VBtn
              class="mt-4"
              variant="outlined"
              color="primary"
              prepend-icon="tabler-plus"
              block
              @click="newOption"
            >
              Tambah Pilihan
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Action Buttons -->
    <VDivider class="my-6" />

    <VRow>
      <VCol class="d-flex justify-end gap-4">
        <VBtn
          color="secondary"
          variant="outlined"
          type="button"
          prepend-icon="tabler-arrow-left"
          size="large"
          @click="backToIndex"
        >
          Batal
        </VBtn>
        <VBtn
          :loading="isLoadingCreate"
          color="primary"
          variant="flat"
          type="submit"
          prepend-icon="tabler-device-floppy"
          size="large"
        >
          Simpan Produk
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
