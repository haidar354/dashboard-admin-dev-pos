<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useItemSkuStockStore } from '@/stores/inventory/itemSkuStockStore'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  itemSkuId: {
    type: String,
    required: true,
  },
  itemSkuCode: {
    type: String,
    default: '',
  },
  itemSkuName: {
    type: String,
    default: '',
  },
  dateRange: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const itemStockStore = useItemSkuStockStore()
const outletSidebarStore = useOutletSidebarStore()

const { stockByOutletData, isLoadingFetchData } = storeToRefs(itemStockStore)

const search = ref<string | undefined>(undefined)

const isVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const headers = [
  { title: 'Outlet', key: 'name', sortable: true },
  { title: 'Awal', key: 'openingQty', align: 'end', sortable: false },
  { title: 'Masuk', key: 'inQty', align: 'end', sortable: false },
  { title: 'Keluar', key: 'outQty', align: 'end', sortable: false },
  { title: 'Terproduksi', key: 'producedQty', align: 'end', sortable: false },
  { title: 'Terjual', key: 'soldQty', align: 'end', sortable: false },
  { title: 'Terbuang', key: 'wastedQty', align: 'end', sortable: false },
  { title: 'Penyesuaian', key: 'adjustedQty', align: 'end', sortable: false },
  { title: 'Transit', key: 'transitQty', align: 'end', sortable: false },
  { title: 'Akhir', key: 'closingQty', align: 'end', sortable: false },
] as any

const fetchData = async () => {
  if (!props.itemSkuId)
    return

  await itemStockStore.fetchStockByOutlet({
    itemSkuId: props.itemSkuId,

    // Fix: pass outletId if search is selected, otherwise empty string
    filter: search.value ? { outletId: search.value } : undefined,
    dateRange: props.dateRange,
  })
}

// Initialize data if already visible on mount
onMounted(() => {
  if (isVisible.value) {
    itemStockStore.requestQuery.page = 1
    fetchData()
  }

  // Initialize outlet list for autocomplete
  outletSidebarStore.fetchAllData()
})

watch(isVisible, async val => {
  if (val) {
    itemStockStore.requestQuery.page = 1
    fetchData()
  }
})

watch(search, () => {
  itemStockStore.requestQuery.page = 1
  fetchData()
})

// Watch for dateRange prop changes to re-fetch if dialog is open
watch(() => props.dateRange, () => {
  if (isVisible.value) {
    itemStockStore.requestQuery.page = 1
    fetchData()
  }
})
</script>

<template>
  <VDialog
    v-model="isVisible"
    width="1200"
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <div>
          <span class="text-h6">Daftar Stok Semua Outlet</span>
          <div class="text-subtitle-2 text-medium-emphasis mt-1">
            SKU : {{ itemSkuCode }} &nbsp; Nama Produk : {{ itemSkuName }}
          </div>
        </div>
        <VBtn
          icon
          variant="text"
          @click="isVisible = false"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VRow class="mb-4">
          <VCol
            cols="12"
            md="4"
          >
            <AppAutocomplete
              v-model="search"
              :items="outletSidebarStore.data"
              item-title="name"
              item-value="outletId"
              placeholder="Cari Outlet ..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
              prepend-inner-icon="tabler-search"
            />
          </VCol>
        </VRow>

        <VDataTableServer
          class="border rounded text-no-wrap"
          :headers="headers"
          :items="stockByOutletData.data"
          :loading="isLoadingFetchData"
          :items-length="stockByOutletData.meta?.total || 0"
          :items-per-page="itemStockStore.requestQuery.perPage"
          @update:page="itemStockStore.requestQuery.page = $event; fetchData()"
          @update:items-per-page="itemStockStore.requestQuery.perPage = $event; fetchData()"
        >
          <template #item.openingQty="{ item }">
            {{ Number(item.openingQty || 0) }}
          </template>
          <template #item.inQty="{ item }">
            {{ Number(item.inQty || 0) }}
          </template>
          <template #item.outQty="{ item }">
            {{ Number(item.outQty || 0) }}
          </template>
          <template #item.producedQty="{ item }">
            {{ Number(item.producedQty || 0) }}
          </template>
          <template #item.soldQty="{ item }">
            {{ Number(item.soldQty || 0) }}
          </template>
          <template #item.wastedQty="{ item }">
            {{ Number(item.wastedQty || 0) }}
          </template>
          <template #item.adjustedQty="{ item }">
            {{ Number(item.adjustedQty || 0) }}
          </template>
          <template #item.transitQty="{ item }">
            {{ Number(item.transitQty || 0) }}
          </template>
          <template #item.closingQty="{ item }">
            <span class="font-weight-bold text-primary">
              {{ Number(item.closingQty || 0) }}
            </span>
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>
  </VDialog>
</template>
