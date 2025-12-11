<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'

import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'

import { useOutletStore } from '@/stores/outletStore'
import type { ItemCategoryFormErrors } from '@/types/models/product/item-category'

const itemCategoryStore = useItemCategoryStore()
const { dialog, selectedItemCategory, paginateData } = storeToRefs(itemCategoryStore)

const outletStore = useOutletStore()
const { data: outlets, isLoadingFetchData: isLoadingFetchDataOutlet } = storeToRefs(outletStore)

const errorsForm = ref<ItemCategoryFormErrors>({})

const refVForm = ref<VForm>()

const onSubmit = async () => {
  refVForm.value?.validate()
    .then(async ({ valid: isValid }) => {
      if (isValid) {
        await itemCategoryStore.save().then(async () => {
          if (paginateData.value.data?.length === 0)
            await itemCategoryStore.fetchPaginate()
        })

        if (paginateData.value.data?.length === 0)
          await itemCategoryStore.fetchPaginate()
      }
      else { showToast('Pastikan semua form wajib terisi dan sesuai', 'error') }
    })
}

onMounted(async () => {
  await outletStore.fetchAllData()
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
            <VCol cols="12">
              <label for="">Toko <span class="text-error">*</span></label>
              <VAutocomplete
                v-model="dialog.form.outletIds"
                :items="outlets"
                multiple
                item-value="outletId"
                item-title="name"
                :rules="[requiredValidator]"
                :error-messages="errorsForm?.outletIds"
                :loading="isLoadingFetchDataOutlet"
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
              <label for="">Deskripsi</label>
              <VTextarea
                v-if="dialog.mode !== 'show'"
                v-model="dialog.form.description"
                :error-messages="errorsForm?.description"
                maxlength="100"
                counter
              />
              <VTextarea
                v-else
                v-model="dialog.form.description"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
              class="pt-0"
            >
              <label for="">Status <span class="text-error">*</span></label>
              <VSwitch
                v-if="dialog.mode !== 'show'"
                v-model="dialog.form.isActive"
                :error-messages="errorsForm?.isActive"
                :true-value="true"
                :false-value="false"
                true-icon="tabler-check"
                false-icon="tabler-x"
              />
              <div v-else>
                <VChip :color="dialog.form.isActive ? 'success' : 'error'">
                  {{ dialog.form.isActive ? 'Aktif' : 'Tidak Aktif' }}
                </VChip>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="6"
              class="pt-0"
            >
              <label for="">Tampil di POS <span class="text-error">*</span></label>
              <VSwitch
                v-if="dialog.mode !== 'show'"
                v-model="dialog.form.showInPos"
                :error-messages="errorsForm?.showInPos"
                :true-value="true"
                :false-value="false"
                hint="Tampilkan kategori pada aplikasi kasir"
                persistent-hint
                true-icon="tabler-check"
                false-icon="tabler-x"
              />
              <div v-else>
                <VChip :color="dialog.form.showInPos ? 'success' : 'error'">
                  {{ dialog.form.showInPos ? 'Ya' : 'Tidak' }}
                </VChip>
              </div>
            </VCol>
          </VRow>
          <DataInformation
            v-if="dialog.mode === 'show'"
            :created-at="selectedItemCategory?.createdAt"
            :updated-at="selectedItemCategory?.updatedAt"
          />
        </VCardText>

        <VCardText class="d-flex justify-center gap-4">
          <VBtn
            type="button"
            color="secondary"
            :disabled="dialog.isLoadingSubmit"
            @click="itemCategoryStore.resetDialog()"
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
