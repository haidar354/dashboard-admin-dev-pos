<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReturnStore } from '@/stores/sales/returnStore'
import type { CreateReturnRequest } from '@/types/models/sales/order-return'
import { $salesAPI } from '@/utils/api'
import { translateStatus } from '@/utils/common'

const router = useRouter()
const route = useRoute()
const returnStore = useReturnStore()

// Form data
const selectedOrderId = ref('')
const selectedOrder = ref<any>(null)
const reason = ref<'DAMAGED' | 'WRONG_ITEM' | 'EXPIRED' | 'CUSTOMER_REQUEST' | 'OTHER'>('DAMAGED')
const notes = ref('')
const isLoadingOrder = ref(false)

// Order Search
const orderSearchQuery = ref('')
const orderSearchResults = ref<any[]>([])
const isLoadingSearch = ref(false)

// Item Selection Dialog
const isItemSelectionOpen = ref(false)
const availableOrderLines = ref<any[]>([])
const selectedLineIds = ref<string[]>([])

const returnLines = ref<Array<{
  orderLineId: string
  itemName: string
  quantityOrdered: number
  quantityReturned: number
  quantityRestockable: number
  quantityDamaged: number
  condition: 'GOOD' | 'DAMAGED' | 'OPENED' | 'EXPIRED'
  notes: string
  remainingQuantity: number
}>>([])

const reasonOptions = [
  { value: 'DAMAGED', title: 'Barang Rusak' },
  { value: 'WRONG_ITEM', title: 'Salah Barang' },
  { value: 'EXPIRED', title: 'Kadaluarsa' },
  { value: 'CUSTOMER_REQUEST', title: 'Permintaan Pelanggan' },
  { value: 'OTHER', title: 'Lainnya' },
]

const conditionOptions = [
  { value: 'GOOD', title: 'Baik' },
  { value: 'DAMAGED', title: 'Rusak' },
  { value: 'OPENED', title: 'Terbuka' },
  { value: 'EXPIRED', title: 'Kadaluarsa' },
]

const isLoading = ref(false)

// Computed
const canSubmit = computed(() => {
  if (!selectedOrderId.value || returnLines.value.length === 0)
    return false

  // Validate all lines
  return returnLines.value.every(line => {
    const sum = line.quantityRestockable + line.quantityDamaged

    return (
      line.quantityReturned > 0
      && line.quantityReturned <= line.remainingQuantity
      && sum === line.quantityReturned
    )
  })
})

const validationErrors = computed(() => {
  const errors: string[] = []

  returnLines.value.forEach((line, index) => {
    const sum = line.quantityRestockable + line.quantityDamaged

    if (line.quantityReturned > line.remainingQuantity)
      errors.push(`Baris ${index + 1} (${line.itemName}): Tidak boleh retur melebihi sisa (${line.remainingQuantity})`)

    if (sum !== line.quantityReturned)
      errors.push(`Baris ${index + 1} (${line.itemName}): Masuk Stok + Rusak harus sama dengan Jumlah Retur`)
  })

  return errors
})

// Search Orders API
const searchOrders = async (query: string) => {
  if (!query || query.length < 2)
    return

  isLoadingSearch.value = true
  try {
    const response = await $salesAPI<{ data: any[] }>('orders', {
      params: {
        search: query,
        status: 'DELIVERED',
        perPage: 20,
      },
    })

    orderSearchResults.value = response.data
  }
  catch (error) {
    console.error('Search error:', error)
  }
  finally {
    isLoadingSearch.value = false
  }
}

// Watch search query for autocomplete
watch(orderSearchQuery, val => {
  if (val)
    searchOrders(val)
})

// Load order from API
const loadOrderById = async (orderId: string) => {
  isLoadingOrder.value = true
  try {
    const response = await $salesAPI<{ data: any }>(`orders/${orderId}`, {
      params: {
        include: 'lines,lines.sku,returns,returns.lines',
      },
    })

    const order = response.data

    selectedOrder.value = order
    selectedOrderId.value = order.orderId

    // Calculate remaining quantities
    const linesWithRemaining = order.lines.map((line: any) => {
      // Calculate total returned for this line from previous returns
      const previousReturns = order.returns?.reduce((acc: number, ret: any) => {
        // Skip rejected/cancelled returns
        if (ret.status === 'REJECTED' || ret.status === 'CANCELLED')
          return acc

        const retLine = ret.lines?.find((rl: any) => rl.orderLineId === line.orderLineId)

        return acc + (retLine?.quantityReturned || 0)
      }, 0) || 0

      const remaining = line.quantity - previousReturns

      return {
        ...line,
        remainingQuantity: Math.max(0, remaining),
        previousReturns,
      }
    })

    availableOrderLines.value = linesWithRemaining.filter((l: any) => l.remainingQuantity > 0)

    // Reset return lines
    returnLines.value = []
  }
  catch (error: any) {
    console.error('Failed to load order:', error)
  }
  finally {
    isLoadingOrder.value = false
  }
}

const openItemSelection = () => {
  if (!selectedOrder.value)
    return
  selectedLineIds.value = []
  isItemSelectionOpen.value = true
}

const addSelectedItems = () => {
  const selected = availableOrderLines.value.filter(l => selectedLineIds.value.includes(l.orderLineId))

  selected.forEach(line => {
    // Check if already in returnLines
    if (returnLines.value.some(rl => rl.orderLineId === line.orderLineId))
      return

    returnLines.value.push({
      orderLineId: line.orderLineId,
      itemName: line.itemName,
      quantityOrdered: line.quantity,
      quantityReturned: 1, // Default to 1
      quantityRestockable: 1,
      quantityDamaged: 0,
      condition: 'GOOD',
      notes: '',
      remainingQuantity: line.remainingQuantity,
    })
  })
  isItemSelectionOpen.value = false
}

const removeLine = (index: number) => {
  returnLines.value.splice(index, 1)
}

const updateQuantities = (line: any) => {
  // Auto-calculate if one is missing
  const returned = line.quantityReturned || 0
  const restockable = line.quantityRestockable || 0
  const damaged = line.quantityDamaged || 0

  if (returned > 0 && restockable > 0 && damaged === 0)
    line.quantityDamaged = returned - restockable

  else if (returned > 0 && damaged > 0 && restockable === 0)
    line.quantityRestockable = returned - damaged
}

const handleSubmit = async () => {
  if (!canSubmit.value)
    return

  isLoading.value = true
  try {
    const payload: CreateReturnRequest = {
      reason: reason.value,
      notes: notes.value || undefined,
      lines: returnLines.value
        .filter(line => line.quantityReturned > 0)
        .map(line => ({
          orderLineId: line.orderLineId,
          quantityReturned: line.quantityReturned,
          quantityRestockable: line.quantityRestockable,
          quantityDamaged: line.quantityDamaged,
          condition: line.condition,
          notes: line.notes || undefined,
        })),
    }

    const createdReturn = await returnStore.createReturn(selectedOrderId.value, payload)

    router.push(`/sales/returns/${createdReturn.returnId}`)
  }
  catch (error: any) {
    // Error handled by store or toast can be added here
  }
  finally {
    isLoading.value = false
  }
}

// Auto-load from query params
onMounted(() => {
  const orderId = route.query.orderId as string
  if (orderId)
    loadOrderById(orderId)
})

// Watch selected search result
const onOrderSelect = (order: any) => {
  if (order) {
    selectedOrderId.value = order.orderId
    loadOrderById(order.orderId)
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <VCard>
      <VCardText class="d-flex justify-space-between pa-5">
        <div>
          <h3 class="text-h5 font-weight-bold">
            Buat Retur Penjualan
          </h3>
          <div class="text-body-1 text-medium-emphasis">
            Buat pengajuan retur barang dari pelanggan
          </div>
        </div>
      </VCardText>

      <VDivider />

      <VCardText>
        <!-- Order Selection -->
        <div class="mb-6">
          <h4 class="text-h6 mb-3">
            Pilih Order
          </h4>
          <VAutocomplete
            v-if="!route.query.orderId"
            v-model="selectedOrder"
            v-model:search="orderSearchQuery"
            :items="orderSearchResults"
            :loading="isLoadingSearch"
            item-title="orderCode"
            item-value="orderId"
            label="Cari Order (Kode, Pelanggan)"
            placeholder="Ketik untuk mencari..."
            prepend-inner-icon="tabler-search"
            return-object
            @update:model-value="onOrderSelect"
          >
            <template #item="{ props, item }">
              <VListItem
                v-bind="props"
                :subtitle="`${item.raw.customerName} - ${translateStatus(item.raw.status)}`"
              />
            </template>
          </VAutocomplete>

          <!-- Locked view if order selected or loaded -->
          <VCard
            v-if="selectedOrder"
            variant="outlined"
            class="mt-2 bg-grey-lighten-5"
          >
            <VCardText class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption">
                  Order Terpilih
                </div>
                <div class="text-h6">
                  {{ selectedOrder.orderCode }}
                </div>
                <div class="text-body-2">
                  {{ selectedOrder.customerName }}
                </div>
              </div>
              <div>
                <VChip :color="(selectedOrder.fulfillmentStatus === 'DELIVERED' || selectedOrder.fulfillmentStatus === 'COMPLETED' || selectedOrder.status === 'COMPLETED') ? 'success' : 'warning'">
                  {{ translateStatus(selectedOrder.fulfillmentStatus || selectedOrder.status) }}
                </VChip>
                <VBtn
                  v-if="!route.query.orderId"
                  icon
                  size="small"
                  variant="text"
                  color="secondary"
                  class="ms-2"
                  @click="selectedOrder = null; selectedOrderId = ''; returnLines = []"
                >
                  <VIcon icon="tabler-x" />
                </VBtn>
              </div>
            </VCardText>
          </VCard>

          <VAlert
            v-if="!selectedOrderId && !isLoadingSearch"
            type="info"
            class="mt-4"
            variant="tonal"
            icon="tabler-info-circle"
          >
            Silakan cari dan pilih order dengan status DELIVERED/SERVED/COMPLETED untuk membuat retur.
          </VAlert>
        </div>

        <VDivider class="my-6" />

        <!-- Return Details -->
        <div
          v-if="selectedOrderId"
          class="mb-6"
        >
          <h4 class="text-h6 mb-3">
            Rincian Retur
          </h4>
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="reason"
                :items="reasonOptions"
                label="Alasan Retur *"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="notes"
                label="Catatan"
                placeholder="Tambahkan catatan tambahan (opsional)"
                rows="3"
              />
            </VCol>
          </VRow>
        </div>

        <VDivider
          v-if="selectedOrderId"
          class="my-6"
        />

        <!-- Return Items -->
        <div v-if="selectedOrderId">
          <div class="d-flex justify-space-between align-center mb-3">
            <h4 class="text-h6">
              Barang Retur
            </h4>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="openItemSelection"
            >
              Pilih Barang
            </VBtn>
          </div>

          <!-- Validation Errors -->
          <VAlert
            v-if="validationErrors.length > 0"
            type="error"
            class="mb-4"
            variant="tonal"
            icon="tabler-alert-circle"
          >
            <div class="font-weight-bold mb-2">
              Mohon Periksa Kembali:
            </div>
            <ul class="ms-4">
              <li
                v-for="error in validationErrors"
                :key="error"
              >
                {{ error }}
              </li>
            </ul>
          </VAlert>

          <!-- Items Table (Desktop) -->
          <div class="d-none d-md-block">
            <VTable class="border rounded">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th class="text-end">
                    Dipesan
                  </th>
                  <th class="text-end">
                    Sisa
                  </th>
                  <th
                    class="text-end"
                    style="width: 110px"
                  >
                    Retur *
                  </th>
                  <th
                    class="text-end"
                    style="width: 110px"
                  >
                    Masuk Stok
                  </th>
                  <th
                    class="text-end"
                    style="width: 110px"
                  >
                    Rusak
                  </th>
                  <th>Kondisi</th>
                  <th>Catatan</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(line, index) in returnLines"
                  :key="index"
                >
                  <td>
                    <div class="font-weight-medium">
                      {{ line.itemName }}
                    </div>
                  </td>
                  <td class="text-end text-disabled">
                    {{ line.quantityOrdered }}
                  </td>
                  <td class="text-end">
                    {{ line.remainingQuantity }}
                  </td>
                  <td>
                    <VTextField
                      v-model.number="line.quantityReturned"
                      type="number"
                      density="compact"
                      hide-details
                      min="0"
                      :max="line.remainingQuantity"
                      @input="updateQuantities(line)"
                    />
                  </td>
                  <td>
                    <VTextField
                      v-model.number="line.quantityRestockable"
                      type="number"
                      density="compact"
                      hide-details
                      min="0"
                      @input="updateQuantities(line)"
                    />
                  </td>
                  <td>
                    <VTextField
                      v-model.number="line.quantityDamaged"
                      type="number"
                      density="compact"
                      hide-details
                      min="0"
                      @input="updateQuantities(line)"
                    />
                  </td>
                  <td>
                    <VSelect
                      v-model="line.condition"
                      :items="conditionOptions"
                      density="compact"
                      hide-details
                      style="min-width: 100px"
                    />
                  </td>
                  <td>
                    <VTextField
                      v-model="line.notes"
                      density="compact"
                      hide-details
                      placeholder="Opsional"
                    />
                  </td>
                  <td>
                    <VBtn
                      icon="tabler-trash"
                      variant="text"
                      size="small"
                      color="error"
                      @click="removeLine(index)"
                    />
                  </td>
                </tr>
              </tbody>
            </VTable>
          </div>

          <!-- Items List (Mobile) -->
          <div class="d-md-none d-flex flex-column gap-4">
            <VCard
              v-for="(line, index) in returnLines"
              :key="index"
              variant="outlined"
            >
              <VCardText>
                <div class="d-flex justify-space-between mb-2">
                  <div class="font-weight-bold">
                    {{ line.itemName }}
                  </div>
                  <VBtn
                    icon="tabler-trash"
                    variant="text"
                    size="small"
                    color="error"
                    @click="removeLine(index)"
                  />
                </div>
                <div class="d-flex gap-4 text-caption mb-3 text-medium-emphasis">
                  <div>Dipesan: {{ line.quantityOrdered }}</div>
                  <div>Sisa: {{ line.remainingQuantity }}</div>
                </div>

                <VRow dense>
                  <VCol cols="4">
                    <VTextField
                      v-model.number="line.quantityReturned"
                      label="Jml Retur"
                      type="number"
                      density="compact"
                      hide-details
                      min="0"
                      :max="line.remainingQuantity"
                      @input="updateQuantities(line)"
                    />
                  </VCol>
                  <VCol cols="4">
                    <VTextField
                      v-model.number="line.quantityRestockable"
                      label="Masuk Stok"
                      type="number"
                      density="compact"
                      hide-details
                      min="0"
                      @input="updateQuantities(line)"
                    />
                  </VCol>
                  <VCol cols="4">
                    <VTextField
                      v-model.number="line.quantityDamaged"
                      label="Rusak"
                      type="number"
                      density="compact"
                      hide-details
                      min="0"
                      @input="updateQuantities(line)"
                    />
                  </VCol>
                  <VCol cols="6">
                    <VSelect
                      v-model="line.condition"
                      label="Kondisi"
                      :items="conditionOptions"
                      density="compact"
                      hide-details
                    />
                  </VCol>
                  <VCol cols="6">
                    <VTextField
                      v-model="line.notes"
                      label="Catatan"
                      density="compact"
                      hide-details
                      placeholder="Opsional"
                    />
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </div>

          <VAlert
            v-if="returnLines.length === 0"
            type="info"
            class="mt-4"
            variant="tonal"
            icon="tabler-info-circle"
          >
            Belum ada barang dipilih. Klik "Pilih Barang" untuk menambahkan.
          </VAlert>
        </div>
      </VCardText>

      <VCardActions
        v-if="selectedOrderId"
        class="pa-4"
      >
        <VSpacer />
        <VBtn
          variant="outlined"
          color="secondary"
          class="me-2"
          @click="router.push('/sales/returns')"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          :disabled="!canSubmit"
          :loading="isLoading"
          @click="handleSubmit"
        >
          Buat Retur
        </VBtn>
      </VCardActions>
    </VCard>

    <!-- Item Selection Dialog -->
    <VDialog
      v-model="isItemSelectionOpen"
      max-width="800"
    >
      <VCard>
        <VCardTitle>Pilih Barang Retur</VCardTitle>
        <VCardText>
          <VTable>
            <thead>
              <tr>
                <th style="width: 50px" />
                <th>Barang</th>
                <th class="text-end">
                  Dipesan
                </th>
                <th class="text-end">
                  Sisa
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in availableOrderLines"
                :key="line.orderLineId"
              >
                <td>
                  <VCheckbox
                    v-model="selectedLineIds"
                    :value="line.orderLineId"
                    hide-details
                    density="compact"
                    :disabled="returnLines.some(rl => rl.orderLineId === line.orderLineId)"
                  />
                </td>
                <td>
                  <div>{{ line.itemName }}</div>
                  <div
                    v-if="line.itemSku"
                    class="text-caption text-disabled"
                  >
                    {{ line.itemSku.skuCode }}
                  </div>
                </td>
                <td class="text-end">
                  {{ line.quantity }}
                </td>
                <td class="text-end font-weight-bold">
                  {{ line.remainingQuantity }}
                </td>
              </tr>
              <tr v-if="availableOrderLines.length === 0">
                <td
                  colspan="4"
                  class="text-center text-disabled"
                >
                  Tidak ada barang tersedia untuk diretur
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="isItemSelectionOpen = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            :disabled="selectedLineIds.length === 0"
            @click="addSelectedItems"
          >
            Tambahkan
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
