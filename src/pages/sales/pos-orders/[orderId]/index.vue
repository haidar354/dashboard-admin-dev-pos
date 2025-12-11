<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { translateStatus } from '@/utils/common'
import { usePosOrderStore } from '@/stores/sales/posOrderStore'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

definePage({
  meta: {
    name: 'Detail Pesanan POS',
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
const orderId = route.params.orderId as string

const posOrderStore = usePosOrderStore()
const { selectedOrder, isLoadingFetchDetail, isLoadingConfirm, isLoadingUpdate, isLoadingDelete, isLoadingDownload } = storeToRefs(posOrderStore)

const statusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DRAFT': return 'secondary'
    case 'OPEN': return 'info'
    case 'CONFIRMED': return 'success'
    case 'IN_PRODUCTION': return 'warning'
    case 'READY': return 'success'
    case 'DELIVERED': return 'primary'
    case 'COMPLETED': return 'success'
    case 'PAID': return 'success'
    case 'CLOSED': return 'success'
    case 'CANCELLED': return 'error'
    default: return 'default'
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDateTime = (date: string) => dayjs(date).format('DD MMMM YYYY HH:mm')

const fetchOrder = async () => {
  try {
    await posOrderStore.fetchOrderDetail(orderId, {
      include: [
        'lines',
        'lines.itemSku',
        'customer',
        'createdByUser',
      ],
    })
  }
  catch (error) {
    console.error(error)
    showToast('Gagal memuat data pesanan POS', 'error')
    router.back()
  }
}

const confirmOrder = async () => {
  const isConfirmed = await useConfirmDialogStore().openGenericDialog(
    `Yakin ingin mengkonfirmasi pesanan POS "${selectedOrder.value?.orderCode}" ini?`,
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
    await posOrderStore.confirmOrder(orderId)
    await fetchOrder()
  }
  catch (err) {
    // handled in store
  }
}

const closeOrder = async () => {
  const isConfirmed = await useConfirmDialogStore().openGenericDialog(
    `Yakin ingin menutup pesanan POS "${selectedOrder.value?.orderCode}" ini?`,
    {
      title: 'Tutup Pesanan',
      confirmText: 'Ya, Tutup',
      cancelText: 'Batal',
      color: 'primary',
      icon: 'tabler-check',
    },
  )

  if (!isConfirmed)
    return

  try {
    await posOrderStore.closeOrder(orderId)
    await fetchOrder()
  }
  catch (err) {
    // handled in store
  }
}

const voidOrder = async () => {
  const isConfirmed = await useConfirmDialogStore().openGenericDialog(
    `Yakin ingin membatalkan (void) pesanan POS "${selectedOrder.value?.orderCode}" ini?`,
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
    await posOrderStore.voidOrder(orderId)
    await fetchOrder()
  }
  catch (err) {
    // handled in store
  }
}

const downloadPDF = async () => {
  if (!selectedOrder.value)
    return
  await posOrderStore.downloadPdf(selectedOrder.value)
}

onMounted(() => {
  fetchOrder()
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
        Memuat data pesanan POS...
      </p>
    </VCard>

    <div v-else-if="selectedOrder && selectedOrder.orderId">
      <VCard>
        <VCardText class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
          <div class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              @click="router.push('/sales/pos-orders')"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div class="ms-3">
              <h2 class="text-h5">
                {{ selectedOrder.orderCode }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Detail Pesanan POS
              </p>
            </div>
          </div>

          <!-- actions moved to right column Aksi card -->
        </VCardText>
      </VCard>

      <VRow class="mt-4">
        <VCol
          cols="12"
          md="8"
        >
          <VCard>
            <VCardTitle>Informasi Pesanan</VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Nomor Pesanan
                  </div>
                  <div class="text-body-1 font-weight-medium">
                    {{ selectedOrder.orderCode }}
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Tanggal
                  </div>
                  <div class="text-body-1">
                    {{ formatDateTime(selectedOrder.createdAt) }}
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Status Pesanan
                  </div>
                  <VChip
                    :color="statusColor(selectedOrder.status)"
                    size="small"
                    class="mt-1 text-uppercase"
                  >
                    {{ translateStatus(selectedOrder.status) }}
                  </VChip>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Status Pembayaran
                  </div>
                  <VChip
                    :color="statusColor(selectedOrder.paymentStatus)"
                    size="small"
                    class="mt-1 text-uppercase"
                  >
                    {{ translateStatus(selectedOrder.paymentStatus) }}
                  </VChip>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Status Penyajian
                  </div>
                  <VChip
                    :color="statusColor(selectedOrder.fulfillmentStatus)"
                    size="small"
                    class="mt-1 text-uppercase"
                  >
                    {{ translateStatus(selectedOrder.fulfillmentStatus) }}
                  </VChip>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="text-caption text-medium-emphasis">
                    Dibuat Oleh
                  </div>
                  <div class="text-body-1">
                    {{ selectedOrder.createdByUser?.name || '-' }}
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <VCard class="mt-4">
            <VCardTitle>Informasi Pelanggan</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Nama Pelanggan
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ selectedOrder.customer?.name || '-' }}
                </div>
              </div>
            </VCardText>
          </VCard>

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
                    v-for="line in selectedOrder.lines || selectedOrder.order?.lines"
                    :key="line.orderLineId || line.id"
                  >
                    <td>
                      <div>
                        <strong>{{ line.itemName || line.name }}</strong>
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
                      {{ formatCurrency(line.unitPrice || line.price) }}
                    </td>
                    <td class="text-end">
                      {{ formatCurrency(line.totalPrice || (line.quantity * (line.unitPrice || line.price || 0))) }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <!-- Actions Card (moved from header) -->
          <VCard>
            <VCardTitle>Aksi</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-2">
                <VBtn
                  color="primary"
                  variant="tonal"
                  prepend-icon="tabler-download"
                  :loading="isLoadingDownload"
                  block
                  @click="downloadPDF"
                >
                  Download PDF
                </VBtn>

                <!-- Create Return Button -->
                <VBtn
                  v-if="['DELIVERED', 'SERVED', 'COMPLETED'].includes(selectedOrder.fulfillmentStatus) || selectedOrder.status === 'COMPLETED'"
                  color="warning"
                  variant="tonal"
                  prepend-icon="tabler-rotate-2"
                  block
                  @click="router.push(`/sales/returns/create?orderId=${selectedOrder.orderId || selectedOrder.id}`)"
                >
                  Buat Retur
                </VBtn>

                <VBtn
                  v-if="selectedOrder.status === 'DRAFT'"
                  color="success"
                  prepend-icon="tabler-check"
                  :loading="isLoadingConfirm"
                  block
                  @click="confirmOrder"
                >
                  Konfirmasi
                </VBtn>

                <VBtn
                  v-if="selectedOrder.status !== 'CLOSED' && selectedOrder.status !== 'CANCELLED'"
                  color="primary"
                  variant="outlined"
                  prepend-icon="tabler-box"
                  block
                  @click="closeOrder"
                >
                  Tutup
                </VBtn>

                <VBtn
                  v-if="selectedOrder.status === 'DRAFT'"
                  color="primary"
                  prepend-icon="tabler-edit"
                  :to="`/sales/pos-orders/${orderId}/edit`"
                  block
                >
                  Edit
                </VBtn>

                <VBtn
                  v-if="selectedOrder.paymentStatus === 'UNPAID'"
                  color="error"
                  variant="tonal"
                  prepend-icon="tabler-x"
                  :loading="isLoadingUpdate"
                  block
                  @click="voidOrder"
                >
                  Void
                </VBtn>

                <VAlert
                  v-if="selectedOrder.status !== 'DRAFT' && selectedOrder.status === 'CLOSED'"
                  type="info"
                  variant="tonal"
                  density="compact"
                >
                  Tidak ada aksi tersedia untuk status ini
                </VAlert>
              </div>
            </VCardText>
          </VCard>

          <VCard class="mt-4">
            <VCardTitle>Ringkasan Pesanan</VCardTitle>
            <VCardText>
              <div class="d-flex justify-space-between mb-2">
                <span>Subtotal:</span>
                <strong>{{ formatCurrency(selectedOrder.subtotal || selectedOrder.order?.subtotal || 0) }}</strong>
              </div>
              <div
                v-if="(selectedOrder.discountTotal || selectedOrder.order?.discountTotal) > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span>Diskon:</span>
                <strong class="text-error">- {{ formatCurrency(selectedOrder.discountTotal || selectedOrder.order?.discountTotal) }}</strong>
              </div>
              <div
                v-if="(selectedOrder.taxTotal || selectedOrder.order?.taxTotal) > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span>Pajak:</span>
                <strong>{{ formatCurrency(selectedOrder.taxTotal || selectedOrder.order?.taxTotal) }}</strong>
              </div>
              <VDivider class="my-3" />
              <div class="d-flex justify-space-between">
                <span class="text-h6">Total:</span>
                <strong class="text-h6 text-primary">{{ formatCurrency(selectedOrder.grandTotal || selectedOrder.order?.grandTotal || 0) }}</strong>
              </div>
            </VCardText>
          </VCard>

          <VCard class="mt-4">
            <VCardTitle>Timeline</VCardTitle>
            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Dibuat
                </div>
                <div class="text-body-2">
                  {{ formatDateTime(selectedOrder.createdAt) }}
                </div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis">
                  Terakhir Diupdate
                </div>
                <div class="text-body-2">
                  {{ formatDateTime(selectedOrder.updatedAt) }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>
</template>
