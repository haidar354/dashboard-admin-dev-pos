<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { ref } from 'vue'
import { VAutocomplete, VDataTableServer, VImg } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import type { DataTableHeader } from 'vuetify/lib/types.mjs'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { itemKinds, manufacturingSourceLabel, saleFulfillmentLabel } from '@/constants/product/item'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'
import { useItemStore } from '@/stores/product/itemStore'
import type { Item } from '@/types/models/product/item'

definePage({
  meta: {
    name: 'Produk',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

dayjs.locale(id)

const itemStore = useItemStore()
const itemCategoryStore = useItemCategoryStore()
const outletStore = useOutletSidebarStore()
const { getSelectedOutletId } = storeToRefs(outletStore)
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  isFilterVisible,
  additionalFilter,

  // isLoadingExport,
} = storeToRefs(itemStore)

const {
  data: itemCategories,
  isLoadingFetchData: isLoadingFetchDataItemCategory,
} = storeToRefs(itemCategoryStore)

const { smAndDown } = useDisplay()

const headers = computed<DataTableHeader[]>(() => {
  const base: DataTableHeader[] = [
    { title: 'NO', key: 'index', align: 'center', width: '5%', sortable: false },
    { title: 'Nama Produk', key: 'name', align: 'start', width: '20%' },
    { title: 'Kategori', key: 'category.name', align: 'start', width: '15%' },
    { title: 'Sumber Produk', key: 'defaultManufacturingSource', align: 'start', width: '12%' },
    { title: 'Mode Penjualan', key: 'defaultSaleFulfillmentMode', align: 'start', width: '12%' },
    { title: 'Tampil di POS', key: 'config.showInPos', align: 'center', width: '10%', sortable: false },
    { title: 'Status', key: 'isActive', align: 'center', width: '8%', sortable: false },
    { title: 'Aksi', key: 'actions', align: 'center', width: '6%', sortable: false },
  ]

  return base
})

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()
const selectedItem = ref<Item | null>(null)

const onRowClick = (item: Item, event: MouseEvent | PointerEvent) => {
  selectedItem.value = item
  openFromEvent(event)
}

watch(isFilterVisible, (newValue: boolean) => {
  if (newValue)
    itemCategoryStore.fetchAllData()
})

watch(getSelectedOutletId, (newValue: string | undefined) => {
  requestQuery.value.outletId = newValue || undefined
})

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

const fetchPaginate = async () => {
  const outletId = getSelectedOutletId.value

  const includes = ['category', 'image', 'sku', 'skusCount']

  const filters: Record<string, any> = {}

  if (outletId) {
    includes.push('sku.override')
    filters.outletId = outletId
  }

  await itemStore.fetchPaginate({
    include: includes,
    outletId: outletId || undefined,
  })
}

onMounted(async () => {
  await fetchPaginate()
  if (requestQuery.value?.search)
    search.value = requestQuery.value.search
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
  <div>
    <!-- Header Section with Loading -->
    <VCard
      class="mb-4"
      elevation="2"
    >
      <!-- Search and Filter Section with Loading -->
      <VCardText>
        <VSkeletonLoader
          v-if="isLoadingFetchData && !paginateData.data?.length"
          type="actions"
          class="mx-2"
        />
        <template v-else>
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
                prepend-inner-icon="tabler-list"
              />
              <VSpacer />

              <VSpacer />

              <VSpacer />

              <VAutocomplete
                v-model="requestQuery.itemCategoryId"
                :loading="isLoadingFetchDataItemCategory"
                :items="itemCategories"
                item-title="name"
                item-value="itemCategoryId"
                hide-details
                dense
                outlined
                style="max-inline-size: 14rem;min-inline-size: 10rem;"
                label="Kategori"
                clearable
              />

              <VSelect
                v-model="requestQuery.kind"
                :items="[
                  { title: 'Semua', value: '' },
                  { title: 'Produk', value: 'product' },
                  { title: 'Bahan', value: 'material' },
                  { title: 'Jasa', value: 'service' },
                ]"
                item-title="title"
                item-value="value"
                hide-details
                dense
                outlined
                style="max-inline-size: 14rem;min-inline-size: 10rem;"
                label="Jenis Produk"
                clearable
              />

              <VBtn
                variant="outlined"
                append-icon="tabler-filter"
                color="primary"
                @click="isFilterVisible = !isFilterVisible"
              >
                Filter
              </VBtn>

              <AppTextField
                v-model="search"
                class="ms-0 mt-sm-0 flex-1-1-100 flex-sm-fill"
                placeholder="Cari produk..."
                append-inner-icon="tabler-search"
                single-line
                hide-details
                dense
                outlined
                clearable
              />
            </VCol>
          </VRow>
        </template>
      </VCardText>
      <!-- Filter Section with Loading -->
      <VExpandTransition>
        <VCard
          v-if="isFilterVisible"
          class="ma-6"
          variant="outlined"
          elevation="1"
        >
          <template #title>
            <div class="d-flex align-center">
              <VIcon
                icon="tabler-filter"
                class="me-2"
                color="primary"
              />
              Filter Tambahan
            </div>
          </template>
          <template #append>
            <div class="mt-n4 me-n2">
              <IconBtn color="disabled">
                <VIcon
                  icon="tabler-x"
                  @click="isFilterVisible = false"
                />
              </IconBtn>
            </div>
          </template>
          <VCardText>
            <VSkeletonLoader
              v-if="isLoadingFetchDataItemCategory"
              type="list-item-two-line"
              class="mb-4"
            />
            <VForm
              v-else
              @submit.prevent="itemStore.applyFilter()"
            >
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Jenis</label>

                  <VAutocomplete
                    v-model="additionalFilter.kind"
                    :items="itemKinds"
                    item-title="title"
                    item-value="value"
                    prepend-inner-icon="tabler-box"
                    clearable
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Kategori</label>

                  <VAutocomplete
                    v-model="additionalFilter.itemCategoryId"
                    :items="itemCategories"
                    item-title="name"
                    item-value="itemCategoryId"
                    prepend-inner-icon="tabler-grid-dots"
                    :loading="isLoadingFetchDataItemCategory"
                    clearable
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Tampil Di POS?</label>
                  <VRadioGroup
                    v-model="additionalFilter.showInPos"
                    inline
                  >
                    <VRadio
                      label="Ya"
                      :value="true"
                    />
                    <VRadio
                      label="Tidak"
                      :value="false"
                    />
                  </VRadioGroup>
                </VCol>
                <VCol
                  cols="12"
                  class="d-flex justify-end"
                >
                  <VBtn
                    class="me-3"
                    color="error"
                    variant="outlined"
                    append-icon="tabler-reload"
                    @click="itemStore.resetFilter()"
                  >
                    Reset
                  </VBtn>
                  <VBtn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    append-icon="tabler-device-floppy"
                  >
                    Terapkan
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VExpandTransition>
      <!-- Data Table with Enhanced Loading -->
      <VDataTableServer
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoadingFetchData"
        loading-text="Memuat data produk..."
        class="text-wrap elevation-1"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        :sort-by="[{ key: requestQuery.orderField || '', order: requestQuery.orderDirection || 'asc' }]"
        @update:page="requestQuery.page = $event"
        @update:sort-by="itemStore.onSortBy"
      >
        <!-- Loading Skeleton for Table -->
        <template #loading>
          <div class="pa-4">
            <VSkeletonLoader
              v-for="n in 5"
              :key="n"
              type="table-row-divider"
              class="mb-2"
            />
          </div>
        </template>

        <template #item="{ index, item }">
          <tr
            class="cursor-pointer"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          >
            <!-- #1 NO -->
            <td class="text-center">
              <span class="text-body-2 font-weight-medium">
                {{ (paginateData.meta?.from || 0) + index }}
              </span>
            </td>

            <!-- #2 NAMA PRODUK -->
            <td style="min-width: 250px;">
              <div class="d-flex align-center">
                <VAvatar
                  size="32"
                  color="primary"
                  class="me-3"
                >
                  <VImg
                    v-if="item.image?.imageUrlSmall"
                    :src="item.image?.imageUrlSmall"
                    :alt="item.name"
                  />
                  <VIcon
                    v-else
                    icon="tabler-package"
                    size="16"
                  />
                </VAvatar>
                <div class="text-wrap">
                  <div class="font-weight-medium">
                    {{ item.name }}
                  </div>
                  <div class="d-flex gap-1 my-1">
                    <VChip
                      size="x-small"
                      color="primary"
                      variant="tonal"
                      class="me-1"
                    >
                      {{ item.skusCount }} SKU
                    </VChip>
                    <VChip
                      v-if="item.hasModifier"
                      size="x-small"
                      color="info"
                      variant="tonal"
                    >
                      Modifier
                    </VChip>
                  </div>
                </div>
              </div>
            </td>

            <!-- #3 KATEGORI -->
            <td>
              <VChip
                size="small"
                variant="outlined"
                color="secondary"
              >
                {{ item.category?.name || '-' }}
              </VChip>
            </td>

            <!-- #5 SUMBER PRODUKSI -->
            <td>
              <VChip
                size="small"
                variant="tonal"
                :color="{
                  IN_HOUSE: 'success',
                  PURCHASED: 'primary',
                  EITHER: 'warning',
                  NONE: 'secondary',
                }[item.manufacturingSource] || 'secondary'"
              >
                {{ manufacturingSourceLabel[item.manufacturingSource] || '-' }}
              </VChip>
            </td>

            <!-- #4 MODE PENJUALAN -->
            <td>
              <VChip
                size="small"
                variant="tonal"
                :color="{
                  RECIPE: 'success',
                  FINISHED_STOCK: 'primary',
                  EITHER: 'warning',
                  NONE: 'secondary',
                }[item.saleFulfillmentMode] || 'secondary'"
              >
                {{ saleFulfillmentLabel[item.saleFulfillmentMode] || '-' }}
              </VChip>
            </td>

            <!-- #6 (opsional) TAMPIL DI POS -->
            <td class="text-center">
              <VChip
                size="small"
                :color="item.sku?.override?.showInPos || item.sku?.showInPos || item?.showInPos ? 'success' : 'error'"
                variant="tonal"
              >
                {{ item.sku?.override?.showInPos || item.sku?.showInPos || item?.showInPos ? 'Ya' : 'Tidak' }}
              </VChip>
            </td>

            <!-- #8 STATUS -->
            <td class="text-center">
              <VChip
                :color="item.sku?.override?.isActive || item.sku?.isActive || item?.isActive ? 'success' : 'error'"
                :icon="item.sku?.override?.isActive || item.sku?.isActive || item?.isActive ? 'tabler-check' : 'tabler-x'"
                size="small"
                variant="tonal"
              >
                {{ item.sku?.override?.isActive || item.sku?.isActive || item?.isActive ? 'Aktif' : 'Nonaktif' }}
              </VChip>
            </td>

            <!-- #9 AKSI -->
            <td class="text-center">
              <VBtn
                icon="tabler-dots-vertical"
                variant="text"
                @click="onRowClick(item, $event)"
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
              :to="{ name: 'product-items-create' }"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Produk Pertama
            </VBtn>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-space-between align-center mt-2">
              <div class="text-body-2 text-medium-emphasis">
                Menampilkan {{ paginateData.meta?.from || 0 }} - {{ paginateData.meta?.to || 0 }} dari {{ paginateData.meta?.total || 0 }} produk
              </div>
              <VPagination
                v-model="requestQuery.page"
                :total-visible="smAndDown ? 3 : 5"
                :length="paginateData.meta?.lastPage || 0"
                color="primary"
                variant="elevated"
              />
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
          v-if="selectedItem"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            :to="{ name: 'product-items-item-id', params: { itemId: selectedItem?.itemId } }"
          />
          <VListItem
            title="Edit"
            prepend-icon="tabler-edit"
            :to="{ name: 'product-items-item-id-edit', params: { itemId: selectedItem?.itemId } }"
          />
          <VListItem
            title="Hapus"
            prepend-icon="tabler-trash"
            @click="itemStore.onDeleteItem(selectedItem)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
