<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useDeliveryOrderStore } from '@/stores/sales/deliveryOrderStore'
import type { DeliveryOrderLine } from '@/types/models/sales/delivery-order'

definePage({
  meta: {
    name: 'Detail Delivery Order',
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
const deliveryId = route.params.deliveryId as string

const deliveryOrderStore = useDeliveryOrderStore()

const {
  selectedDeliveryOrder,
  isLoadingFetchDetail,
  isLoadingUpdate,
  isLoadingDownload,
} = storeToRefs(deliveryOrderStore)

const statusColor = (status: string) => {
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

const statusOptions = [
  { value: 'PENDING', title: 'Menunggu', icon: 'tabler-clock' },
  { value: 'PACKING', title: 'Dikemas', icon: 'tabler-package' },
  { value: 'READY_TO_SHIP', title: 'Siap Dikirim', icon: 'tabler-check' },
  { value: 'SHIPPED', title: 'Dikirim', icon: 'tabler-truck' },
  { value: 'DELIVERED', title: 'Diterima', icon: 'tabler-circle-check' },
  { value: 'FAILED', title: 'Gagal', icon: 'tabler-x' },
  { value: 'RETURNED', title: 'Dikembalikan', icon: 'tabler-arrow-back' },
  { value: 'CANCELLED', title: 'Dibatalkan', icon: 'tabler-ban' },
]

const getStatusTitle = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)

  return option ? option.title : status
}

const availableStatusOptions = computed(() => {
  const currentStatus = selectedDeliveryOrder.value?.status
  if (!currentStatus)
    return []

  const transitions: Record<string, string[]> = {
    PENDING: ['PACKING', 'CANCELLED'],
    PACKING: ['READY_TO_SHIP', 'CANCELLED'],
    READY_TO_SHIP: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'FAILED', 'RETURNED'],
    DELIVERED: [],
    FAILED: ['SHIPPED', 'CANCELLED'],
    RETURNED: [],
    CANCELLED: [],
  }

  const allowed = transitions[currentStatus] || []

  // Also include current status to show it as active/disabled
  return statusOptions.filter(
    opt => allowed.includes(opt.value) || opt.value === currentStatus,
  )
})

const fetchDeliveryOrder = async () => {
  try {
    await deliveryOrderStore.fetchDetail(deliveryId, {
      include: ['order', 'order.salesOrder', 'lines', 'lines.orderLine'],
    })
  }
  catch (error) {
    console.error(error)

    // showToast("Gagal memuat data delivery order", "error");
    router.back()
  }
}

const updateStatus = async (newStatus: string) => {
  try {
    await deliveryOrderStore.updateStatus(deliveryId, newStatus)
  }
  catch (error) {
    // Error handled in store
  }
}

const downloadPDF = async () => {
  if (!selectedDeliveryOrder.value)
    return
  await deliveryOrderStore.downloadPdf(selectedDeliveryOrder.value)
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD MMMM YYYY HH:mm')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(() => {
  fetchDeliveryOrder()
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
        Memuat data delivery order...
      </p>
    </VCard>

    <div v-else-if="selectedDeliveryOrder">
      <!-- Header -->
      <VCard>
        <VCardText class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
          <div class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              @click="router.push('/sales/delivery-orders')"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div class="ms-3">
              <h2 class="text-h5">
                <VIcon
                  icon="tabler-truck-delivery"
                  class="me-2"
                />
                {{ selectedDeliveryOrder.deliveryNumber }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Detail Delivery Order
              </p>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <VBtn
              color="primary"
              variant="tonal"
              prepend-icon="tabler-download"
              :loading="isLoadingDownload"
              @click="downloadPDF"
            >
              Download DO
            </VBtn>

            <VBtn
              v-if="selectedDeliveryOrder.status === 'DELIVERED'"
              color="warning"
              variant="tonal"
              prepend-icon="tabler-rotate-2"
              @click="router.push(`/sales/returns/create?orderId=${selectedDeliveryOrder.orderId}`)"
            >
              Buat Retur
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <VRow class="mt-4">
        <!-- Left Column -->
        <VCol
          cols="12"
          md="8"
        >
          <!-- Delivery Info -->
          <VCard>
            <VCardTitle class="d-flex align-center justify-space-between">
              <span>Informasi Pengiriman</span>
              <VChip
                :color="statusColor(selectedDeliveryOrder.status)"
                size="small"
                class="text-uppercase"
              >
                {{ getStatusTitle(selectedDeliveryOrder.status) }}
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
                      Nomor DO
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ selectedDeliveryOrder.deliveryNumber }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Tanggal Dibuat
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(selectedDeliveryOrder.createdAt) }}
                    </div>
                  </div>
                  <div
                    v-if="selectedDeliveryOrder.shippedAt"
                    class="mb-4"
                  >
                    <div class="text-caption text-medium-emphasis">
                      Dikirim Pada
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(selectedDeliveryOrder.shippedAt) }}
                    </div>
                  </div>
                  <div
                    v-if="selectedDeliveryOrder.deliveredAt"
                    class="mb-4"
                  >
                    <div class="text-caption text-medium-emphasis">
                      Diterima Pada
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(selectedDeliveryOrder.deliveredAt) }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Referensi Order (SO)
                    </div>
                    <div
                      class="text-body-1 text-primary cursor-pointer"
                      @click="
                        selectedDeliveryOrder.order?.salesOrder?.salesOrderId
                          && router.push(
                            `/sales/sales-orders/${selectedDeliveryOrder.order?.salesOrder?.salesOrderId}`,
                          )
                      "
                    >
                      {{ selectedDeliveryOrder.order?.orderCode || "-" }}
                    </div>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">
                      Biaya Pengiriman
                    </div>
                    <div class="text-body-1">
                      {{ formatCurrency(selectedDeliveryOrder.shippingCost) }}
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Recipient & Courier Info -->
          <VCard class="mt-4">
            <VCardTitle>Penerima & Kurir</VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <h4 class="text-subtitle-1 mb-3">
                    Informasi Penerima
                  </h4>
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">
                      Nama
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ selectedDeliveryOrder.recipientName || "-" }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">
                      Telepon
                    </div>
                    <div class="text-body-1">
                      {{ selectedDeliveryOrder.recipientPhone || "-" }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">
                      Alamat
                    </div>
                    <div class="text-body-1">
                      {{ selectedDeliveryOrder.recipientAddress || "-" }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <h4 class="text-subtitle-1 mb-3">
                    Informasi Kurir
                  </h4>
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">
                      Kurir
                    </div>
                    <div class="text-body-1">
                      {{ selectedDeliveryOrder.courierName || "-" }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">
                      Layanan
                    </div>
                    <div class="text-body-1">
                      {{ selectedDeliveryOrder.courierService || "-" }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">
                      No. Resi
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ selectedDeliveryOrder.trackingNumber || "-" }}
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Items -->
          <VCard class="mt-4">
            <VCardTitle>Item Pengiriman</VCardTitle>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-center">
                      Qty Dikirim
                    </th>
                    <th v-if="selectedDeliveryOrder.lines?.some((l: DeliveryOrderLine) => l.notes)">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="line in selectedDeliveryOrder.lines"
                    :key="line.deliveryLineId"
                  >
                    <td>
                      <div>
                        <strong>{{ line.orderLine?.itemName || "-" }}</strong>
                      </div>
                    </td>
                    <td class="text-center">
                      {{ line.quantityDelivered }}
                    </td>
                    <td v-if="selectedDeliveryOrder.lines?.some((l: DeliveryOrderLine) => l.notes)">
                      {{ line.notes || "-" }}
                    </td>
                  </tr>
                  <tr
                    v-if="
                      !selectedDeliveryOrder.lines
                        || selectedDeliveryOrder.lines.length === 0
                    "
                  >
                    <td
                      colspan="3"
                      class="text-center text-medium-emphasis"
                    >
                      Tidak ada item
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Notes -->
          <VCard
            v-if="selectedDeliveryOrder.notes"
            class="mt-4"
          >
            <VCardTitle>Catatan</VCardTitle>
            <VCardText>
              <div class="text-body-1">
                {{ selectedDeliveryOrder.notes }}
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column - Actions -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardTitle>Update Status</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-2">
                <VBtn
                  v-for="status in availableStatusOptions"
                  :key="status.value"
                  :color="
                    selectedDeliveryOrder.status === status.value
                      ? statusColor(status.value)
                      : 'default'
                  "
                  :variant="
                    selectedDeliveryOrder.status === status.value
                      ? 'tonal'
                      : 'outlined'
                  "
                  :prepend-icon="status.icon"
                  :loading="isLoadingUpdate"
                  :disabled="selectedDeliveryOrder.status === status.value"
                  block
                  class="justify-start"
                  @click="updateStatus(status.value)"
                >
                  {{ status.title }}
                </VBtn>
              </div>
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
        Data delivery order tidak ditemukan
      </p>
      <VBtn
        color="primary"
        class="mt-2"
        @click="router.push('/sales/delivery-orders')"
      >
        Kembali ke Daftar
      </VBtn>
    </VCard>
  </div>
</template>
