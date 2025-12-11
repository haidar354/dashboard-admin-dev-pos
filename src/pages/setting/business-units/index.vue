<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { ref } from 'vue'
import { VAutocomplete, type VDataTable, VImg } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useBusinessUnitStore } from '@/stores/businessUnitStore'

definePage({
  meta: {
    name: 'Data Unit Bisnis',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
      {
        action: 'manage',
        subject: 'Lihat Unit Bisnis',
      },
    ],
  },
})

dayjs.locale(id)
type ReadonlyHeaders = VDataTable['$props']['headers']
const businessUnitStore = useBusinessUnitStore()
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  isFilterVisible,

  // additionalFilter,
  // isLoadingDelete,

  // isLoadingExport,
} = storeToRefs(businessUnitStore)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nama', key: 'name', align: 'start' },
  { title: 'Provinsi', key: 'province.name', align: 'start', width: '15%' },
  { title: 'Kota', key: 'city.name', align: 'start', width: '15%' },

  { title: 'Total Outlet', key: 'outletsCount', align: 'start', width: '10%' },

  { title: 'Dibuat Pada', key: 'createdAt', align: 'start', width: '10%' },
  { title: 'Aksi', key: 'Aksi', align: 'center', width: '5%', sortable: false },
]

watch(isFilterVisible, () => {
})

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

onMounted(async () => {
  await businessUnitStore.fetchPaginate()
})

watch(
  () => requestQuery,
  async () => {
    await businessUnitStore.fetchPaginate()
  },
  { deep: true },
)
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          Data Unit Bisnis
        </span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end">
            <!--
              <VBtn
              v-if="($can('manage', 'Lihat Outlet') || $can('manage', 'Lihat Semua Outlet') || $can('manage', 'default'))"
              color="primary"
              variant="outlined"
              :loading="isLoadingExport"
              @click="outletStore.export()"
              >
              <VIcon
              start
              icon="tabler-screen-share"
              />
              Export
              </VBtn>
            -->

            <VBtn
              v-if="$can('manage', 'Tambah Unit Bisnis') || $can('manage', 'Tambah Semua Unit Bisnis') || $can('manage', 'default')"
              class="ms-2"
              color="primary"
              :to="{
                name: 'setting-business-units-create',
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
            <VForm @submit.prevent="businessUnitStore.applyFilter()">
              <VRow>
                <VCol
                  cols="12"
                  class="d-flex justify-end"
                >
                  <VBtn
                    class="me-3"
                    color="error"
                    append-icon="tabler-reload"
                    @click="businessUnitStore.resetFilter()"
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
      <VDataTable
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoadingFetchData"
        loading-text="Memuat data ..."
        class="text-no-wrap"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        :sort-by="[{ key: requestQuery.orderField || '', order: requestQuery.orderDirection || 'asc' }]"
        @update:sort-by="businessUnitStore.onSortBy"
        @update:page="requestQuery.page = $event"
      >
        <template #item.index="{ index }">
          <span>{{ index + 1 }}</span>
        </template>

        <template #item.name="{ item }">
          <div class="d-flex gap-2">
            <VAvatar
              size="35"
              color="primary"
            >
              <VImg
                v-if="item.logo"
                :src="item.logo"
                :alt="item.name"
                cover
              />
              <VIcon
                v-else
                icon="tabler-building-store"
                color="white"
                size="16"
              />
            </VAvatar>
            <div class="d-flex align-center text-wrap">
              {{ item.name }}
            </div>
          </div>
        </template>

        <template #item.province.name="{ item }">
          <div class="text-wrap">
            {{ item.province?.name || '-' }}
          </div>
        </template>

        <template #item.city.name="{ item }">
          <div class="text-wrap">
            {{ item.city?.name || '-' }}
          </div>
        </template>

        <template #item.createdAt="{ item }">
          {{ dayjs(item.createdAt).format('DD-MM-YYYY HH:mm') }}
        </template>

        <template #item.Aksi="{ item }">
          <div class="d-flex align-center justify-center">
            <IconBtn
              :disabled="!($can('manage', 'Lihat Unit Bisnis') || $can('manage', 'default'))"
              :to="{ name: 'setting-business-units-business-unit-id', params: { businessUnitId: item.businessUnitId } }"
            >
              <VIcon
                color="primary"
                icon="tabler-eye"
              />
            </IconBtn>
            <IconBtn
              v-if="($can('manage', 'Edit Unit Bisnis') || $can('manage', 'Edit Semua Unit Bisnis') || $can('manage', 'default'))"
              :to="{
                name: 'setting-business-units-business-unit-id-edit',
                params: { businessUnitId: item.businessUnitId },
              }"
            >
              <VIcon
                color="warning"
                icon="tabler-edit"
              />
            </IconBtn>
            <!--
              <IconBtn
              v-if="($can('manage', 'Hapus Outlet') || $can('manage', 'Hapus Semua Outlet') || $can('manage', 'default'))"
              :loading="isLoadingDelete"
              @click="outletStore.onDeleteItem(item)"
              >
              <VIcon
              color="error"
              icon="tabler-trash"
              />
              </IconBtn>
            -->
          </div>
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
      </VDataTable>
    </VCard>
  </div>
</template>
