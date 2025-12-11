<!-- eslint-disable indent -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { VIcon } from 'vuetify/components/VIcon'
import { useItemUpdate } from '@/composables/product/useItemUpdate'

const { defaultUnit, updateForm, enableBom, isInitializing } = useItemUpdate()

// === OPTION LISTS ===
const manufacturingSourceList = computed(() => {
  if (updateForm.value?.kind === 'service') {
    return [{ title: 'Tidak Kelola Stok', value: 'NONE' }]
  }
  else {
    return [
      { title: 'Diproduksi Sendiri', value: 'IN_HOUSE' },
      { title: 'Dibeli dari Supplier', value: 'PURCHASED' },
      { title: 'Bisa Produksi Sendiri atau Beli', value: 'EITHER' },
      { title: 'Tidak Kelola Stok', value: 'NONE' },
    ]
  }
})

const sourcingSitePolicyList = computed(() => {
  switch (updateForm.value?.config?.manufacturingSource) {
    case 'NONE':
      return [{ title: 'Non Produksi / Jasa', value: 'NONE' }]
    case 'PURCHASED':
      return [
        { title: 'Dibeli oleh Outlet', value: 'OUTLET_ONLY' },
        { title: 'Dibeli Melalui Outlet Pusat', value: 'CENTRAL_ONLY' },
        { title: 'Bisa di Outlet atau Outlet Pusat', value: 'EITHER' },
      ]
    default:
      return [
        { title: 'Diproduksi di Outlet', value: 'OUTLET_ONLY' },
        { title: 'Diproduksi di Outlet Pusat', value: 'CENTRAL_ONLY' },
        { title: 'Bisa di Outlet atau Outlet Pusat', value: 'EITHER' },
      ]
  }
})

const saleFulfillmentModeList = computed(() => {
  if (updateForm.value?.kind === 'service')
    return [{ title: 'Non Stok (jasa atau layanan)', value: 'NONE' }]
  else if (updateForm.value?.kind === 'material')
    return [{ title: 'Non Stok (bahan baku)', value: 'NONE' }]

  if (updateForm.value?.config?.manufacturingSource === 'PURCHASED')
    return [{ title: 'Produk Siap Jual (stok hasil pembelian)', value: 'FINISHED_STOCK' }]

  if (updateForm.value?.config?.manufacturingSource === 'NONE')
    return [{ title: 'Non Stok (hanya catat penjualan)', value: 'NONE' }]

  return [
    { title: 'Produk Siap Jual (stok jadi)', value: 'FINISHED_STOCK' },
    { title: 'Produk Racikan / Masakan (dibuat dari resep)', value: 'RECIPE' },

  ]
})

// === WATCHERS ===

// Jenis produk → default pengaturan
watch(
  () => updateForm.value.kind,
  kind => {
    if (isInitializing?.value)
      return
    if (updateForm.value?.config) {
      switch (kind) {
        case 'product':
          updateForm.value!.config!.manufacturingSource = 'NONE'
          updateForm.value!.config!.saleable = true
          updateForm.value!.config!.manageStock = true
          updateForm.value!.config!.showInPos = true
          break
        case 'material':
          updateForm.value!.config!.manufacturingSource = 'NONE'
          updateForm.value!.config!.saleable = false
          updateForm.value!.config!.showInPos = false
          break
        case 'service':
          updateForm.value!.config!.manufacturingSource = 'NONE'
          updateForm.value!.config!.saleable = true
          updateForm.value!.config!.manageStock = false
          updateForm.value!.config!.showInPos = true
          break
      }
    }
  },
  { immediate: true },
)

// manufacturingSource → atur turunan lainnya
watch(
  () => updateForm.value?.config?.manufacturingSource,
  src => {
    if (isInitializing?.value)
      return
    if (updateForm.value?.config) {
      if (src === 'NONE') {
        updateForm.value!.config!.sourcingSitePolicy = 'EITHER'
        updateForm.value!.config!.saleFulfillmentMode = 'NONE'
        updateForm.value!.config!.manageStock = false
        updateForm.value!.config!.minStockAlert = 0
        updateForm.value!.config!.maxStockAlert = 0
        updateForm.value!.config!.allowNegativeStock = false
      }
      else if (src === 'PURCHASED' || src === 'IN_HOUSE' || src === 'EITHER') {
        updateForm.value!.config!.sourcingSitePolicy = 'EITHER'
        updateForm.value!.config!.saleFulfillmentMode = 'FINISHED_STOCK'
        updateForm.value!.config!.manageStock = true
        updateForm.value!.config!.minStockAlert = 0
        updateForm.value!.config!.maxStockAlert = 0
        updateForm.value!.config!.allowNegativeStock = false
      }
    }
  },
  { immediate: true },
)

// saleFulfillmentMode → sinkron stok
watch(
  () => updateForm.value?.config?.saleFulfillmentMode,
  mode => {
    if (isInitializing?.value)
      return

    updateForm.value!.config!.manageStock = (mode === 'FINISHED_STOCK')
    if (mode === 'RECIPE') {
      updateForm.value.config!.recipePolicy = 'ITEM_BOM_ONLY'
      enableBom()
    }
  },
)
</script>

<template>
  <VCard
    elevation="2"
    class="mb-6"
  >
    <VCardItem>
      <VCardTitle class="text-h6 d-flex align-center">
        <VIcon
          icon="tabler-settings"
          class="me-2"
          color="primary"
        />
        Pengaturan Produk
      </VCardTitle>
    </VCardItem>

    <VCardText>
      <template v-if="['product', 'material'].includes(updateForm.kind)">
        <!-- === Asal Produk === -->
        <VRow>
          <VCol
            cols="12"
            class="font-weight-bold"
          >
            Asal Produk
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Sumber Produk</label>
            <VSelect
              v-if="updateForm.config?.manufacturingSource !== undefined"
              v-model="updateForm.config.manufacturingSource"
              :items="manufacturingSourceList"
              variant="outlined"
              density="comfortable"
            />
          </VCol>

          <VCol
            v-if="updateForm.config?.manufacturingSource !== 'NONE'"
            cols="12"
            md="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">{{ updateForm.config?.manufacturingSource === 'PURCHASED' ? 'Dibeli Oleh' : 'Lokasi Produksi' }}</label>
            <VSelect
              v-if="updateForm.config?.sourcingSitePolicy !== undefined"
              v-model="updateForm.config.sourcingSitePolicy"
              :items="sourcingSitePolicyList"
              variant="outlined"
              density="comfortable"
            />
          </VCol>
        </VRow>
      </template>

      <template v-if="['product', 'service'].includes(updateForm.kind)">
        <VDivider class="my-6" />

        <!-- === Cara Penjualan === -->
        <VRow>
          <VCol
            cols="12"
            class="font-weight-bold"
          >
            Penjualan Produk
          </VCol>

          <VCol
            cols="12"
            md="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Dapat dijual?</label>
            <VSwitch
              v-if="updateForm.config?.saleable !== undefined"
              v-model="updateForm.config.saleable"
              :true-value="true"
              :false-value="false"
              inset
              color="warning"
              :label="updateForm.config?.saleable ? 'Ya, dijual' : 'Tidak dijual'"
            />
          </VCol>

          <VCol
            v-if="updateForm.config?.saleable"
            cols="12"
            md="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Tampil di POS?</label>
            <VSwitch
              v-if="updateForm.config?.showInPos !== undefined"
              v-model="updateForm.config.showInPos"
              :true-value="true"
              :false-value="false"
              inset
              color="warning"
              :label="updateForm.config?.showInPos ? 'Ya' : 'Tidak'"
            />
          </VCol>

          <VCol
            v-if="updateForm.config?.saleable"
            cols="12"
            md="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Cara Pemenuhan Penjualan</label>
            <VSelect
              v-if="updateForm.config?.saleFulfillmentMode !== undefined"
              v-model="updateForm.config.saleFulfillmentMode"
              :items="saleFulfillmentModeList"
              variant="outlined"
              density="comfortable"
            />
            <div class="text-caption text-medium-emphasis mt-2">
              <div v-if="updateForm.config?.saleFulfillmentMode === 'FINISHED_STOCK'">
                Produk dijual dari stok yang tersedia di outlet.
              </div>
              <div v-else-if="updateForm.config?.saleFulfillmentMode === 'RECIPE'">
                Produk dibuat dari bahan saat dipesan (resep).
              </div>
              <div v-else>
                Produk non-stok seperti jasa atau biaya layanan.
              </div>
            </div>
          </VCol>
        </VRow>
      </template>

      <template v-if="updateForm.config?.saleFulfillmentMode === 'FINISHED_STOCK'">
        <VDivider class="my-6" />

        <!-- === Manajemen Stok === -->
        <VRow>
          <VCol
            cols="12"
            class="font-weight-bold"
          >
            Manajemen Stok
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Peringatan Minimum Stok</label>
            <AppTextField
              v-if="updateForm.config?.minStockAlert !== undefined"
              v-model="updateForm.config.minStockAlert"
              type="number"
              min="0"
              placeholder="Misal: 10"
              prepend-inner-icon="tabler-bell"
              variant="outlined"
            >
              <template #append-inner>
                <span>{{ defaultUnit?.unit?.code || 'unit' }}</span>
              </template>
            </AppTextField>
          </VCol>

          <VCol
            cols="12"
            md="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Izinkan Stok Minus?</label>
            <VSwitch
              v-if="updateForm.config?.allowNegativeStock !== undefined"
              v-model="updateForm.config.allowNegativeStock"
              :true-value="true"
              :false-value="false"
              inset
              color="error"
              :label="updateForm.config?.allowNegativeStock
                ? 'Boleh minus (kasir tetap bisa jual)'
                : 'Tidak boleh minus'"
            />
          </VCol>
        </VRow>
      </template>
    </VCardText>
  </VCard>
</template>
