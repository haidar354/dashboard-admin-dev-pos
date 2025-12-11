<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import { type VDataTable, VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { UNIT_METRICS } from '@/constants/product/unit'
import { useUnitStore } from '@/stores/product/unitStore'
import type { Unit } from '@/types/models/product/unit/unit'
import UnitDialog from '@/views/pages/product/units/UnitDialog.vue'

definePage({
  meta: {
    name: 'Satuan Produk',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const unitStore = useUnitStore()
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  isLoadingDelete,
  selectedUnit,

  // isLoadingExport,
} = storeToRefs(unitStore)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Kode', key: 'code', align: 'start', width: '10%' },
  { title: 'Nama', key: 'name', align: 'start' },
  { title: 'Metrik', key: 'metric', align: 'start', width: '10%' },
  { title: 'Total Produk', key: 'itemsCount', align: 'start', width: '10%' },
  { title: 'Dibuat Pada', key: 'createdAt', align: 'start', width: '10%' },
  { title: 'Aksi', key: 'Aksi', align: 'center', width: '5%', sortable: false },
]

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: Unit, event: MouseEvent | PointerEvent) => {
  selectedUnit.value = item
  openFromEvent(event)
}

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

onMounted(async () => {
  await unitStore.fetchPaginate()
  if (requestQuery.value?.search)
    search.value = requestQuery.value.search
})

watch(
  () => requestQuery,
  async () => {
    await unitStore.fetchPaginate()
  },
  { deep: true },
)
</script>

<template>
  <UnitDialog />
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          Data Satuan Produk
        </span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end">
            <!--
              <VBtn
              v-if="($can('manage', 'Lihat Satuan Produk') || $can('manage', 'default'))"
              color="primary"
              variant="outlined"
              :loading="isLoadingExport"
              @click="unitStore.export()"
              >
              <VIcon
              start
              icon="tabler-screen-share"
              />
              Export
              </VBtn>
            -->

            <VBtn
              v-if="$can('manage', 'Tambah Satuan Produk') || $can('manage', 'default')"
              class="ms-2"
              color="primary"
              @click="unitStore.openCreateDialog()"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Data
            </VBtn>
          </div>
        </div>
      </VCardText>
      <VDivider />
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            class="d-flex flex-row flex-wrap"
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
            <AppTextField
              v-model="search"
              class="ms-0 ms-sm-3 mt-3 mt-sm-0 flex-1-1-100 flex-sm-fill"
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
        @update:sort-by="unitStore.onSortBy"
      >
        <template #item="{ index, item }">
          <tr
            class="cursor-pointer"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          >
            <td>{{ (paginateData.meta?.from || 0) + index }}</td>
            <td>
              <div class="text-wrap">
                {{ item.code }}
              </div>
            </td>
            <td>
              <div class="text-wrap">
                {{ item.name }}
              </div>
            </td>
            <td>
              <div class="text-wrap">
                {{ UNIT_METRICS.find((metric) => metric.value === item.metric)?.title || item.metric || '-' }}
              </div>
            </td>
            <td>
              <div class="text-wrap">
                {{ item.itemsCount || 0 }} item
              </div>
            </td>
            <td>
              <div class="text-wrap">
                {{ dayjs(item.createdAt).format('DD-MM-YYYY HH:mm') }}
              </div>
            </td>
            <td>
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
          <VAlert
            dense
            color="light-secondary"
          >
            <VIcon>tabler-alert-triangle</VIcon>
            <div>Data tidak tersedia</div>
          </VAlert>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-end  mt-2">
              <VPagination
                v-model="requestQuery.page"
                :total-visible="smAndDown ? 3 : 5"
                :length="paginateData.meta?.lastPage || 0"
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
          v-if="selectedUnit"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            @click="unitStore.openDetailDialog(selectedUnit)"
          />
          <VListItem
            title="Edit"
            prepend-icon="tabler-edit"
            @click="unitStore.openEditDialog(selectedUnit)"
          />
          <VListItem
            title="Hapus"
            prepend-icon="tabler-trash"
            @click="unitStore.onDeleteItem(selectedUnit)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
