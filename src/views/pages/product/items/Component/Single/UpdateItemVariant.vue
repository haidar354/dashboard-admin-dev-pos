<script setup lang="ts">
import { useItemUpdate } from '@/composables/product/useItemUpdate'

const {
  updateForm,
  updateFormErrors,
  variantGroups,

  // Methods
  generateVariants,
  addBlankVariantGroup,
  addBlankVariantGroupOption,
  removeVariantGroup,
  removeVariantGroupOption,
} = useItemUpdate()
</script>

<template>
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
      <VCardSubtitle> Tentukan apakah produk ini memiliki varian </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VAlert
        v-if="false"
        type="warning"
      >
        Comming soon
      </VAlert>
      <VRow v-else>
        <VCol cols="12">
          <VCard
            variant="outlined"
            class="pa-4 mb-4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-3 d-block">
              Apakah produk ini memiliki varian? <span class="text-error">*</span>
            </label>
            <VSwitch
              id="has-variant"
              v-model="updateForm.hasVariant"
              name="hasVariant"
              :error-messages="updateFormErrors?.hasVariant"
              :label="updateForm.hasVariant ? 'Ya, memiliki varian' : 'Tidak memiliki varian'"
              :true-value="true"
              :false-value="false"
              color="warning"
              inset
            />
          </VCard>
        </VCol>
        <VCol
          v-if="updateForm.hasVariant"
          cols="12"
        >
          <div v-if="(variantGroups || []).length > 0">
            <VRow
              v-for="(group, index) in (variantGroups || [])"
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
                        :id="`variant-group-${index}-name`"
                        v-model="group.name"
                        :name="`variantGroups[${index}][name]`"
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
                        :id="`variant-group-${index}-option-${optionIndex}-name`"
                        v-model="option.name"
                        :name="`variantGroups[${index}][options][${optionIndex}][name]`"
                        :rules="[requiredValidator]"
                        type="text"
                        variant="outlined"
                        @keyup="generateVariants"
                      >
                        <template
                          v-if="group.options.length > 1"
                          #append-inner
                        >
                          <VBtn
                            variant="text"
                            color="error"
                            icon="tabler-trash"
                            size="small"
                            @click="removeVariantGroupOption(index, optionIndex)"
                          />
                        </template>
                        <template
                          v-if="optionIndex === group.options.length - 1"
                          #append
                        >
                          <VBtn
                            variant="outlined"
                            color="primary"
                            icon="tabler-plus"
                            size="small"
                            rounded
                            @click="addBlankVariantGroupOption(index)"
                          />
                        </template>
                      </VTextField>
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
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
