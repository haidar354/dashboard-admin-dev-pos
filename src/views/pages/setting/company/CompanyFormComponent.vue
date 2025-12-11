<script setup lang="ts">
import { useAdministrativeStore } from '@/stores/administrativeStore'
import { useCompanyStore } from '@/stores/companyStore'

defineProps<{ readonly?: boolean }>()

const companyStore = useCompanyStore()
const { form, formErrors } = storeToRefs(companyStore)

const administrativeStore = useAdministrativeStore()
const { provinces, cities, isLoadingFetchProvinces, isLoadingFetchCities } = storeToRefs(administrativeStore)
const { fetchProvince, fetchCity } = administrativeStore

const photoEl = ref<HTMLInputElement | null>(null)

const logo = computed(() => {
  const logoValue = form.value?.logo
  if (typeof logoValue === 'string')
    return logoValue
  if (logoValue instanceof File)
    return URL.createObjectURL(logoValue)

  return ''
})

const triggerPhoto = () => photoEl.value?.click()

const onNewPhoto = (event: Event) => {
  form.value.logo = handleFileUpload(event)
}

/**
 * WATCH provinceCode → fetch kota SEKALI (initial + setiap ganti provinsi)
 * - Tidak fetch dari onMounted lagi
 * - Tidak ngereset cityCode kalau masih valid (edit mode)
 */
watch(
  () => form.value.provinceCode,
  async (newCode, oldCode) => {
    // Kalau kosong → bersihkan kota
    if (!newCode) {
      cities.value = []
      form.value.cityCode = undefined

      return
    }

    // Fetch kota untuk provinsi baru
    await fetchCity(newCode)

    // Kalau sudah ada cityCode dan masih valid → jangan diapa-apain
    if (form.value.cityCode && cities.value.some(c => c.code === form.value.cityCode))
      return

    // Kalau memang ganti provinsi (bukan first mount) → reset cityCode
    if (oldCode && newCode !== oldCode)
      form.value.cityCode = undefined

    // Kalau cityCode masih kosong dan ada data kota → auto pilih pertama (opsional)
    if (!form.value.cityCode && cities.value.length > 0)
      form.value.cityCode = cities.value[0].code
  },
  { immediate: true }, // initial load juga ikut
)

// === Lifecycle ===
onMounted(async () => {
  // Provinsi cukup di-load sekali
  if (!provinces.value.length)
    await fetchProvince()

  // ❌ JANGAN fetchCity di sini lagi, cukup dari watcher di atas
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
        <label>Logo</label>
        <div class="d-flex flex-wrap justify-start gap-3">
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
          <div class="mt-3 text-left">
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
              Upload logo perusahaan dengan format jpg/png maks. 2MB
            </div>
          </div>
        </div>
      </VCol>

      <VCol cols="12">
        <label>Nama Perusahaan <span class="text-error">*</span></label>
        <AppTextField
          v-model="form.name"
          :rules="[requiredValidator]"
          :error-messages="formErrors?.name"
          counter
          maxlength="100"
          prepend-inner-icon="tabler-building"
          :readonly="readonly"
          placeholder="Masukkan nama perusahaan"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>Provinsi</label>
        <AppAutocomplete
          v-model="form.provinceCode"
          :items="provinces"
          item-title="name"
          item-value="code"
          :error-messages="formErrors?.provinceCode"
          prepend-inner-icon="tabler-map-pin"
          :readonly="readonly"
          placeholder="Pilih provinsi"
          :loading="isLoadingFetchProvinces"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>Kota</label>
        <AppAutocomplete
          v-model="form.cityCode"
          :items="cities"
          item-title="name"
          item-value="code"
          :error-messages="formErrors?.cityCode"
          prepend-inner-icon="tabler-map-pin"
          :readonly="readonly"
          placeholder="Pilih kota"
          :loading="isLoadingFetchCities"
          :disabled="!form.provinceCode"
        />
      </VCol>
    </VRow>
  </div>
</template>

<style scoped lang="scss">
.no-wrap-text {
  flex-shrink: 0;
  white-space: nowrap;
}
</style>
