<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'

import { useItemCreate } from '../../../composables/product/useItemCreate'
import { useItemStore } from '@/stores/product/itemStore'
import CreateItemForm from '@/views/pages/product/items/CreateItemForm.vue'

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
const itemStore = useItemStore()
const { isLoadingCreate } = storeToRefs(itemStore)

const refVForm = ref<VForm>()

const backToIndex = () => {
  router.push({
    name: 'product-items',
  })
}

const SubmitData = async () => {
  await itemStore.create().then(() => {
    backToIndex()
  })
}

const onSubmit = async () => {
  refVForm.value?.validate().then(async ({ valid: isValid, errors }) => {
    console.log(errors)
    if (isValid)
      await SubmitData()
    else showToast('Pastikan semua form wajib terisi dan sesuai', 'error')
  })
}

const { initializeForm } = useItemCreate()

onMounted(() => {
  initializeForm()
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle class="text-h5 font-weight-bold">
        Tambah Produk
      </VCardTitle>
      <VCardSubtitle class="text-body-1">
        Tambah data produk baru
      </VCardSubtitle>
    </VCardItem>
  </VCard>
  <VForm
    ref="refVForm"
    class="mt-5"
    @submit.prevent="onSubmit"
  >
    <CreateItemForm />

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
