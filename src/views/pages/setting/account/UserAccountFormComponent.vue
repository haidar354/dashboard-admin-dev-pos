<script setup lang="ts">
import { useAccountStore } from '@/stores/accountStore'

defineProps<{
  readonly?: boolean
}>()

const accountStore = useAccountStore()
const { form, formErrors } = storeToRefs(accountStore)

const photoEl = ref<HTMLInputElement | null>(null)

const avatar = computed(() => {
  if (form.value && form.value.avatar) {
    if (typeof form.value.avatar === 'string')
      return form.value.avatar
    else if (form.value.avatar instanceof File)
      return URL.createObjectURL(form.value.avatar)
  }

  return ''
})

const triggerPhoto = () => {
  if (photoEl.value)
    photoEl.value.click()
}

const onNewPhoto = (event: Event) => {
  form.value.avatar = handleFileUpload(event)
}

onMounted(async () => {
})
</script>

<template>
  <div>
    <VRow>
      <!-- Basic Information -->
      <VCol
        cols="12"
        class="pb-0"
      >
        <div class="text-h6">
          Informasi Dasar
        </div>
      </VCol>
      <VCol cols="12">
        <label>Avatar <span class="text-error">*</span></label>
        <div class="d-flex flex-wrap justify-start gap-3">
          <div>
            <VImg
              :src="avatar"
              width="80"
              :aspect-ratio="1"
              rounded="5"
              class="border-2"
              alt="alt"
              cover
              color="light-primary"
            />
          </div>
          <div class=" mt-3 text-left">
            <div>
              <input
                ref="photoEl"
                type="file"
                accept=".png, .jpg, .jpeg"
                class="d-none"
                @change="onNewPhoto"
              >
              <VBtn
                color="primary"
                variant="outlined"
                @click="triggerPhoto"
              >
                Pilih Avatar
              </VBtn>
            </div>
            <div class="mt-2">
              Upload avatar dengan format jpg/png maks. 2MB
            </div>
          </div>
        </div>
      </VCol>

      <VCol cols="12">
        <label>Nama Lengkap Anda <span class="text-error">*</span></label>
        <AppTextField
          v-model="form.name"
          :rules="[requiredValidator]"
          :error-messages="formErrors?.name"
          counter
          maxlength="100"
          prepend-inner-icon="tabler-building"
          :readonly="readonly"
          placeholder="Masukkan nama lengkap"
        />
      </VCol>

      <VCol cols="12">
        <label>Alamat Email <span class="text-error">*</span></label>
        <AppTextField
          v-model="form.email"
          :rules="[requiredValidator, emailValidator]"
          :error-messages="formErrors?.email"
          counter
          maxlength="100"
          prepend-inner-icon="tabler-building"
          :readonly="readonly"
          placeholder="Masukkan alamat email"
        />
      </VCol>

      <VCol cols="12">
        <label>No. Telepon</label>
        <AppTextField
          v-model="form.phone"
          :error-messages="formErrors?.phone"
          counter
          maxlength="255"
          prepend-inner-icon="tabler-phone"
          :readonly="readonly"
          rows="3"
          placeholder="Masukkan nomor telepon"
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
