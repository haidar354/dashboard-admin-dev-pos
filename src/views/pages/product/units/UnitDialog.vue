<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'

import { useUnitStore } from '@/stores/product/unitStore'

import type { UnitFormErrors } from '@/types/models/product/unit/unit'

const unitStore = useUnitStore()
const { dialog, selectedUnit, paginateData } = storeToRefs(unitStore)

const errorsForm = ref<UnitFormErrors>({})

const refVForm = ref<VForm>()

const onSubmit = async () => {
  refVForm.value?.validate()
    .then(async ({ valid: isValid }) => {
      if (isValid) {
        await unitStore.save().then(async () => {
          if (paginateData.value.data?.length === 0)
            await unitStore.fetchPaginate()
        })
      }
      else { showToast('Pastikan semua form wajib terisi dan sesuai', 'error') }
    })
}

onMounted(async () => {
})
</script>

<template>
  <VDialog
    v-model="dialog.isVisible"
    persistent
    :overlay="false"
    max-width="500px"
    transition="dialog-transition"
  >
    <DialogCloseBtn
      :disabled="dialog.isLoadingSubmit"
      @click="dialog.isVisible = !dialog.isVisible"
    />
    <VForm
      ref="refVForm"
      :readonly="dialog.mode === 'show'"
      @submit.prevent="onSubmit"
    >
      <VSkeletonLoader
        v-if="dialog.isLoadingFetchDetail"
        class="mx-auto w-100"
        elevation="2"
        type="article, table-row-divider@6, actions"
        boilerplate
      />
      <VCard
        v-else
        :title="dialog.title"
      >
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              class="pt-0"
            >
              <label for="">Kode <span class="text-error">*</span></label>
              <VTextField
                v-if="dialog.mode !== 'show'"
                v-model="dialog.form.code"
                :rules="[requiredValidator]"
                :error-messages="errorsForm?.code"
                maxlength="100"
                counter
              />
              <VTextField
                v-else
                v-model:value="dialog.form.code"
              />
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <label for="">Nama <span class="text-error">*</span></label>
              <VTextField
                v-if="dialog.mode !== 'show'"
                v-model="dialog.form.name"
                :rules="[requiredValidator]"
                :error-messages="errorsForm?.name"
                maxlength="100"
                counter
              />
              <VTextField
                v-else
                v-model:value="dialog.form.name"
              />
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <label for="">Metrik <span class="text-error">*</span></label>
              <VRadioGroup
                v-if="dialog.mode !== 'show'"
                v-model="dialog.form.metric"
                :rules="[requiredValidator]"
                :error-messages="errorsForm?.metric"
                inline
              >
                <VRadio
                  label="Volume"
                  value="volume"
                />
                <VRadio
                  label="Berat"
                  value="weight"
                />
                <VRadio
                  label="Unit"
                  value="unit"
                />
              </VRadioGroup>
              <VTextField
                v-else
                v-model:value="dialog.form.name"
              />
            </VCol>
          </VRow>
          <DataInformation
            v-if="dialog.mode === 'show'"
            :created-at="selectedUnit?.createdAt"
            :updated-at="selectedUnit?.updatedAt"
          />
        </VCardText>

        <VCardText class="d-flex justify-center gap-4">
          <VBtn
            type="button"
            color="secondary"
            :disabled="dialog.isLoadingSubmit"
            @click="unitStore.resetDialog()"
          >
            {{ dialog.mode === 'show' ? 'Tutup' : 'Batal' }}
          </VBtn>
          <VBtn
            v-if="dialog.mode !== 'show'"
            type="submit"
            color="primary"
            :loading="dialog.isLoadingSubmit"
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
