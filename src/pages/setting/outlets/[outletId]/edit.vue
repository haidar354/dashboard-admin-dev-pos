<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useOutletStore } from '@/stores/outletStore'
import OutletFormComponent from '@/views/pages/setting/outlets/OutletFormComponent.vue'

definePage({
  meta: {
    name: 'Edit Outlet',
    navActiveLink: 'setting-outlets',
    rules: [
      {
        action: 'manage',
        subject: 'Edit Outlet',
      },
      {
        action: 'manage',
        subject: 'Edit Semua Outlet',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const route = useRoute()
const outletStore = useOutletStore()
const { isLoadingSubmit, isLoadingFetchDetail, selectedOutlet } = storeToRefs(outletStore)
const outletId = (route.params as { outletId: string }).outletId

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToDetail = async () => {
  await router.push({
    name: 'setting-outlets-outlet-id',
    params: { outletId },
  })
}

const SubmitData = async () => {
  try {
    await outletStore.update()
    backToDetail().then(() => {
      showToast('Outlet berhasil diperbarui', 'success')
    })
  }
  catch (error) {
    console.error('Error updating outlet:', error)

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
  if (outletId) {
    outletStore.fetchDetailAndSetForm(outletId).catch(() => {
      router.push({ name: 'setting-outlets' })
    })
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
            @click="backToDetail"
          >
            <VIcon icon="tabler-arrow-left" />
          </VBtn>
          <span>Edit Outlet</span>
        </VCardTitle>
        <VCardSubtitle>
          Perbarui informasi outlet yang sudah ada
        </VCardSubtitle>
      </VCardItem>
    </VCard>

    <!-- Loading State -->
    <VCard v-if="isLoadingFetchDetail">
      <VCardText>
        <VSkeletonLoader type="article,divider,article,divider,article" />
      </VCardText>
    </VCard>

    <!-- Form Card -->
    <VCard v-else-if="selectedOutlet.outletId">
      <VCardItem>
        <VCardTitle>
          <VIcon
            icon="tabler-building-store"
            class="me-2"
          />
          Informasi Outlet
        </VCardTitle>
        <VCardSubtitle>
          {{ selectedOutlet.name }}
        </VCardSubtitle>
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
              @click="backToDetail"
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
              <span v-if="isLoadingSubmit">Memperbarui...</span>
              <span v-else>Perbarui Outlet</span>
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
            <VListItemTitle>Perubahan Data</VListItemTitle>
            <VListItemSubtitle>
              Pastikan data yang diubah sudah sesuai sebelum menyimpan
            </VListItemSubtitle>
          </VListItem>

          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-map-pin"
                color="success"
              />
            </template>
            <VListItemTitle>Lokasi Administratif</VListItemTitle>
            <VListItemSubtitle>
              Perubahan lokasi administratif akan mempengaruhi laporan dan analisis
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
              Perubahan jam operasional akan mempengaruhi status outlet di sistem
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
