<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useBusinessUnitStore } from '@/stores/businessUnitStore'
import type { BusinessUnit } from '@/types/models/business-unit'
import BusinessUnitFormComponent from '@/views/pages/setting/business-units/BusinessUnitFormComponent.vue'

definePage({
  meta: {
    name: 'Tambah Unit Bisnis',
    navActiveLink: 'setting-business-units',
    rules: [
      {
        action: 'manage',
        subject: 'Tambah Unit Bisnis',
      },
      {
        action: 'manage',
        subject: 'Tambah Semua Unit Bisnis',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const businessUnitStore = useBusinessUnitStore()
const { isLoadingSubmit, form } = storeToRefs(businessUnitStore)

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToIndex = async () => {
  await router.push({
    name: 'setting-business-units',
  })
}

const SubmitData = async () => {
  try {
    await businessUnitStore.create()
    showToast('Unit Bisnis berhasil ditambahkan', 'success')
    backToIndex()
  }
  catch (error) {
    console.error('Error creating unit bisnis:', error)

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

// Reset form when component mounts
onMounted(async () => {
  businessUnitStore.resetForm()
  businessUnitStore.selectedBusinessUnit = {} as BusinessUnit
  form.value = {
    name: '',
    description: '',
    logo: undefined,
    cityCode: '',
    provinceCode: '',
    isActive: true,
  }

  await businessUnitStore.fetchAllData()
  if (businessUnitStore.data.length >= 1) {
    await backToIndex()
    showToast('Hanya diperbolehkan memiliki satu unit bisnis pada versi ini.', 'warning')
  }
})

// Clean up when leaving
onBeforeUnmount(() => {
  businessUnitStore.resetForm()
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
            @click="backToIndex"
          >
            <VIcon icon="tabler-arrow-left" />
          </VBtn>
          <span>Tambah Unit Bisnis Baru</span>
        </VCardTitle>
        <VCardSubtitle>
          Lengkapi informasi unit bisnis untuk menambahkan lokasi baru ke sistem
        </VCardSubtitle>
      </VCardItem>
    </VCard>

    <!-- Form Card -->
    <VCard>
      <VCardItem>
        <VCardTitle>
          <VIcon
            icon="tabler-building-store"
            class="me-2"
          />
          Informasi Unit Bisnis
        </VCardTitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <BusinessUnitFormComponent />

          <!-- Action Buttons -->
          <div class="d-flex justify-end mt-6 gap-3">
            <VBtn
              color="secondary"
              variant="outlined"
              type="button"
              prepend-icon="tabler-x"
              @click="backToIndex"
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
              <span v-if="isLoadingSubmit">Menyimpan...</span>
              <span v-else>Simpan Unit Bisnis</span>
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <!-- Help Card -->
    <VCard class="mt-6">
      <VCardItem>
        <VCardTitle>
          <VIcon
            icon="tabler-help-circle"
            class="me-2"
          />
          Bantuan
        </VCardTitle>
      </VCardItem>
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
