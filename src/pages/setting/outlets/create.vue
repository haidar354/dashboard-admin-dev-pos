<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useOutletStore } from '@/stores/outletStore'
import type { Outlet } from '@/types/models/outlet'
import OutletFormComponent from '@/views/pages/setting/outlets/OutletFormComponent.vue'

definePage({
  meta: {
    name: 'Tambah Outlet',
    navActiveLink: 'setting-outlets',
    rules: [
      {
        action: 'manage',
        subject: 'Tambah Outlet',
      },
      {
        action: 'manage',
        subject: 'Tambah Semua Outlet',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const outletStore = useOutletStore()
const { isLoadingSubmit, form } = storeToRefs(outletStore)

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToIndex = () => {
  router.push({
    name: 'setting-outlets',
  })
}

const SubmitData = async () => {
  try {
    await outletStore.create()
    showToast('Outlet berhasil ditambahkan', 'success')
    backToIndex()
  }
  catch (error) {
    console.error('Error creating outlet:', error)

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
onMounted(() => {
  outletStore.resetForm()
  outletStore.selectedOutlet = {} as Outlet
  form.value = {
    name: '',
    address: '',
    phone: '',
    villageCode: '',
    latitude: '',
    longitude: '',
    openingTime: '',
    closingTime: '',
    isCentral: false,
    description: '',
  }
})

// Clean up when leaving
onBeforeUnmount(() => {
  outletStore.resetForm()
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
          <span>Tambah Outlet Baru</span>
        </VCardTitle>
        <VCardSubtitle>
          Lengkapi informasi outlet untuk menambahkan lokasi baru ke sistem
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
          Informasi Outlet
        </VCardTitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <OutletFormComponent />

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
              <span v-else>Simpan Outlet</span>
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

      <VCardText>
        <VList>
          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-info-circle"
                color="info"
              />
            </template>
            <VListItemTitle>Nama Outlet</VListItemTitle>
            <VListItemSubtitle>
              Berikan nama yang mudah diingat dan mencerminkan lokasi outlet
            </VListItemSubtitle>
          </VListItem>

          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-building-store"
                color="primary"
              />
            </template>
            <VListItemTitle>Tipe Outlet</VListItemTitle>
            <VListItemSubtitle>
              Pilih "Outlet Pusat" untuk kantor pusat, atau "Outlet Cabang" untuk cabang
            </VListItemSubtitle>
          </VListItem>

          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-map-pin"
                color="success"
              />
            </template>
            <VListItemTitle>Lokasi GPS</VListItemTitle>
            <VListItemSubtitle>
              Gunakan tombol lokasi untuk mendapatkan koordinat otomatis, atau masukkan manual
            </VListItemSubtitle>
          </VListItem>

          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-clock"
                color="warning"
              />
            </template>
            <VListItemTitle>Jam Operasional</VListItemTitle>
            <VListItemSubtitle>
              Tentukan jam buka dan tutup untuk menampilkan status operasional
            </VListItemSubtitle>
          </VListItem>
        </VList>
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
