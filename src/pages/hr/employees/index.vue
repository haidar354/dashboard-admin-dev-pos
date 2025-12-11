<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { ref } from 'vue'
import { VAutocomplete, type VDataTable, VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import { useEmployeeStore } from '@/stores/employeeStore'

definePage({
  meta: {
    name: 'Data Karyawan',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
      {
        action: 'manage',
        subject: 'Lihat Karyawan',
      },
    ],
  },
})

dayjs.locale(id)
type ReadonlyHeaders = VDataTable['$props']['headers']
const employeeStore = useEmployeeStore()
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  isFilterVisible,

  // additionalFilter,
  // isLoadingDelete,

  // isLoadingExport,
} = storeToRefs(employeeStore)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nama', key: 'name', align: 'start' },
  { title: 'Role', key: 'roleName', align: 'start', sortable: false },
  { title: 'Jabatan', key: 'position', align: 'start' },
  { title: 'Outlet', key: 'outlet', align: 'start' },
  { title: 'No. Telp', key: 'phone', align: 'start' },
  { title: 'Dibuat Pada', key: 'createdAt', align: 'start', width: '10%' },
  { title: 'Aksi', key: 'Aksi', align: 'center', width: '10%', sortable: false },
]

watch(isFilterVisible, () => {
})

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

onMounted(async () => {
  await employeeStore.fetchData()
})

watch(
  () => requestQuery,
  async () => {
    await employeeStore.fetchData()
  },
  { deep: true },
)
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          Data Karyawan
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
              v-if="$can('manage', 'Tambah Karyawan') || $can('manage', 'Tambah Semua Karyawan') || $can('manage', 'default')"
              class="ms-2"
              color="primary"
              :to="{
                name: 'hr-employees-create',
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
            <VForm @submit.prevent="employeeStore.applyFilter()">
              <VRow>
                <VCol
                  cols="12"
                  class="d-flex justify-end"
                >
                  <VBtn
                    class="me-3"
                    color="error"
                    append-icon="tabler-reload"
                    @click="employeeStore.resetFilter()"
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
      <VDataTableServer
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoadingFetchData"
        loading-text="Memuat data ..."
        class="text-no-wrap"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.total || 0"
        :sort-by="[{ key: requestQuery.orderField || '', order: requestQuery.orderDirection || 'asc' }]"
        @update:page="requestQuery.page = $event"
        @update:sort-by="employeeStore.onSortBy"
      >
        <template #item.index="{ index }">
          <span>{{ index + 1 }}</span>
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="40"
              class="me-3"
            >
              <VImg
                v-if="item.user?.avatar"
                :src="item.user.avatar"
                alt="Employee Avatar"
              />
              <VIcon
                v-else
                icon="tabler-user"
              />
            </VAvatar>
            <div>
              <div class="text-body-1 font-weight-medium">
                {{ item.user?.name || item.name || 'Nama tidak tersedia' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ item.position }}
              </div>
            </div>
          </div>
        </template>

        <template #item.roleName="{ item }">
          <VChip
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ item.user?.roles?.[0]?.name || '-' }}
          </VChip>
        </template>

        <template #item.position="{ item }">
          <VChip
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ item.position || 'Tidak ada jabatan' }}
          </VChip>
        </template>

        <template #item.outlet="{ item }">
          <div class="text-wrap">
            {{ item.employeeAssignments?.[0]?.org?.name || 'Tidak ada outlet terkait' }}
          </div>
        </template>

        <template #item.phone="{ item }">
          <div class="text-wrap">
            {{ item.user?.phone || '-' }}
          </div>
        </template>

        <template #item.createdAt="{ item }">
          {{ dayjs(item.createdAt).format('DD-MM-YYYY') }}
        </template>

        <template #item.Aksi="{ item }">
          <div class="d-flex align-center justify-center">
            <IconBtn
              :disabled="!($can('manage', 'Lihat Karyawan') || $can('manage', 'Lihat Semua Karyawan') || $can('manage', 'default'))"
              :to="{ name: 'hr-employees-employee-id', params: { employeeId: item.employeeId } }"
              @click="employeeStore.fetchDetailAndSetForm(item.employeeId)"
            >
              <VIcon
                color="primary"
                icon="tabler-eye"
              />
              <VTooltip activator="parent">
                Lihat Detail
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="($can('manage', 'Edit Karyawan') || $can('manage', 'Edit Semua Karyawan') || $can('manage', 'default'))"
              :to="{
                name: 'hr-employees-employee-id-edit',
                params: { employeeId: item.employeeId },
              }"
              @click="employeeStore.fetchDetailAndSetForm(item.employeeId)"
            >
              <VIcon
                color="warning"
                icon="tabler-edit"
              />
              <VTooltip activator="parent">
                Edit Karyawan
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="($can('manage', 'Hapus Karyawan') || $can('manage', 'Hapus Semua Karyawan') || $can('manage', 'default'))"
              @click="employeeStore.onDeleteEmployee(item)"
            >
              <VIcon
                color="error"
                icon="tabler-trash"
              />
              <VTooltip activator="parent">
                Hapus Karyawan
              </VTooltip>
            </IconBtn>
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
                :length="paginateData.lastPage || 0"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
