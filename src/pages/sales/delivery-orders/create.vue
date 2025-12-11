<script setup lang="ts">
import dayjs from 'dayjs'
import { useSalesOrderStore } from '@/stores/sales/salesOrderStore'
import { useDeliveryOrderStore } from '@/stores/sales/deliveryOrderStore'
import { showToast } from '@/utils/toaster'
import type { SalesOrder } from '@/types/models/sales/sales-order'

const route = useRoute()
const router = useRouter()
const salesOrderStore = useSalesOrderStore()
const deliveryOrderStore = useDeliveryOrderStore()

const salesOrderId = ref<string | undefined>(undefined)
const salesOrder = ref<SalesOrder | null>(null)
const isLoading = ref(false)
const isFromRoute = ref(false)
const salesOrderOptions = ref<SalesOrder[]>([])

// Items for partial delivery
const items = ref<any[]>([])

// Form data - matching OrderDelivery model
const form = ref({
  deliveryNumber: '',
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  courierName: '',
  courierService: '',
  trackingNumber: '',
  shippingCost: 0,
  notes: '',
})

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

const grandTotal = computed(() => {
  return salesOrder.value?.order?.grandTotal || 0
})

const fetchSalesOrderOptions = async () => {
  try {
    // Use server-side filtering for status
    await salesOrderStore.fetchPaginatedData({
      page: 1,
      perPage: 100,
      orderField: 'createdAt',
      orderDirection: 'desc',
      status: 'OPEN,PAID', // Server-side filter
    })
    salesOrderOptions.value = salesOrderStore.paginateData.data || []
  }
  catch (error) {
    console.error('Failed to fetch SO options', error)
  }
}

const fetchSalesOrder = async () => {
  if (!salesOrderId.value)
    return

  isLoading.value = true
  try {
    await salesOrderStore.fetchDetail(salesOrderId.value, {
      include: [
        'order',
        'order.lines',
        'order.lines.itemSku',
        'order.lines.itemSku.stocks', // Include stocks directly
        'order.deliveries',
        'order.deliveries.lines',
      ],

      // Only fetch fields that are actually used
      fields: {
        'sales_orders': [
          'salesOrderId',
          'orderId',
          'deliveryAddress',
          'deliveryContactName',
          'deliveryContactPhone',
          'createdAt',
        ],
        'order': [
          'orderId',
          'orderCode',
          'outletId',
          'customerName',
          'grandTotal',
        ],
        'lines': ['orderLineId', 'itemName', 'quantity', 'itemSkuId'],
        'itemSku': ['itemSkuId', 'code', 'displayName'],
        'stocks': ['stockItemId', 'outletId', 'quantityOnHand'],
        'deliveries': ['deliveryId', 'deliveryNumber', 'status'],
        'deliveries.lines': [
          'deliveryLineId',
          'orderLineId',
          'quantityDelivered',
        ],
      },
    })
    salesOrder.value = salesOrderStore.selectedSalesOrder

    if (!salesOrder.value || !salesOrder.value.order)
      throw new Error('Sales Order not found')

    // Add to options if not exists
    if (salesOrder.value) {
      const exists = salesOrderOptions.value.some(
        (o: SalesOrder) => o.salesOrderId === salesOrder.value?.salesOrderId,
      )

      if (!exists)
        salesOrderOptions.value.push(salesOrder.value)
    }

    // Pre-fill recipient info
    if (salesOrder.value.deliveryAddress)
      form.value.recipientAddress = salesOrder.value.deliveryAddress

    if (salesOrder.value.deliveryContactName)
      form.value.recipientName = salesOrder.value.deliveryContactName

    if (salesOrder.value.deliveryContactPhone)
      form.value.recipientPhone = salesOrder.value.deliveryContactPhone

    // Map SO lines to items with stock info
    items.value = (salesOrder.value.order.lines || []).map((line: any) => {
      let stock = 0
      const sku = line.itemSku

      if (sku && sku.stocks) {
        if (salesOrder.value?.order?.outletId) {
          // Filter stock by outlet
          const outletStock = sku.stocks.find(
            (s: any) => s.outletId === salesOrder.value?.order?.outletId,
          )

          stock = outletStock ? outletStock.quantityOnHand : 0
        }
        else {
          // Sum global stock
          stock = sku.stocks.reduce(
            (acc: number, s: any) => acc + s.quantityOnHand,
            0,
          )
        }
      }

      return {
        orderLineId: line.orderLineId,
        itemName: line.itemName,
        quantityOrdered: line.quantity,
        quantityShipped: 0,
        stock,
        quantityToShip: line.quantity,
        isSelected: true,
      }
    })

    // Calculate previously shipped quantities
    // Only count deliveries that are NOT cancelled, failed, or returned
    if (salesOrder.value.order.deliveries) {
      const validStatuses = [
        'PENDING',
        'PACKING',
        'READY_TO_SHIP',
        'SHIPPED',
        'DELIVERED',
      ]

      salesOrder.value.order.deliveries.forEach((d: any) => {
        // Skip cancelled, failed, or returned deliveries
        if (!validStatuses.includes(d.status))
          return

        if (d.lines) {
          d.lines.forEach((l: any) => {
            const item = items.value.find(
              i => i.orderLineId === l.orderLineId,
            )

            if (item)
              item.quantityShipped += l.quantityDelivered
          })
        }
      })
    }

    // Update quantityToShip based on remaining
    items.value.forEach(item => {
      const remaining = Math.max(
        0,
        item.quantityOrdered - item.quantityShipped,
      )

      item.quantityToShip = remaining

      // Deselect if fully shipped
      if (remaining === 0)
        item.isSelected = false
    })
  }
  catch (error) {
    console.error('Failed to fetch Sales Order', error)
    showToast('Gagal memuat Sales Order', 'error')
  }
  finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  // Validate items
  const selectedItems = items.value.filter(i => i.isSelected)
  if (selectedItems.length === 0) {
    showToast('Pilih minimal 1 item untuk dikirim', 'error')

    return
  }

  // Validate quantities
  for (const item of selectedItems) {
    if (item.quantityToShip <= 0) {
      showToast(
        `Jumlah kirim untuk "${item.itemName}" harus lebih dari 0`,
        'error',
      )

      return
    }

    if (item.quantityToShip > item.stock) {
      showToast(
        `Stok tidak cukup untuk "${item.itemName}". Stok tersedia: ${item.stock}, diminta: ${item.quantityToShip}`,
        'error',
      )

      return
    }

    const remaining = item.quantityOrdered - item.quantityShipped
    if (item.quantityToShip > remaining) {
      showToast(
        `Jumlah kirim untuk "${item.itemName}" melebihi sisa pesanan. Sisa: ${remaining}, diminta: ${item.quantityToShip}`,
        'error',
      )

      return
    }
  }

  try {
    const payload = {
      salesOrderId: salesOrderId.value,
      deliveryNumber: form.value.deliveryNumber || null,
      recipientName: form.value.recipientName || null,
      recipientPhone: form.value.recipientPhone || null,
      recipientAddress: form.value.recipientAddress || null,
      courierName: form.value.courierName || null,
      courierService: form.value.courierService || null,
      trackingNumber: form.value.trackingNumber || null,
      shippingCost: form.value.shippingCost || 0,
      notes: form.value.notes || null,
      items: selectedItems.map(i => ({
        orderLineId: i.orderLineId,
        quantity: i.quantityToShip,
        notes: null,
      })),
    }

    const result = await deliveryOrderStore.create(payload)

    if (result?.deliveryId)
      router.push(`/sales/delivery-orders/${result.deliveryId}`)
  }
  catch (error: any) {
    // Error handling is done in the store
    console.error('Failed to create delivery order:', error)
  }
}

watch(salesOrderId, newVal => {
  if (newVal) {
    fetchSalesOrder()
  }
  else {
    salesOrder.value = null
    items.value = []
    form.value.recipientName = ''
    form.value.recipientPhone = ''
    form.value.recipientAddress = ''
  }
})

onMounted(async () => {
  await fetchSalesOrderOptions()

  const queryId = route.query.salesOrderId as string
  if (queryId) {
    salesOrderId.value = queryId
    isFromRoute.value = true
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <VBtn
            icon="tabler-arrow-left"
            variant="text"
            @click="router.back()"
          />
          <span>Buat Surat Jalan (Delivery Order)</span>
        </div>
      </VCardTitle>
      <VCardText>
        <VAutocomplete
          v-model="salesOrderId"
          :items="salesOrderOptions"
          item-title="orderNumber"
          item-value="salesOrderId"
          label="Pilih Permintaan Penjualan (SO)"
          placeholder="Cari Permintaan Penjualan (SO)..."
          :disabled="isFromRoute || isLoading"
          clearable
          no-data-text="Tidak ada Permintaan Penjualan ditemukan"
          persistent-placeholder
        >
          <template #item="{ props, item }">
            <VListItem
              v-bind="props"
              :subtitle="item.raw.customerName"
              :title="item.raw.orderNumber"
            >
              <template #append>
                <VChip
                  size="x-small"
                  color="primary"
                >
                  {{ item.raw.status }}
                </VChip>
              </template>
            </VListItem>
          </template>
        </VAutocomplete>
      </VCardText>
    </VCard>

    <!-- Loading State -->
    <VCard
      v-if="isLoading"
      class="text-center py-8"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
      <p class="mt-4">
        Memuat data Permintaan Penjualan...
      </p>
    </VCard>

    <!-- Main Content -->
    <div v-else-if="salesOrder">
      <VRow>
        <!-- Left Column - SO Info -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardTitle>Informasi Permintaan Penjualan (SO)</VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-3">
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Nomor SO
                  </div>
                  <div class="font-weight-medium">
                    {{ salesOrder.order?.orderCode }}
                  </div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Customer
                  </div>
                  <div class="font-weight-medium">
                    {{ salesOrder.order?.customerName || "-" }}
                  </div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Tanggal Order
                  </div>
                  <div>{{ formatDate(salesOrder.createdAt) }}</div>
                </div>
                <VDivider />
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Grand Total
                  </div>
                  <div class="text-h6 text-primary">
                    {{ formatCurrency(grandTotal) }}
                  </div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Right Column - Delivery Form -->
        <VCol
          cols="12"
          md="8"
        >
          <VCard class="mb-4">
            <VCardTitle>Items Pengiriman</VCardTitle>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th style="inline-size: 40px">
                      <!-- Checkbox Header? No, individual select -->
                    </th>
                    <th>Item</th>
                    <th class="text-center">
                      Dipesan
                    </th>
                    <th class="text-center">
                      Dikirim
                    </th>
                    <th class="text-center">
                      Stok
                    </th>
                    <th style="inline-size: 120px">
                      Jml Kirim
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in items"
                    :key="item.orderLineId"
                  >
                    <td>
                      <VCheckbox
                        v-model="item.isSelected"
                        hide-details
                        density="compact"
                        :disabled="
                          item.quantityOrdered - item.quantityShipped <= 0
                        "
                      />
                    </td>
                    <td>
                      <div class="font-weight-medium">
                        {{ item.itemName }}
                      </div>
                    </td>
                    <td class="text-center">
                      {{ item.quantityOrdered }}
                    </td>
                    <td class="text-center">
                      {{ item.quantityShipped }}
                    </td>
                    <td class="text-center">
                      <VChip
                        :color="
                          item.stock >= item.quantityToShip
                            ? 'success'
                            : 'error'
                        "
                        size="small"
                      >
                        {{ item.stock }}
                      </VChip>
                    </td>
                    <td>
                      <VTextField
                        v-model.number="item.quantityToShip"
                        type="number"
                        density="compact"
                        hide-details
                        min="0"
                        :max="item.stock"
                        :disabled="!item.isSelected"
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <VCard>
            <VCardTitle>Detail Pengiriman</VCardTitle>
            <VCardText>
              <VForm @submit.prevent="handleSubmit">
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      v-model="form.deliveryNumber"
                      label="Nomor Surat Jalan (Opsional)"
                      placeholder="DO-20250129-XXXX"
                      hint="Kosongkan jika ingin sistem generate otomatis"
                      persistent-hint
                    />
                  </VCol>

                  <VCol cols="12">
                    <VDivider />
                    <div class="text-subtitle-2 mt-4 mb-2">
                      Informasi Penerima
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="form.recipientName"
                      label="Nama Penerima"
                      placeholder="Nama kontak penerima"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="form.recipientPhone"
                      label="No. Telepon Penerima"
                      placeholder="08xxxxxxxxxx"
                    />
                  </VCol>
                  <VCol cols="12">
                    <VTextarea
                      v-model="form.recipientAddress"
                      label="Alamat Pengiriman"
                      placeholder="Masukkan alamat lengkap pengiriman..."
                      rows="3"
                    />
                  </VCol>

                  <VCol cols="12">
                    <VDivider />
                    <div class="text-subtitle-2 mt-4 mb-2">
                      Informasi Kurir & Pengiriman
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="form.courierName"
                      label="Nama Kurir"
                      placeholder="JNE, J&T, SiCepat, dll"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="form.courierService"
                      label="Layanan Kurir"
                      placeholder="REG, YES, OKE, dll"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="form.trackingNumber"
                      label="Nomor Resi"
                      placeholder="Nomor tracking pengiriman"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model.number="form.shippingCost"
                      label="Biaya Pengiriman"
                      type="number"
                      prefix="Rp"
                    />
                  </VCol>
                  <VCol cols="12">
                    <VTextarea
                      v-model="form.notes"
                      label="Catatan Pengiriman"
                      placeholder="Catatan tambahan untuk pengiriman..."
                      rows="3"
                    />
                  </VCol>
                </VRow>

                <VDivider class="my-4" />

                <div class="d-flex justify-space-between align-center">
                  <VBtn
                    variant="outlined"
                    prepend-icon="tabler-arrow-left"
                    @click="router.back()"
                  >
                    Batal
                  </VBtn>
                  <VBtn
                    type="submit"
                    color="primary"
                    prepend-icon="tabler-truck-delivery"
                    :loading="deliveryOrderStore.isLoadingCreate"
                  >
                    Buat Surat Jalan
                  </VBtn>
                </div>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>
</template>
