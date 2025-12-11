<script setup lang="ts">
import { useAccountStore } from '@/stores/accountStore'

defineProps<{
  readonly?: boolean
}>()

const accountStore = useAccountStore()
const { changePasswordForm, changePasswordFormErrors } = storeToRefs(accountStore)

const isPasswordVisible = ref(false)
const isPasswordConfirmationVisible = ref(false)

onMounted(async () => {
})
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <AppTextField
          v-model="changePasswordForm.oldPassword"
          label="Password Lama"
          :rules="[requiredValidator]"
          :type="isPasswordVisible ? 'text' : 'password'"
          :error-messages="changePasswordFormErrors.oldPassword"
          :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          validate-on="submit"
          placeholder="Masukkan password lama Anda"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
        />
      </VCol>

      <VCol cols="6">
        <AppTextField
          v-model="changePasswordForm.newPassword"
          label="Password Baru"
          :rules="[requiredValidator]"
          :type="isPasswordVisible ? 'text' : 'password'"
          :error-messages="changePasswordFormErrors.newPassword"
          :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          validate-on="submit"
          placeholder="Masukkan password baru minimal 8 karakter"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
        />
      </VCol>

      <VCol cols="6">
        <AppTextField
          v-model="changePasswordForm.newPasswordConfirmation"
          label="Konfirmasi Password Baru"
          :rules="[requiredValidator]"
          :type="isPasswordConfirmationVisible ? 'text' : 'password'"
          :error-messages="changePasswordFormErrors.newPasswordConfirmation"
          :append-inner-icon="isPasswordConfirmationVisible ? 'tabler-eye-off' : 'tabler-eye'"
          validate-on="submit"
          placeholder="Masukkan ulang password baru"
          @click:append-inner="isPasswordConfirmationVisible = !isPasswordConfirmationVisible"
        />
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.no-wrap-text {
  flex-shrink: 0;
  white-space: nowrap;
}
</style>
