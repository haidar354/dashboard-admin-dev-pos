<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useEmployeeStore } from '@/stores/employeeStore'
import EmployeeFormComponent from '@/views/pages/hr/employees/EmployeeFormComponent.vue'

definePage({
  meta: {
    name: 'Edit Karyawan',
    navActiveLink: 'hr-employees',
    rules: [
      {
        action: 'manage',
        subject: 'Edit Karyawan',
      },
      {
        action: 'manage',
        subject: 'Edit Semua Karyawan',
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
const employeeStore = useEmployeeStore()
const { isLoadingUpdate: isLoadingSubmit, isLoadingFetchDetail, selectedEmployee } = storeToRefs(employeeStore)
const employeeId = (route.params as { employeeId: string }).employeeId

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToDetail = async () => {
  await router.push({
    name: 'hr-employees-employee-id',
    params: { employeeId },
  })
}

const SubmitData = async () => {
  try {
    await employeeStore.update()
    await backToDetail()
    showToast('Karyawan berhasil diperbarui', 'success')
  }
  catch (error) {
    console.error('Error updating employee:', error)

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
  if (employeeId) {
    employeeStore.fetchDetailAndSetForm(employeeId).catch(() => {
      router.push({ name: 'hr-employees' })
    })
  }
})

// Clean up when leaving
onBeforeUnmount(() => {
  employeeStore.resetForm()
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
          <span>Edit Karyawan</span>
        </VCardTitle>
        <VCardSubtitle>
          Perbarui informasi karyawan yang sudah ada
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
    <VCard v-else-if="selectedEmployee.employeeId">
      <VCardItem>
        <VCardTitle>
          <VIcon
            icon="tabler-user"
            class="me-2"
          />
          Informasi Karyawan
        </VCardTitle>
        <VCardSubtitle>
          {{ selectedEmployee.user?.name || 'Nama tidak tersedia' }}
        </VCardSubtitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <EmployeeFormComponent mode="edit" />

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
              <span v-else>Perbarui Karyawan</span>
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
                icon="tabler-briefcase"
                color="primary"
              />
            </template>
            <VListItemTitle>Jabatan & Outlet</VListItemTitle>
            <VListItemSubtitle>
              Perubahan jabatan atau outlet akan mempengaruhi akses dan tanggung jawab karyawan
            </VListItemSubtitle>
          </VListItem>

          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-shield-lock"
                color="warning"
              />
            </template>
            <VListItemTitle>PIN Akses</VListItemTitle>
            <VListItemSubtitle>
              Perubahan PIN akan mempengaruhi akses karyawan ke sistem POS
            </VListItemSubtitle>
          </VListItem>

          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-phone"
                color="success"
              />
            </template>
            <VListItemTitle>Kontak</VListItemTitle>
            <VListItemSubtitle>
              Pastikan nomor telepon tetap aktif untuk komunikasi internal
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
