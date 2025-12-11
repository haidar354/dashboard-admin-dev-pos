<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { useStockCountStore } from '@/stores/inventory/stockCountStore'

// Props & Emit - None for pages

// Composables
const router = useRouter()
const outletStore = useOutletSidebarStore()
const stockCountStore = useStockCountStore()

// State
const { data: outlets, isLoadingFetchData: isFetchingOutlets } = storeToRefs(outletStore)
const selectedOutlet = ref<string | null>(null)
const notes = ref('')
const isLoading = ref(false)

// Lifecycle
onMounted(() => {
  if (outlets.value.length === 0)
    outletStore.fetchAllData()
})

// Methods
const handleSubmit = async () => {
  if (!selectedOutlet.value)
    return

  isLoading.value = true
  try {
    const response = await stockCountStore.create({
      outletId: selectedOutlet.value,
      notes: notes.value,
    })

    // Redirect to detail page
    router.push(`/inventory/stock-counts/${response.data.stockCountId}`)
  }
  catch (error: any) {
    console.error(error)

    // alert(error.message || 'Gagal memulai opname') // Use toast in real app
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <VCard elevation="2">
      <VCardText>
        <!-- Title Section -->
        <div class="d-flex align-center mb-6">
          <VIcon
            icon="tabler-clipboard-list"
            class="me-3"
            color="primary"
            size="32"
          />
          <div>
            <div class="text-h5 font-weight-bold">
              Mulai Stock Opname
            </div>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Pilih outlet untuk memulai sesi perhitungan stok fisik baru
            </p>
          </div>
        </div>

        <VForm @submit.prevent="handleSubmit">
          <!-- Basic Information Card -->
          <VCard
            variant="outlined"
            class="mb-6"
          >
            <VCardText class="d-flex align-center">
              <VIcon
                icon="tabler-info-circle"
                class="me-2"
                color="primary"
              />
              <span class="font-weight-medium">Informasi Dasar</span>
            </VCardText>

            <VDivider />

            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <label class="v-label font-weight-medium mb-1">Outlet <span class="text-error">*</span></label>
                  <AppAutocomplete
                    v-model="selectedOutlet"
                    :items="outlets"
                    item-title="name"
                    item-value="outletId"
                    placeholder="Pilih Outlet"
                    prepend-inner-icon="tabler-building-store"
                    :loading="isFetchingOutlets"
                    clearable
                    variant="outlined"
                  />
                </VCol>

                <VCol cols="12">
                  <label class="v-label font-weight-medium mb-1">Catatan (Opsional)</label>
                  <AppTextarea
                    v-model="notes"
                    placeholder="Tambahkan catatan untuk sesi opname ini..."
                    prepend-inner-icon="tabler-note"
                    variant="outlined"
                    rows="3"
                  />
                </VCol>
              </VRow>

              <VAlert
                v-if="selectedOutlet"
                type="info"
                variant="tonal"
                class="mt-4"
                icon="tabler-info-circle"
              >
                Memulai Stock Opname akan mencatat snapshot stok sistem saat ini untuk semua barang di outlet yang dipilih.
              </VAlert>
            </VCardText>
          </VCard>

          <!-- Actions -->
          <div class="d-flex justify-end gap-3">
            <VBtn
              variant="outlined"
              color="secondary"
              @click="router.back()"
            >
              Batal
            </VBtn>
            <VBtn
              type="submit"
              color="primary"
              variant="elevated"
              :loading="isLoading"
              :disabled="!selectedOutlet"
              prepend-icon="tabler-player-play"
            >
              Mulai Opname
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>
