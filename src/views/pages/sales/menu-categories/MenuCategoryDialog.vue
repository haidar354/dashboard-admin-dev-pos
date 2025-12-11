<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useMenuCategoryStore } from '@/stores/menuCategoryStore'

const menuCategoryStore = useMenuCategoryStore()

const {
  isDialogVisible,
  dialogTitle,
  submitButtonText,
  form,
  formErrors,
  isLoadingCreate,
  isLoadingUpdate,
  dialogMode,
} = storeToRefs(menuCategoryStore)

const refVForm = ref<VForm>()
const isFormValid = ref(false)

// Computed loading state
const isLoading = computed(() => {
  return dialogMode.value === 'create' ? isLoadingCreate.value : isLoadingUpdate.value
})

// Form validation rules
const nameValidator = (value: string) => {
  if (!value)
    return 'Nama kategori wajib diisi'
  if (value.length < 2)
    return 'Nama kategori minimal 2 karakter'
  if (value.length > 50)
    return 'Nama kategori maksimal 50 karakter'

  return true
}

const sortOrderValidator = (value: number) => {
  if (value === null || value === undefined)
    return 'Urutan tampil wajib diisi'
  if (value < 1)
    return 'Urutan tampil minimal 1'
  if (value > 999)
    return 'Urutan tampil maksimal 999'

  return true
}

// Form submission
const onSubmit = async () => {
  if (!refVForm.value)
    return

  const { valid: isValid } = await refVForm.value.validate()

  if (isValid) {
    if (dialogMode.value === 'create')
      await menuCategoryStore.create()

    else
      await menuCategoryStore.update()
  }
  else {
    showToast('Pastikan semua form wajib terisi dan sesuai', 'error')
  }
}

// Close dialog
const onClose = () => {
  menuCategoryStore.closeDialog()
}

// Watch dialog visibility to reset form validation
watch(isDialogVisible, newVal => {
  if (newVal && refVForm.value) {
    nextTick(() => {
      refVForm.value?.resetValidation()
    })
  }
})
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    max-width="600"
    persistent
  >
    <VCard>
      <VCardItem>
        <VCardTitle class="d-flex align-center gap-2">
          <VIcon
            icon="tabler-category"
            color="primary"
          />
          {{ dialogTitle }}
        </VCardTitle>
        <VCardSubtitle>
          {{ dialogMode === 'create' ? 'Tambahkan kategori menu baru untuk mengorganisir menu Anda' : 'Perbarui informasi kategori menu' }}
        </VCardSubtitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VForm
          ref="refVForm"
          v-model="isFormValid"
          validate-on="input"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <!-- Nama Kategori -->
            <VCol cols="12">
              <label class="text-body-1 font-weight-medium mb-2 d-block">
                Nama Kategori <span class="text-error">*</span>
              </label>
              <AppTextField
                v-model="form.name"
                :rules="[nameValidator]"
                :error-messages="formErrors?.name"
                placeholder="Contoh: Makanan Utama, Minuman, Dessert"
                prepend-inner-icon="tabler-category"
                counter
                maxlength="50"
                :disabled="isLoading"
                validate-on-blur
              />
            </VCol>

            <!-- Urutan Tampil -->
            <VCol
              cols="12"
              md="6"
            >
              <label class="text-body-1 font-weight-medium mb-2 d-block">
                Urutan Tampil <span class="text-error">*</span>
              </label>
              <AppTextField
                v-model.number="form.sortOrder"
                :rules="[sortOrderValidator]"
                :error-messages="formErrors?.sortOrder"
                type="number"
                min="1"
                max="999"
                placeholder="1"
                prepend-inner-icon="tabler-sort-ascending"
                :disabled="isLoading"
              />
              <div class="text-caption text-medium-emphasis mt-1">
                Kategori dengan urutan lebih kecil akan tampil lebih dulu
              </div>
            </VCol>

            <!-- Tampil di POS -->
            <VCol
              cols="12"
              md="6"
            >
              <label class="text-body-1 font-weight-medium mb-2 d-block">
                Pengaturan Tampilan
              </label>
              <div class="d-flex align-center mt-3">
                <VSwitch
                  v-model="form.showInPOS"
                  color="primary"
                  :disabled="isLoading"
                  hide-details
                />
                <div class="ms-3">
                  <div class="text-body-2 font-weight-medium">
                    Tampilkan di POS
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Kategori akan terlihat di sistem Point of Sale
                  </div>
                </div>
              </div>
            </VCol>

            <!-- Preview Card -->
            <VCol cols="12">
              <VAlert
                type="info"
                variant="tonal"
                class="mb-0"
              >
                <div class="d-flex align-center">
                  <VIcon
                    icon="tabler-eye"
                    class="me-2"
                  />
                  <div>
                    <div class="text-body-2 font-weight-medium">
                      Preview Kategori
                    </div>
                    <div class="text-caption">
                      <strong>{{ form.name || 'Nama Kategori' }}</strong>
                      • Urutan: {{ form.sortOrder || 1 }}
                      • {{ form.showInPOS ? 'Tampil di POS' : 'Tidak tampil di POS' }}
                    </div>
                  </div>
                </div>
              </VAlert>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="outlined"
          :disabled="isLoading"
          @click="onClose"
        >
          Batal {{ isFormValid ? '' : '(Form belum valid)' }}
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          :loading="isLoading"
          :disabled="isFormValid === false || isLoading"
          type="submit"
          @click="onSubmit"
        >
          {{ submitButtonText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.v-card {
  overflow: visible;
}

.v-dialog > .v-overlay__content {
  overflow: visible;
}
</style>
