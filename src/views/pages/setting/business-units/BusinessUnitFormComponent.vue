<script setup lang="ts">
import { useAdministrativeStore } from '@/stores/administrativeStore'
import { useBusinessUnitStore } from '@/stores/businessUnitStore'

defineProps<{ readonly?: boolean }>()

const businessUnitStore = useBusinessUnitStore()
const { form, formErrors } = storeToRefs(businessUnitStore)

const administrativeStore = useAdministrativeStore()
const { provinces, isLoadingFetchProvinces, isLoadingFetchCities } = storeToRefs(administrativeStore)
const { fetchProvince, fetchCity } = administrativeStore

// ✅ Gunakan localCities agar tidak share state antar form
const localCities = ref<{ code: string; name: string }[]>([])

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
const onNewPhoto = (e: Event) => (form.value.logo = handleFileUpload(e))

// 🧠 Handle perubahan provinsi
async function onProvinceChange(code?: string) {
  form.value.cityCode = undefined
  localCities.value = []

  if (!code)
    return

  const result = await fetchCity(code)

  localCities.value = Array.isArray(result) ? result : administrativeStore.cities

  // auto-pilih pertama (opsional)
  if (!form.value.cityCode && localCities.value.length)
    form.value.cityCode = localCities.value[0].code
}

// 🧩 Lifecycle
onMounted(async () => {
  // --- 1️⃣ Pastikan provinsi ter-load
  if (!provinces.value.length)
    await fetchProvince()

  // --- 2️⃣ Kalau edit form, load kota
  if (form.value.provinceCode) {
    const result = await fetchCity(form.value.provinceCode)

    localCities.value = Array.isArray(result) ? result : administrativeStore.cities

    // --- 3️⃣ Validasi cityCode
    if (form.value.cityCode && !localCities.value.some(c => c.code === form.value.cityCode))
      form.value.cityCode = undefined
  }
})
</script>

<template>
  <div>
    <VRow>
      <!-- Informasi Dasar -->
      <VCol
        cols="12"
        class="pb-0"
      >
        <div class="text-h6">
          Informasi Dasar
        </div>
      </VCol>

      <!-- Logo -->
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
              alt="Logo"
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
              Upload logo unit usaha dengan format jpg/png maks. 2MB
            </div>
          </div>
        </div>
      </VCol>

      <!-- Nama Unit Bisnis -->
      <VCol cols="12">
        <label>Nama Unit Bisnis <span class="text-error">*</span></label>
        <AppTextField
          v-model="form.name"
          :rules="[requiredValidator]"
          :error-messages="formErrors?.name"
          counter
          maxlength="100"
          prepend-inner-icon="tabler-building"
          :readonly="readonly"
          placeholder="Masukkan nama unit bisnis"
        />
      </VCol>

      <!-- Provinsi -->
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
          @update:model-value="onProvinceChange"
        />
      </VCol>

      <!-- Kota -->
      <VCol
        cols="12"
        md="6"
      >
        <label>Kota</label>
        <AppAutocomplete
          v-model="form.cityCode"
          :items="localCities"
          item-title="name"
          item-value="code"
          :error-messages="formErrors?.cityCode"
          prepend-inner-icon="tabler-building-community"
          :readonly="readonly"
          placeholder="Pilih kota"
          :loading="isLoadingFetchCities"
          :disabled="!form.provinceCode"
        />
      </VCol>

      <!-- Informasi Tambahan -->
      <VCol
        cols="12"
        class="pb-0"
      >
        <div class="text-h6">
          Informasi Tambahan
        </div>
      </VCol>

      <VCol cols="12">
        <label>Deskripsi</label>
        <AppTextarea
          v-model="form.description"
          :error-messages="formErrors?.description"
          prepend-inner-icon="tabler-file-text"
          :readonly="readonly"
          rows="3"
          counter
          maxlength="500"
          placeholder="Deskripsi singkat tentang unit bisnis (opsional)"
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
