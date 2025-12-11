<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useAccountStore } from '@/stores/accountStore'
import UserPasswordFormComponent from '@/views/pages/setting/account/UserPasswordFormComponent.vue'

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
const { isLoadingUpdatePassword } = storeToRefs(accountStore)

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToDetail = async () => {
  await router.push({
    name: 'setting-profile-account',
  })
}

const SubmitData = async () => {
  try {
    await accountStore.updateUserPassword()
    backToDetail().then(() => {
      showToast('Password Akun berhasil diperbarui', 'success')
    })
  }
  catch (error) {
    console.error('Error updating password:', error)

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
  accountStore.resetChangePasswordForm()
})

// Clean up when leaving
onBeforeUnmount(() => {
  accountStore.resetChangePasswordForm()
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
          <span>Ubah Password</span>
        </VCardTitle>
        <VCardSubtitle>
          Perbarui password akun Anda
        </VCardSubtitle>
      </VCardItem>
    </VCard>

    <!-- Form Card -->
    <VCard>
      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <UserPasswordFormComponent />

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
              :loading="isLoadingUpdatePassword"
              :disabled="isLoadingUpdatePassword"
              color="primary"
              variant="flat"
              type="submit"
              prepend-icon="tabler-device-floppy"
            >
              <span v-if="isLoadingUpdatePassword">Memperbarui...</span>
              <span v-else>Perbarui Password</span>
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
