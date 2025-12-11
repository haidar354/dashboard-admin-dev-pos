<!-- eslint-disable indent -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { VIcon } from 'vuetify/components/VIcon'
import { useItemCreate } from '@/composables/product/useItemCreate'

const { defaultUnit, createForm, enableBom } = useItemCreate()

// === OPTION LISTS ===
const manufacturingSourceList = computed(() => {
  if (createForm.value?.kind === 'service') {
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
  switch (createForm.value?.config?.manufacturingSource) {
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
  if (createForm.value?.kind === 'service')
    return [{ title: 'Non Stok (jasa atau layanan)', value: 'NONE' }]
  else if (createForm.value?.kind === 'material')
    return [{ title: 'Non Stok (bahan baku)', value: 'NONE' }]

  if (createForm.value?.config?.manufacturingSource === 'PURCHASED')
    return [{ title: 'Produk Siap Jual (stok hasil pembelian)', value: 'FINISHED_STOCK' }]

  if (createForm.value?.config?.manufacturingSource === 'NONE')
    return [{ title: 'Non Stok (jual tanpa bahan)', value: 'NONE' }]

  return [
    { title: 'Produk Siap Jual (stok jadi)', value: 'FINISHED_STOCK' },

  ]
})

// === WATCHERS ===

// Jenis produk → default pengaturan
watch(
  () => createForm.value.kind,
  kind => {
    if (createForm.value?.config) {
      switch (kind) {
        case 'product':
          createForm.value!.config!.manufacturingSource = 'NONE'
          createForm.value!.config!.saleable = true
          createForm.value!.config!.manageStock = true
          createForm.value!.config!.showInPos = true
          break
        case 'material':
          createForm.value!.config!.manufacturingSource = 'NONE'
          createForm.value!.config!.saleable = false
          createForm.value!.config!.showInPos = false
          break
        case 'service':
          createForm.value!.config!.manufacturingSource = 'NONE'
          createForm.value!.config!.saleable = true
          createForm.value!.config!.manageStock = false
          createForm.value!.config!.showInPos = true
          break
      }
    }
  },
  { immediate: true },
)

// manufacturingSource → atur turunan lainnya
watch(
  () => createForm.value?.config?.manufacturingSource,
  src => {
    if (createForm.value?.config) {
      if (src === 'NONE') {
        createForm.value!.config!.sourcingSitePolicy = 'EITHER'
        createForm.value!.config!.saleFulfillmentMode = 'NONE'
        createForm.value!.config!.manageStock = false
      }
      else {
        createForm.value!.config!.sourcingSitePolicy = 'EITHER'
        createForm.value!.config!.saleFulfillmentMode = 'FINISHED_STOCK'
        createForm.value!.config!.manageStock = true
      }
    }
  },
  { immediate: true },
)

// saleFulfillmentMode → sinkron stok
watch(
  () => createForm.value?.config?.saleFulfillmentMode,
  mode => {
    createForm.value!.config!.manageStock = (mode === 'FINISHED_STOCK')
    if (mode === 'RECIPE') {
      createForm.value.config!.recipePolicy = 'ITEM_BOM_ONLY'
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
      <template v-if="['product', 'material'].includes(createForm.kind)">
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
              v-if="createForm.config?.manufacturingSource"
              v-model="createForm.config.manufacturingSource"
              :items="manufacturingSourceList"
              variant="outlined"
              density="comfortable"
            />
          </VCol>

          <VCol
            v-if="createForm.config?.manufacturingSource !== 'NONE'"
            cols="12"
            md="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">{{ createForm.config?.manufacturingSource === 'PURCHASED' ? 'Dibeli Oleh' : 'Lokasi Produksi' }}</label>
            <VSelect
              v-if="createForm.config?.sourcingSitePolicy"
              v-model="createForm.config.sourcingSitePolicy"
              :items="sourcingSitePolicyList"
              variant="outlined"
              density="comfortable"
            />
          </VCol>
        </VRow>
      </template>

      <template v-if="['product', 'service'].includes(createForm.kind)">
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
            cols="6"
            md="3"
            lg="2"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Dapat dijual?</label>
            <VSwitch
              v-if="createForm.config?.saleable !== undefined"
              v-model="createForm.config.saleable"
              :true-value="true"
              :false-value="false"
              inset
              color="warning"
              :label="createForm.config?.saleable ? 'Ya, dijual' : 'Tidak dijual'"
            />
          </VCol>

          <VCol
            v-if="createForm.config?.saleable"
            cols="6"
            md="3"
            lg="2"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Tampil di POS?</label>
            <VSwitch
              v-if="createForm.config?.showInPos !== undefined"
              v-model="createForm.config.showInPos"
              :true-value="true"
              :false-value="false"
              inset
              color="warning"
              :label="createForm.config?.showInPos ? 'Ya' : 'Tidak'"
            />
          </VCol>

          <VCol
            v-if="createForm.config?.saleable"
            cols="12"
            md="5"
            lg="4"
          >
            <label class="text-subtitle-2 font-weight-medium mb-2 d-block">Cara Pemenuhan</label>
            <VSelect
              v-if="createForm.config?.saleFulfillmentMode"
              v-model="createForm.config.saleFulfillmentMode"
              :items="saleFulfillmentModeList"
              variant="outlined"
              density="comfortable"
            />
            <div class="text-caption text-medium-emphasis mt-2">
              <div v-if="createForm.config?.saleFulfillmentMode === 'FINISHED_STOCK'">
                Produk dijual dari stok yang tersedia di outlet.
              </div>
              <div v-else-if="createForm.config?.saleFulfillmentMode === 'RECIPE'">
                Produk dibuat dari bahan saat dipesan (resep).
              </div>
              <div v-else>
                Produk non-stok seperti jasa atau biaya layanan.
              </div>
            </div>
          </VCol>
        </VRow>
      </template>

      <template v-if="createForm.config?.saleFulfillmentMode === 'FINISHED_STOCK'">
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
              v-if="createForm.config?.minStockAlert !== undefined"
              v-model="createForm.config.minStockAlert"
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
              v-if="createForm.config?.allowNegativeStock !== undefined"
              v-model="createForm.config.allowNegativeStock"
              :true-value="true"
              :false-value="false"
              inset
              color="error"
              :label="createForm.config?.allowNegativeStock
                ? 'Boleh minus (kasir tetap bisa jual)'
                : 'Tidak boleh minus'"
            />
          </VCol>
        </VRow>
      </template>
    </VCardText>
  </VCard>
</template>
