<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReturnStore } from '@/stores/sales/returnStore'
import { customDebounce, formatCurrency, formatDateTime, translateStatus } from '@/utils/common'

const returnStore = useReturnStore()
const router = useRouter()

// UI States
const isFilterVisible = ref(false)

// Table headers
const headers: any[] = [
  { title: 'No. Retur', key: 'returnNumber', sortable: true },
  { title: 'Kode Order', key: 'order.orderCode', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Alasan', key: 'reason', sortable: false },
  { title: 'Total Refund', key: 'refundAmount', sortable: true, align: 'end' },
  { title: 'Tanggal', key: 'createdAt', sortable: true },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'center' },
]

// Filters
const statusFilter = ref<string | undefined>(undefined)
const reasonFilter = ref<string | undefined>(undefined)
const dateFrom = ref('')
const dateTo = ref('')

// Items per page options
const perPageOptions = [10, 25, 50, 100]

const statusOptions = [
  { value: 'PENDING', title: 'Menunggu' },
  { value: 'APPROVED', title: 'Disetujui' },
  { value: 'RECEIVED', title: 'Diterima' },
  { value: 'INSPECTED', title: 'Diperiksa' },
  { value: 'COMPLETED', title: 'Selesai' },
  { value: 'REJECTED', title: 'Ditolak' },
  { value: 'CANCELLED', title: 'Dibatalkan' },
]

const reasonOptions = [
  { value: 'DAMAGED', title: 'Barang Rusak' },
  { value: 'WRONG_ITEM', title: 'Salah Barang' },
  { value: 'EXPIRED', title: 'Kadaluarsa' },
  { value: 'CUSTOMER_REQUEST', title: 'Permintaan Pelanggan' },
  { value: 'OTHER', title: 'Lainnya' },
]

const applyFilters = () => {
  returnStore.additionalFilter.status = statusFilter.value
  returnStore.additionalFilter.reason = reasonFilter.value
  returnStore.additionalFilter.dateFrom = dateFrom.value
  returnStore.additionalFilter.dateTo = dateTo.value
  returnStore.applyFilter()
}

const resetFilters = () => {
  statusFilter.value = undefined
  reasonFilter.value = undefined
  dateFrom.value = ''
  dateTo.value = ''
  returnStore.resetFilter()
  returnStore.fetchPaginatedData()
}

const onFilter = () => {
  applyFilters()
}

const onResetFilter = () => {
  resetFilters()
}

const onRowClick = (event: Event, { item }: { item: any }) => {
  router.push(`/sales/returns/${item.returnId}`)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'info',
    RECEIVED: 'info',
    INSPECTED: 'info',
    COMPLETED: 'success',
    REJECTED: 'error',
    CANCELLED: 'secondary',
  }

  return colors[status] || 'secondary'
}

const getReasonLabel = (reason: string) => {
  const map: Record<string, string> = {
    DAMAGED: 'Barang Rusak',
    WRONG_ITEM: 'Salah Barang',
    EXPIRED: 'Kadaluarsa',
    CUSTOMER_REQUEST: 'Permintaan Pelanggan',
    OTHER: 'Lainnya',
  }

  return map[reason] || reason
}

// Watchers
watch([
  () => returnStore.requestQuery.page,
  () => returnStore.requestQuery.perPage,
], () => {
  returnStore.fetchPaginatedData()
})

watch(
  () => returnStore.requestQuery.search,
  customDebounce(() => {
    returnStore.requestQuery.page = 1
    returnStore.fetchPaginatedData()
  }, 500),
)

onMounted(() => {
  returnStore.fetchPaginatedData()
})
</script>

<template>
  <div>
    <VCard elevation="2">
      <!-- Header -->
      <VCardText class="d-flex flex-wrap justify-space-between align-center">
        <span class="text-h5 font-weight-bold d-flex align-center gap-2">
          <VIcon
            icon="tabler-truck-return"
            color="primary"
          />
          Data Retur Penjualan
        </span>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="router.push('/sales/returns/create')"
        >
          Buat Retur
        </VBtn>
      </VCardText>

      <VDivider />

      <!-- Toolbar -->
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="2"
          >
            <!-- Items Per Page -->
            <VSelect
              v-model="returnStore.requestQuery.perPage"
              :items="perPageOptions"
              label="Baris per halaman"
              density="compact"
              variant="outlined"
              hide-details
            />
          </VCol>
          <VSpacer />
          <VCol
            cols="12"
            md="8"
            class="d-flex gap-2 justify-end"
          >
            <!-- Filter Button -->
            <VBtn
              variant="outlined"
              prepend-icon="tabler-filter"
              color="primary"
              @click="isFilterVisible = !isFilterVisible"
            >
              Filter
            </VBtn>

            <!-- Search -->
            <VTextField
              v-model="returnStore.requestQuery.search"
              placeholder="Cari No. Retur atau Order..."
              prepend-inner-icon="tabler-search"
              variant="outlined"
              hide-details
              style="max-width: 300px;"
            />
          </VCol>
        </VRow>
      </VCardText>

      <!-- Expandable Filters -->
      <VExpandTransition>
        <div v-if="isFilterVisible">
          <VDivider />
          <VCardText>
            <VForm @submit.prevent="onFilter">
              <VRow>
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
                  md="3"
                >
                  <VSelect
                    v-model="reasonFilter"
                    :items="reasonOptions"
                    label="Alasan"
                    clearable
                    variant="outlined"
                    hide-details
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                >
                  <VTextField
                    v-model="dateFrom"
                    type="date"
                    label="Dari Tanggal"
                    variant="outlined"
                    hide-details
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="2"
                >
                  <VTextField
                    v-model="dateTo"
                    type="date"
                    label="Sampai Tanggal"
                    variant="outlined"
                    hide-details
                  />
                </VCol>
                <VCol cols="12">
                  <div class="d-flex align-center gap-2 justify-end">
                    <VBtn
                      variant="outlined"
                      color="secondary"
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
                  </div>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
          <VDivider />
        </div>
      </VExpandTransition>

      <!-- Data Table -->
      <VDataTableServer
        v-model:items-per-page="returnStore.requestQuery.perPage"
        v-model:page="returnStore.requestQuery.page"
        :headers="headers"
        :items="returnStore.paginateData.data || []"
        :items-length="returnStore.paginateData.meta?.total || 0"
        :loading="returnStore.isLoadingFetchData"
        class="elevation-0"
        @update:sort-by="returnStore.onSortBy"
        @click:row="onRowClick"
      >
        <!-- Return Number -->
        <template #item.returnNumber="{ item }">
          <div class="font-weight-medium text-primary">
            {{ item.returnNumber }}
          </div>
        </template>

        <!-- Order Code -->
        <template #item.order.orderCode="{ item }">
          <div v-if="item.order">
            {{ item.order.orderCode }}
          </div>
          <div
            v-else
            class="text-medium-emphasis"
          >
            -
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ translateStatus(item.status) }}
          </VChip>
        </template>

        <!-- Reason -->
        <template #item.reason="{ item }">
          {{ item.reason ? getReasonLabel(item.reason) : '-' }}
        </template>

        <!-- Refund Amount -->
        <template #item.refundAmount="{ item }">
          <div class="text-end">
            {{ formatCurrency(item.refundAmount || 0) }}
          </div>
        </template>

        <!-- Created At -->
        <template #item.createdAt="{ item }">
          {{ formatDateTime(item.createdAt) }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <VBtn
            icon="tabler-eye"
            variant="text"
            size="small"
            color="primary"
            @click.stop="router.push(`/sales/returns/${item.returnId}`)"
          />
        </template>

        <!-- Bottom Pagination (Standard is usually built-in, but can be customized) -->
      </VDataTableServer>
    </VCard>
  </div>
</template>
