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
import { useInvoiceStore } from '@/stores/sales/invoiceStore'
import { customDebounce, translateStatus } from '@/utils/common'
import type { Invoice } from '@/types/models/sales/invoice'

definePage({
  meta: {
    name: 'Faktur Penjualan (Invoice)',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const invoiceStore = useInvoiceStore()
const router = useRouter()

const { paginateData, isLoadingFetchData, requestQuery, additionalFilter }
  = storeToRefs(invoiceStore)

const selectedInvoice = ref<Invoice | null>(null)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nomor Faktur', key: 'invoiceNumber', align: 'start' },
  { title: 'Pelanggan', key: 'customerName', align: 'start' },
  { title: 'Tanggal', key: 'invoiceDate', align: 'start' },
  { title: 'Jatuh Tempo', key: 'dueDate', align: 'start' },
  { title: 'Total', key: 'grandTotal', align: 'end' },
  { title: 'Status', key: 'status', align: 'center', sortable: false },
  {
    title: 'Aksi',
    key: 'actions',
    align: 'center',
    width: '10%',
    sortable: false,
  },
]

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: Invoice, event: MouseEvent | PointerEvent) => {
  selectedInvoice.value = item
  openFromEvent(event)
}

watch(
  () => requestQuery.value.search,
  customDebounce(() => {
    invoiceStore.fetchPaginatedData()
  }, 500),
)

// Watch filters
watch(
  () => [
    additionalFilter.value.status,
    additionalFilter.value.dateFrom,
    additionalFilter.value.dateTo,
  ],
  () => {
    invoiceStore.applyFilter()
  },
)

const fetchPaginate = async () => {
  await invoiceStore.fetchPaginatedData()
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
  switch (status?.toUpperCase()) {
    case 'PAID':
      return 'success'
    case 'PARTIALLY_PAID':
      return 'warning'
    case 'UNPAID':
      return 'error'
    case 'SENT':
      return 'info'
    case 'OVERDUE':
      return 'error'
    case 'DRAFT':
      return 'secondary'
    case 'CANCELLED':
    case 'VOID':
      return 'secondary'
    default:
      return 'default'
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD MMM YYYY')
}

const statusOptions = [
  { title: 'Semua Status', value: undefined },
  { title: 'Draft', value: 'DRAFT' },
  { title: 'Terkirim', value: 'SENT' },
  { title: 'Belum Bayar', value: 'UNPAID' },
  { title: 'Bayar Sebagian', value: 'PARTIALLY_PAID' },
  { title: 'Lunas', value: 'PAID' },
  { title: 'Jatuh Tempo', value: 'OVERDUE' },
  { title: 'Dibatalkan', value: 'CANCELLED' },
  { title: 'Void', value: 'VOID' },
]
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">Daftar Faktur Penjualan (Invoice)</span>
        <VBtn
          prepend-icon="tabler-plus"
          @click="router.push('/sales/invoices/create')"
        >
          Buat Baru
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="additionalFilter.status"
              :items="statusOptions"
              placeholder="Filter Status"
              clearable
              hide-details
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppDateTimePicker
              v-model="additionalFilter.dateFrom"
              placeholder="Dari Tanggal"
              hide-details
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppDateTimePicker
              v-model="additionalFilter.dateTo"
              placeholder="Sampai Tanggal"
              hide-details
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
            class="d-flex align-center"
          >
            <AppTextField
              v-model="requestQuery.search"
              placeholder="Cari No Invoice / Customer..."
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
        @update:items-per-page="requestQuery.perPage = $event"
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
                <span class="font-weight-bold text-primary">{{
                  item.invoiceNumber
                }}</span>
                <div
                  v-if="item.type !== 'FULL'"
                  class="text-caption text-medium-emphasis"
                >
                  {{ item.type }}
                </div>
              </div>
            </td>
            <td>
              <div class="d-flex flex-column">
                <span class="font-weight-medium">{{
                  item.customerName || "-"
                }}</span>
                <span
                  v-if="item.orderId"
                  class="text-caption text-disabled"
                >Ref: Order</span>
              </div>
            </td>
            <td>
              {{ formatDate(item.invoiceDate) }}
            </td>
            <td>
              <span
                :class="{
                  'text-error font-weight-bold': item.status === 'OVERDUE',
                }"
              >
                {{ formatDate(item.dueDate) }}
              </span>
            </td>
            <td class="text-end font-weight-bold">
              {{ formatCurrency(item.grandTotal) }}
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
            <td class="text-center">
              <VBtn
                icon="tabler-dots-vertical"
                variant="text"
                size="small"
                @click.stop="onRowClick(item, $event)"
              />
            </td>
          </tr>
        </template>

        <!-- No Data -->
        <template #no-data>
          <div class="d-flex flex-column align-center justify-center py-8 text-medium-emphasis">
            <VIcon
              icon="tabler-file-invoice"
              size="48"
              class="mb-2"
            />
            <div class="text-h6">
              Belum ada invoice
            </div>
            <div class="text-body-2">
              Buat invoice baru untuk memulai
            </div>
          </div>
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
        location="bottom end"
        location-strategy="connected"
        :close-on-content-click="true"
        @after-leave="onAfterLeave"
      >
        <VList
          v-if="selectedInvoice"
          class="py-2"
          density="compact"
          elevation="2"
        >
          <VListItem
            title="Lihat Detail"
            prepend-icon="tabler-eye"
            @click="
              $router.push(`/sales/invoices/${selectedInvoice.invoiceId}`)
            "
          />
          <VListItem
            v-if="
              ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(
                selectedInvoice.status,
              )
            "
            title="Catat Pembayaran"
            prepend-icon="tabler-cash"
            @click="
              $router.push(
                `/sales/invoices/${selectedInvoice.invoiceId}?action=payment`,
              )
            "
          />
          <VDivider class="my-1" />
          <VListItem
            title="Download PDF"
            prepend-icon="tabler-file-download"
            :disabled="invoiceStore.isLoadingDownload"
            @click="invoiceStore.downloadPdf(selectedInvoice)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
