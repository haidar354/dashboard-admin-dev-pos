<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'

import { useItemUpdate } from '@/composables/product/useItemUpdate'
import { useItemStore } from '@/stores/product/itemStore'
import UpdateItemForm from '@/views/pages/product/items/UpdateItemForm.vue'

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
const route = useRoute()
const itemStore = useItemStore()
const { isLoadingUpdate, isLoadingFetchDetail } = storeToRefs(itemStore)
const itemId = (route.params as { itemId: string }).itemId

const refVForm = ref<VForm>()

const backToIndex = () => {
  router.push({
    name: 'product-items',
  })
}

const SubmitData = async () => {
  await itemStore.update().then(() => {
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

const {
  initializeForm,
} = useItemUpdate()

onMounted(async () => {
  if (!itemId)
    return
  await initializeForm(itemId)
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle class="text-h5 font-weight-bold">
        Edit Produk
      </VCardTitle>
      <VCardSubtitle class="text-body-1">
        Edit data produk yang sudah ada
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
    <UpdateItemForm />

    <!-- Action Buttons -->

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
