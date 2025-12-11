<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { ref } from 'vue'
import { VAutocomplete, VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import type { DataTableHeader } from 'vuetify/lib/types.mjs'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { itemKinds } from '@/constants/product/item'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'
import { useItemSkuStore } from '@/stores/product/itemSkuStore'
import type { ItemSkuView } from '@/types/models/product/item'

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

const itemSkuStore = useItemSkuStore()
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
} = storeToRefs(itemSkuStore)

const {
  data: itemCategories,
  isLoadingFetchData: isLoadingFetchDataItemCategory,
} = storeToRefs(itemCategoryStore)

const { smAndDown } = useDisplay()

const headers = computed<DataTableHeader[]>(() => [
  { title: 'NO', key: 'index', align: 'center', width: '5%', sortable: false },
  { title: 'Nama SKU', key: 'displayName', align: 'start', width: '22%' },
  { title: 'Kode', key: 'code', align: 'start', width: '12%' },
  { title: 'Produk', key: 'item.name', align: 'start', width: '15%' },
  { title: 'Kategori', key: 'item.category.name', align: 'start', width: '12%' },
  { title: 'Unit', key: 'unit', align: 'start', width: '8%' },
  { title: 'Harga', key: 'price', align: 'end', width: '10%' }, // 🔹 satu kolom universal
  { title: 'Tampil di POS', key: 'config.showInPos', align: 'center', width: '8%', sortable: false },
  { title: 'Status', key: 'isActive', align: 'center', width: '6%', sortable: false },
  { title: 'Aksi', key: 'actions', align: 'center', width: '6%', sortable: false },
])

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()
const selectedItem = ref<ItemSkuView | null>(null)

const onRowClick = (item: ItemSkuView, event: MouseEvent | PointerEvent) => {
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

  const includes = ['item.category', 'item.image', 'itemUnit.unit', 'price']

  const filters: Record<string, any> = {}

  if (outletId) {
    includes.push('override')
    filters.outletId = outletId
  }

  await itemSkuStore.fetchPaginate({
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
              @submit.prevent="itemSkuStore.applyFilter()"
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
                    @click="itemSkuStore.resetFilter()"
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
        @update:sort-by="itemSkuStore.onSortBy"
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

            <!-- #2 NAMA SKU -->
            <td class="text-start">
              <div class="font-weight-medium">
                {{ item.displayName }}
              </div>
            </td>

            <!-- #3 KODE -->
            <td class="text-start">
              <span class="text-body-2">{{ item.code || '-' }}</span>
            </td>

            <!-- #4 PRODUK -->
            <td class="text-start">
              <span class="text-body-2">{{ item.item?.name || '-' }}</span>
            </td>

            <!-- #5 KATEGORI -->
            <td class="text-start">
              <VChip
                size="small"
                variant="outlined"
                color="secondary"
              >
                {{ item.item?.category?.name || '-' }}
              </VChip>
            </td>

            <!-- #6 UNIT (bisa dari variantUnit atau itemUnit langsung) -->
            <td class="text-start">
              {{
                item.variantUnit?.itemUnit?.unit?.name
                  || item.itemUnit?.unit?.name
                  || '-'
              }}
            </td>

            <!-- #7 HARGA -->
            <td class="text-end">
              <span v-if="item.price">
                {{ formatRupiah(item.price.price) }}
              </span>

              <span
                v-else
                class="text-grey"
              >-</span>
            </td>

            <!-- #8 TAMPIL DI POS -->
            <td class="text-center">
              <VChip
                size="small"
                variant="tonal"
                :color="item.override?.showInPos || item.showInPos ? 'success' : 'error'"
              >
                {{ item.override?.showInPos || item.showInPos ? 'Ya' : 'Tidak' }}
              </VChip>
            </td>

            <!-- #9 STATUS -->
            <td class="text-center">
              <VChip
                size="small"
                variant="tonal"
                :color="item.override?.isActive ?? item.isActive ? 'success' : 'error'"
                :icon="(item.override?.isActive ?? item.isActive) ? 'tabler-check' : 'tabler-x'"
              >
                {{ (item.override?.isActive ?? item.isActive) ? 'Aktif' : 'Nonaktif' }}
              </VChip>
            </td>

            <!-- #10 AKSI -->
            <td class="text-center">
              <VBtn
                icon="tabler-dots-vertical"
                variant="text"
                density="comfortable"
                @click="onRowClick(item, $event)"
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
            @click="itemSkuStore.onDeleteItem(selectedItem)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
