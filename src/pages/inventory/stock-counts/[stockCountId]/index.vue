<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useStockCountStore } from '@/stores/inventory/stockCountStore'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import type { StockCount, StockCountLine } from '@/types/models/inventory/stock-count'
import 'dayjs/locale/id'

dayjs.locale('id')

const route = useRoute()
const router = useRouter()
const stockCountStore = useStockCountStore()
const confirmDialogStore = useConfirmDialogStore()

const { isDownloading } = storeToRefs(stockCountStore)
const stockCountId = route.params.stockCountId as string
const stockCount = ref<StockCount | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)

// Local state for lines to handle inputs
const lines = ref<StockCountLine[]>([])
const searchQuery = ref('')
const showDiffOnly = ref(false)

// Computed
const filteredLines = computed(() => {
  let result = lines.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()

    result = result.filter((l: StockCountLine) =>
      (l.itemSku?.itemName || '').toLowerCase().includes(query)
      || (l.itemSku?.code || '').toLowerCase().includes(query),
    )
  }

  if (showDiffOnly.value)
    result = result.filter((l: StockCountLine) => l.difference !== 0)

  return result
})

const isCompleted = computed(() => stockCount.value?.status === 'COMPLETED' || stockCount.value?.status === 'CANCELLED')
const totalSystemQty = computed(() => lines.value.reduce((acc: number, l: StockCountLine) => acc + (l.systemQty || 0), 0))
const totalCountedQty = computed(() => lines.value.reduce((acc: number, l: StockCountLine) => acc + (l.countedQty || 0), 0))
const totalDifference = computed(() => lines.value.reduce((acc: number, l: StockCountLine) => acc + (l.difference || 0), 0))

const loadData = async () => {
  isLoading.value = true
  try {
    const response = await stockCountStore.fetchById(stockCountId)

    stockCount.value = response.data

    // Deep copy lines to modify locally
    lines.value = JSON.parse(JSON.stringify(response.data.lines || []))
  }
  catch (error) {
    console.error(error)

    // alert('Gagal memuat data')
  }
  finally {
    isLoading.value = false
  }
}

const updateDifference = (line: StockCountLine) => {
  const counted = Number(line.countedQty)

  line.countedQty = Number.isNaN(counted) ? 0 : counted
  line.difference = line.countedQty - line.systemQty
}

const saveDraft = async () => {
  if (!stockCount.value)
    return

  isSaving.value = true
  try {
    const payloadLines = lines.value.map((l: StockCountLine) => ({
      stockCountLineId: l.stockCountLineId,
      countedQty: l.countedQty,
      notes: l.notes,
    }))

    await stockCountStore.update(stockCountId, { lines: payloadLines })
    await loadData()
  }
  catch (error: any) {
    console.error(error)
    alert(error.data?.message || 'Gagal menyimpan draft')
  }
  finally {
    isSaving.value = false
  }
}

const handleFinalize = async () => {
  const confirmed = await confirmDialogStore.openGenericDialog(
    'Apakah Anda yakin ingin menyelesaikan Stock Opname ini? Stok sistem akan disesuaikan secara otomatis berdasarkan selisih.',
    {
      title: 'Selesaikan Opname',
      confirmText: 'Ya, Selesaikan',
      cancelText: 'Batal',
      color: 'primary',
    },
  )

  if (!confirmed)
    return

  await saveDraft()

  isSaving.value = true
  try {
    await stockCountStore.finalize(stockCountId)
    await loadData()
  }
  catch (error: any) {
    console.error(error)
    showToast(error.data?.message || 'Gagal menyelesaikan opname', 'error')
  }
  finally {
    isSaving.value = false
  }
}

const handleCancel = async () => {
  const confirmed = await confirmDialogStore.openGenericDialog(
    'Apakah Anda yakin ingin membatalkan Stock Opname ini? Tindakan ini tidak dapat dibatalkan.',
    {
      title: 'Batalkan Opname',
      confirmText: 'Ya, Batalkan',
      cancelText: 'Tidak',
      color: 'error',
    },
  )

  if (!confirmed)
    return

  isSaving.value = true
  try {
    await stockCountStore.cancel(stockCountId)
    await loadData()
    showToast('Stock Opname berhasil dibatalkan', 'success')
  }
  catch (error: any) {
    console.error(error)
    showToast(error.data?.message || 'Gagal membatalkan opname', 'error')
  }
  finally {
    isSaving.value = false
  }
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    OPEN: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
  }

  return colors[status] || 'secondary'
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <VCard
      v-if="isLoading"
      class="mb-4"
      elevation="2"
    >
      <VCardText class="text-center pa-8">
        <VProgressCircular
          indeterminate
          color="primary"
          size="48"
        />
        <div class="mt-4 text-body-1">
          Memuat detail opname...
        </div>
      </VCardText>
    </VCard>

    <template v-else-if="stockCount">
      <!-- Header Section -->
      <VCard
        class="mb-4"
        elevation="2"
      >
        <VCardText>
          <div class="d-flex flex-wrap justify-space-between align-center">
            <div class="d-flex align-center">
              <VBtn
                icon
                variant="text"
                color="default"
                class="me-3"
                @click="router.push('/inventory/stock-counts')"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
              <div class="d-flex gap-2 align-center">
                <VIcon
                  icon="tabler-clipboard-check"
                  class="me-2"
                  color="primary"
                  size="30"
                />
                <div>
                  <div class="text-h5 font-weight-bold">
                    Detail Stock Opname
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ stockCount.reference }} &bull; {{ dayjs(stockCount.createdAt).format('DD MMMM YYYY') }}
                  </div>
                </div>
              </div>
            </div>

            <VChip
              :color="getStatusColor(stockCount.status)"
              variant="flat"
              size="large"
              class="font-weight-bold"
            >
              {{ stockCount.status }}
            </VChip>
          </div>
        </VCardText>

        <VDivider />

        <!-- Actions -->
        <VCardText class="pb-2">
          <div class="d-flex flex-wrap gap-2 justify-end">
            <VBtn
              v-if="!isCompleted"
              variant="tonal"
              color="error"
              class="me-auto"
              :loading="isSaving"
              @click="handleCancel"
            >
              Batalkan
            </VBtn>

            <VBtn
              v-if="!isCompleted"
              variant="tonal"
              color="secondary"
              prepend-icon="tabler-device-floppy"
              :loading="isSaving"
              @click="saveDraft"
            >
              Simpan
            </VBtn>

            <VBtn
              v-if="!isCompleted"
              color="primary"
              prepend-icon="tabler-check"
              :loading="isSaving"
              @click="handleFinalize"
            >
              Selesaikan
            </VBtn>

            <!-- Print Button -->
            <VBtn
              color="info"
              variant="tonal"
              prepend-icon="tabler-file-type-pdf"
              :loading="isDownloading"
              @click="stockCountStore.downloadPdf(stockCount)"
            >
              Unduh Laporan
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <VRow>
        <!-- Information Card -->
        <VCol
          cols="12"
          md="8"
        >
          <VCard
            class="mb-4"
            elevation="2"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon
                icon="tabler-info-circle"
                class="me-2"
                color="primary"
              />
              Informasi Sesi
            </VCardTitle>
            <VDivider />
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Outlet</label>
                    <div class="d-flex align-center">
                      <VAvatar
                        size="24"
                        color="primary"
                        variant="tonal"
                        class="me-2"
                      >
                        <VIcon
                          icon="tabler-building-store"
                          size="14"
                        />
                      </VAvatar>
                      <span class="text-body-1 font-weight-medium">{{ stockCount.outlet?.name }}</span>
                    </div>
                  </div>
                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Dibuat Oleh</label>
                    <div class="d-flex align-center">
                      <VAvatar
                        size="24"
                        color="secondary"
                        variant="tonal"
                        class="me-2"
                      >
                        <VIcon
                          icon="tabler-user"
                          size="14"
                        />
                      </VAvatar>
                      <span class="text-body-1">{{ stockCount.createdByUser?.name }}</span>
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Waktu Mulai</label>
                    <div class="d-flex align-center">
                      <VIcon
                        icon="tabler-clock"
                        size="16"
                        class="me-2 text-warning"
                      />
                      <span>{{ dayjs(stockCount.createdAt).format('DD MMM YYYY, HH:mm') }}</span>
                    </div>
                  </div>
                  <!-- Optional Updated At -->
                </VCol>
              </VRow>
              <div
                v-if="stockCount.notes"
                class="mt-2"
              >
                <label class="text-caption text-medium-emphasis">Catatan</label>
                <div class="bg-var-theme-background rounded pa-2 text-body-2">
                  {{ stockCount.notes }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Summary Statistics -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard
            class="mb-4"
            elevation="2"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon
                icon="tabler-chart-bar"
                class="me-2"
                color="primary"
              />
              Ringkasan
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Total Item</span>
                <span class="font-weight-bold">{{ lines.length }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Total Sistem</span>
                <span class="font-weight-bold">{{ totalSystemQty }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Total Fisik</span>
                <span class="font-weight-bold">{{ totalCountedQty }}</span>
              </div>
              <VDivider class="my-2" />
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-1 font-weight-bold">Total Selisih</span>
                <VChip
                  :color="totalDifference === 0 ? 'success' : 'error'"
                  size="small"
                >
                  {{ totalDifference > 0 ? '+' : '' }}{{ totalDifference }}
                </VChip>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Lines Table -->
      <VCard elevation="2">
        <VCardText class="d-flex flex-wrap align-center gap-4 py-3">
          <span class="text-h6 font-weight-bold">Daftar Item</span>
          <VSpacer />
          <div style="width: 250px;">
            <VTextField
              v-model="searchQuery"
              placeholder="Cari Item / SKU..."
              prepend-inner-icon="tabler-search"
              density="compact"
              variant="outlined"
              hide-details
            />
          </div>
          <VCheckbox
            v-model="showDiffOnly"
            label="Hanya Selisih"
            density="compact"
            hide-details
          />
        </VCardText>
        <VDivider />

        <VTable
          hover
          class="text-no-wrap"
        >
          <thead>
            <tr class="text-uppercase bg-var-theme-background">
              <th>Item</th>
              <th
                class="text-end"
                style="width: 120px;"
              >
                Sistem
              </th>
              <th
                class="text-end"
                style="width: 150px;"
              >
                Fisik
              </th>
              <th
                class="text-end"
                style="width: 120px;"
              >
                Selisih
              </th>
              <th>Catatan Item</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="line in filteredLines"
              :key="line.stockCountLineId"
            >
              <td>
                <div class="d-flex align-center">
                  <VAvatar
                    size="32"
                    color="primary"
                    variant="tonal"
                    class="me-3"
                  >
                    <VIcon
                      icon="tabler-package"
                      size="18"
                    />
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium">
                      {{ line.itemSku?.itemName }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ line.itemSku?.code }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-end font-weight-medium text-disabled">
                {{ line.systemQty }}
              </td>
              <td class="text-end">
                <div v-if="!isCompleted">
                  <VTextField
                    v-model.number="line.countedQty"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    min="0"
                    class="centered-input"
                    @input="updateDifference(line)"
                  />
                </div>
                <div
                  v-else
                  class="font-weight-bold"
                >
                  {{ line.countedQty }}
                </div>
              </td>
              <td class="text-end">
                <VChip
                  :color="line.difference === 0 ? 'default' : (line.difference > 0 ? 'success' : 'error')"
                  size="small"
                  variant="flat"
                >
                  {{ line.difference > 0 ? '+' : '' }}{{ line.difference }}
                </VChip>
              </td>
              <td>
                <VTextField
                  v-if="!isCompleted"
                  v-model="line.notes"
                  placeholder="Tambah catatan..."
                  variant="plain"
                  density="compact"
                  hide-details
                />
                <span
                  v-else
                  class="text-caption"
                >{{ line.notes || '-' }}</span>
              </td>
            </tr>
            <tr v-if="filteredLines.length === 0">
              <td
                colspan="5"
                class="text-center pa-8 text-medium-emphasis"
              >
                <VIcon
                  icon="tabler-search-off"
                  size="32"
                  class="mb-2"
                />
                <div>Tidak ada item yang ditemukan</div>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </template>
  </div>
</template>

<style scoped>
.centered-input :deep(input) {
  text-align: right;
}
</style>
