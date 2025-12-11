<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useItemSkuStore } from '@/stores/product/itemSkuStore'
import type { PurchaseDirectItemForm } from '@/types/models/purchase/purchase-direct'

// Props
const props = defineProps<{
  isItemModalVisible: boolean
  purchaseDirectItems: PurchaseDirectItemForm[]
  outletId: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:isItemModalVisible', value: boolean): void
  (e: 'submit', value: PurchaseDirectItemForm[]): void
}>()

// Local refs for v-model
const isItemModalVisible = ref(props.isItemModalVisible)
const selecetedItemSkuIds = ref<string[]>(props.purchaseDirectItems.map(item => item.itemSkuId || ''))

// Emit changes to parent
watch(isItemModalVisible, val => emit('update:isItemModalVisible', val))

// Store
const itemSkuStore = useItemSkuStore()
const { fetchPaginate: fetchItemSkus } = itemSkuStore
const { paginateData: itemsPaginate, requestQuery, isLoadingFetchData: isLoadingFetchDataItems, requestQuery: itemSkuRequestQuery } = storeToRefs(itemSkuStore)

// Search and query
const itemSearchQuery = ref('')

const fetchItemSkuPaginate = async () => {
  await fetchItemSkus({
    include: [
      'item',
      'item.category',
      'itemUnit.unit',
      'cost',
      'price',
    ],
    filter: {
      outletId: props.outletId,
    },
  })
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(itemSearchQuery, val => {
  if (searchTimeout)
    clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    itemSkuRequestQuery.value.search = val
    itemSkuRequestQuery.value.page = 1
    fetchItemSkuPaginate()
  }, 500)
})

// Watch for prop changes to update local refs
watch(
  () => props.isItemModalVisible,
  val => { isItemModalVisible.value = val },
)
watch(
  () => props.outletId,
  val => { requestQuery.value.outletId = val },
  {
    immediate: true,
  },
)
watch(
  () => props.purchaseDirectItems,
  items => {
    selecetedItemSkuIds.value = items.map(item => item.itemSkuId || '')
  },
  {
    deep: true,
  },
)

// Watch for page/perPage/orderBy changes to refetch
watch(
  () => [
    itemSkuRequestQuery.value.page,
    itemSkuRequestQuery.value.perPage,
    JSON.stringify(itemSkuRequestQuery.value.orderBy),
  ],
  () => {
    fetchItemSkuPaginate()
  },
)

// Add selected items to form
function addSelectedItemsToForm() {
  const selectedIds = selecetedItemSkuIds.value

  // keep yang masih dipilih
  const keptItems = props.purchaseDirectItems.filter(item =>
    selectedIds.includes(item.itemSkuId || ''),
  )

  // tambahkan item baru (yang dipilih tapi belum ada di keptItems)
  const addedItems: PurchaseDirectItemForm[] = itemsPaginate.value.data
    .filter(item => selectedIds.includes(item.itemSkuId))
    .filter(item => !keptItems.some(i => i.itemSkuId === item.itemSkuId))
    .map(item => ({
      itemSkuId: item.itemSkuId,
      itemName: item.displayName,
      itemCode: item.code,
      unitPrice: item.cost?.lastCost || 0,
      qty: 0,
      lineTotal: 0,
      itemUnitId: item.itemUnit?.itemUnitId || '',
      itemUnitName: item.itemUnit?.unit?.name || '',
    }))

  isItemModalVisible.value = false

  // gabungkan yang masih ada + yang baru
  emit('submit', [...keptItems, ...addedItems])
}

// Initial fetch
fetchItemSkuPaginate()
</script>

<template>
  <VDialog
    v-model="isItemModalVisible"
    max-width="1200px"
    persistent
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VIcon
            icon="tabler-package"
            class="me-2"
            color="primary"
          />
          Pilih Produk
        </div>
        <VBtn
          icon="tabler-x"
          variant="text"
          @click="isItemModalVisible = false"
        />
      </VCardTitle>

      <VCardText>
        <!-- Search -->
        <VRow class="mb-4">
          <VCol cols="12">
            <AppTextField
              v-model="itemSearchQuery"
              placeholder="Cari produk..."
              prepend-inner-icon="tabler-search"
              variant="outlined"
              clearable
            />
          </VCol>
        </VRow>

        <!-- Items Table -->
        <div>
          <VDataTableServer
            v-model:page="itemSkuRequestQuery.page"
            v-model:items-per-page="itemSkuRequestQuery.perPage"
            v-model="selecetedItemSkuIds"
            :headers="[
              { title: 'Produk', value: 'item.name', sortable: true },
              { title: 'Kategori', value: 'item.category.name', sortable: true },
              { title: 'Satuan', value: 'itemUnit.unit.name', sortable: true },
              { title: 'Stok', value: 'stock', width: 100, align: 'end', sortable: true },
              { title: 'Harga Beli', value: 'cost.lastCost', width: 150, align: 'end', sortable: true },
              { title: 'Harga Jual', value: 'price.price', width: 150, align: 'end', sortable: true },
            ]"
            :items="itemsPaginate?.data || []"
            :loading="isLoadingFetchDataItems"
            :items-length="itemsPaginate.meta?.total || 0"
            max-height="700px"
            multi-sort
            show-select
            select-all
            fixed-header
            item-value="itemSkuId"
            @update:sort-by="itemSkuStore.onSortBy"
          >
            <template #item.item.name="{ item }">
              <div class="d-flex align-center">
                <VAvatar
                  size="32"
                  color="primary"
                  class="me-3"
                >
                  <VIcon
                    icon="tabler-package"
                    size="16"
                  />
                </VAvatar>
                <div>
                  <div class="font-weight-medium text-wrap">
                    {{ item.item?.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.code }}
                  </div>
                </div>
              </div>
            </template>
            <template #item.item.category.name="{ item }">
              <div class="text-medium-emphasis text-wrap">
                {{ item.item?.category?.name }}
              </div>
            </template>
            <template #item.itemUnit.unit.name="{ item }">
              <div class="text-medium-emphasis">
                {{ item.itemUnit?.unit?.name }}
              </div>
            </template>
            <template #item.stock="{ item }">
              <div class="text-medium-emphasis text-right">
                {{ item.stock }}
              </div>
            </template>
            <template #item.cost.lastCost="{ item }">
              <div class="text-medium-emphasis text-right">
                {{ formatRupiah(item.cost?.lastCost || 0) }}
              </div>
            </template>
            <template #item.price.price="{ item }">
              <div class="text-medium-emphasis text-right">
                {{ formatRupiah(item.price?.price || 0) }}
              </div>
            </template>
            <template #loading>
              <div class="text-center py-8">
                <VProgressCircular
                  color="primary"
                  indeterminate
                />
                <p class="text-body-2 mt-2">
                  Memuat produk...
                </p>
              </div>
            </template>
            <template #no-data>
              <div class="text-center py-8">
                <VIcon
                  icon="tabler-package-off"
                  size="64"
                  color="disabled"
                  class="mb-4"
                />
                <h6 class="text-h6 mb-2">
                  Tidak ada produk
                </h6>
                <p class="text-body-2 text-medium-emphasis">
                  Tidak ada produk yang ditemukan
                </p>
              </div>
            </template>
          </VDataTableServer>
        </div>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          color="error"
          variant="outlined"
          @click="isItemModalVisible = false"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="selecetedItemSkuIds.length === 0"
          @click="addSelectedItemsToForm"
        >
          Tambah {{ selecetedItemSkuIds.length }} Produk
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
