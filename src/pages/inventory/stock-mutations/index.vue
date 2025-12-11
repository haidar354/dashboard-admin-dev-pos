<script setup lang="ts">
import { ref } from 'vue'
import { type VDataTable, VDataTableServer } from 'vuetify/lib/components/index.mjs'

import dayjs from 'dayjs'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { useStockMovementStore } from '@/stores/inventory/stockMovementStore'
import type { StockMovement } from '@/types/models/inventory/item-sku-stock/stock-movement'
import ItemModifierCreateDialog from '@/views/pages/product/item-modifiers/ItemModifierCreateDialog.vue'

definePage({
  meta: {
    name: 'Daftar Mutasi Stok',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const stockMovement = useStockMovementStore()
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  selectedStockMovement,

  // isLoadingExport,
} = storeToRefs(stockMovement)

const allHeaders: ReadonlyHeaders = [
  { title: 'Tanggal', key: 'movementDate', align: 'start', width: '12%' },

  { title: 'Tipe Mutasi', key: 'movementType', align: 'start', width: '10%' },

  // { title: 'Referensi', key: 'referenceId', align: 'start', minWidth: '140px' },
  { title: 'Keterangan', key: 'notes', align: 'start', minWidth: '160px' },

  { title: 'SKU', key: 'itemSku.code', align: 'start', width: '8%' },
  { title: 'Nama SKU', key: 'itemSku.displayName', align: 'start', minWidth: '160px' },

  { title: 'Jml Masuk', key: 'quantityIn', align: 'end', width: '8%' },
  { title: 'Jml Keluar', key: 'quantityOut', align: 'end', width: '8%' },

  { title: 'Outlet', key: 'outlet.name', align: 'start', width: '14%' },

  { title: 'Aksi', key: 'actions', align: 'center', width: '6%', sortable: false },
]

const visibleColumns = ref<string[]>([
  'movementDate',
  'movementType',

  // 'referenceId',
  'itemSku.code',
  'itemSku.displayName',
  'quantityIn',
  'quantityOut',
  'actions',
])

const headers = computed<ReadonlyHeaders>(() =>
  allHeaders.filter(h => visibleColumns.value.includes(h.key as string)),
)

const movementTypeLabels: Record<string, string> = {
  PURCHASE_IN: 'Pembelian',
  PURCHASE_RETURN_OUT: 'Retur Pembelian Keluar',
  SALE_OUT: 'Penjualan Keluar',
  SALE_RETURN_IN: 'Retur Penjualan',
  TRANSFER_IN: 'Transfer Masuk',
  TRANSFER_OUT: 'Transfer Keluar',
  PRODUCED_IN: 'Produksi',
  WASTED_OUT: 'Stok Rusak',
  ADJUSTED_IN: 'Penyesuaian Stok Masuk',
  ADJUSTED_OUT: 'Penyesuaian Stok Keluar',
  TRANSIT_IN: 'Transit Masuk',
  TRANSIT_OUT: 'Transit Keluar',
}

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: StockMovement, event: MouseEvent | PointerEvent) => {
  selectedStockMovement.value = item
  openFromEvent(event)
}

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

const fetchPaginate = async () => {
  await stockMovement.fetchPaginate({
    include: ['itemSku', 'outlet'],
  })
}

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
</script>

<template>
  <ItemModifierCreateDialog />
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          Data Mutasi Stok
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
            <VSelect
              v-model="requestQuery.movementType"
              :items="Object.entries(movementTypeLabels).map(([value, title]) => ({ title, value }))"
              placeholder="Tipe Mutasi"
              dense
            />
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
        @update:sort-by="stockMovement.onSortBy"
      >
        <template #item="{ item }">
          <tr
            class="cursor-pointer"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          >
            <!-- SKU -->
            <td v-if="visibleColumns.includes('movementDate')">
              {{ dayjs(item.movementDate).format('DD MMM YYYY') || '-' }}
            </td>

            <!-- Nama SKU -->
            <td
              v-if="visibleColumns.includes('movementType')"
              style="min-width: 200px;"
            >
              <div class="font-weight-medium">
                {{ item.movementType ? movementTypeLabels[item.movementType] : '-' }}
              </div>
            </td>

            <!-- Tipe -->
            <td
              v-if="visibleColumns.includes('referenceId')"
              class="text-capitalize"
            >
              {{ item.referenceId || '-' }}
            </td>

            <!-- Kuantitas -->
            <td
              v-if="visibleColumns.includes('notes')"
              class="text-wrap"
            >
              {{ item.notes || '-' }}
            </td>

            <td v-if="visibleColumns.includes('itemSku.code')">
              {{ item.itemSku?.code || '-' }}
            </td>

            <td
              v-if="visibleColumns.includes('itemSku.displayName')"
              class="text-wrap"
            >
              {{ item.itemSku?.displayName || '-' }}
            </td>

            <td
              v-if="visibleColumns.includes('quantityIn')"
              class="text-right"
            >
              <VChip
                variant="flat"
                color="success"
                class="font-weight-bold"
              >
                {{ Number(item.quantityIn) ?? 0 }}
              </VChip>
            </td>

            <td
              v-if="visibleColumns.includes('quantityOut')"
              class="text-right"
            >
              <VChip
                variant="flat"
                color="error"
                class="font-weight-bold"
              >
                {{ Number(item.quantityOut) ?? 0 }}
              </VChip>
            </td>

            <td
              v-if="visibleColumns.includes('outlet.name')"
              class="text-wrap"
            >
              {{ item.outlet?.name || '-' }}
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
          v-if="selectedStockMovement"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
