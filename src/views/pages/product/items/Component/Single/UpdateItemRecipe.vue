<script setup lang="ts">
import { useItemUpdate } from '@/composables/product/useItemUpdate'
import { saleFulfillmentLabel } from '@/constants/product/item'

const {
  updateForm,
  defaultUnit,
  materials,
  isLoadingMaterials,

  // Methods
  addBomLine,
  removeBomLine,
} = useItemUpdate()
</script>

<template>
  <VCard
    v-if="updateForm.config?.saleFulfillmentMode === 'RECIPE'"
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
        Resep Penjualan
      </VCardTitle>
      <VCardSubtitle> Tentukan apakah produk ini memerlukan resep dan bahan baku saat dijual </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VRow>
        <VCol
          v-if="updateForm.useSameConfig && updateForm.config?.saleFulfillmentMode !== 'RECIPE'"
          cols="12"
        >
          <VAlert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <VAlertTitle>Informasi Resep</VAlertTitle>
            <div>
              Resep hanya berlaku untuk produk dengan <span class="font-weight-bold">Mode Penjualan "{{ saleFulfillmentLabel.RECIPE }}"</span>
            </div>
          </VAlert>
        </VCol>

        <VCol
          v-else
          cols="12"
        >
          <VRow>
            <VCol
              v-if="updateForm.useSameConfig && updateForm.config?.saleFulfillmentMode === 'RECIPE'"
              cols="12"
            >
              <div
                v-if="updateForm.hasVariant && updateForm.config?.saleFulfillmentMode === 'RECIPE'"
                class="mb-4"
              >
                <VAlert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  <VAlertTitle>Informasi Resep</VAlertTitle>
                  <div>
                    Terdapat <span>{{ updateForm.skus?.length }}</span> SKU untuk produk ini.
                  </div>
                </VAlert>
                <div>
                  <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                    Atur Bahan Baku untuk masing-masing SKU? <span class="text-error">Coming Soon</span>
                  </label>
                  <VSwitch
                    id="recipe-mode"
                    name="recipeMode"
                    true-value="perVariant"
                    false-value="parent"
                    label="'Tidak'"
                    disabled
                  />
                </div>
              </div>
              <template v-if="updateForm.config?.recipePolicy === 'ITEM_BOM_ONLY'">
                <template v-if="(updateForm.bom?.lines?.length || 0) > 0">
                  <VRow
                    v-for="(recipe, index) in (updateForm.bom?.lines || [])"
                    :key="index"
                    class="mb-4"
                  >
                    <VCol cols="12">
                      <VCard
                        variant="outlined"
                        class="pa-2"
                      >
                        <VCardItem class="pa-2">
                          <VCardTitle class="text-h6 d-flex align-center">
                            <VIcon
                              icon="tabler-carrot"
                              class="me-2"
                              color="primary"
                            />
                            Bahan baku {{ index + 1 }}
                          </VCardTitle>
                          <template #append>
                            <VBtn
                              variant="outlined"
                              color="error"
                              icon="tabler-trash"
                              size="small"
                              rounded
                              @click="removeBomLine(index)"
                            />
                          </template>
                        </VCardItem>
                        <VCardText class="pa-2">
                          <VRow align="center">
                            <VCol
                              cols="12"
                              md="6"
                            >
                              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                                Bahan Baku <span class="text-error">*</span>
                              </label>
                              <VAutocomplete
                                :id="`recipe-${index}-material-item-id`"
                                v-model="recipe.materialItemSkuId"
                                :name="`recipe[${index}][materialItemId]`"
                                :items="materials"
                                item-title="displayName"
                                item-value="itemSkuId"
                                :rules="[requiredValidator]"
                                :loading="isLoadingMaterials"
                                variant="outlined"
                                placeholder="Pilih bahan baku"
                              />
                            </VCol>

                            <VCol
                              cols="12"
                              md="3"
                            >
                              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                                Jumlah Takaran <span class="text-error">*</span>
                              </label>
                              <VTextField
                                :id="`recipe-${index}-quantity`"
                                v-model.number="recipe.quantity"
                                :name="`recipe[${index}][quantity]`"
                                :rules="[requiredValidator]"
                                type="number"
                                variant="outlined"
                                placeholder="0"
                                :min="0"
                                :step="1"
                              >
                                <template #append>
                                  <span>{{ defaultUnit?.unit?.code }}</span>
                                </template>
                              </VTextField>
                            </VCol>

                            <VCol
                              cols="12"
                              md="3"
                            >
                              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                                Persentase Terbuang <span class="text-error">*</span>
                              </label>

                              <VTextField
                                :id="`recipe-${index}-waste-pct`"
                                v-model.number="recipe.wastePct"
                                :name="`recipe[${index}][wastePct]`"
                                :rules="[requiredValidator]"
                                type="number"
                                variant="outlined"
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.1"
                                density="comfortable"
                                hide-details="auto"
                              >
                                <template #append-inner>
                                  <span class="text-medium-emphasis">%</span>
                                </template>
                              </VTextField>
                            </VCol>

                            <VCol cols="12">
                              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                                Catatan
                              </label>
                              <VTextarea
                                :id="`recipe-${index}-material-notes`"
                                v-model="recipe.notes"
                                :name="`recipe[${index}][notes]`"
                                variant="outlined"
                                placeholder="Masukkan catatan tambahan untuk bahan baku"
                                rows="1"
                                auto-grow
                              />
                            </VCol>
                          </VRow>
                        </VCardText>
                      </VCard>
                    </VCol>
                  </VRow>
                </template>

                <VBtn
                  variant="outlined"
                  color="primary"
                  prepend-icon="tabler-plus"
                  block
                  @click="addBomLine"
                >
                  Tambah Bahan Baku
                </VBtn>
              </template>
              <template v-else-if="updateForm.config?.recipePolicy === 'SKU_BOM_ONLY'">
                <VAlert type="warning">
                  Mode per SKU belum didukung.
                </VAlert>
              </template>
            </VCol>
          </VRow>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
