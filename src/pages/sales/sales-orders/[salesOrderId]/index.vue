<script setup lang="ts">
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import { useSalesOrderStore } from '@/stores/sales/salesOrderStore'
import { translateStatus } from '@/utils/common'

definePage({
  meta: {
    name: 'Detail Pesanan Penjualan (SO)',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const route = useRoute()
const salesOrderId = route.params.salesOrderId as string

const salesOrderStore = useSalesOrderStore()

const {
  selectedSalesOrder,
  isLoadingFetchDetail,
  isLoadingConfirm,
  isLoadingDownload,
} = storeToRefs(salesOrderStore)

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'secondary'
    case 'open':
      return 'info'
    case 'confirmed':
      return 'success'
    case 'in_production':
      return 'warning'
    case 'ready':
      return 'success'
    case 'delivered':
      return 'primary'
    case 'completed':
      return 'success'
    case 'closed':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const productionStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'secondary'
    case 'scheduled':
      return 'info'
    case 'in_progress':
      return 'warning'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const fulfillmentStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'UNFULFILLED':
      return 'secondary'
    case 'PREPARING':
      return 'warning'
    case 'PARTIALLY_SERVED':
      return 'info'
    case 'SERVED':
      return 'success'
    case 'DELIVERED':
      return 'success'
    case 'RETURNED':
      return 'error'
    default:
      return 'default'
  }
}

const paymentStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'UNPAID':
      return 'error'
    case 'PARTIALLY_PAID':
      return 'warning'
    case 'PAID':
      return 'success'
    case 'OVERPAID':
      return 'info'
    default:
      return 'default'
  }
}

const fetchSalesOrder = async () => {
  try {
    await salesOrderStore.fetchDetail(salesOrderId, {
      include: [
        'order',
        'order.lines',
        'order.lines.itemSku',
        'order.customer',
        'order.deliveries',
        'order.deliveries.lines',
      ],
    })
  }
  catch (error) {
    console.error(error)
    showToast('Gagal memuat data pesanan penjualan (SO)', 'error')
    router.back()
  }
}

const confirmOrder = async () => {
  const isConfirmed = await useConfirmDialogStore().openGenericDialog(
    `Yakin ingin mengkonfirmasi pesanan penjualan (SO) "${selectedSalesOrder.value.order?.orderCode}" ini?`,
    {
      title: 'Konfirmasi Pesanan',
      confirmText: 'Ya, Konfirmasi',
      cancelText: 'Batal',
      color: 'primary',
      icon: 'tabler-check',
    },
  )

  if (!isConfirmed)
    return

  try {
    await salesOrderStore.confirmSalesOrder(salesOrderId)
    await fetchSalesOrder() // Refresh data
  }
  catch (error) {
    // Error handling sudah di store
  }
}

const downloadPDF = async () => {
  if (!selectedSalesOrder.value)
    return
  await salesOrderStore.downloadPdf(selectedSalesOrder.value)
}

const createDelivery = async () => {
  // Navigate to create delivery page with pre-filled orderId and salesOrderId
  router.push({
    path: '/sales/delivery-orders/create',
    query: {
      orderId: selectedSalesOrder.value?.orderId,
      salesOrderId,
    },
  })
}

const createInvoice = async () => {
  // Navigate to create invoice page with pre-filled orderId and salesOrderId
  router.push({
    path: '/sales/invoices/create',
    query: {
      orderId: selectedSalesOrder.value?.orderId,
      salesOrderId,
    },
  })
}

const voidOrder = async () => {
  const isConfirmed = await useConfirmDialogStore().openGenericDialog(
    `Yakin ingin membatalkan (void) pesanan penjualan (SO) "${selectedSalesOrder.value?.order?.orderCode}" ini? Tindakan ini tidak dapat dibatalkan.`,
    {
      title: 'Konfirmasi Void Pesanan',
      confirmText: 'Ya, Void Pesanan',
      cancelText: 'Batal',
      color: 'error',
      icon: 'tabler-ban',
    },
  )

  if (!isConfirmed)
    return

  try {
    await salesOrderStore.voidSalesOrder(salesOrderId)
    await fetchSalesOrder() // Refresh data
  }
  catch (error) {
    // Error handling sudah di store
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
  return dayjs(date).format('DD MMMM YYYY')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('DD MMMM YYYY HH:mm')
}

onMounted(() => {
  fetchSalesOrder()
})
</script>

<template>
  <div>
    <VCard
      v-if="isLoadingFetchDetail"
      class="text-center py-8"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
      <p class="mt-4">
        Memuat data pesanan penjualan...
      </p>
    </VCard>

    <div v-else-if="selectedSalesOrder && selectedSalesOrder.order">
      <!-- Header -->
      <VCard>
        <VCardText class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
          <div class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              @click="router.push('/sales/sales-orders')"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div class="ms-3">
              <h2 class="text-h5">
                {{
                  selectedSalesOrder.orderNumber
                    || selectedSalesOrder.order.orderCode
                }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Detail Pesanan Penjualan (SO)
              </p>
            </div>
          </div>

          <VBtn
            color="primary"
            variant="tonal"
            prepend-icon="tabler-download"
            :loading="isLoadingDownload"
            @click="downloadPDF"
          >
            Download PDF
          </VBtn>
        </VCardText>
      </VCard>

      <VRow class="mt-4">
        <!-- Left Column -->
        <VCol
          cols="12"
          md="8"
        >
          <!-- Order Information -->
          <VCard>
            <VCardTitle class="d-flex align-center justify-space-between">
              <span>Informasi Pesanan</span>
              <VChip
                :color="statusColor(selectedSalesOrder.order.status)"
                size="small"
                class="text-uppercase"
              >
                {{ translateStatus(selectedSalesOrder.order.status) }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Nomor Pesanan
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{
                        selectedSalesOrder.orderNumber
                          || selectedSalesOrder.order.orderCode
                      }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Tanggal Pesanan
                    </div>
                    <div class="text-body-1">
                      {{
                        formatDateTime(
                          selectedSalesOrder.order.openedAt
                            || selectedSalesOrder.createdAt,
                        )
                      }}
                    </div>
                  </div>
                  <div
                    v-if="selectedSalesOrder.quotationNumber"
                    class="mb-4"
                  >
                    <div class="text-caption text-medium-emphasis">
                      Dari Penawaran (SQ)
                    </div>
                    <div class="text-body-1">
                      {{ selectedSalesOrder.quotationNumber }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Status Pembayaran
                    </div>
                    <VChip
                      :color="
                        paymentStatusColor(
                          selectedSalesOrder.order.paymentStatus,
                        )
                      "
                      size="small"
                      class="text-uppercase"
                    >
                      {{
                        translateStatus(selectedSalesOrder.order.paymentStatus)
                      }}
                    </VChip>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Status Pengiriman
                    </div>
                    <VChip
                      :color="
                        fulfillmentStatusColor(
                          selectedSalesOrder.order.fulfillmentStatus,
                        )
                      "
                      size="small"
                      class="text-uppercase"
                    >
                      {{
                        translateStatus(
                          selectedSalesOrder.order.fulfillmentStatus
                            || "UNFULFILLED",
                        )
                      }}
                    </VChip>
                  </div>
                  <!--
                    <div
                    v-if="selectedSalesOrder.productionStatus"
                    class="mb-4"
                    >
                    <div class="text-caption text-medium-emphasis">
                    Status Produksi
                    </div>
                    <VChip
                    :color="
                    productionStatusColor(
                    selectedSalesOrder.productionStatus,
                    )
                    "
                    size="small"
                    class="text-uppercase"
                    >
                    {{ translateStatus(selectedSalesOrder.productionStatus) }}
                    </VChip>
                    </div>
                  -->
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Termin Pembayaran
                    </div>
                    <div class="text-body-1">
                      {{ selectedSalesOrder.paymentTerms || "COD" }}
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Customer Information -->
          <VCard class="mt-4">
            <VCardTitle>Informasi Pelanggan</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Nama Pelanggan
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ selectedSalesOrder.order.customerName }}
                </div>
              </div>
              <div
                v-if="selectedSalesOrder.order.customerPhone"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Telepon
                </div>
                <div class="text-body-1">
                  {{ selectedSalesOrder.order.customerPhone }}
                </div>
              </div>
              <div
                v-if="selectedSalesOrder.customerPurchaseOrderNumber"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Nomor PO Pelanggan
                </div>
                <div class="text-body-1">
                  {{ selectedSalesOrder.customerPurchaseOrderNumber }}
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Delivery Information -->
          <VCard
            v-if="
              selectedSalesOrder.deliveryDate
                || selectedSalesOrder.deliveryAddress
            "
            class="mt-4"
          >
            <VCardTitle>Informasi Pengiriman</VCardTitle>
            <VCardText>
              <div
                v-if="selectedSalesOrder.deliveryDate"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Tanggal Pengiriman
                </div>
                <div class="text-body-1">
                  {{ formatDate(selectedSalesOrder.deliveryDate) }}
                </div>
              </div>
              <div
                v-if="selectedSalesOrder.deliveryAddress"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Alamat Pengiriman
                </div>
                <div class="text-body-1">
                  {{ selectedSalesOrder.deliveryAddress }}
                </div>
              </div>
              <div
                v-if="selectedSalesOrder.deliveryContactName"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Kontak Pengiriman
                </div>
                <div class="text-body-1">
                  {{ selectedSalesOrder.deliveryContactName }}
                  <span v-if="selectedSalesOrder.deliveryContactPhone">
                    - {{ selectedSalesOrder.deliveryContactPhone }}
                  </span>
                </div>
              </div>
              <div
                v-if="selectedSalesOrder.deliveryNotes"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Catatan Pengiriman
                </div>
                <div class="text-body-1">
                  {{ selectedSalesOrder.deliveryNotes }}
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Delivery History -->
          <VCard
            v-if="
              selectedSalesOrder.order.deliveries
                && selectedSalesOrder.order.deliveries.length > 0
            "
            class="mt-4"
          >
            <VCardTitle>Riwayat Pengiriman</VCardTitle>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>No. DO</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th class="text-center">
                      Item
                    </th>
                    <th class="text-end">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="doItem in selectedSalesOrder.order.deliveries"
                    :key="doItem.deliveryId"
                  >
                    <td>
                      <span
                        class="text-primary cursor-pointer font-weight-medium"
                        @click="
                          router.push(
                            `/sales/delivery-orders/${doItem.deliveryId}`,
                          )
                        "
                      >
                        {{ doItem.deliveryNumber }}
                      </span>
                    </td>
                    <td>{{ formatDate(doItem.createdAt) }}</td>
                    <td>
                      <VChip
                        :color="statusColor(doItem.status)"
                        size="x-small"
                      >
                        {{ translateStatus(doItem.status) }}
                      </VChip>
                    </td>
                    <td class="text-center">
                      {{ doItem.lines?.length || 0 }} Item
                    </td>
                    <td class="text-end">
                      <VBtn
                        icon
                        variant="text"
                        size="small"
                        @click="
                          router.push(
                            `/sales/delivery-orders/${doItem.deliveryId}`,
                          )
                        "
                      >
                        <VIcon icon="tabler-eye" />
                      </VBtn>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Order Items -->
          <VCard class="mt-4">
            <VCardTitle>Item Pesanan</VCardTitle>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-center">
                      Qty
                    </th>
                    <th class="text-end">
                      Harga
                    </th>
                    <th class="text-end">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="line in selectedSalesOrder.order.lines"
                    :key="line.orderLineId"
                  >
                    <td>
                      <div>
                        <strong>{{ line.itemName }}</strong>
                        <div
                          v-if="line.itemSku"
                          class="text-caption text-medium-emphasis"
                        >
                          {{ line.itemSku.skuCode }}
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      {{ line.quantity }}
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(line.unitPrice) }}
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(line.totalPrice) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Notes -->
          <VCard
            v-if="
              selectedSalesOrder.order.notes
                || selectedSalesOrder.quotationNotes
            "
            class="mt-4"
          >
            <VCardTitle>Catatan</VCardTitle>
            <VCardText>
              <div
                v-if="selectedSalesOrder.order.notes"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Catatan Pesanan
                </div>
                <div class="text-body-1">
                  {{ selectedSalesOrder.order.notes }}
                </div>
              </div>
              <div
                v-if="selectedSalesOrder.quotationNotes"
                class="mb-3"
              >
                <div class="text-caption text-medium-emphasis">
                  Catatan dari Penawaran
                </div>
                <div class="text-body-1">
                  {{ selectedSalesOrder.quotationNotes }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column -->
        <VCol
          cols="12"
          md="4"
        >
          <!-- Actions Card -->
          <VCard>
            <VCardTitle>Aksi</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-2">
                <!-- Draft Status Actions -->
                <VBtn
                  v-if="selectedSalesOrder.order.status === 'DRAFT'"
                  color="success"
                  prepend-icon="tabler-check"
                  :loading="isLoadingConfirm"
                  block
                  @click="confirmOrder"
                >
                  Konfirmasi Pesanan
                </VBtn>
                <VBtn
                  v-if="selectedSalesOrder.order.status === 'DRAFT'"
                  color="primary"
                  prepend-icon="tabler-edit"
                  block
                  @click="
                    router.push(`/sales/sales-orders/${salesOrderId}/edit`)
                  "
                >
                  Edit Pesanan
                </VBtn>

                <!-- Open Status Actions -->
                <VBtn
                  v-if="selectedSalesOrder.order.status === 'OPEN'"
                  color="primary"
                  prepend-icon="tabler-truck-delivery"
                  block
                  @click="createDelivery"
                >
                  Buat Surat Jalan
                </VBtn>
                <VBtn
                  v-if="selectedSalesOrder.order.status === 'OPEN'"
                  color="info"
                  prepend-icon="tabler-file-invoice"
                  block
                  @click="createInvoice"
                >
                  Buat Tagihan
                </VBtn>

                <!-- Create Return Button (for DELIVERED orders) -->
                <VBtn
                  v-if="selectedSalesOrder.order.fulfillmentStatus === 'DELIVERED'"
                  color="warning"
                  prepend-icon="tabler-rotate-2"
                  block
                  @click="router.push(`/sales/returns/create?orderId=${selectedSalesOrder.orderId}`)"
                >
                  Buat Retur
                </VBtn>

                <VBtn
                  v-if="selectedSalesOrder.order.status === 'OPEN'"
                  color="error"
                  variant="outlined"
                  prepend-icon="tabler-ban"
                  block
                  @click="voidOrder"
                >
                  Void Pesanan
                </VBtn>

                <!-- Info when no actions available -->
                <VAlert
                  v-if="
                    selectedSalesOrder.order.status !== 'DRAFT'
                      && selectedSalesOrder.order.status !== 'OPEN'
                      && selectedSalesOrder.order.fulfillmentStatus !== 'DELIVERED'
                  "
                  type="info"
                  variant="tonal"
                  density="compact"
                >
                  Tidak ada aksi tersedia untuk status ini
                </VAlert>
              </div>
            </VCardText>
          </VCard>

          <!-- Order Summary -->
          <VCard class="mt-4">
            <VCardTitle>Ringkasan Pesanan</VCardTitle>
            <VCardText>
              <div class="d-flex justify-space-between mb-2">
                <span>Subtotal:</span>
                <strong>{{
                  formatCurrency(selectedSalesOrder.order.subtotal)
                }}</strong>
              </div>
              <div
                v-if="selectedSalesOrder.order.discountTotal > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span>Diskon:</span>
                <strong class="text-error">-
                  {{
                    formatCurrency(selectedSalesOrder.order.discountTotal)
                  }}</strong>
              </div>
              <div
                v-if="selectedSalesOrder.order.taxTotal > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span>Pajak:</span>
                <strong>{{
                  formatCurrency(selectedSalesOrder.order.taxTotal)
                }}</strong>
              </div>
              <VDivider class="my-3" />
              <div class="d-flex justify-space-between">
                <span class="text-h6">Total:</span>
                <strong class="text-h6 text-primary">
                  {{ formatCurrency(selectedSalesOrder.order.grandTotal) }}
                </strong>
              </div>
              <div
                v-if="selectedSalesOrder.order.paidTotal > 0"
                class="mt-3"
              >
                <div class="d-flex justify-space-between mb-2">
                  <span>Dibayar:</span>
                  <strong class="text-success">{{
                    formatCurrency(selectedSalesOrder.order.paidTotal)
                  }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Sisa:</span>
                  <strong class="text-warning">
                    {{
                      formatCurrency(
                        selectedSalesOrder.order.grandTotal
                          - selectedSalesOrder.order.paidTotal,
                      )
                    }}
                  </strong>
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Production Info -->
          <!--
            <VCard
            v-if="selectedSalesOrder.productionStatus"
            class="mt-4"
            >
            <VCardTitle>Informasi Produksi</VCardTitle>
            <VCardText>
            <div class="mb-3">
            <div class="text-caption text-medium-emphasis">
            Status
            </div>
            <VChip
            :color="
            productionStatusColor(selectedSalesOrder.productionStatus)
            "
            size="small"
            class="text-uppercase"
            >
            {{ translateStatus(selectedSalesOrder.productionStatus) }}
            </VChip>
            </div>
            <div
            v-if="selectedSalesOrder.productionScheduledAt"
            class="mb-3"
            >
            <div class="text-caption text-medium-emphasis">
            Dijadwalkan
            </div>
            <div class="text-body-1">
            {{ formatDateTime(selectedSalesOrder.productionScheduledAt) }}
            </div>
            </div>
            <div
            v-if="selectedSalesOrder.productionStartedAt"
            class="mb-3"
            >
            <div class="text-caption text-medium-emphasis">
            Dimulai
            </div>
            <div class="text-body-1">
            {{ formatDateTime(selectedSalesOrder.productionStartedAt) }}
            </div>
            </div>
            <div
            v-if="selectedSalesOrder.productionCompletedAt"
            class="mb-3"
            >
            <div class="text-caption text-medium-emphasis">
            Selesai
            </div>
            <div class="text-body-1">
            {{ formatDateTime(selectedSalesOrder.productionCompletedAt) }}
            </div>
            </div>
            </VCardText>
            </VCard>
          -->

          <!-- Timeline -->
          <VCard class="mt-4">
            <VCardTitle>Timeline</VCardTitle>
            <VCardText>
              <VTimeline
                density="compact"
                align="start"
                side="end"
              >
                <VTimelineItem
                  dot-color="primary"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(selectedSalesOrder.createdAt) }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    Pesanan Dibuat
                  </div>
                </VTimelineItem>

                <VTimelineItem
                  v-if="selectedSalesOrder.quotationApprovedAt"
                  dot-color="success"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(selectedSalesOrder.quotationApprovedAt) }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    Penawaran Disetujui
                  </div>
                </VTimelineItem>

                <VTimelineItem
                  v-if="selectedSalesOrder.productionStartedAt"
                  dot-color="warning"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(selectedSalesOrder.productionStartedAt) }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    Produksi Dimulai
                  </div>
                </VTimelineItem>

                <VTimelineItem
                  v-if="selectedSalesOrder.productionCompletedAt"
                  dot-color="success"
                  size="small"
                >
                  <div class="text-caption text-medium-emphasis">
                    {{
                      formatDateTime(selectedSalesOrder.productionCompletedAt)
                    }}
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    Produksi Selesai
                  </div>
                </VTimelineItem>
              </VTimeline>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VCard
      v-else
      class="text-center py-8"
    >
      <VIcon
        icon="tabler-alert-circle"
        size="64"
        color="error"
      />
      <p class="mt-4">
        Data pesanan penjualan tidak ditemukan
      </p>
      <VBtn
        color="primary"
        class="mt-2"
        @click="router.push('/sales/sales-orders')"
      >
        Kembali ke Daftar
      </VBtn>
    </VCard>
  </div>
</template>
