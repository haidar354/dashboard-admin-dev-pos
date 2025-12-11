<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useEmployeeStore } from '@/stores/employeeStore'
import type { Employee } from '@/types/models/employee'
import EmployeeFormComponent from '@/views/pages/hr/employees/EmployeeFormComponent.vue'

definePage({
  meta: {
    name: 'Tambah Karyawan',
    navActiveLink: 'hr-employees',
    rules: [
      {
        action: 'manage',
        subject: 'Tambah Karyawan',
      },
      {
        action: 'manage',
        subject: 'Tambah Semua Karyawan',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const employeeStore = useEmployeeStore()
const { isLoadingCreate: isLoadingSubmit, form } = storeToRefs(employeeStore)

const refVForm = ref<VForm>()
const isFormValid = ref(false)

const backToIndex = () => {
  router.push({
    name: 'hr-employees',
  })
}

const SubmitData = async () => {
  try {
    await employeeStore.create()
    showToast('Karyawan berhasil ditambahkan', 'success')
    backToIndex()
  }
  catch (error) {
    console.error('Error creating employee:', error)

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
  employeeStore.resetForm()
  employeeStore.selectedEmployee = {} as Employee
  form.value = {
    outletId: '',
    userId: '',
    address: '',
    position: '',
    name: '',
    pin: '',
    phone: '',
    role: '',
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
            @click="backToIndex"
          >
            <VIcon icon="tabler-arrow-left" />
          </VBtn>
          <span>Tambah Karyawan Baru</span>
        </VCardTitle>
        <VCardSubtitle>
          Lengkapi informasi karyawan untuk menambahkan karyawan baru ke sistem
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
          Informasi Karyawan
        </VCardTitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <EmployeeFormComponent />

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
              <span v-else>Simpan Karyawan</span>
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
                icon="tabler-user"
                color="info"
              />
            </template>
            <VListItemTitle>Nama Lengkap</VListItemTitle>
            <VListItemSubtitle>
              Masukkan nama lengkap karyawan sesuai dengan dokumen resmi
            </VListItemSubtitle>
          </VListItem>

          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-briefcase"
                color="primary"
              />
            </template>
            <VListItemTitle>Jabatan</VListItemTitle>
            <VListItemSubtitle>
              Pilih jabatan dari daftar atau ketik jabatan khusus sesuai kebutuhan
            </VListItemSubtitle>
          </VListItem>

          <VListItem>
            <template #prepend>
              <VIcon
                icon="tabler-building-store"
                color="success"
              />
            </template>
            <VListItemTitle>Outlet</VListItemTitle>
            <VListItemSubtitle>
              Tentukan outlet tempat karyawan akan bekerja
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
              PIN opsional untuk akses sistem POS, gunakan 6 digit angka yang mudah diingat
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
