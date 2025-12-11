<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CreateCustomerRequest, Customer } from '@/types/models/sales/customer'
import { CustomerType, Gender, PaymentTerms } from '@/types/models/sales/customer'

import AdministrativeLocationSelector from '@/components/AdministrativeLocationSelector.vue'
import type { Village } from '@/types/models/administrative'

const props = defineProps<{
  initialData?: Customer
  isLoading?: boolean
  isEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: CreateCustomerRequest): void
  (e: 'cancel'): void
}>()

const formData = ref<CreateCustomerRequest>({
  name: '',
  email: '',
  phone: '',
  address: '',
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  villageCode: '',
  postalCode: '',
  taxId: '',
  gender: undefined,
  birthday: '',
  isMember: false,
  customerType: CustomerType.RETAIL,
  paymentTerms: PaymentTerms.COD,
  creditLimit: 0,
})

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

// Initialize form data from props
watch(() => props.initialData, val => {
  if (val) {
    formData.value = {
      name: val.name,
      email: val.email || '',
      phone: val.phone || '',
      address: val.address || '',
      provinceCode: val.provinceCode || '',
      cityCode: val.cityCode || '',
      districtCode: val.districtCode || '',
      villageCode: val.villageCode || '',
      postalCode: val.postalCode || '',
      taxId: val.taxId || '',
      gender: val.gender as 'male' | 'female' | undefined,
      birthday: val.birthday || '',
      isMember: val.isMember,
      customerType: val.customerType,
      paymentTerms: val.paymentTerms,
      creditLimit: val.creditLimit ? val.creditLimit / 100 : 0, // Convert cents to units
    }

    if (val.photoUrl)
      previewUrl.value = val.photoUrl
  }
}, { immediate: true })

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn('Ukuran file maksimal 5MB')

      return
    }

    formData.value.photo = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onSubmit = () => {
  // Prepare payload
  const payload: CreateCustomerRequest = {
    ...formData.value,
    creditLimit: (formData.value.creditLimit || 0) * 100, // Convert units to cents
  }

  emit('submit', payload)
}

const onVillageSelect = (village: Village) => {
  if (village && village.meta && village.meta?.pos && village.meta?.pos !== 'NULL')
    formData.value.postalCode = village.meta.pos
}

const customerTypeOptions = [
  { title: 'Retail', value: CustomerType.RETAIL },
  { title: 'Reseller', value: CustomerType.RESELLER },
  { title: 'Grosir (Wholesale)', value: CustomerType.WHOLESALE },
  { title: 'VIP', value: CustomerType.VIP },
  { title: 'Corporate', value: CustomerType.CORPORATE },
]

const paymentTermOptions = [
  { title: 'Cash on Delivery (COD)', value: PaymentTerms.COD },
  { title: 'Net 7 Hari', value: PaymentTerms.NET_7 },
  { title: 'Net 14 Hari', value: PaymentTerms.NET_14 },
  { title: 'Net 30 Hari', value: PaymentTerms.NET_30 },
  { title: 'Net 60 Hari', value: PaymentTerms.NET_60 },
]

const genderOptions = [
  { title: 'Laki-laki', value: Gender.MALE },
  { title: 'Perempuan', value: Gender.FEMALE },
]
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <input
      ref="fileInput"
      type="file"
      accept="image/png, image/jpeg, image/jpg"
      class="d-none"
      @change="onFileChange"
    >

    <VRow>
      <!-- Informasi Dasar -->
      <VCol cols="12">
        <h6 class="text-h6 font-weight-medium mb-4">
          Informasi Dasar
        </h6>
        <VCard
          border
          flat
        >
          <VCardText>
            <VRow>
              <!-- Avatar Section -->
              <VCol
                cols="12"
                md="2"
                class="d-flex flex-column align-center justify-center"
              >
                <VAvatar
                  size="100"
                  color="primary"
                  variant="tonal"
                  class="mb-3"
                >
                  <VImg
                    v-if="previewUrl"
                    :src="previewUrl"
                    cover
                  />
                  <span
                    v-else
                    class="text-h2"
                  >{{ formData.name?.charAt(0).toUpperCase() || '?' }}</span>
                </VAvatar>
                <VBtn
                  size="small"
                  variant="text"
                  color="primary"
                  prepend-icon="tabler-camera"
                  @click="triggerFileInput"
                >
                  Upload Foto
                </VBtn>
              </VCol>

              <!-- Basic Info Fields -->
              <VCol
                cols="12"
                md="10"
              >
                <VRow>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.name"
                      label="Nama Lengkap *"
                      placeholder="Masukkan nama lengkap"
                      :rules="[requiredValidator]"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.email"
                      label="Email"
                      placeholder="contoh@email.com"
                      type="email"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppTextField
                      v-model="formData.phone"
                      label="Nomor Telepon / WhatsApp"
                      placeholder="08123456789"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="3"
                  >
                    <AppSelect
                      v-model="formData.gender"
                      :items="genderOptions"
                      label="Jenis Kelamin"
                      placeholder="Pilih jenis kelamin"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="3"
                  >
                    <AppDateTimePicker
                      v-model="formData.birthday"
                      label="Tanggal Lahir"
                      placeholder="Pilih tanggal lahir"
                    />
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Alamat -->
      <VCol cols="12">
        <h6 class="text-h6 font-weight-medium mb-4 mt-2">
          Alamat
        </h6>
        <VCard
          border
          flat
        >
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextarea
                  v-model="formData.address"
                  label="Alamat Lengkap"
                  placeholder="Jalan, Nomor Rumah, RT/RW"
                  rows="2"
                />
              </VCol>

              <VCol cols="12">
                <AdministrativeLocationSelector
                  v-model:province-code="formData.provinceCode"
                  v-model:city-code="formData.cityCode"
                  v-model:district-code="formData.districtCode"
                  v-model:village-code="formData.villageCode"
                  :initial-province-code="formData.provinceCode"
                  :initial-city-code="formData.cityCode"
                  :initial-district-code="formData.districtCode"
                  @update:village="onVillageSelect"
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <AppTextField
                  v-model="formData.postalCode"
                  label="Kode Pos"
                  placeholder="Masukkan kode pos"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Informasi Bisnis & Keuangan -->
      <VCol cols="12">
        <h6 class="text-h6 font-weight-medium mb-4 mt-2">
          Informasi Bisnis & Keuangan
        </h6>
        <VCard
          border
          flat
        >
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.customerType"
                  :items="customerTypeOptions"
                  label="Tipe Pelanggan"
                  placeholder="Pilih tipe pelanggan"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formData.paymentTerms"
                  :items="paymentTermOptions"
                  label="Termin Pembayaran"
                  placeholder="Pilih termin pembayaran"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.taxId"
                  label="NPWP (Tax ID)"
                  placeholder="Masukkan nomor NPWP"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formData.creditLimit"
                  label="Limit Kredit (Rp)"
                  placeholder="0"
                  type="number"
                  prefix="Rp"
                />
              </VCol>
              <VCol cols="12">
                <VSwitch
                  v-model="formData.isMember"
                  label="Status Member"
                  hint="Aktifkan jika pelanggan ini adalah member"
                  persistent-hint
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Actions -->
      <VCol
        cols="12"
        class="d-flex gap-4 justify-end mt-4"
      >
        <VBtn
          color="secondary"
          variant="tonal"
          @click="emit('cancel')"
        >
          Batal
        </VBtn>
        <VBtn
          type="submit"
          color="primary"
          :loading="isLoading"
        >
          {{ isEdit ? 'Simpan Perubahan' : 'Buat Pelanggan' }}
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
