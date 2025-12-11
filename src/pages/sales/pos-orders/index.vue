<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import {
  type VDataTable,
  VDataTableServer,
} from 'vuetify/lib/components/index.mjs'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { usePosOrderStore } from '@/stores/sales/posOrderStore'
import type { Order } from '@/types/models/sales/order'
import { customDebounce, translateStatus } from '@/utils/common'
import { perPages } from '@/utils/constants'

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

definePage({
  meta: {
    name: 'Pesanan POS',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const posOrderStore = usePosOrderStore()

const { paginateData, isLoadingFetchData, requestQuery }
  = storeToRefs(posOrderStore)

const selectedOrder = ref<Order | null>(null)

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nomor Order', key: 'orderNumber', align: 'start' },
  { title: 'Pelanggan', key: 'customerName', align: 'start' },
  { title: 'Total', key: 'grandTotal', align: 'end' },
  { title: 'Status Order', key: 'status', align: 'center', sortable: false },
  { title: 'Status Pembayaran', key: 'paymentStatus', align: 'center', sortable: false },
  { title: 'Tanggal', key: 'orderDate', align: 'start', width: '12%' },
  { title: 'Aksi', key: 'actions', align: 'center', width: '10%', sortable: false },
]

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: Order, event: MouseEvent | PointerEvent) => {
  selectedOrder.value = item
  openFromEvent(event)
}

watch(
  () => requestQuery.value.search,
  customDebounce(() => {
    posOrderStore.fetchPaginatedData()
  }, 500),
)

const fetchPaginate = async () => {
  await posOrderStore.fetchPaginatedData()
}

onMounted(async () => {
  await fetchPaginate()
})

// Re-fetch on pagination changes
watch(
  () => requestQuery.value.page,
  async () => {
    await fetchPaginate()
  },
)

watch(
  () => requestQuery.value.perPage,
  async () => {
    requestQuery.value.page = 1
    await fetchPaginate()
  },
)

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: 'secondary',
    OPEN: 'info',
    CONFIRMED: 'info',
    IN_PRODUCTION: 'warning',
    READY: 'success',
    PARTIALLY_DELIVERED: 'warning',
    DELIVERED: 'success',
    COMPLETED: 'success',
    CLOSED: 'success',
    CANCELLED: 'error',
    UNPAID: 'error',
    PARTIALLY_PAID: 'warning',
    PAID: 'success',
    OVERPAID: 'info',
  }

  return statusMap[status] || 'default'
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">Pesanan POS</span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end">
            <VBtn
              class="ms-2"
              color="success"
              variant="outlined"
              disabled
              @click="$router.push('/pos')"
            >
              Buka POS WEB
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
              style="max-inline-size: 8rem; min-inline-size: 5rem"
            />
            <VSpacer />

            <AppTextField
              v-model="requestQuery.search"
              class="ms-0 ms-sm-3 mt-3 mt-sm-0 flex-1-1-100 flex-sm-fill"
              placeholder="Cari nomor order atau nama pelanggan..."
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
        loading-text="Memuat data..."
        class="text-no-wrap"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        @update:page="requestQuery.page = $event"
      >
        <template #item="{ index, item }">
          <tr
            class="cursor-pointer"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          >
            <td>
              {{ ((requestQuery.page || 1) - 1) * (requestQuery.perPage || 10) + index + 1 }}
            </td>
            <td>
              <div class="text-wrap">
                <strong>{{ item.orderCode }}</strong>
              </div>
            </td>
            <td>
              <span>{{ item.customerName }}</span>
            </td>
            <td class="text-end">
              {{ formatRupiah(item.grandTotal || 0) }}
            </td>
            <td class="text-center">
              <VChip
                :color="getStatusColor(item.status || '')"
                size="small"
                rounded
                class="text-uppercase font-weight-medium"
              >
                {{ translateStatus(item.status) }}
              </VChip>
            </td>
            <td class="text-center">
              <VChip
                :color="getStatusColor(item.paymentStatus || '')"
                size="small"
                rounded
                class="text-uppercase font-weight-medium"
              >
                {{ translateStatus(item.paymentStatus) }}
              </VChip>
            </td>
            <td>
              {{ dayjs(item.createdAt).format("DD-MM-YYYY HH:mm") }}
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

        <template #no-data>
          <VAlert
            dense
            color="light-secondary"
          >
            <VIcon>tabler-alert-triangle</VIcon>
            <div>Data Pesanan POS tidak tersedia</div>
          </VAlert>
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
            @click="
              $router.push(`/sales/pos-orders/${selectedOrder.orderId}`)
            "
          />
          <VListItem
            title="Download PDF"
            prepend-icon="tabler-file-download"
            :loading="posOrderStore.isLoadingDownload"
            @click="posOrderStore.downloadPdf(selectedOrder)"
          />
          <VListItem
            v-if="selectedOrder.status === 'DRAFT'"
            title="Edit"
            prepend-icon="tabler-edit"
            @click="
              $router.push(
                `/sales/pos-orders/${selectedOrder.orderId}/edit`,
              )
            "
          />
          <VListItem
            v-if="selectedOrder.status === 'DRAFT'"
            title="Hapus"
            prepend-icon="tabler-trash"
            class="text-error"
            @click="console.log('Delete', selectedOrder.salesOrderId)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
