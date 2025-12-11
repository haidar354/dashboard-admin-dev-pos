<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'

import { useModifierStore } from '@/stores/product/modifierStore'

const modifierStore = useModifierStore()
const { isCreateDialogVisible, createForm, createFormErrors, isLoadingCreate } = storeToRefs(modifierStore)

const refVForm = ref<VForm>()

const onSubmit = async () => {
  refVForm.value?.validate()
    .then(async ({ valid: isValid }) => {
      if (isValid) {
        await modifierStore.create().then(() => {
          modifierStore.resetForm()
          modifierStore.fetchPaginate({
            include: ['options'],
          })
        })
      }

      else { showToast('Pastikan semua form wajib terisi dan sesuai', 'error') }
    })
}
</script>

<template>
  <VDialog
    v-model="isCreateDialogVisible"
    persistent
    :overlay="false"
    max-width="500px"
    transition="dialog-bottom-transition"
    fullscreen
  >
    <VCard class="h-100">
      <VToolbar>
        <VToolbarTitle>Tambah Produk Ekstra</VToolbarTitle>

        <VToolbarItems>
          <VBtn
            text="Batal"
            prepend-icon="tabler-x"
            variant="flat"
            @click="isCreateDialogVisible = false"
          />
        </VToolbarItems>
      </VToolbar>
      <VContainer>
        <VCard>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  class="pt-0"
                >
                  <label for="">Nama Produk Ekstra <span class="text-error">*</span></label>
                  <VTextField
                    v-model="createForm.name"
                    :rules="[requiredValidator]"
                    :error-messages="createFormErrors?.name"
                    maxlength="100"
                    counter
                  />
                </VCol>
                <VCol
                  cols="12"
                  class="pt-0"
                >
                  <label for="">Apakah wajib dipilih? <span class="text-error">*</span></label>
                  <VRadioGroup
                    v-model="createForm.minSelect"
                    :error-messages="createFormErrors?.minSelect"
                    inline
                  >
                    <VRadio
                      label="Ya"
                      value="1"
                    />
                    <VRadio
                      label="Tidak"
                      value="0"
                    />
                  </VRadioGroup>
                </VCol>
                <VCol
                  cols="12"
                  class="pt-0"
                >
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
              </VRow>
            </VCardText>

            <VCardText class="d-flex justify-center gap-4">
              <VBtn
                type="button"
                color="secondary"
                :disabled="isLoadingCreate"
                @click="modifierStore.closeDialog()"
              >
                Batal
              </VBtn>
              <VBtn
                type="submit"
                color="primary"
                :loading="isLoadingCreate"
              >
                Simpan
              </VBtn>
            </VCardText>
          </VForm>
        </VCard>
      </VContainer>
      <VBottomNavigation>
        <VBtn value="recent">
          <VIcon>mdi-history</VIcon>

          <span>Recent</span>
        </VBtn>

        <VBtn value="favorites">
          <VIcon>mdi-heart</VIcon>

          <span>Favorites</span>
        </VBtn>

        <VBtn value="nearby">
          <VIcon>tabler-check</VIcon>

          <span>Nearby</span>
        </VBtn>
      </VBottomNavigation>
    </VCard>
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
