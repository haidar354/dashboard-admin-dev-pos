<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useMaterialStore } from '@/stores/inventory/materialStore'
import { useModifierStore } from '@/stores/product/modifierStore'
import type { Material } from '@/types/models/inventory/material'
import type {
  ModifierOptionComponentUpsert,
  ModifierOptionUpsert,
} from '@/types/models/product/item-modifier/modifier-update' // sesuaikan path

definePage({
  meta: {
    name: 'Ubah Produk Ekstra',
    navActiveLink: 'product-item-modifiers',
    rules: [
      { action: 'manage', subject: 'Ubah Produk Ekstra' },
      { action: 'manage', subject: 'default' },
    ],
  },
})

const router = useRouter()
const route = useRoute()

// ===== stores =====
const modifierStore = useModifierStore()
const { selectedModifierGroupDetail: detail, updateForm, isLoadingUpdate, isLoadingFetchDetail } = storeToRefs(modifierStore)

const materialStore = useMaterialStore()
const { data: materials, isLoadingFetchData: isLoadingMaterials } = storeToRefs(materialStore)

// ===== form state =====
type OptionRow = ModifierOptionUpsert & { hasComponent?: boolean } // UI flag

const refVForm = ref<VForm>()

// UI state
const isOptionHasLimit = ref(false) // hanya untuk mode multiple

// ===== materials lookup tanpa watch deep =====
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
    const comp = updateForm.value.options?.[optionIndex]?.components?.[componentIndex]
    if (!comp)
      return

    // set default unit setiap kali material berubah
    const def = materialsById.value.get(itemId)?.itemUnits?.find(p => p.isBase)

    comp.componentUnitId = def?.itemUnitId || ''
  })
}

// ===== load detail → mapping ke form =====
const toNum = (v: number | string | null | undefined) => {
  if (v == null || v === '')
    return 0
  const n = typeof v === 'string' ? Number(v) : v

  return Number.isFinite(n) ? n : 0
}

const hydrateFromDetail = () => {
  const d = detail.value
  if (!d)
    return

  // header
  updateForm.value.name = d.name
  updateForm.value.i18n = d.i18n
  updateForm.value.code = d.code
  updateForm.value.type = d.type
  updateForm.value.multiple = d.multiple
  updateForm.value.allowQuantity = d.allowQuantity
  updateForm.value.minSelect = d.minSelect
  updateForm.value.maxSelect = d.maxSelect
  updateForm.value.isActive = d.isActive

  // limit toggle UI
  isOptionHasLimit.value = !!(d.multiple && (d.minSelect || d.maxSelect))

  // options
  updateForm.value.options = (d.options ?? []).map<OptionRow>(o => ({
    modifierOptionId: o.modifierOptionId,
    name: o.name,
    i18n: o.i18n,

    // code tidak selalu ada di detail fields — aman di-skip
    priceDelta: toNum(o.salesPrice),
    isDefault: o.isDefault,
    sortOrder: o.sortOrder,
    isActive: o.isActive,
    hasComponent: !!o.components?.length, // UI
    components: (o.components ?? []).map<ModifierOptionComponentUpsert>(c => ({
      modifierOptionComponentId: c.modifierOptionComponentId,
      componentItemId: c.componentItemId,
      componentUnitId: c.componentUnitId || undefined,
      quantity: toNum(c.quantity),
      wastagePercent: toNum(c.wastagePercent ?? 0) || undefined,
    })),
  }))
}

// ===== actions =====
const backToIndex = () => {
  router.push({ name: 'product-item-modifiers' })
}

const newOption = () => {
  const opts = (updateForm.value.options as OptionRow[]) || []

  opts.push({
    name: '',
    priceDelta: 0,
    isDefault: false,
    isActive: true,
    hasComponent: false,
    components: [],
  } as OptionRow)
  updateForm.value.options = opts
}

const removeOption = (index: number) => {
  ;(updateForm.value.options as OptionRow[])?.splice(index, 1)

  // reconcile di server: opsi yang tidak dikirim akan dihapus
}

const newOptionComponent = (optionIndex: number) => {
  const opt = (updateForm.value.options as OptionRow[])[optionIndex]
  if (!opt.components)
    opt.components = []
  opt.components.push({
    componentItemId: '',
    componentUnitId: '',
    quantityInBase: 1,
    wastagePercent: 0,
  } as any)
}

const removeOptionComponent = (optionIndex: number, componentIndex: number) => {
  const opt = (updateForm.value.options as OptionRow[])[optionIndex]

  opt.components?.splice(componentIndex, 1)
}

const onOptionComponentToggle = async (optionIndex: number) => {
  await nextTick()

  const opt = (updateForm.value.options as OptionRow[])[optionIndex]
  if (opt.hasComponent) {
    if (!opt.components?.length)
      newOptionComponent(optionIndex)
  }
  else {
    // penting: jangan sertakan "components" agar server tidak reconcile
    delete (opt as any).components
  }
}

const onMultipleChange = () => {
  if (!updateForm.value.multiple) {
    updateForm.value.minSelect = 1
    updateForm.value.maxSelect = 1
    isOptionHasLimit.value = false
  }
}

const onSubmit = async () => {
  const { valid } = await refVForm.value!.validate()
  if (!valid) {
    showToast('Pastikan semua form wajib terisi dan sesuai', 'error')

    return
  }

  modifierStore.update().then(() => {
    router.push({ name: 'product-item-modifiers' }).then(() => {
      showToast('Produk Ekstra berhasil diperbarui', 'success')
    })
  }).catch(err => {
    showToast(err.data?.message || 'Error updating product modifier', 'error')
  })
}

onMounted(async () => {
  const id = String(route.params.itemModifierId ?? route.params.id ?? '')

  await Promise.all([
    materialStore.fetchAllData({
      include: [
        'itemUnits.unit',
        'itemUnits.itemCost',
      ],
    }),
    modifierStore.fetchDetail(id, {
      include: [
        'options',
        'options.components.componentItem',
        'options.components.componentUnit.itemSku',
        'options.components.componentUnit.itemCost',
        'options.components.componentUnit.unit',
      ],
      fields: {
        'options.components.componentUnit': [
          'itemUnitId',
          'unitId',
          'conversion',
        ],
      },
    }),
  ])
  hydrateFromDetail()
})
</script>

<template>
  <VCard class="mb-4">
    <VCardItem>
      <VCardTitle class="text-h5 font-weight-bold">
        Ubah Produk Ekstra
      </VCardTitle>
      <VCardSubtitle class="text-body-1">
        Perbarui data produk ekstra
      </VCardSubtitle>
    </VCardItem>
  </VCard>
  <VCard v-if="isLoadingFetchDetail">
    <VRow class="py-6">
      <VCol cols="12">
        <VSkeletonLoader type="article, actions" />
      </VCol>
    </VRow>
  </VCard>

  <VForm
    v-else
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
            <label>Nama Produk Ekstra <span class="text-error">*</span></label>
            <VTextField
              v-model="updateForm.name"
              :rules="[requiredValidator]"
              maxlength="100"
              counter
            />
          </VCol>

          <VCol cols="12">
            <label>Cara pilih <span class="text-error">*</span></label>
            <VRadioGroup
              v-model="updateForm.multiple"
              inline
              @update:model-value="onMultipleChange"
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
            v-if="updateForm.multiple"
            cols="12"
          >
            <VRow>
              <VCol
                cols="12"
                md="4"
                sm="6"
              >
                <label>Batasi Jumlah Pilihan</label>
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
                <label>Minimal Pilih</label>
                <VTextField
                  v-model.number="updateForm.minSelect"
                  :rules="[requiredValidator]"
                  type="number"
                />
              </VCol>

              <VCol
                v-if="isOptionHasLimit"
                cols="12"
                md="4"
                sm="6"
              >
                <label>Maksimal Pilih</label>
                <VTextField
                  v-model.number="updateForm.maxSelect"
                  :rules="[requiredValidator]"
                  type="number"
                />
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="12">
            <label>Status <span class="text-error">*</span></label>
            <VSwitch
              v-model="updateForm.isActive"
              :true-value="true"
              :false-value="false"
              hint="Tampilkan pada aplikasi kasir"
              persistent-hint
              true-icon="tabler-check"
              false-icon="tabler-x"
            />
          </VCol>

          <VCol cols="12">
            <label>Pilihan <span class="text-error">*</span></label>

            <VRow
              v-for="(option, optionIndex) in (updateForm.options as any[])"
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
                        v-if="(updateForm.options as any[]).length > 1"
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
                        <label>Asal Produk <span class="text-error">*</span></label>
                        <VRadioGroup
                          v-model="option.hasComponent"
                          inline
                          @change="onOptionComponentToggle(optionIndex)"
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
                        <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Nama Pilihan <span class="text-error">*</span></label>
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
                        <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Harga Jual <span class="text-error">*</span></label>
                        <AppTextFieldRupiah
                          v-model="option.priceDelta"
                          :rules="[requiredValidator]"
                          variant="outlined"
                          placeholder="Masukkan harga jual"
                        />
                      </VCol>

                      <VCol
                        v-if="option.hasComponent"
                        cols="12"
                      >
                        <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Daftar Bahan Baku <span class="text-error">*</span></label>

                        <VTable>
                          <thead>
                            <tr>
                              <th>Nama Bahan Baku</th>
                              <th width="180">
                                Harga Modal @
                              </th>
                              <th width="150">
                                Takaran
                              </th>
                              <th width="180">
                                Kemasan
                              </th>
                              <th width="50" />
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(component, componentIndex) in (option.components || [])"
                              :key="componentIndex"
                            >
                              <td>
                                <VAutocomplete
                                  v-model="component.componentItemId"
                                  :items="materials"
                                  item-title="name"
                                  item-value="itemId"
                                  :rules="[requiredValidator]"
                                  :loading="isLoadingMaterials"
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
                                    v-if="!(option.components?.length)"
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
          :loading="isLoadingUpdate"
          color="primary"
          variant="flat"
          type="submit"
          prepend-icon="tabler-device-floppy"
          size="large"
        >
          Simpan Perubahan
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
