<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import {
  type VDataTable,
  VDataTableServer,
} from 'vuetify/lib/components/index.mjs'
import { useRefundStore } from '@/stores/sales/refundStore'
import { customDebounce, formatCurrency } from '@/utils/common'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import RefundCreateModal from '@/components/dialogs/RefundCreateModal.vue'
import CompleteRefundDialog from '@/components/sales/refunds/CompleteRefundDialog.vue'
import CancelRefundDialog from '@/components/sales/refunds/CancelRefundDialog.vue'

definePage({
  meta: {
    name: 'Daftar Refund',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const refundStore = useRefundStore()

const { paginateData, isLoadingFetchData, requestQuery }
  = storeToRefs(refundStore)

const { smAndDown } = useDisplay()

const isFilterVisible = ref(false)
const search = ref('')
const isCreateModalOpen = ref(false)
const selectedRefund = ref<any>(null)
type ReadonlyHeaders = VDataTable['$props']['headers']

const perPages = [10, 25, 50, 100]

const statusOptions = [
  { title: 'Draft', value: 'DRAFT', color: 'warning' },
  { title: 'Belum Diproses', value: 'OPEN', color: 'info' },
  { title: 'Selesai', value: 'COMPLETED', color: 'success' },
  { title: 'Dibatalkan', value: 'CANCELLED', color: 'error' },
]

const refundMethods = [
  { title: 'Cash', value: 'CASH' },
  { title: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { title: 'Credit Card', value: 'CREDIT_CARD' },
  { title: 'Debit Card', value: 'DEBIT_CARD' },
  { title: 'QRIS', value: 'QRIS' },
  { title: 'E-Wallet', value: 'E_WALLET' },
  { title: 'Check', value: 'CHECK' },
  { title: 'Other', value: 'OTHER' },
]

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'KODE REFUND', key: 'refundCode', sortable: true },
  { title: 'TANGGAL', key: 'refundDate', sortable: true },
  { title: 'INVOICE', key: 'invoice.invoiceNumber', sortable: false },
  { title: 'METODE', key: 'refundMethod', sortable: false },
  { title: 'JUMLAH', key: 'amount', align: 'end', sortable: true },
  {
    title: 'STATUS',
    key: 'status',
    align: 'center',
    width: '10%',
    sortable: false,
  },
  { title: 'DIBUAT OLEH', key: 'createdByUser.name', sortable: false },
  {
    title: 'AKSI',
    key: 'actions',
    align: 'center',
    width: '8%',
    sortable: false,
  },
]

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: any, event: MouseEvent | PointerEvent) => {
  selectedRefund.value = item
  openFromEvent(event)
}

const fetchRefunds = async () => {
  await refundStore.fetchPaginatedData()
}

watch(
  search,
  customDebounce((newValue: string) => {
    requestQuery.value.search = newValue
    requestQuery.value.page = 1
    fetchRefunds()
  }, 500),
)

watch(
  () => requestQuery.value.perPage,
  () => {
    requestQuery.value.page = 1
    fetchRefunds()
  },
)

const onPageChange = (page: number) => {
  requestQuery.value.page = page
  fetchRefunds()
}

const onSortBy = (sortBy: any) => {
  refundStore.onSortBy(sortBy)
}

const getStatusConfig = (status: string) => {
  return (
    statusOptions.find(option => option.value === status) || statusOptions[0]
  )
}

const onFilter = () => {
  requestQuery.value.page = 1
  fetchRefunds()
}

const onResetFilter = () => {
  refundStore.resetFilter()
  fetchRefunds()
}

const onRefundCreated = () => {
  isCreateModalOpen.value = false
  fetchRefunds()
}

const isCompleteDialogOpen = ref(false)
const refundToComplete = ref<any>(null)
const isCompleting = ref(false)

const openCompleteDialog = (refund: any) => {
  refundToComplete.value = refund
  isCompleteDialogOpen.value = true
}

const handleComplete = async () => {
  if (!refundToComplete.value)
    return

  isCompleting.value = true
  try {
    await $salesAPI(`refunds/${refundToComplete.value.refundId}/complete`, {
      method: 'POST',
    })
    showToast('Refund berhasil diselesaikan', 'success')
    isCompleteDialogOpen.value = false
    await fetchRefunds()
  }
  catch (error: any) {
    console.error('Failed to complete refund:', error)

    const errorMessage
      = error?.response?._data?.message
      || error?.response?.data?.message
      || error?.message
      || 'Gagal menyelesaikan refund'

    showToast(errorMessage, 'error')
  }
  finally {
    isCompleting.value = false
  }
}

const isCancelDialogOpen = ref(false)
const refundToCancel = ref<any>(null)
const isCancelling = ref(false)

const openCancelDialog = (refund: any) => {
  refundToCancel.value = refund
  isCancelDialogOpen.value = true
}

const handleCancel = async (reason: string) => {
  if (!refundToCancel.value)
    return

  isCancelling.value = true
  try {
    await $salesAPI(`refunds/${refundToCancel.value.refundId}/cancel`, {
      method: 'POST',
      body: {
        cancelReason: reason,
      },
    })
    showToast('Refund berhasil dibatalkan', 'success')
    isCancelDialogOpen.value = false
    await fetchRefunds()
  }
  catch (error: any) {
    console.error('Failed to cancel refund:', error)

    const errorMessage
      = error?.response?._data?.message
      || error?.response?.data?.message
      || error?.message
      || 'Gagal membatalkan refund'

    showToast(errorMessage, 'error')
  }
  finally {
    isCancelling.value = false
  }
}

const canComplete = (refund: any) => {
  return refund.status === 'OPEN' || refund.status === 'DRAFT'
}

const canCancel = (refund: any) => {
  return refund.status !== 'CANCELLED' && refund.status !== 'COMPLETED'
}

onMounted(() => {
  fetchRefunds()
})
</script>

<template>
  <div>
    <VCard
      class="mb-4"
      elevation="2"
    >
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          <VIcon
            icon="tabler-receipt-refund"
            class="me-2"
            color="primary"
          />
          Data Refund
        </span>
        <VBtn
          color="primary"
          variant="elevated"
          prepend-icon="tabler-plus"
          @click="isCreateModalOpen = true"
        >
          Buat Refund
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
              prepend-inner-icon="tabler-list"
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
              placeholder="Cari Kode Refund / Invoice..."
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
            <VForm @submit.prevent="onFilter">
              <VRow>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppDateTimePicker
                    v-model="requestQuery.dateFrom"
                    label="Dari Tanggal"
                    placeholder="Pilih tanggal"
                    clearable
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppDateTimePicker
                    v-model="requestQuery.dateTo"
                    label="Sampai Tanggal"
                    placeholder="Pilih tanggal"
                    clearable
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label
                    for="status"
                    class="v-label text-body-2 mb-1"
                  >Status</label>
                  <VSelect
                    v-model="requestQuery.status"
                    :items="statusOptions"
                    placeholder="Semua Status"
                    clearable
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label
                    for="refundMethod"
                    class="v-label text-body-2 mb-1"
                  >Metode Refund</label>
                  <VSelect
                    v-model="requestQuery.refundMethod"
                    :items="refundMethods"
                    placeholder="Semua Metode"
                    clearable
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  class="d-flex justify-end"
                >
                  <VBtn
                    class="me-3"
                    color="error"
                    variant="outlined"
                    append-icon="tabler-reload"
                    @click="onResetFilter"
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
        :items="paginateData.data || []"
        :items-length="paginateData.meta?.total || 0"
        :loading="isLoadingFetchData"
        loading-text="Memuat data refund..."
        class="text-no-wrap elevation-1"
        :items-per-page="requestQuery.perPage"
        @update:page="onPageChange"
        @update:sort-by="onSortBy"
      >
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

        <template #item="{ index, item }">
          <tr
            class="cursor-pointer"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          >
            <td>
              <span class="text-body-2 font-weight-medium">{{
                (paginateData.meta?.from || 0) + index
              }}</span>
            </td>
            <td>
              <RouterLink
                :to="`/sales/refunds/${item.refundId}`"
                class="font-weight-medium text-primary text-decoration-none"
                @click.stop
              >
                {{ item.refundCode }}
              </RouterLink>
            </td>
            <td>
              <div class="text-body-2">
                <div>{{ formatDate(item.refundDate) }}</div>
              </div>
            </td>
            <td>
              <div class="d-flex align-center">
                <VAvatar
                  size="32"
                  color="info"
                  class="me-3"
                  variant="tonal"
                >
                  <VIcon
                    icon="tabler-invoice"
                    size="16"
                  />
                </VAvatar>
                <div>
                  <RouterLink
                    v-if="item.invoice"
                    :to="`/sales/invoices/${item.invoice.invoiceId}`"
                    class="text-primary text-decoration-none font-weight-medium"
                    @click.stop
                  >
                    {{ item.invoice.invoiceNumber }}
                  </RouterLink>
                  <span v-else>-</span>
                </div>
              </div>
            </td>
            <td>
              <VChip
                size="small"
                color="primary"
                class="text-capitalize"
              >
                {{ item.refundMethod?.replace(/_/g, " ").toLowerCase() }}
              </VChip>
            </td>
            <td class="text-end">
              <span class="text-error font-weight-medium">
                - {{ formatCurrency(item.amount) }}
              </span>
            </td>
            <td class="text-center">
              <VChip
                :color="getStatusConfig(item.status).color"
                size="small"
                variant="flat"
              >
                {{ getStatusConfig(item.status).title }}
              </VChip>
            </td>
            <td>
              {{ item.createdByUser?.name || "-" }}
            </td>
            <td class="text-center">
              <VBtn
                icon="tabler-dots-vertical"
                variant="text"
                size="small"
                @click.stop="onRowClick(item, $event)"
                @contextmenu.prevent="openFromEvent"
              />
            </td>
          </tr>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-receipt-refund"
              size="64"
              color="disabled"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              Tidak ada data refund
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Belum ada refund yang dibuat atau sesuai dengan filter pencarian
            </p>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-space-between gap-4 mt-2">
              <span class="text-sm text-disabled">
                Menampilkan {{ paginateData.meta?.from || 0 }} sampai
                {{ paginateData.meta?.to || 0 }} dari
                {{ paginateData.meta?.total || 0 }} data
              </span>
              <VPagination
                v-model="requestQuery.page"
                :total-visible="smAndDown ? 3 : 5"
                :length="paginateData.meta?.lastPage || 1"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>

      <!-- Context Menu -->
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
          v-if="selectedRefund"
          class="py-2"
        >
          <VListItem
            title="Lihat Detail"
            prepend-icon="tabler-eye"
            @click="router.push(`/sales/refunds/${selectedRefund.refundId}`)"
          />
          <VDivider
            v-if="canComplete(selectedRefund) || canCancel(selectedRefund)"
            class="my-1"
          />
          <VListItem
            v-if="canComplete(selectedRefund)"
            title="Selesaikan Refund"
            prepend-icon="tabler-check"
            class="text-success"
            @click="openCompleteDialog(selectedRefund)"
          />
          <VListItem
            v-if="canCancel(selectedRefund)"
            title="Batalkan Refund"
            prepend-icon="tabler-ban"
            class="text-error"
            @click="openCancelDialog(selectedRefund)"
          />
        </VList>
      </VMenu>
    </VCard>

    <!-- Complete Refund Dialog -->
    <CompleteRefundDialog
      v-model="isCompleteDialogOpen"
      :refund="refundToComplete"
      :loading="isCompleting"
      @confirm="handleComplete"
    />

    <!-- Cancel Dialog -->
    <CancelRefundDialog
      v-model="isCancelDialogOpen"
      :refund="refundToCancel"
      :loading="isCancelling"
      @confirm="handleCancel"
    />

    <!-- Create Refund Modal -->
    <RefundCreateModal
      v-model="isCreateModalOpen"
      @success="onRefundCreated"
    />
  </div>
</template>
