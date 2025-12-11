<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useAccountStore } from '@/stores/accountStore'
import UserAccountFormComponent from '@/views/pages/setting/account/UserAccountFormComponent.vue'

definePage({
  meta: {
    name: 'Edit Profil Akun',
    navActiveLink: 'setting-profile-account',
    rules: [
      {
        action: 'manage',
        subject: 'Edit Profil Akun',
      },
      {
        action: 'manage',
        subject: 'Edit Semua Profil Akun',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const accountStore = useAccountStore()
const { isLoadingSubmit, isLoadingFetchData, userAccount } = storeToRefs(accountStore)

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToDetail = async () => {
  await router.push({
    name: 'setting-profile-account',
  })
}

const SubmitData = async () => {
  try {
    await accountStore.updateUserAccount()
    backToDetail().then(() => {
      showToast('Profil Akun berhasil diperbarui', 'success')
    })
  }
  catch (error) {
    console.error('Error updating business unit:', error)

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
  accountStore.fetchDetailAndSetForm()
})

// Clean up when leaving
onBeforeUnmount(() => {
  accountStore.resetForm()
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
          <span>Edit Profil Akun</span>
        </VCardTitle>
        <VCardSubtitle>
          Perbarui informasi profil akun Anda
        </VCardSubtitle>
      </VCardItem>
    </VCard>

    <!-- Loading State -->
    <VCard v-if="isLoadingFetchData">
      <VCardText>
        <VSkeletonLoader type="article,divider,article,divider,article" />
      </VCardText>
    </VCard>

    <!-- Form Card -->
    <VCard v-else-if="userAccount.userId">
      <VCardItem>
        <VCardTitle>
          <VIcon
            icon="tabler-user"
            class="me-2"
          />
          Informasi Akun Anda
        </VCardTitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <UserAccountFormComponent />

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
              <span v-else>Perbarui Profil Akun</span>
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
