<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useCompanyStore } from '@/stores/companyStore'
import CompanyFormComponent from '@/views/pages/setting/company/CompanyFormComponent.vue'

definePage({
  meta: {
    name: 'Edit Profil Perusahaan',
    navActiveLink: 'setting-profile-company',
    rules: [
      {
        action: 'manage',
        subject: 'Edit Profil Perusahaan',
      },
      {
        action: 'manage',
        subject: 'Edit Semua Profil Perusahaan',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const companyStore = useCompanyStore()
const { isLoadingSubmit, isLoadingFetchDetail, selectedCompany } = storeToRefs(companyStore)

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToDetail = async () => {
  await router.push({
    name: 'setting-profile-company',
  })
}

const SubmitData = async () => {
  try {
    await companyStore.update()
    backToDetail().then(() => {
      showToast('Profil Perusahaan berhasil diperbarui', 'success')
    })
  }
  catch (error) {
    console.error('Error updating company:', error)

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

onMounted(async () => {
  companyStore.resetForm()
  await companyStore.fetchDetailAndSetForm()
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
          <span>Edit Profil Perusahaan</span>
        </VCardTitle>
        <VCardSubtitle>
          Perbarui informasi profil perusahaan Anda
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
    <VCard v-else-if="selectedCompany.companyId && !isLoadingFetchDetail">
      <VCardItem>
        <VCardTitle>
          <VIcon
            icon="tabler-building-store"
            class="me-2"
          />
          Informasi Profil Perusahaan
        </VCardTitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <CompanyFormComponent />

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
              <span v-else>Perbarui Profil Perusahaan</span>
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
