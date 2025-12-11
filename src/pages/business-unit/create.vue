<!-- eslint-disable import/no-named-default -->
<!-- ❗Errors in the form are set on line 60 -->
<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'

import { useAuthStore } from '@/stores/authStore'
import { useBusinessUnitStore } from '@/stores/businessUnitStore'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import {
  default as authV2LoginIllustrationBorderedDark,
  default as authV2LoginIllustrationBorderedLight,
  default as authV2LoginIllustrationDark,
  default as authV2LoginIllustrationLight,
} from '@images/illustrations/outlet.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePage({
  meta: {
    layout: 'blank',
  },
})

const businessUnitStore = useBusinessUnitStore()
const authStore = useAuthStore()

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
})

const refVForm = ref<VForm>()

const { form } = storeToRefs(businessUnitStore)

const { userData } = storeToRefs(authStore)

const isLoading = ref(false)

const router = useRouter()

const updateOrCreate = async () => {
  await businessUnitStore.create().then(() => {
    userData.value.businessUnitId = businessUnitStore.selectedBusinessUnit?.businessUnitId
    router.push({
      name: 'setting-business-units-business-unit-id',
      params: { businessUnitId: businessUnitStore.selectedBusinessUnit?.businessUnitId },
    }).then(() => {
      showToast(`Selamat datang pemilik ${businessUnitStore?.selectedBusinessUnit?.name}`, 'success')
    })
  })
}

const onSubmit = async () => {
  refVForm.value?.validate()
    .then(async ({ valid: isValid }) => {
      if (isValid) {
        isLoading.value = true
        await updateOrCreate()
          .finally(() => {
            isLoading.value = false
          })
      }
    })
}

const photoEl = ref<HTMLInputElement | null>(null)

const logo = computed(() => {
  if (form.value && form.value.logo) {
    if (typeof form.value.logo === 'string')
      return form.value.logo
    else if (form.value.logo instanceof File)
      return URL.createObjectURL(form.value.logo)
  }

  return ''
})

const triggerPhoto = () => {
  if (photoEl.value)
    photoEl.value.click()
}

const onNewPhoto = (event: Event) => {
  form.value.logo = handleFileUpload(event)
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      lg="8"
      class="d-none d-lg-flex"
    >
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="900"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          :src="authThemeMask"
          class="auth-footer-mask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        :max-width="500"
        class="mt-12 mt-sm-0"
      >
        <VCardText>
          <h4 class="text-h4 mb-1 text-center">
            Lengkapi Data Unit Usaha
          </h4>
          <p class="mb-0">
            Silahkan lengkapi data unit usaha Anda untuk melaanjutkan
          </p>
        </VCardText>
        <VDivider />
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <div class="d-flex flex-wrap justify-center">
                  <div>
                    <VImg
                      :src="logo"
                      width="80"
                      :aspect-ratio="1"
                      rounded="5"
                      class="border-2"
                      alt="alt"
                      cover
                      color="light-primary"
                    />
                  </div>
                  <div class=" mt-3 text-center">
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
                        Pilih Logo
                      </VBtn>
                    </div>
                    <div class="mt-2">
                      Upload logo unit usaha dengan format jpg/png maks. 2MB
                    </div>
                  </div>
                </div>
              </VCol>
              <VCol cols="12">
                <label for="name">
                  Nama Unit Usaha <span class="text-error">*</span>
                </label>
                <AppTextField
                  v-model="form.name"
                  placeholder="Nama Unit Usaha"
                  type="text"
                  autofocus
                  :rules="[requiredValidator]"
                  :error-messages="errors.email"
                  validate-on="submit"
                />
              </VCol>

              <VCol cols="12">
                <AppTextarea
                  v-model="form.address"
                  label="Alamat"
                  placeholder="Alamat"
                  persistent-placeholder
                  type="text"
                  autofocus
                  :error-messages="errors.email"
                  validate-on="submit"
                  rows="2"
                />
              </VCol>

              <VCol cols="12">
                <AppTextarea
                  v-model="form.description"
                  label="Deskripsi"
                  placeholder="Deskripsi"
                  persistent-placeholder
                  type="text"
                  autofocus
                  :error-messages="errors.email"
                  validate-on="submit"
                />
              </VCol>

              <VCol
                cols="12"
                class="text-center"
              >
                <VBtn
                  block
                  type="submit"
                  :loading="isLoading"
                >
                  Simpan
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
