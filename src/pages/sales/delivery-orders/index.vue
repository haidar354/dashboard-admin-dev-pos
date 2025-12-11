<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  type VDataTable,
  VDataTableServer,
} from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { useDeliveryOrderStore } from '@/stores/sales/deliveryOrderStore'
import type { DeliveryOrder } from '@/types/models/sales/delivery-order'
import { perPages } from '@/utils/constants'
import { customDebounce, translateStatus } from '@/utils/common'

definePage({
  meta: {
    name: 'Pengiriman Penjualan (DO)',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const deliveryOrderStore = useDeliveryOrderStore()

const { paginateData, isLoadingFetchData, requestQuery }
  = storeToRefs(deliveryOrderStore)

const selectedDelivery = ref<DeliveryOrder | null>(null)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nomor DO', key: 'deliveryNumber', align: 'start' },
  { title: 'Penerima', key: 'recipientName', align: 'start' },
  { title: 'Kurir', key: 'courierName', align: 'start' },
  { title: 'Status', key: 'status', align: 'center', sortable: false },
  { title: 'Tanggal', key: 'createdAt', align: 'start', width: '15%' },
  {
    title: 'Aksi',
    key: 'actions',
    align: 'center',
    width: '10%',
    sortable: false,
  },
]

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: DeliveryOrder, event: MouseEvent | PointerEvent) => {
  selectedDelivery.value = item
  openFromEvent(event)
}

watch(
  () => requestQuery.value.search,
  customDebounce(() => {
    deliveryOrderStore.fetchPaginatedData()
  }, 500),
)

const fetchPaginate = async () => {
  await deliveryOrderStore.fetchPaginatedData()
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
    PENDING: 'warning',
    PACKING: 'info',
    READY_TO_SHIP: 'primary',
    SHIPPED: 'secondary',
    DELIVERED: 'success',
    FAILED: 'error',
    RETURNED: 'error',
    CANCELLED: 'secondary',
  }

  return statusMap[status] || 'default'
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">Pengiriman Penjualan (DO)</span>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="$router.push('/sales/delivery-orders/create')"
        >
          Buat Baru
        </VBtn>
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
              placeholder="Cari nomor DO, penerima, atau resi..."
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
        :items="paginateData.data || []"
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
              {{
                ((requestQuery.page || 1) - 1) * (requestQuery.perPage || 10)
                  + index
                  + 1
              }}
            </td>
            <td>
              <div class="text-wrap">
                <strong>{{ item.deliveryNumber }}</strong>
              </div>
            </td>
            <td>
              <div>
                <span>{{ item.recipientName || "-" }}</span>
                <div
                  v-if="item.recipientPhone"
                  class="text-caption text-medium-emphasis"
                >
                  {{ item.recipientPhone }}
                </div>
              </div>
            </td>
            <td>
              <div>
                <span>{{ item.courierName || "-" }}</span>
                <div
                  v-if="item.trackingNumber"
                  class="text-caption text-medium-emphasis"
                >
                  {{ item.trackingNumber }}
                </div>
              </div>
            </td>
            <td class="text-center">
              <VChip
                :color="getStatusColor(item.status)"
                size="small"
                rounded
                class="text-uppercase font-weight-medium"
              >
                {{ translateStatus(item.status) }}
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

        <!-- No Data -->
        <template #no-data>
          <VAlert
            dense
            color="light-secondary"
          >
            <VIcon>tabler-truck-delivery</VIcon>
            <div>Data pengiriman penjualan (DO) tidak tersedia</div>
          </VAlert>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-end mt-2">
              <VPagination
                v-model="requestQuery.page"
                :total-visible="smAndDown ? 3 : 5"
                :length="paginateData.meta?.lastPage || 1"
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
          v-if="selectedDelivery"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            @click="
              $router.push(
                `/sales/delivery-orders/${selectedDelivery.deliveryId}`,
              )
            "
          />
          <VListItem
            title="Download DO"
            prepend-icon="tabler-file-download"
            :loading="deliveryOrderStore.isLoadingDownload"
            @click="deliveryOrderStore.downloadPdf(selectedDelivery)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
