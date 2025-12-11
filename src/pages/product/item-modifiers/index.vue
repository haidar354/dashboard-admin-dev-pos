<script setup lang="ts">
import { ref } from 'vue'
import { type VDataTable, VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { useModifierStore } from '@/stores/product/modifierStore'
import type { ModifierGroup } from '@/types/models/product/item-modifier/modifier-group'
import ItemModifierCreateDialog from '@/views/pages/product/item-modifiers/ItemModifierCreateDialog.vue'

definePage({
  meta: {
    name: 'Produk Ekstra',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const modifierStore = useModifierStore()
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  selectedModifierGroup,

  // isLoadingExport,
} = storeToRefs(modifierStore)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nama Ekstra', key: 'name', align: 'start' },
  { title: 'Pilihan', key: 'options', align: 'start' },
  { title: 'Status', key: 'isActive', align: 'center', sortable: false },
  { title: 'Aksi', key: 'Aksi', align: 'center', width: '5%', sortable: false },
]

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: ModifierGroup, event: MouseEvent | PointerEvent) => {
  selectedModifierGroup.value = item
  openFromEvent(event)
}

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

const fetchPaginate = async () => {
  await modifierStore.fetchPaginate({
    include: ['options'],
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
  <ItemModifierCreateDialog />
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          Data Produk Ekstra
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
        @update:sort-by="modifierStore.onSortBy"
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
                {{ item.name }}
              </div>
            </td>
            <td>
              <div class="d-flex flex-wrap gap-1">
                <VChip
                  v-for="option in item.options"
                  :key="option.modifierGroupId"
                  size="small"
                  color="primary"
                >
                  {{ option.name }}
                </VChip>
              </div>
            </td>
            <td>
              <div class="text-wrap">
                <VChip
                  :color="item.isActive ? 'success' : 'error'"
                  :prepend-icon="item.isActive ? 'tabler-check' : 'tabler-x'"
                  size="small"
                  rounded
                >
                  {{ item.isActive ? 'Aktif' : 'Tidak Aktif' }}
                </VChip>
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
          v-if="selectedModifierGroup"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            :to="{ name: 'product-item-modifiers-item-modifier-id', params: { itemModifierId: selectedModifierGroup?.modifierGroupId } }"
          />
          <VListItem
            title="Edit"
            prepend-icon="tabler-edit"
            :to="{ name: 'product-item-modifiers-item-modifier-id-edit', params: { itemModifierId: selectedModifierGroup?.modifierGroupId } }"
          />
          <VListItem
            title="Hapus"
            prepend-icon="tabler-trash"
            @click="modifierStore.onDeleteItem(selectedModifierGroup)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
