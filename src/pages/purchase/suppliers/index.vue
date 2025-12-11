<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import { type VDataTable, VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import { useSupplierStore } from '@/stores/purchase/supplierStore'
import SupplierDialog from '@/views/pages/purchase/suppliers/SupplierDialog.vue'

definePage({
  meta: {
    name: 'Supplier',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const supplierStore = useSupplierStore()
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  isFilterVisible,
  additionalFilter,
  isLoadingDelete,

  // isLoadingExport,
} = storeToRefs(supplierStore)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nama', key: 'name', align: 'start' },
  { title: 'Dibuat Pada', key: 'createdAt', align: 'start', width: '10%' },
  { title: 'Aksi', key: 'Aksi', align: 'center', width: '5%', sortable: false },
]

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

onMounted(async () => {
  await supplierStore.fetchData()
})

watch(
  () => requestQuery,
  async () => {
    await supplierStore.fetchData()
  },
  { deep: true },
)
</script>

<template>
  <SupplierDialog />
  <div>
    <!-- Header Section with Loading -->
    <VCard
      class="mb-4"
      elevation="2"
    >
      <VSkeletonLoader
        v-if="isLoadingFetchData && !paginateData.data?.length"
        type="heading"
        class="mx-4 my-4"
      />
      <template v-else>
        <VCardText class="d-flex flex-wrap justify-space-between">
          <span class="text-h5 d-inline my-auto">
            <VIcon
              icon="tabler-truck"
              class="me-2"
              color="primary"
            />
            Data Supplier
          </span>
          <div class="mt-3 mt-md-0 flex-fill">
            <div class="w-auto d-flex flex-wrap justify-end">
              <!--
                <VBtn
                v-if="($can('manage', 'Lihat Kategori Produk') || $can('manage', 'default'))"
                color="primary"
                variant="outlined"
                :loading="isLoadingExport"
                @click="supplierStore.export()"
                >
                <VIcon
                start
                icon="tabler-screen-share"
                />
                Export
                </VBtn>
              -->

              <VBtn
                v-if="$can('manage', 'Tambah Supplier') || $can('manage', 'default')"
                class="ms-2"
                color="primary"
                variant="elevated"
                @click="supplierStore.openCreateDialog()"
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
      </template>

      <VDivider />

      <!-- Search Section with Loading -->
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
              class="d-flex flex-row flex-wrap"
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
                placeholder="Cari supplier..."
                append-inner-icon="tabler-search"
                single-line
                hide-details
                dense
                outlined
              />
            </VCol>
          </VRow>
        </template>
      </VCardText>
      <VExpandTransition>
        <VCard
          v-if="isFilterVisible"
          class="ma-6"
          variant="outlined"
          title="Filter Tambahan"
        >
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
            <VForm @submit.prevent="supplierStore.applyFilter()">
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Status</label>
                  <VRadioGroup
                    v-model="additionalFilter.field"
                    inline
                  >
                    <VRadio
                      label="Merekrut"
                      :value="1"
                      color="success"
                    />
                    <VRadio
                      label="Tidak Merekrut"
                      :value="0"
                      color="error"
                    />
                  </VRadioGroup>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Tipe</label>
                  <VSelect
                    v-model="additionalFilter.field"
                    clearable
                  />
                </VCol>
                <VCol
                  cols="12"
                  class="d-flex justify-end"
                >
                  <VBtn
                    class="me-3"
                    color="error"
                    append-icon="tabler-reload"
                    @click="supplierStore.resetFilter()"
                  >
                    Reset
                  </VBtn>
                  <VBtn
                    type="submit"
                    color="primary"
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
        loading-text="Memuat data supplier..."
        class="text-no-wrap elevation-1"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        :sort-by="[{ key: requestQuery.orderField || '', order: requestQuery.orderDirection || 'asc' }]"
        @update:sort-by="supplierStore.onSortBy"
        @update:page="requestQuery.page = $event"
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

        <template #item.index="{ index }">
          <span class="text-body-2 font-weight-medium">{{ (paginateData.meta?.from || 0) + index }}</span>
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="32"
              color="primary"
              class="me-3"
            >
              <VIcon
                icon="tabler-truck"
                size="16"
              />
            </VAvatar>
            <div class="text-wrap">
              <div class="font-weight-medium">
                {{ item.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Supplier
              </div>
            </div>
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <div class="text-body-2">
            <div>{{ dayjs(item.createdAt).format('DD-MM-YYYY') }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ dayjs(item.createdAt).format('HH:mm') }}
            </div>
          </div>
        </template>

        <template #item.Aksi="{ item }">
          <div class="d-flex align-center">
            <VTooltip text="Lihat Detail">
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  :disabled="!($can('manage', 'Lihat Supplier') || $can('manage', 'default'))"
                  color="primary"
                  variant="tonal"
                  size="small"
                  @click="supplierStore.openDetailDialog(item)"
                >
                  <VIcon
                    icon="tabler-eye"
                    size="18"
                  />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip text="Edit Supplier">
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  :disabled="!($can('manage', 'Edit Supplier') || $can('manage', 'default'))"
                  color="warning"
                  variant="tonal"
                  size="small"
                  class="ms-1"
                  @click="supplierStore.openEditDialog(item)"
                >
                  <VIcon
                    icon="tabler-edit"
                    size="18"
                  />
                </IconBtn>
              </template>
            </VTooltip>

            <VTooltip text="Hapus Supplier">
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  :disabled="!($can('manage', 'Hapus Supplier') || $can('manage', 'default'))"
                  :loading="isLoadingDelete"
                  color="error"
                  variant="tonal"
                  size="small"
                  class="ms-1"
                  @click="supplierStore.onDeleteItem(item)"
                >
                  <VIcon
                    icon="tabler-trash"
                    size="18"
                  />
                </IconBtn>
              </template>
            </VTooltip>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-truck-off"
              size="64"
              color="disabled"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              Tidak ada data supplier
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Belum ada supplier yang ditambahkan atau sesuai dengan pencarian
            </p>
            <VBtn
              v-if="$can('manage', 'Tambah Supplier') || $can('manage', 'default')"
              color="primary"
              variant="elevated"
              @click="supplierStore.openCreateDialog()"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Supplier Pertama
            </VBtn>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-space-between align-center mt-2">
              <div class="text-body-2 text-medium-emphasis">
                Menampilkan {{ paginateData.meta?.from || 0 }} - {{ paginateData.meta?.to || 0 }} dari {{ paginateData.meta?.total || 0 }} supplier
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
    </VCard>
  </div>
</template>
