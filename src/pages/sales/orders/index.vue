<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { type VDataTable, VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { useOrderStore } from '@/stores/sales/orderStore'
import type { Order } from '@/types/models/sales/order'
import { customDebounce } from '@/utils/common'
import { perPages } from '@/utils/constants'

definePage({
  meta: {
    name: 'Transaksi Penjualan',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const orderStore = useOrderStore()
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  selectedOrder,
  isFilterVisible,
} = storeToRefs(orderStore)

const additionalFilter = ref({
  dateFrom: '',
  dateTo: '',
  orderType: undefined,
  status: undefined,
  paymentStatus: undefined,
  fulfillmentStatus: undefined,
})

const applyFilter = async () => {
  requestQuery.value.page = 1

  // copy filter values into requestQuery
  requestQuery.value.orderType = additionalFilter.value.orderType || ''
  requestQuery.value.status = additionalFilter.value.status || ''
  requestQuery.value.paymentStatus = additionalFilter.value.paymentStatus || ''
  requestQuery.value.fulfillmentStatus = additionalFilter.value.fulfillmentStatus || ''
  if (additionalFilter.value.dateFrom)
    requestQuery.value.dateFrom = additionalFilter.value.dateFrom
  else
    delete requestQuery.value.dateFrom

  if (additionalFilter.value.dateTo)
    requestQuery.value.dateTo = additionalFilter.value.dateTo
  else
    delete requestQuery.value.dateTo

  await fetchPaginate()
}

const resetFilter = async () => {
  additionalFilter.value = {
    dateFrom: '', dateTo: '', orderType: undefined, status: undefined, paymentStatus: undefined, fulfillmentStatus: undefined,
  }

  // clear requestQuery filter fields
  requestQuery.value.orderType = ''
  requestQuery.value.status = ''
  requestQuery.value.paymentStatus = ''
  requestQuery.value.fulfillmentStatus = ''
  delete requestQuery.value.dateFrom
  delete requestQuery.value.dateTo
  requestQuery.value.page = 1
  await fetchPaginate()
}

const orderTypeOptions = [
  { title: 'Semua', value: null },
  { title: 'POS', value: 'POS' },
  { title: 'SALES_ORDER', value: 'SALES_ORDER' },
]

const orderStatusOptions = [
  { title: 'Semua', value: null },
  { title: 'Draft', value: 'DRAFT' },
  { title: 'Open', value: 'OPEN' },
  { title: 'Confirmed', value: 'CONFIRMED' },
  { title: 'In Production', value: 'IN_PRODUCTION' },
  { title: 'Ready', value: 'READY' },
  { title: 'Delivered', value: 'DELIVERED' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'Closed', value: 'CLOSED' },
  { title: 'Void', value: 'VOID' },
  { title: 'Cancelled', value: 'CANCELLED' },
]

const paymentStatusOptions = [
  { title: 'Semua', value: null },
  { title: 'Unpaid', value: 'UNPAID' },
  { title: 'Partially Paid', value: 'PARTIALLY_PAID' },
  { title: 'Paid', value: 'PAID' },
  { title: 'Overpaid', value: 'OVERPAID' },
]

const fulfillmentStatusOptions = [
  { title: 'Semua', value: null },
  { title: 'Unfulfilled', value: 'UNFULFILLED' },
  { title: 'Preparing', value: 'PREPARING' },
  { title: 'Partially Served', value: 'PARTIALLY_SERVED' },
  { title: 'Served', value: 'SERVED' },
  { title: 'Delivered', value: 'DELIVERED' },
  { title: 'Returned', value: 'RETURNED' },
]

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Kode Transaksi', key: 'orderCode', align: 'start' },
  { title: 'Tipe', key: 'orderType', align: 'start' },
  { title: 'Pelanggan', key: 'customerName', align: 'start' },
  { title: 'Total', key: 'grandTotal', align: 'end' },
  { title: 'Status', key: 'status', align: 'center', sortable: false },
  { title: 'Outlet', key: 'outlet.name', align: 'start' },
  { title: 'Tanggal Buat', key: 'createdAt', align: 'start', width: '12%' },
  { title: 'Aksi', key: 'actions', align: 'center', width: '10%', sortable: false },
]

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: Order, event: MouseEvent | PointerEvent) => {
  selectedOrder.value = item
  openFromEvent(event)
}

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

const fetchPaginate = async () => {
  await orderStore.fetchPaginate({
    include: ['outlet', 'salesChannel', 'salesOrder'],
  })
}

onMounted(async () => {
  await fetchPaginate()
  if (requestQuery.value?.search)
    search.value = requestQuery.value.search
})

// Re-fetch on query changes
watch(
  () => requestQuery.value,
  async () => {
    await fetchPaginate()
  },
  { deep: true },
)
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          Data Transaksi Penjualan
        </span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end" />
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
              style="max-inline-size: 8rem; min-inline-size: 5rem;"
            />
            <VSpacer />

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
              class="ms-0 ms-sm-3 mt-3 mt-sm-0 flex-1-1-100 flex-sm-fill"
              placeholder="Cari kode atau nama pelanggan..."
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
            <VForm @submit.prevent="applyFilter">
              <VRow>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Tanggal Dari</label>
                  <VTextField
                    v-model="additionalFilter.dateFrom"
                    type="date"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Tanggal Sampai</label>
                  <VTextField
                    v-model="additionalFilter.dateTo"
                    type="date"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Tipe Order</label>
                  <VSelect
                    v-model="additionalFilter.orderType"
                    :items="orderTypeOptions"
                    item-title="title"
                    item-value="value"
                    clearable
                    variant="outlined"
                    prepend-inner-icon="tabler-list"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Status</label>
                  <VSelect
                    v-model="additionalFilter.status"
                    :items="orderStatusOptions"
                    item-title="title"
                    item-value="value"
                    clearable
                    variant="outlined"
                    prepend-inner-icon="tabler-flag"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                  class="mt-3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Status Pembayaran</label>
                  <VSelect
                    v-model="additionalFilter.paymentStatus"
                    :items="paymentStatusOptions"
                    item-title="title"
                    item-value="value"
                    clearable
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                  class="mt-3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Status Pengiriman</label>
                  <VSelect
                    v-model="additionalFilter.fulfillmentStatus"
                    :items="fulfillmentStatusOptions"
                    item-title="title"
                    item-value="value"
                    clearable
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  class="d-flex justify-end mt-4"
                >
                  <VBtn
                    class="me-3"
                    color="error"
                    variant="outlined"
                    append-icon="tabler-reload"
                    @click="resetFilter"
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

      <VDataTableServer
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoadingFetchData"
        loading-text="Memuat data..."
        class="text-no-wrap"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        :sort-by="[{ key: requestQuery.orderField || '', order: requestQuery.orderDirection || 'asc' }]"
        @update:page="requestQuery.page = $event"
        @update:sort-by="orderStore.onSortBy"
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
                <strong>{{ item.orderCode }}</strong>
              </div>
            </td>
            <td>
              <span>{{ item.orderType }}</span>
            </td>
            <td>
              <span>{{ item.customerName || 'Umum' }}</span>
            </td>
            <td class="text-end">
              {{ formatRupiah(item.grandTotal) }}
            </td>
            <td class="text-center">
              <VChip
                :color="(['PAID', 'CLOSED'].includes(item.status)) ? 'success' : item.status === 'VOID' ? 'error' : 'secondary'"
                size="small"
                rounded
                class="text-uppercase font-weight-medium"
              >
                {{ item.status }}
              </VChip>
            </td>
            <td>
              <span>{{ item.outlet?.name || '-' }}</span>
            </td>
            <td>
              {{ dayjs(item.createdAt).format('DD-MM-YYYY HH:mm') }}
            </td>
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

        <!-- No Data -->
        <template #no-data>
          <VAlert
            dense
            color="light-secondary"
          >
            <VIcon>tabler-alert-triangle</VIcon>
            <div>Data transaksi tidak tersedia</div>
          </VAlert>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-end mt-2">
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
          v-if="selectedOrder"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            :to="selectedOrder.orderType === 'POS' ? `/sales/pos-orders/${selectedOrder.orderId}` : `/sales/sales-orders/${selectedOrder.salesOrder?.salesOrderId}`"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
