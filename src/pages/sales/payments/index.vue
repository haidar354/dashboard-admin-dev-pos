<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import RefundCreateModal from '@/components/dialogs/RefundCreateModal.vue'
import VoidPaymentDialog from '@/components/sales/payments/VoidPaymentDialog.vue'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { usePaymentStore } from '@/stores/sales/paymentStore'
import { showToast } from '@/utils/toaster'

definePage({
  meta: {
    name: 'Pembayaran Masuk',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const paymentStore = usePaymentStore()

const { paginateData, isLoadingFetchData, requestQuery, additionalFilter }
  = storeToRefs(paymentStore)

const headers = [
  { title: 'Kode', key: 'paymentCode', sortable: true },
  { title: 'Tanggal', key: 'paymentDate', sortable: true },
  { title: 'Jumlah', key: 'amount', sortable: true },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Metode', key: 'paymentMethod', sortable: false },
  { title: 'Terkait', key: 'invoice', sortable: false },
  { title: 'Diterima Oleh', key: 'createdByUser', sortable: false },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'end' },
]

const paymentMethods = [
  { title: 'Cash', value: 'CASH' },
  { title: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { title: 'Credit Card', value: 'CREDIT_CARD' },
  { title: 'Debit Card', value: 'DEBIT_CARD' },
  { title: 'QRIS', value: 'QRIS' },
  { title: 'E-Wallet', value: 'E_WALLET' },
  { title: 'Check', value: 'CHECK' },
  { title: 'Other', value: 'OTHER' },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD MMM YYYY HH:mm')
}

const fetchPayments = () => {
  paymentStore.fetchPaginatedData()
}

const onPageChange = (page: number) => {
  requestQuery.value.page = page
  fetchPayments()
}

const onPerPageChange = (perPage: number) => {
  requestQuery.value.perPage = perPage
  requestQuery.value.page = 1
  fetchPayments()
}

const isFilterVisible = ref(false)
const selectedPayment = ref<any>(null)

// Dialog states
const isVoidDialogOpen = ref(false)
const isRefundDialogOpen = ref(false)

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: any, event: MouseEvent | PointerEvent) => {
  selectedPayment.value = item
  openFromEvent(event)
}

const openVoidDialog = (payment: any) => {
  selectedPayment.value = payment
  isVoidDialogOpen.value = true
}

const openRefundDialog = (payment: any) => {
  selectedPayment.value = payment
  isRefundDialogOpen.value = true
}

const handleDialogSuccess = () => {
  fetchPayments() // Refresh data after void/refund
}

const handleDownloadPDF = async (payment: any) => {
  try {
    await paymentStore.downloadPDF(payment.paymentId)
    showToast('PDF berhasil diunduh', 'success')
  }
  catch (error) {
    showToast('Gagal mengunduh PDF', 'error')
  }
}

const handlePrintDotMatrix = async (payment: any) => {
  try {
    await paymentStore.printDotMatrix(payment.paymentId)
    showToast('File print berhasil diunduh', 'success')
  }
  catch (error) {
    showToast('Gagal mengunduh file print', 'error')
  }
}

const onSearch = () => {
  setTimeout(() => {
    requestQuery.value.page = 1
    fetchPayments()
  }, 500)
}

const onFilter = () => {
  paymentStore.applyFilter()
}

const onReset = () => {
  paymentStore.resetFilter()
  fetchPayments()
}

onMounted(() => {
  fetchPayments()
})
</script>

<template>
  <div>
    <VCard class="mb-6">
      <VCardText class="d-flex flex-wrap justify-space-between gap-4">
        <div class="d-flex align-center gap-2">
          <span class="text-h5">Daftar Pembayaran Faktur</span>
        </div>
        <div class="d-flex align-center gap-2 flex-wrap">
          <VBtn
            prepend-icon="tabler-plus"
            @click="router.push('/sales/payments/create')"
          >
            Buat Pembayaran
          </VBtn>
        </div>
      </VCardText>

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
              v-model="requestQuery.search"
              class="ms-0 ms-sm-3 mt-3 mt-sm-0 flex-1-1-100 flex-sm-fill"
              placeholder="Cari Kode Pembayaran..."
              append-inner-icon="tabler-search"
              single-line
              hide-details
              dense
              outlined
              @input="onSearch"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VExpandTransition>
        <div v-show="isFilterVisible">
          <VDivider />
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="4"
              >
                <AppDateTimePicker
                  v-model="additionalFilter.dateFrom"
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
                  v-model="additionalFilter.dateTo"
                  label="Sampai Tanggal"
                  placeholder="Pilih tanggal"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <label for="paymentMethod">Metode Pembayaran</label>
                <VSelect
                  v-model="additionalFilter.paymentMethod"
                  :items="paymentMethods"
                  placeholder="Semua Metode"
                  clearable
                  class="mt-1"
                />
              </VCol>
              <VCol
                cols="12"
                class="d-flex align-end gap-2 justify-end"
              >
                <VBtn
                  color="primary"
                  prepend-icon="tabler-filter"
                  @click="onFilter"
                >
                  Terapkan
                </VBtn>
                <VBtn
                  color="secondary"
                  variant="tonal"
                  prepend-icon="tabler-refresh"
                  @click="onReset"
                >
                  Reset
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </div>
      </VExpandTransition>

      <VDivider />

      <VDataTableServer
        v-model:items-per-page="requestQuery.perPage"
        :headers="headers"
        :items="paginateData.data || []"
        :items-length="paginateData.meta?.total || 0"
        :loading="isLoadingFetchData"
        loading-text="Memuat data..."
        class="text-no-wrap"
        @update:page="onPageChange"
        @update:items-per-page="onPerPageChange"
      >
        <template #item="{ item }">
          <tr
            class="cursor-pointer"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          >
            <td>
              <span class="font-weight-medium">
                {{ item?.paymentCode || "-" }}
              </span>
            </td>
            <td>
              {{
                item?.paymentDate
                  ? formatDate(item.paymentDate)
                  : item?.createdAt
                    ? formatDate(item.createdAt)
                    : "-"
              }}
            </td>
            <td class="text-end">
              <span
                v-if="item?.amount !== undefined"
                class="font-weight-medium"
                :class="[
                  item.amount < 0 ? 'text-error' : 'text-success',
                ]"
              >
                {{ formatCurrency(item.amount) }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <VChip
                v-if="item.isVoided"
                color="error"
                size="small"
                class="text-capitalize"
              >
                Dibatalkan
              </VChip>
              <VChip
                v-else-if="item.refundStatus === 'FULLY_REFUNDED'"
                color="warning"
                size="small"
                class="text-capitalize"
              >
                Refund Penuh
              </VChip>
              <VChip
                v-else-if="item.refundStatus === 'PARTIALLY_REFUNDED'"
                color="warning"
                size="small"
                class="text-capitalize"
              >
                Refund Sebagian
              </VChip>
              <VChip
                v-else
                color="success"
                size="small"
                class="text-capitalize"
              >
                Normal
              </VChip>
            </td>
            <td>
              <VChip
                v-if="item?.paymentMethod"
                size="small"
                color="primary"
                class="text-capitalize"
              >
                {{ item.paymentMethod.replace(/_/g, " ").toLowerCase() }}
              </VChip>
              <span v-else>-</span>
            </td>
            <td>
              <div v-if="item?.invoice">
                <span class="text-caption text-medium-emphasis">Invoice:</span>
                <RouterLink
                  :to="`/sales/invoices/${item.invoice.invoiceId}`"
                  class="text-primary ms-1"
                >
                  {{ item.invoice.invoiceNumber }}
                </RouterLink>
                <div
                  v-if="item.invoice.order?.salesOrder"
                  class="text-caption"
                >
                  SO: {{ item.invoice.order.orderCode }}
                </div>
              </div>
              <span v-else>-</span>
            </td>
            <td>
              {{ item?.createdByUser?.name || "-" }}
            </td>
            <td class="text-center">
              <VBtn
                icon="tabler-dots-vertical"
                variant="text"
                size="small"
                @click="onRowClick(item, $event)"
                @contextmenu.prevent="openFromEvent"
              />
            </td>
          </tr>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="requestQuery.page"
            :items-per-page="requestQuery.perPage"
            :total-items="paginateData.meta?.total || 0"
          />
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
          v-if="selectedPayment"
          class="py-2"
        >
          <VListItem
            title="Lihat Detail"
            prepend-icon="tabler-eye"
            @click="router.push(`/sales/payments/${selectedPayment.paymentId}`)"
          />
          <VListItem
            title="Download PDF"
            prepend-icon="tabler-download"
            @click="handleDownloadPDF(selectedPayment)"
          />
          <VListItem
            title="Print Dot Matrix"
            prepend-icon="tabler-printer"
            @click="handlePrintDotMatrix(selectedPayment)"
          />
          <VDivider class="my-1" />
          <VListItem
            v-if="!selectedPayment.isVoided"
            title="Batalkan (Void)"
            prepend-icon="tabler-ban"
            class="text-warning"
            @click="openVoidDialog(selectedPayment)"
          />
          <VListItem
            v-if="!selectedPayment.isVoided"
            title="Refund"
            prepend-icon="tabler-receipt-refund"
            class="text-error"
            @click="openRefundDialog(selectedPayment)"
          />
        </VList>
      </VMenu>
    </VCard>

    <!-- Void Dialog Component -->
    <VoidPaymentDialog
      v-if="selectedPayment"
      v-model="isVoidDialogOpen"
      :payment-id="selectedPayment.paymentId"
      @success="handleDialogSuccess"
    />

    <!-- Refund Create Modal -->
    <RefundCreateModal
      v-if="selectedPayment"
      v-model="isRefundDialogOpen"
      :payment-id="selectedPayment.paymentId"
      @success="handleDialogSuccess"
    />
  </div>
</template>
