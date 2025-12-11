<script setup lang="ts">
import { useOutletStore } from '@/stores/outletStore'

defineProps<{
  readonly?: boolean
}>()

const outletStore = useOutletStore()
const { form, formErrors, selectedOutlet } = storeToRefs(outletStore)

// Get current location
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        form.value.latitude = position.coords.latitude.toString()
        form.value.longitude = position.coords.longitude.toString()
        showToast('Lokasi berhasil didapatkan', 'success')
      },
      error => {
        console.error('Error getting location:', error)
        showToast('Gagal mendapatkan lokasi', 'error')
      },
    )
  }
  else {
    showToast('Geolocation tidak didukung oleh browser', 'error')
  }
}

// Custom validators
const phoneValidator = (value: string) => {
  if (!value)
    return true // Optional field
  const phoneRegex = /^(?:\+62|62|0)8[1-9]\d{6,10}$/

  return phoneRegex.test(value) || 'Format nomor telepon tidak valid'
}

const coordinateValidator = (value: string, type: 'latitude' | 'longitude') => {
  if (!value)
    return true // Optional field
  const num = Number.parseFloat(value)
  if (Number.isNaN(num))
    return 'Koordinat harus berupa angka'

  if (type === 'latitude')
    return (num >= -90 && num <= 90) || 'Latitude harus antara -90 dan 90'
  else
    return (num >= -180 && num <= 180) || 'Longitude harus antara -180 dan 180'
}

const timeValidator = (value: string) => {
  if (!value)
    return true // Optional field

  const timeRegex = /^(?:[01]?\d|2[0-3]):[0-5]\d$/

  return timeRegex.test(value) || 'Format waktu tidak valid (HH:MM)'
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

onMounted(async () => {
})
</script>

<template>
  <div>
    <VRow>
      <!-- Basic Information -->
      <VCol cols="12">
        <div class="text-h6 mb-4">
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
                Pilih Logo
              </VBtn>
            </div>
            <div class="mt-2">
              Upload logo outlet dengan format jpg/png maks. 2MB
            </div>
          </div>
        </div>
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <label>Nama Outlet <span class="text-error">*</span></label>
        <AppTextField
          v-model="form.name"
          :rules="[requiredValidator]"
          :error-messages="formErrors?.name"
          counter
          maxlength="100"
          prepend-inner-icon="tabler-building"
          :readonly="readonly"
          placeholder="Masukkan nama outlet"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <label>Tipe Outlet <span class="text-error">*</span></label>
        <AppSelect
          v-model="form.isCentral"
          :items="[
            { title: 'Outlet Pusat', value: true },
            { title: 'Outlet Cabang', value: false },
          ]"
          :rules="[requiredValidator]"
          :error-messages="formErrors?.isCentral"
          prepend-inner-icon="tabler-building-store"
          :readonly="readonly"
          placeholder="Pilih tipe outlet"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>No. Telepon</label>
        <AppTextField
          v-model="form.phone"
          :rules="[phoneValidator]"
          :error-messages="formErrors?.phone"
          prepend-inner-icon="tabler-phone"
          :readonly="readonly"
          placeholder="Contoh: 08123456789"
          type="tel"
        />
      </VCol>

      <!-- Location Information -->
      <VCol cols="12">
        <div class="text-h6 mt-4">
          Informasi Lokasi
        </div>
      </VCol>

      <VCol
        cols="12"
        md="5"
      >
        <label>Latitude</label>
        <AppTextField
          v-model="form.latitude"
          :rules="[(value: string) => coordinateValidator(value, 'latitude')]"
          :error-messages="formErrors?.latitude"
          prepend-inner-icon="tabler-map-pin"
          :readonly="readonly"
          placeholder="Contoh: -6.200000"
          type="number"
          step="any"
        />
      </VCol>

      <VCol
        cols="12"
        md="5"
      >
        <label>Longitude</label>
        <AppTextField
          v-model="form.longitude"
          :rules="[(value: string) => coordinateValidator(value, 'longitude')]"
          :error-messages="formErrors?.longitude"
          prepend-inner-icon="tabler-map-pin"
          :readonly="readonly"
          placeholder="Contoh: 106.816666"
          type="number"
          step="any"
        />
      </VCol>

      <VCol
        cols="12"
        md="2"
        class="d-flex align-end"
      >
        <VBtn
          v-if="!readonly"
          color="primary"
          variant="outlined"
          size="large"
          class="w-100"
          @click="getCurrentLocation"
        >
          <VIcon icon="tabler-current-location" />
        </VBtn>
      </VCol>

      <VCol cols="12">
        <VAlert
          type="info"
          variant="tonal"
          class="mb-0"
          icon="tabler-info-circle"
        >
          <span class="text-body-2">
            Klik tombol lokasi untuk menggunakan lokasi saat ini, atau masukkan koordinat secara manual.
            Koordinat akan membantu dalam pencarian dan navigasi ke outlet.
          </span>
        </VAlert>
      </VCol>

      <!-- Administrative Location Selector -->
      <VCol cols="12">
        <AdministrativeLocationSelector
          v-model:province-code="form.provinceCode"
          v-model:city-code="form.cityCode"
          v-model:district-code="form.districtCode"
          v-model:village-code="form.villageCode"
          :initial-province-code="selectedOutlet?.village?.district?.city?.province?.code"
          :initial-city-code="selectedOutlet?.village?.district?.city?.code"
          :initial-district-code="selectedOutlet?.village?.district?.code"
          :error-messages="formErrors?.villageCode"
          label="Lokasi Administratif"
        />
      </VCol>

      <VCol cols="12">
        <label>Alamat Lengkap<span class="text-error">*</span></label>
        <AppTextarea
          v-model="form.address"
          :rules="[requiredValidator]"
          :error-messages="formErrors?.address"
          counter
          maxlength="255"
          prepend-inner-icon="tabler-map-pin"
          :readonly="readonly"
          rows="3"
          placeholder="Masukkan alamat lengkap outlet"
        />
      </VCol>

      <!-- Operating Hours -->
      <!--
        <VCol cols="12">
        <div class="text-h6 mt-4">
        Jam Operasional
        </div>
        </VCol>

        <VCol
        cols="12"
        md="6"
        >
        <label>Jam Buka</label>
        <AppTextField
        v-model="form.openingTime"
        :rules="[timeValidator]"
        :error-messages="formErrors?.openingTime"
        prepend-inner-icon="tabler-clock"
        :readonly="readonly"
        placeholder="Contoh: 08:00"
        type="time"
        />
        </VCol>

        <VCol
        cols="12"
        md="6"
        >
        <label>Jam Tutup</label>
        <AppTextField
        v-model="form.closingTime"
        :rules="[timeValidator]"
        :error-messages="formErrors?.closingTime"
        prepend-inner-icon="tabler-clock"
        :readonly="readonly"
        placeholder="Contoh: 22:00"
        type="time"
        />
        </VCol>
      -->

      <!-- Additional Information -->
      <!--
        <VCol cols="12">
        <div class="text-h6 mb-4 mt-4">
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
        placeholder="Deskripsi singkat tentang outlet (opsional)"
        />
        </VCol>
      -->
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.no-wrap-text {
  flex-shrink: 0;
  white-space: nowrap;
}
</style>
