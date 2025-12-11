<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useBusinessUnitStore } from '@/stores/businessUnitStore'
import BusinessUnitFormComponent from '@/views/pages/setting/business-units/BusinessUnitFormComponent.vue'

definePage({
  meta: {
    name: 'Edit Unit Bisnis',
    navActiveLink: 'setting-business-units',
    rules: [
      {
        action: 'manage',
        subject: 'Edit Unit Bisnis',
      },
      {
        action: 'manage',
        subject: 'Edit Semua Unit Bisnis',
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
const businessUnitStore = useBusinessUnitStore()
const { isLoadingSubmit, isLoadingFetchDetail, selectedBusinessUnit } = storeToRefs(businessUnitStore)
const businessUnitId = (route.params as { businessUnitId: string }).businessUnitId

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToDetail = async () => {
  await router.push({
    name: 'setting-business-units-business-unit-id',
    params: { businessUnitId },
  })
}

const SubmitData = async () => {
  try {
    await businessUnitStore.update()
    backToDetail().then(() => {
      showToast('Unit Bisnis berhasil diperbarui', 'success')
    })
  }
  catch (error) {
    console.error('Error updating unit bisnis:', error)

    // Error handling is already done in the store
  }
}

const onSubmit = async () => {
  if (!refVForm.value)
    return

  const { valid: isValid } = await refVForm.value.validate()

  if (isValid) {
    await SubmitData()
  }
  else {
    showToast('Pastikan semua form wajib terisi dan sesuai', 'error')

    // Scroll to first error
    const firstError = document.querySelector('.v-messages--active')
    if (firstError)
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

onMounted(() => {
  if (businessUnitId) {
    businessUnitStore.fetchDetailAndSetForm(businessUnitId).catch(() => {
      router.push({ name: 'setting-business-units' })
    })
  }
})

// Clean up when leaving
onBeforeUnmount(() => {
  isLoadingFetchDetail.value = true
  businessUnitStore.resetForm()
})
</script>

<template>
  <div>
    <!-- Header -->
    <VCard class="mb-6">
      <VCardItem>
        <VCardTitle class="d-flex align-center gap-3">
          <VBtn
            icon
            variant="text"
            @click="backToDetail"
          >
            <VIcon icon="tabler-arrow-left" />
          </VBtn>
          <span>Edit Unit Bisnis</span>
        </VCardTitle>
        <VCardSubtitle>
          Perbarui informasi unit bisnis yang sudah ada
        </VCardSubtitle>
      </VCardItem>
    </VCard>

    <!-- Loading State -->
    <VCard v-if="isLoadingFetchDetail">
      <VCardText>
        <VSkeletonLoader type="article,divider,article,divider,article" />
      </VCardText>
    </VCard>

    <!-- Form Card -->
    <VCard v-else-if="selectedBusinessUnit.businessUnitId">
      <VCardItem>
        <VCardTitle>
          <VIcon
            icon="tabler-building-skyscraper"
            class="me-2"
          />
          Informasi Unit Bisnis
        </VCardTitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <BusinessUnitFormComponent />

          <!-- Action Buttons -->
          <div class="d-flex justify-end mt-6 gap-3">
            <VBtn
              color="secondary"
              variant="outlined"
              type="button"
              prepend-icon="tabler-x"
              @click="backToDetail"
            >
              Batal
            </VBtn>
            <VBtn
              :loading="isLoadingSubmit"
              :disabled="isLoadingSubmit"
              color="primary"
              variant="flat"
              type="submit"
              prepend-icon="tabler-device-floppy"
            >
              <span v-if="isLoadingSubmit">Memperbarui...</span>
              <span v-else>Perbarui Unit Bisnis</span>
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
// Custom styles for better form presentation
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 10%);
}
</style>
