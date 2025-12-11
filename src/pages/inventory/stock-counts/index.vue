```vue
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useStockCountStore } from '@/stores/inventory/stockCountStore' // Store
import { useOutletSidebarStore } from '@/stores/outletSidebarStore' // For filter
import { customDebounce, formatDateTime } from '@/utils/common'

definePage({
  meta: {
    action: 'manage',
    subject: 'View Inventory StockCounts',
  },
})

const router = useRouter()
const stockCountStore = useStockCountStore()
const outletStore = useOutletSidebarStore()

// UI States
const isFilterVisible = ref(false)

// Table headers - Match Purchase Direct style (uppercase?) or standard?
// Purchase Direct uses mix. Let's stick to standard clean titles.
const headers: any[] = [
  { title: 'No. Referensi', key: 'reference', sortable: true },
  { title: 'Outlet', key: 'outlet.name', sortable: false },
  { title: 'Dibuat Oleh', key: 'createdByUser.name', sortable: false },
  { title: 'Status', key: 'status', sortable: true, align: 'center' },
  { title: 'Tanggal', key: 'createdAt', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'center' },
]

// Filters
const statusFilter = ref<string | undefined>(undefined)
const outletFilter = ref<string | undefined>(undefined)

const statusOptions = [
  { value: 'OPEN', title: 'Open' },
  { value: 'COMPLETED', title: 'Selesai' },
  { value: 'CANCELLED', title: 'Dibatalkan' },
]

const { data: outlets, isLoadingFetchData: isLoadingOutlets } = storeToRefs(outletStore)

// Fetch outlets when filter is opened
watch(isFilterVisible, val => {
  if (val && outlets.value.length === 0)
    outletStore.fetchAllData()
})

const onFilter = () => {
  stockCountStore.additionalFilter.status = statusFilter.value
  stockCountStore.additionalFilter.outletId = outletFilter.value
  stockCountStore.applyFilter()
}

const onResetFilter = () => {
  statusFilter.value = undefined
  outletFilter.value = undefined
  stockCountStore.resetFilter()
}

const onRowClick = (event: Event, { item }: { item: any }) => {
  router.push(`/inventory/stock-counts/${item.stockCountId}`)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    OPEN: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error', // Changed to error to match Purchase Direct red
  }

  return colors[status] || 'secondary'
}

// Watchers
watch([
  () => stockCountStore.requestQuery.page,
  () => stockCountStore.requestQuery.perPage,
], () => {
  stockCountStore.fetchPaginatedData()
})

watch(
  () => stockCountStore.requestQuery.search,
  customDebounce(() => {
    stockCountStore.requestQuery.page = 1
    stockCountStore.fetchPaginatedData()
  }, 500),
)

onMounted(() => {
  stockCountStore.fetchPaginatedData()
})
</script>

<template>
  <div>
    <VCard
      elevation="2"
      class="mb-4"
    >
      <!-- Header -->
      <VCardText class="d-flex flex-wrap justify-space-between align-center">
        <span class="text-h5 font-weight-bold d-flex align-center gap-2">
          <VIcon
            icon="tabler-clipboard-list"
            color="primary"
          />
          Daftar Stock Opname
        </span>

        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          to="/inventory/stock-counts/create"
        >
          Mulai Opname
        </VBtn>
      </VCardText>

      <VDivider />

      <!-- Toolbar -->
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            class="d-flex flex-row flex-wrap align-center gap-4"
          >
            <!-- Per Page -->
            <div style="width: 100px;">
              <VSelect
                v-model="stockCountStore.requestQuery.perPage"
                :items="[10, 25, 50, 100]"
                variant="outlined"
                hide-details
              />
            </div>

            <VSpacer />

            <VBtn
              variant="outlined"
              prepend-icon="tabler-filter"
              color="primary"
              @click="isFilterVisible = !isFilterVisible"
            >
              Filter
            </VBtn>

            <div style="width: 300px;">
              <VTextField
                v-model="stockCountStore.requestQuery.search"
                placeholder="Cari Referensi..."
                prepend-inner-icon="tabler-search"
                variant="outlined"
                hide-details
              />
            </div>
          </VCol>
        </VRow>
      </VCardText>

      <!-- Expandable Filters -->
      <VExpandTransition>
        <VCard
          v-if="isFilterVisible"
          variant="flat"
          class="border-t"
        >
          <VCardText>
            <VForm @submit.prevent="onFilter">
              <VRow>
                <VCol
                  cols="12"
                  md="3"
                >
                  <VAutocomplete
                    v-model="outletFilter"
                    :items="outlets"
                    item-title="name"
                    item-value="outletId"
                    label="Outlet"
                    :loading="isLoadingOutlets"
                    clearable
                    variant="outlined"
                    hide-details
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <VSelect
                    v-model="statusFilter"
                    :items="statusOptions"
                    label="Status"
                    clearable
                    variant="outlined"
                    hide-details
                  />
                </VCol>
                <VCol
                  cols="12"
                  class="d-flex justify-end gap-2"
                >
                  <VBtn
                    variant="outlined"
                    color="error"
                    prepend-icon="tabler-refresh"
                    @click="onResetFilter"
                  >
                    Reset
                  </VBtn>
                  <VBtn
                    color="primary"
                    type="submit"
                    variant="elevated"
                    prepend-icon="tabler-filter"
                  >
                    Terapkan
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VExpandTransition>

      <VDivider />

      <!-- Data Table -->
      <VDataTableServer
        v-model:items-per-page="stockCountStore.requestQuery.perPage"
        v-model:page="stockCountStore.requestQuery.page"
        :headers="headers"
        :items="stockCountStore.paginateData.data || []"
        :items-length="stockCountStore.paginateData.meta?.total || 0"
        :loading="stockCountStore.isLoadingFetchData"
        class="elevation-0"
        @click:row="onRowClick"
      >
        <template #item.reference="{ item }">
          <div class="font-weight-medium text-primary cursor-pointer">
            {{ item.reference }}
          </div>
        </template>

        <template #item.outlet.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="24"
              color="primary"
              variant="tonal"
              class="me-2"
            >
              <VIcon
                icon="tabler-building-store"
                size="14"
              />
            </VAvatar>
            <span>{{ item.outlet?.name }}</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ item.status }}
          </VChip>
        </template>

        <template #item.createdAt="{ item }">
          <div class="d-flex flex-column">
            <span class="text-body-2">{{ formatDateTime(item.createdAt) }}</span>
            <span class="text-caption text-medium-emphasis">{{ new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-center">
            <VTooltip text="Lihat Detail">
              <template #activator="{ props }">
                <VBtn
                  v-bind="props"
                  icon="tabler-eye"
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="router.push(`/inventory/stock-counts/${item.stockCountId}`)"
                />
              </template>
            </VTooltip>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-clipboard-list"
              size="48"
              color="disabled"
              class="mb-3"
            />
            <h3 class="text-h6 text-medium-emphasis">
              Belum ada data Stock Opname
            </h3>
            <p class="text-caption text-disabled">
              Mulai opname baru untuk melakukan pengecekan stok.
            </p>
          </div>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
