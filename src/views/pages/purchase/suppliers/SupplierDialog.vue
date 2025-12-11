<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'

import { useSupplierStore } from '@/stores/purchase/supplierStore'

import type { SupplierFormErrors } from '@/types/models/purchase/supplier'

const supplierStore = useSupplierStore()
const { dialog, selectedSupplier } = storeToRefs(supplierStore)

const errorsForm = ref<SupplierFormErrors>({})

const refVForm = ref<VForm>()
const isLoadingSubmit = ref(false)

const onSubmit = async () => {
  refVForm.value?.validate()
    .then(async ({ valid: isValid }) => {
      if (isValid)
        await supplierStore.save()

      else showToast('Pastikan semua form wajib terisi dan sesuai', 'error')
    })
}
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
      :disabled="isLoadingSubmit"
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
            <VCol cols="12">
              <label for="">Nama Supplier <span class="text-error">*</span></label>
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
                :model-value="dialog.form.name"
              />
            </VCol>
            <VCol cols="12">
              <label for="">No. Telepon <span class="text-error">*</span></label>
              <VTextField
                v-if="dialog.mode !== 'show'"
                v-model="dialog.form.phone"
                :rules="[requiredValidator]"
                :error-messages="errorsForm?.phone"
                maxlength="100"
                counter
              />
              <VTextField
                v-else
                :model-value="dialog.form.phone"
              />
            </VCol>
            <VCol cols="12">
              <label for="">Alamat <span class="text-error">*</span></label>
              <VTextarea
                v-if="dialog.mode !== 'show'"
                v-model="dialog.form.address"
                :rules="[requiredValidator]"
                :error-messages="errorsForm?.address"
                maxlength="255"
                counter
              />
              <VTextarea
                v-else
                :model-value="dialog.form.address"
              />
            </VCol>
          </VRow>
          <DataInformation
            v-if="dialog.mode === 'show'"
            :created-at="selectedSupplier?.createdAt"
            :updated-at="selectedSupplier?.updatedAt"
          />
        </VCardText>

        <VCardText class="d-flex justify-center gap-4">
          <VBtn
            type="button"
            color="secondary"
            :disabled="dialog.isLoadingSubmit"
            @click="supplierStore.resetDialog()"
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
