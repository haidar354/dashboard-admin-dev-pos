<script setup lang="ts">
import { ref } from 'vue'
import { type VDataTable, VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { useItemSkuStockStore } from '@/stores/inventory/itemSkuStockStore'
import type { ItemSkuStock } from '@/types/models/inventory/item-sku-stock/item-sku-stock'
import ItemModifierCreateDialog from '@/views/pages/product/item-modifiers/ItemModifierCreateDialog.vue'
import StockCardDialog from '@/components/inventory/StockCardDialog.vue'

import { useOutletSidebarStore } from '@/stores/outletSidebarStore'

definePage({
  meta: {
    name: 'Daftar Stok',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const itemStockStore = useItemSkuStockStore()
const outletStore = useOutletSidebarStore()
const search = ref('')


const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  selectedItemSkuStock,

  // isLoadingExport,
} = storeToRefs(itemStockStore)

const allHeaders: ReadonlyHeaders = [
  { title: 'SKU', key: 'code', align: 'start', width: '8%', sortable: false },
  { title: 'Nama SKU', key: 'displayName', align: 'start', minWidth: '200px' },
  { title: 'Tipe', key: 'item.kind', align: 'start', width: '10%' },
  { title: 'Awal', key: 'stock.openingQty', align: 'end', width: '8%' },
  { title: 'Masuk', key: 'stock.inQty', align: 'end', width: '8%' },
  { title: 'Keluar', key: 'stock.outQty', align: 'end', width: '8%' },
  { title: 'Terproduksi', key: 'stock.producedQty', align: 'end', width: '10%' },
  { title: 'Terjual', key: 'stock.soldQty', align: 'end', width: '8%' },
  { title: 'Terbuang', key: 'stock.wastedQty', align: 'end', width: '8%' },
  { title: 'Transit', key: 'stock.transitQty', align: 'end', width: '8%' },
  { title: 'Akhir', key: 'stock.closingQty', align: 'end', width: '8%' },
  { title: 'Satuan', key: 'itemUnit.unit.name', align: 'center', width: '8%' },
  { title: 'Aksi', key: 'actions', align: 'center', width: '6%', sortable: false },
]

const visibleColumns = ref<string[]>([
  'code',
  'displayName',
  'item.kind',
  'stock.openingQty',
  'stock.inQty',
  'stock.outQty',
  'stock.closingQty',
  'itemUnit.unit.name',
  'actions',
])

const headers = computed<ReadonlyHeaders>(() =>
  allHeaders.filter(h => visibleColumns.value.includes(h.key as string)),
)

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: ItemSkuStock, event: MouseEvent | PointerEvent) => {
  selectedItemSkuStock.value = item
  openFromEvent(event)
}

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

const fetchPaginate = async () => {
  await itemStockStore.fetchPaginate({
    include: [],
  })
}

const { data: outlets, isLoadingFetchData: isLoadingOutlets } = storeToRefs(outletStore)

onMounted(async () => {
  await fetchPaginate()
})

watch(
  () => requestQuery,
  async () => {
    await fetchPaginate()
  },
  { deep: true },
)

const isStockCardVisible = ref(false)
const selectedSkuForCard = ref<ItemSkuStock | null>(null)

const openStockCard = (item: ItemSkuStock) => {
  selectedSkuForCard.value = item
  isStockCardVisible.value = true
}
</script>

<template>
  <ItemModifierCreateDialog />
  <StockListDialog
    v-if="selectedSkuForCard"
    v-model="isStockCardVisible"
    :item-sku-id="selectedSkuForCard.itemSkuId || ''"
    :item-sku-code="selectedSkuForCard.code || ''"
    :item-sku-name="selectedSkuForCard.displayName || ''"
    :date-range="requestQuery.dateRange || ''"
  />
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          Data Daftar Stok
        </span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end">
            <!--
              <VBtn
              v-if="($can('manage', 'Lihat Produk Ekstra') || $can('manage', 'default'))"
              color="primary"
              variant="outlined"
              :loading="isLoadingExport"
              @click="modifierStore.export()"
              >
              <VIcon
              start
              icon="tabler-screen-share"
              />
              Export
              </VBtn>
            -->

            <!--
              <VBtn
              v-if="$can('manage', 'Tambah Produk') || $can('manage', 'default')"
              class="ms-2"
              color="primary"
              variant="elevated"
              :to="{
              name: 'product-item-modifiers-create',
              }"
              >
              <VIcon
              start
              icon="tabler-plus"
              />
              Tambah Data
              </VBtn>
            -->
          </div>
        </div>
      </VCardText>
      <VDivider />
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            class="d-flex flex-row flex-wrap gap-3"
          >
            <VAutocomplete
              v-model="requestQuery.perPage"
              :items="perPages"
              hide-details
              dense
              outlined
              style="max-inline-size: 8rem;min-inline-size: 5rem;"
            />

            <VSpacer />

            <VSpacer />

            <VSpacer />

            <!--
              <VBtn
              variant="outlined"
              append-icon="tabler-filter"
              @click="isFilterVisible = !isFilterVisible"
              >
              Filter
              </VBtn>
            -->
            <div>
              <AppDateTimePicker
                v-model="requestQuery.dateRange"
                dense
                outlined
                hide-details
                placeholder="Pilih Rentang Tanggal"
                style="min-width: 260px;"
                prepend-inner-icon="tabler-calendar"
                :config="{
                  dateFormat: 'Y-m-d',
                  allowInput: true,
                  enableTime: false,
                  time_24hr: true,
                  altFormat: 'd M Y',
                  altInput: true,
                  mode: 'range',
                }"
              />
            </div>
            <VMenu :close-on-content-click="false">
              <template #activator="{ props }">
                <VBtn
                  v-bind="props"
                  prepend-icon="tabler-columns"
                  variant="outlined"
                >
                  Kolom
                </VBtn>
              </template>

              <VList>
                <VListItem>
                  <VCheckbox
                    label="Pilih Semua"
                    hide-details
                    density="compact"
                    :model-value="visibleColumns.length === allHeaders.length"
                    @update:model-value="val => visibleColumns = val ? allHeaders.map(h => h.key as string) : []"
                  />
                </VListItem>

                <VDivider class="my-1" />

                <VListItem
                  v-for="h in allHeaders"
                  :key="h.key"
                  density="compact"
                >
                  <VCheckbox
                    v-model="visibleColumns"
                    :label="h.title"
                    :value="h.key"
                    hide-details
                  />
                </VListItem>
              </VList>
            </VMenu>
            <AppTextField
              v-model="search"
              class="ms-0 flex-1-1-100 flex-sm-fill"
              placeholder="Cari ..."
              append-inner-icon="tabler-search"
              single-line
              hide-details
              dense
              outlined
            />
          </VCol>
        </VRow>
      </VCardText>
      <VDataTableServer
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoadingFetchData"
        loading-text="Memuat data ..."
        class="text-no-wrap"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        :sort-by="[{ key: requestQuery.orderField || '', order: requestQuery.orderDirection || 'asc' }]"
        @update:page="requestQuery.page = $event"
        @update:sort-by="itemStockStore.onSortBy"
      >
        <template #item="{ item }">
          <tr
            class="cursor-pointer"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          >
            <!-- SKU -->
            <td v-if="visibleColumns.includes('code')">
              {{ item.code || '-' }}
            </td>

            <!-- Nama SKU -->
            <td
              v-if="visibleColumns.includes('displayName')"
              style="min-width: 200px;"
            >
              <div class="font-weight-medium">
                {{ item.displayName || '-' }}
              </div>
              <div
                v-if="item.item?.name"
                class="text-body-2 text-muted"
              >
                {{ item.item?.name }}
              </div>
            </td>

            <!-- Tipe -->
            <td
              v-if="visibleColumns.includes('item.kind')"
              class="text-capitalize"
            >
              {{ item.itemType || '-' }}
            </td>

            <!-- Kuantitas -->
            <td
              v-if="visibleColumns.includes('stock.openingQty')"
              class="text-right"
            >
              {{ Number(item?.openingQty) ?? 0 }}
            </td>

            <td
              v-if="visibleColumns.includes('stock.inQty')"
              class="text-right"
            >
              {{ Number(item.inQty) ?? 0 }}
            </td>

            <td
              v-if="visibleColumns.includes('stock.outQty')"
              class="text-right"
            >
              {{ Number(item.outQty) ?? 0 }}
            </td>

            <td
              v-if="visibleColumns.includes('stock.producedQty')"
              class="text-right"
            >
              {{ Number(item.producedQty) ?? 0 }}
            </td>

            <td
              v-if="visibleColumns.includes('stock.soldQty')"
              class="text-right"
            >
              {{ Number(item.soldQty) ?? 0 }}
            </td>

            <td
              v-if="visibleColumns.includes('stock.wastedQty')"
              class="text-right"
            >
              {{ Number(item.wastedQty) ?? 0 }}
            </td>

            <td
              v-if="visibleColumns.includes('stock.transitQty')"
              class="text-right"
            >
              {{ Number(item.transitQty) ?? 0 }}
            </td>

            <td
              v-if="visibleColumns.includes('stock.closingQty')"
              class="text-right font-weight-medium text-primary"
            >
              {{ Number(item.closingQty) ?? 0 }}
            </td>

            <!-- Satuan -->
            <td
              v-if="visibleColumns.includes('itemUnit.unit.name')"
              class="text-center"
            >
              {{ item.unitName || '-' }}
            </td>

            <!-- Aksi -->
            <td
              v-if="visibleColumns.includes('actions')"
              class="text-center"
            >
              <VBtn
                icon="tabler-dots-vertical"
                variant="text"
                color="secondary"
                size="small"
                @click.stop="onRowClick(item, $event)"
                @contextmenu.prevent="openFromEvent"
              />
            </td>
          </tr>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-package-off"
              size="64"
              color="disabled"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              Tidak ada data produk
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Belum ada produk yang ditambahkan atau sesuai dengan filter pencarian
            </p>
            <VBtn
              v-if="$can('manage', 'Tambah Produk') || $can('manage', 'default')"
              color="primary"
              variant="elevated"
              :to="{ name: 'product-item-modifiers-create' }"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Produk Ekstra Pertama
            </VBtn>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-end  mt-2">
              <VPagination
                v-model="requestQuery.page"
                :show-first-last-page="false"
              >
                <template #prev>
                  <VBtn
                    icon="tabler-chevron-left"
                    variant="tonal"
                    :disabled="(requestQuery.page || 0) <= 1"
                    @click="requestQuery.page = (requestQuery.page || 1) - 1"
                  />
                </template>
                <template #next>
                  <VBtn
                    icon="tabler-chevron-right"
                    variant="tonal"
                    :disabled="(paginateData.meta?.hasMore) === false"
                    @click="requestQuery.page = (requestQuery.page || 1) + 1"
                  />
                </template>
              </VPagination>
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
      <VMenu
        v-model="isOpen"
        :target="target"
        location="bottom start"
        location-strategy="connected"
        scroll-strategy="reposition"
        :offset="0"
        :close-on-content-click="true"
        @after-leave="onAfterLeave"
      >
        <VList
          v-if="selectedItemSkuStock"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            @click="openStockCard(selectedItemSkuStock)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
