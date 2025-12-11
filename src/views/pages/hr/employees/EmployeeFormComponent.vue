<script setup lang="ts">
import { useEmployeeStore } from '@/stores/employeeStore'
import { useOutletStore } from '@/stores/outletStore'
import { useRoleStore } from '@/stores/roleStore'

defineProps<{
  readonly?: boolean
  mode?: 'create' | 'edit'
}>()

const employeeStore = useEmployeeStore()
const outletStore = useOutletStore()
const { form, formErrors } = storeToRefs(employeeStore)
const { data: outlets } = storeToRefs(outletStore)

const roleStore = useRoleStore()
const { isLoadingFetchData: isLoadingFetchRoles, data: roles } = storeToRefs(roleStore)

// Custom validators
const phoneValidator = (value: string) => {
  if (!value)
    return true // Optional field
  const phoneRegex = /^(?:\+62|62|0)8[1-9]\d{6,10}$/

  return phoneRegex.test(value) || 'Format nomor telepon tidak valid (contoh: 08123456789)'
}

const nameValidator = (value: string) => {
  if (!value)
    return 'Nama wajib diisi'
  if (value.length < 2)
    return 'Nama minimal 2 karakter'
  if (value.length > 100)
    return 'Nama maksimal 100 karakter'

  return true
}

const positionValidator = (value: string) => {
  if (!value)
    return 'Jabatan wajib diisi'
  if (value.length < 2)
    return 'Jabatan minimal 2 karakter'
  if (value.length > 50)
    return 'Jabatan maksimal 50 karakter'

  return true
}

const addressValidator = (value: string) => {
  if (!value)
    return 'Alamat wajib diisi'
  if (value.length < 10)
    return 'Alamat minimal 10 karakter'
  if (value.length > 255)
    return 'Alamat maksimal 255 karakter'

  return true
}

const pinValidator = (value: string) => {
  if (!value)
    return true // PIN is optional
  if (!/^\d{4,6}$/.test(value))
    return 'PIN harus berupa 4-6 digit angka'

  return true
}

// Position options
const positionOptions = [
  'Manager',
  'Supervisor',
  'Kasir',
  'Staff Gudang',
  'Sales',
  'Customer Service',
  'Admin',
  'Security',
  'Cleaning Service',
  'Driver',
  'Teknisi',
  'Marketing',
  'Accounting',
  'HRD',
]

onMounted(async () => {
  // Fetch outlets for dropdown
  if (outlets.value.length === 0)
    await outletStore.fetchAllData()

  roleStore.fetchAllData()
})
</script>

<template>
  <div>
    <VRow>
      <!-- Personal Information Section -->
      <VCol cols="12">
        <div class="text-h6 mb-4">
          <VIcon
            icon="tabler-user"
            class="me-2"
          />
          Informasi Karyawan
        </div>
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>Nama Lengkap <span class="text-error">*</span></label>
        <AppTextField
          v-model="form.name"
          :rules="[nameValidator]"
          :error-messages="formErrors?.name"
          counter
          maxlength="100"
          prepend-inner-icon="tabler-user"
          :readonly="readonly"
          placeholder="Masukkan nama lengkap karyawan"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>No. Telepon <span class="text-error">*</span></label>
        <AppTextField
          v-model="form.phone"
          :rules="[requiredValidator, phoneValidator]"
          :error-messages="formErrors?.phone"
          prepend-inner-icon="tabler-phone"
          :readonly="readonly"
          placeholder="Contoh: 08123456789"
          type="tel"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>Role<span class="text-error">*</span></label>
        <VSelect
          v-model="form.role"
          :items="roles.map(role => role.name)"
          :rules="[requiredValidator]"
          :error-messages="formErrors?.role"
          prepend-inner-icon="tabler-user-shield"
          :readonly="readonly"
          placeholder="Pilih role karyawan"
          :loading="isLoadingFetchRoles"
          persistent-hint
          hint="Pilih role karyawan dari daftar yang tersedia"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>Jabatan <span class="text-error">*</span></label>
        <AppCombobox
          v-model="form.position"
          :items="positionOptions"
          :rules="[positionValidator]"
          :error-messages="formErrors?.position"
          prepend-inner-icon="tabler-briefcase"
          :readonly="readonly"
          persistent-hint
          hint="Pilih jabatan karyawan dari daftar yang tersedia atau ketik manual"
        />
      </VCol>

      <VCol cols="12">
        <label>Alamat Lengkap <span class="text-error">*</span></label>
        <AppTextarea
          v-model="form.address"
          :rules="[addressValidator]"
          :error-messages="formErrors?.address"
          counter
          maxlength="255"
          prepend-inner-icon="tabler-map-pin"
          :readonly="readonly"
          rows="3"
          placeholder="Masukkan alamat lengkap karyawan"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>Outlet <span class="text-error">*</span></label>
        <AppSelect
          v-model="form.outletId"
          :items="outlets.map(outlet => ({
            title: outlet.name,
            value: outlet.outletId,
            subtitle: outlet.address,
          }))"
          :rules="[requiredValidator]"
          :error-messages="formErrors?.outletId"
          prepend-inner-icon="tabler-building-store"
          :readonly="readonly"
          placeholder="Pilih outlet tempat kerja"
          item-title="title"
          item-value="value"
          :disabled="mode === 'edit'"
        >
          <template #item="{ props, item }">
            <VListItem
              v-bind="props"
              :subtitle="item.raw.subtitle"
            />
          </template>
        </AppSelect>
      </VCol>

      <!-- Security Information Section -->
      <VCol cols="12">
        <VDivider class="my-4" />
        <div class="text-h6 mb-4">
          <VIcon
            icon="tabler-shield-lock"
            class="me-2"
          />
          Informasi Keamanan
        </div>
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <label>PIN Akses (Opsional)</label>
        <AppTextField
          v-model="form.pin"
          :rules="[pinValidator]"
          :error-messages="formErrors?.pin"
          prepend-inner-icon="tabler-lock"
          :readonly="readonly"
          placeholder=" 6 digit angka (default 123456)"
          type="password"
          maxlength="6"
        />
        <div class="text-caption text-medium-emphasis mt-1">
          PIN digunakan untuk akses sistem POS (Point of Sale)
        </div>
      </VCol>

      <!-- Information Alert -->
      <VCol cols="12">
        <VAlert
          type="info"
          variant="tonal"
          class="mb-0"
          icon="tabler-info-circle"
        >
          <div class="text-body-2">
            <strong>Informasi Penting:</strong>
            <ul class="mt-2 ms-4">
              <li>Pastikan nomor telepon aktif untuk komunikasi</li>
              <li>PIN akses bersifat opsional dan digunakan untuk sistem POS</li>
              <li>Alamat akan digunakan untuk keperluan administrasi</li>
              <li>Jabatan dapat dipilih dari daftar atau diketik manual</li>
            </ul>
          </div>
        </VAlert>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.v-alert ul {
  list-style-type: disc;
  padding-inline-start: 0;
}

.v-alert li {
  margin-block-end: 4px;
}
</style>
