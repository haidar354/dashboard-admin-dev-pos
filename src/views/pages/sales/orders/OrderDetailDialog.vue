<script setup lang="ts">
import dayjs from 'dayjs'
import { useOrderStore } from '@/stores/sales/orderStore'
import type { OrderLine } from '@/types/models/sales/order-line'

const orderStore = useOrderStore()
const { detailDialog, selectedOrderDetail } = storeToRefs(orderStore)

const closeDialog = () => {
  detailDialog.value.isVisible = false
  selectedOrderDetail.value = {} as any
}

const formatCurrency = (v?: number | null) => {
  if (v == null)
    return '-'

  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(v)
}

const renderLines = (lines: OrderLine[], depth = 0): (OrderLine & { depth: number; children: OrderLine[] })[] => {
  return lines.map(line => ({
    ...line,
    depth,
    children: line.childModifiers ? renderLines(line.childModifiers, depth + 1) : [],
  }))
}
</script>

<template>
  <VDialog
    v-model="detailDialog.isVisible"
    width="960"
    scrollable
    persistent
  >
    <DialogCloseBtn @click="closeDialog" />
    <VCard>
      <VCardText class="pa-2">
        <VCardTitle>
          Detail Pesanan #{{ selectedOrderDetail.orderCode }}
        </VCardTitle>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <div class="mb-2">
              <strong>Kode Transaksi:</strong> {{ selectedOrderDetail.orderCode }}
            </div>
            <div class="mb-2">
              <strong>Status:</strong>
              <VChip
                :color="selectedOrderDetail.status === 'PAID' ? 'success' : selectedOrderDetail.status === 'VOID' ? 'error' : 'warning'"
                size="small"
                rounded
              >
                {{ selectedOrderDetail.status }}
              </VChip>
            </div>
            <div class="mb-2">
              <strong>Tanggal Buat:</strong> {{ dayjs(selectedOrderDetail.createdAt).format('DD MMM YYYY HH:mm') }}
            </div>
            <div
              v-if="selectedOrderDetail.paidAt"
              class="mb-2"
            >
              <strong>Tanggal Bayar:</strong> {{ dayjs(selectedOrderDetail.paidAt).format('DD MMM YYYY HH:mm') }}
            </div>
            <div><strong>Outlet:</strong> {{ selectedOrderDetail.outlet?.name || '-' }}</div>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <div class="mb-2">
              <strong>Pelanggan:</strong> {{ selectedOrderDetail.customerName || selectedOrderDetail.customer?.name || 'Umum' }}
            </div>
            <div class="mb-2">
              <strong>No. Telepon:</strong> {{ selectedOrderDetail.customerPhone || selectedOrderDetail.customer?.phone || '-' }}
            </div>
            <div class="mb-2">
              <strong>Kasir:</strong> {{ selectedOrderDetail.paidByUser?.name || selectedOrderDetail.createdByUser?.name || '-' }}
            </div>
            <div><strong>Sales Channel:</strong> {{ selectedOrderDetail.salesChannel?.name || '-' }}</div>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <h6 class="text-subtitle-1 mb-2">
          Daftar Item
        </h6>
        <VTable
          density="compact"
          class="text-body-2"
        >
          <thead>
            <tr>
              <th class="text-start">
                Item
              </th>
              <th
                class="text-start"
                width="20%"
              >
                Catatan
              </th>
              <th
                class="text-end"
                width="10%"
              >
                Qty
              </th>
              <th
                class="text-end"
                width="10%"
              >
                Harga
              </th>
              <th
                class="text-end"
                width="10%"
              >
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="parentLine in renderLines(selectedOrderDetail.lines || [])"
              :key="parentLine.orderLineId"
            >
              <tr>
                <td>
                  <div :style="{ paddingLeft: `${parentLine.depth * 16}px` }">
                    <div>
                      {{ parentLine.itemName }}
                      <small
                        v-if="parentLine.isModifier"
                        class="text-muted"
                      >(modifier)</small>
                      <small
                        v-if="parentLine.isModifier"
                        class="text-muted"
                      >(modifier)</small>
                    </div>
                    <div class="text-xs text-caption text-muted">
                      {{ parentLine.sku?.code || '-' }}
                    </div>
                  </div>
                </td>
                <td class="text-start text-wrap">
                  {{ parentLine.notes || '-' }}
                </td>
                <td class="text-end">
                  {{ parentLine.quantity }}
                </td>
                <td class="text-end">
                  {{ formatCurrency(parentLine.unitPrice) }}
                </td>
                <td class="text-end">
                  {{ formatCurrency(parentLine.totalPrice) }}
                </td>
              </tr>
              <template
                v-for="line in renderLines(parentLine.childModifiers || [])"
                :key="line.orderLineId"
              >
                <tr>
                  <td>
                    <div :style="{ paddingLeft: `${line.depth * 16}px` }">
                      <div class="ps-5">
                        {{ line.itemName }}
                        <small
                          v-if="line.isModifier"
                          class="text-muted"
                        >(modifier)</small>
                      </div>
                    </div>
                  </td>
                  <td class="text-start text-wrap">
                    {{ line.notes || '-' }}
                  </td>
                  <td class="text-end">
                    {{ line.quantity }}
                  </td>
                  <td class="text-end">
                    {{ formatCurrency(line.unitPrice) }}
                  </td>
                  <td class="text-end">
                    {{ formatCurrency(line.totalPrice) }}
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </VTable>

        <VDivider class="my-3" />

        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <h6 class="text-subtitle-1 mb-2">
              Pembayaran
            </h6>
            <VTable
              density="compact"
              class="text-body-2"
            >
              <thead>
                <tr>
                  <th class="text-start">
                    Metode
                  </th>
                  <th class="text-end">
                    Jumlah
                  </th>
                  <th class="text-start">
                    Ref
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="payment in selectedOrderDetail.payments || []"
                  :key="payment.orderPaymentId"
                >
                  <td>{{ payment.paymentMethod }}</td>
                  <td class="text-end">
                    {{ formatCurrency(payment.amount) }}
                  </td>
                  <td>{{ payment.referenceNo || '-' }}</td>
                </tr>
                <tr v-if="!selectedOrderDetail.payments?.length">
                  <td
                    colspan="3"
                    class="text-center text-muted"
                  >
                    Belum ada pembayaran
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <h6 class="text-subtitle-1 mb-2">
              Ringkasan
            </h6>
            <VList
              density="compact"
              lines="one"
            >
              <VListItem title="Subtotal">
                <template #append>
                  {{ formatCurrency(selectedOrderDetail.subtotal) }}
                </template>
              </VListItem>
              <VListItem title="Diskon">
                <template #append>
                  {{ formatCurrency(selectedOrderDetail.discountTotal) }}
                </template>
              </VListItem>
              <VListItem title="Pajak">
                <template #append>
                  {{ formatCurrency(selectedOrderDetail.taxTotal) }}
                </template>
              </VListItem>
              <VListItem title="Service Charge">
                <template #append>
                  {{ formatCurrency(selectedOrderDetail.serviceChargeTotal) }}
                </template>
              </VListItem>
              <VDivider class="my-2" />
              <VListItem title="Grand Total">
                <template #append>
                  <strong>{{ formatCurrency(selectedOrderDetail.grandTotal) }}</strong>
                </template>
              </VListItem>
              <VListItem title="Dibayar">
                <template #append>
                  {{ formatCurrency(selectedOrderDetail.paidTotal) }}
                </template>
              </VListItem>
              <VListItem title="Kembalian">
                <template #append>
                  {{ formatCurrency(selectedOrderDetail.changeDue) }}
                </template>
              </VListItem>
            </VList>
          </VCol>
        </VRow>

        <VDivider class="my-3" />

        <div
          v-if="selectedOrderDetail.notes"
          class="text-caption text-muted"
        >
          <strong>Catatan:</strong> {{ selectedOrderDetail.notes }}
        </div>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex pa-4">
        <VSpacer />
        <VBtn
          color="primary"
          variant="outlined"
          text="Tutup"
          @click="closeDialog"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.text-body-2 th,
.text-body-2 td {
  padding-block: 6px;
}
</style>
