<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useItemOutletStore } from '@/stores/inventory/itemOutletStore'
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
const selecetedItemIds = ref<string[]>(props.purchaseDirectItems.map(item => item.itemOutletId || ''))

// Emit changes to parent
watch(isItemModalVisible, val => emit('update:isItemModalVisible', val))

// Store
const itemOutletStore = useItemOutletStore()
const { fetchPaginate: fetchItemOutlets } = itemOutletStore
const { paginateData: itemsPaginate, requestQuery, isLoadingFetchData: isLoadingFetchDataItems, requestQuery: itemOutletRequestQuery } = storeToRefs(itemOutletStore)

// Search and query
const itemSearchQuery = ref('')

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(itemSearchQuery, val => {
  if (searchTimeout)
    clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    itemOutletRequestQuery.value.search = val
    itemOutletRequestQuery.value.page = 1
    fetchItemOutlets()
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
    selecetedItemIds.value = items.map(item => item.itemOutletId || '')
  },
  {
    deep: true,
  },
)

// Watch for page/perPage/orderBy changes to refetch
watch(
  () => [
    itemOutletRequestQuery.value.page,
    itemOutletRequestQuery.value.perPage,
    JSON.stringify(itemOutletRequestQuery.value.orderBy),
  ],
  () => {
    fetchItemOutlets()
  },
)

// Add selected items to form
function addSelectedItemsToForm() {
  const selectedIds = selecetedItemIds.value

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
      itemCode: item.code,
      itemName: item.displayName,
      unitPrice: item.salePrice,
      qty: 0,
      itemUnitId: item.itemUnit?.unitId || '',
      itemUnitName: item.itemUnit?.name || '',
    }))

  isItemModalVisible.value = false
  console.log({ ...keptItems, ...addedItems })

  // gabungkan yang masih ada + yang baru
  emit('submit', [...keptItems, ...addedItems])
}

// Initial fetch
fetchItemOutlets()
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
            v-model:page="itemOutletRequestQuery.page"
            v-model:items-per-page="itemOutletRequestQuery.perPage"
            v-model="selecetedItemIds"
            :headers="[
              { title: 'Produk', value: 'item.name', sortable: true },
              { title: 'Kategori', value: 'item.itemCategory.name', sortable: true },
              { title: 'Satuan', value: 'item.defaultUnit.unit.name', sortable: true },
              { title: 'Stok', value: 'stock', width: 100, sortable: true },
              { title: 'Harga Beli', value: 'avgPurchasePrice', width: 120, sortable: true },
              { title: 'Harga Jual', value: 'salePrice', width: 120, sortable: true },
            ]"
            :items="itemsPaginate?.data || []"
            :loading="isLoadingFetchDataItems"
            :items-length="itemsPaginate.total || 0"
            max-height="700px"
            multi-sort
            show-select
            select-all
            fixed-header
            show-expand
            item-value="itemOutletId"
            @update:sort-by="itemOutletStore.onSortBy"
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
                    {{ item.item?.code }}
                  </div>
                </div>
              </div>
            </template>
            <template #item.item.itemCategory.name="{ item }">
              <div class="text-medium-emphasis text-wrap">
                {{ item.item?.itemCategory?.name }}
              </div>
            </template>
            <template #item.item.defaultUnit.unit.name="{ item }">
              <div class="text-medium-emphasis">
                {{ item.item?.defaultItemUnit?.unit?.name }}
              </div>
            </template>
            <template #item.stock="{ item }">
              <div class="text-medium-emphasis text-right">
                {{ item.stock }}
              </div>
            </template>
            <template #item.avgPurchasePrice="{ item }">
              <div class="text-medium-emphasis text-right">
                {{ formatRupiah(item.avgPurchasePrice) }}
              </div>
            </template>
            <template #item.salePrice="{ item }">
              <div class="text-medium-emphasis text-right">
                {{ formatRupiah(item.salePrice) }}
              </div>
            </template>
            <template #expanded-row="{ item }">
              <tr>
                <td />
                <td colspan="7">
                  <VCard class="w-100">
                    <VCardText>
                      <ul>
                        <li>Outlet: {{ item.outlet?.name }}</li>
                      </ul>
                    </VCardText>
                  </VCard>
                </td>
              </tr>
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
          :disabled="selecetedItemIds.length === 0"
          @click="addSelectedItemsToForm"
        >
          Tambah {{ selecetedItemIds.length }} Produk
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
