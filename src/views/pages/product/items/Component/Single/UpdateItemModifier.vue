<script setup lang="ts">
import { useItemUpdate } from '@/composables/product/useItemUpdate'

const {
  updateForm,
  updateFormErrors,
  modifiers,
  isLoadingModifiers,

  // Methods
  addModifier,
  removeModifier,
} = useItemUpdate()

const onUpdateModifier = (index: number) => {
  if (updateForm.value?.modifiers?.[index])
    updateForm.value.modifiers[index].group = modifiers.value?.find(m => m.modifierGroupId === updateForm.value?.modifiers?.[index]?.modifierGroupId) || undefined
}
</script>

<template>
  <VCard
    v-if="updateForm.config?.saleable"
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
        Ekstra (Topping/Isian)
      </VCardTitle>
      <VCardSubtitle> Tentukan apakah produk ini menyediakan ekstra (topping/isian) </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VRow>
        <VCol cols="12">
          <VRow>
            <VCol cols="12">
              <VCard
                variant="outlined"
                class="pa-4"
              >
                <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
                  Apakah produk ini menyediakan Ekstra (Topping/Isian)? <span class="text-error">*</span>
                </label>
                <VSwitch
                  id="has-modifier-master"
                  v-model="updateForm.hasModifier"
                  name="hasModifierMaster"
                  :rules="[requiredValidator]"
                  :error-messages="updateFormErrors?.hasModifier"
                  :label="updateForm.hasModifier ? 'Ya' : 'Tidak'"
                  :true-value="true"
                  :false-value="false"
                  color="warning"
                  inset
                />
              </VCard>
            </VCol>

            <VCol
              v-if="updateForm.hasModifier"
              cols="12"
            >
              <div v-if="(updateForm.modifiers?.length || 0) > 0">
                <VRow
                  v-for="(modifier, index) in (updateForm.modifiers || [])"
                  :key="index"
                  class="mb-4"
                >
                  <VCol cols="12">
                    <VCard class="pa-2">
                      <VCardItem class="pa-2">
                        <VCardTitle class="text-h6 d-flex align-center">
                          <VIcon
                            icon="tabler-carrot"
                            class="me-2"
                            color="primary"
                          />
                          Ekstra {{ index + 1 }}
                        </VCardTitle>
                        <template #append>
                          <VBtn
                            variant="outlined"
                            color="error"
                            icon="tabler-trash"
                            size="small"
                            @click="removeModifier(index)"
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
                              Pilih Ekstra <span class="text-error">*</span>
                            </label>
                            <VAutocomplete
                              v-if="updateForm.modifiers?.[index]?.modifierGroupId !== undefined"
                              :id="`modifier-${index}-group`"
                              v-model="updateForm.modifiers[index].modifierGroupId"
                              :name="`modifiers[${index}][modifierGroupId]`"
                              :items="modifiers"
                              item-title="name"
                              item-value="modifierGroupId"
                              :rules="[requiredValidator]"
                              :loading="isLoadingModifiers"
                              variant="outlined"
                              placeholder="Pilih produk ekstra"
                              @update:model-value="onUpdateModifier(index)"
                            />
                          </VCol>

                          <VCol
                            cols="12"
                            md="6"
                          >
                            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                              Wajib Dipilih?
                            </label>
                            <VSwitch
                              v-if="updateForm.modifiers?.[index]?.isRequired !== undefined"
                              :id="`modifier-${index}-is-required`"
                              v-model="updateForm.modifiers[index].isRequired"
                              :name="`modifiers[${index}][isRequired]`"
                              :label="updateForm.modifiers[index].isRequired ? 'Ya' : 'Tidak'"
                              :true-value="true"
                              :false-value="false"
                              color="warning"
                              inset
                            />
                          </VCol>

                          <VCol cols="12">
                            <VCard
                              v-for="(option, optionIndex) in updateForm.modifiers?.[index]?.group?.options || []"
                              :key="optionIndex"
                              variant="outlined"
                            >
                              <VCardItem>
                                <VCardTitle class="text-h6 d-flex align-center">
                                  Pilihan Ekstra {{ optionIndex + 1 }}
                                </VCardTitle>
                              </VCardItem>
                              <VCardText>
                                <VRow>
                                  <VCol cols="6">
                                    <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                                      Nama Ekstra
                                    </label>
                                    <VTextField
                                      :id="`modifier-${index}-option-${optionIndex}-name`"
                                      :name="`modifiers[${index}][options][${optionIndex}][name]`"
                                      :value="updateForm.modifiers?.[index]?.group?.options[optionIndex]?.name || ''"
                                      variant="outlined"
                                      readonly
                                    />
                                  </VCol>
                                  <VCol cols="6">
                                    <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                                      Harga Jual
                                    </label>
                                    <AppTextFieldRupiah
                                      :id="`modifier-${index}-option-${optionIndex}-sales-price`"
                                      v-model="option.defaultPrice"
                                      :name="`modifiers[${index}][options][${optionIndex}][salesPrice]`"
                                      variant="outlined"
                                      disabled
                                    />
                                  </VCol>
                                </VRow>
                              </VCardText>
                            </VCard>
                          </VCol>
                        </VRow>
                      </VCardText>
                    </VCard>
                  </VCol>
                </VRow>
              </div>

              <VBtn
                variant="outlined"
                color="primary"
                prepend-icon="tabler-plus"
                block
                @click="addModifier"
              >
                Tambah Ekstra Lain
              </VBtn>
            </VCol>
          </VRow>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
