<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import enums from '@/../docs/enums.json'

// Types
interface ProductionBOM {
  productionBomId: string
  bomCode: string
  bomName: string
  productionType: keyof typeof enums.productionTypes
  baseQuantity: number
  baseUnit: string
  totalInputCost: number
  isActive: boolean
  version: number
  inputsCount: number
  outputsCount: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  totalTimeMinutes?: number
  outputs?: Array<{
    itemSku: {
      skuName: string
    }
  }>
}

// Router
const router = useRouter()

// State
const searchQuery = ref('')
const productionTypeFilter = ref<string>('ALL')
const statusFilter = ref<string>('ALL')
const currentPage = ref(1)
const perPage = ref(20)
const isLoading = ref(false)

// Mock Data
const boms = ref<ProductionBOM[]>([
  {
    productionBomId: '1',
    bomCode: 'BOM-NASIGORENG-001',
    bomName: 'Nasi Goreng Special Recipe',
    productionType: 'COOKING',
    baseQuantity: 1,
    baseUnit: 'porsi',
    totalInputCost: 21000,
    isActive: true,
    version: 2,
    inputsCount: 5,
    outputsCount: 1,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    outputs: [{ itemSku: { skuName: 'Nasi Goreng Special' } }],
  },
  {
    productionBomId: '2',
    bomCode: 'BOM-AYAM-002',
    bomName: 'Ayam Utuh Breakdown',
    productionType: 'DISASSEMBLY',
    baseQuantity: 1,
    baseUnit: 'ekor',
    totalInputCost: 45000,
    isActive: true,
    version: 1,
    inputsCount: 1,
    outputsCount: 6,
    prepTimeMinutes: 15,
    totalTimeMinutes: 15,
    outputs: [{ itemSku: { skuName: 'Ayam Dada, Paha, Sayap, dll' } }],
  },
  {
    productionBomId: '3',
    bomCode: 'BOM-NASIKOTAK-003',
    bomName: 'Nasi Kotak Premium Batch 100',
    productionType: 'ASSEMBLY',
    baseQuantity: 100,
    baseUnit: 'box',
    totalInputCost: 850000,
    isActive: true,
    version: 1,
    inputsCount: 8,
    outputsCount: 3,
    prepTimeMinutes: 30,
    cookTimeMinutes: 60,
    totalTimeMinutes: 90,
    outputs: [{ itemSku: { skuName: 'Nasi Kotak A, B, C' } }],
  },
  {
    productionBomId: '4',
    bomCode: 'BOM-BUMBU-004',
    bomName: 'Bumbu Dasar Merah',
    productionType: 'PROCESSING',
    baseQuantity: 1,
    baseUnit: 'kg',
    totalInputCost: 35000,
    isActive: true,
    version: 3,
    inputsCount: 6,
    outputsCount: 1,
    prepTimeMinutes: 20,
    totalTimeMinutes: 20,
    outputs: [{ itemSku: { skuName: 'Bumbu Dasar Merah' } }],
  },
  {
    productionBomId: '5',
    bomCode: 'BOM-CAPPUCCINO-005',
    bomName: 'Cappuccino Premium',
    productionType: 'COOKING',
    baseQuantity: 1,
    baseUnit: 'cup',
    totalInputCost: 12000,
    isActive: false,
    version: 1,
    inputsCount: 3,
    outputsCount: 1,
    prepTimeMinutes: 3,
    totalTimeMinutes: 3,
    outputs: [{ itemSku: { skuName: 'Cappuccino' } }],
  },
])

// Computed
const filteredBOMs = computed(() => {
  let result = boms.value

  // Filter by production type
  if (productionTypeFilter.value !== 'ALL')
    result = result.filter(bom => bom.productionType === productionTypeFilter.value)

  // Filter by status
  if (statusFilter.value === 'ACTIVE')
    result = result.filter(bom => bom.isActive)
  else if (statusFilter.value === 'INACTIVE')
    result = result.filter(bom => !bom.isActive)

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()

    result = result.filter(bom =>
      bom.bomCode.toLowerCase().includes(query)
      || bom.bomName.toLowerCase().includes(query),
    )
  }

  return result
})

const productionTypeOptions = computed(() => {
  return [
    { value: 'ALL', label: 'Semua Tipe' },
    ...Object.entries(enums.productionTypes).map(([key, value]) => ({
      value: key,
      label: value.label,
    })),
  ]
})

const statusOptions = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'INACTIVE', label: 'Tidak Aktif' },
]

const stats = computed(() => {
  const total = boms.value.length
  const active = boms.value.filter(b => b.isActive).length
  const inactive = boms.value.filter(b => !b.isActive).length
  const cooking = boms.value.filter(b => b.productionType === 'COOKING').length
  const assembly = boms.value.filter(b => b.productionType === 'ASSEMBLY').length

  return { total, active, inactive, cooking, assembly }
})

// Methods
const getProductionTypeConfig = (type: keyof typeof enums.productionTypes) => {
  return enums.productionTypes[type] || {}
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatTime = (minutes?: number) => {
  if (!minutes)
    return '-'
  if (minutes < 60)
    return `${minutes} menit`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours}j ${mins}m`
}

const viewBOM = (bomId: string) => {
  router.push(`/production/boms/${bomId}`)
}

const createBOM = () => {
  router.push('/production/boms/create')
}

const editBOM = (bomId: string) => {
  router.push(`/production/boms/${bomId}/edit`)
}

const cloneBOM = (bomId: string) => {
  console.log('Clone BOM:', bomId)
}

const toggleStatus = (bomId: string) => {
  const bom = boms.value.find(b => b.productionBomId === bomId)
  if (bom)
    bom.isActive = !bom.isActive
}

// Table headers
const tableHeaders = [
  { title: 'Kode BOM', key: 'bomCode', align: 'start', sortable: true },
  { title: 'Nama Resep', key: 'bomName', align: 'start', sortable: true },
  { title: 'Tipe Produksi', key: 'productionType', align: 'start', sortable: false },
  { title: 'Base Qty', key: 'baseQuantity', align: 'center', sortable: false },
  { title: 'Input/Output', key: 'io', align: 'center', sortable: false },
  { title: 'Waktu', key: 'totalTimeMinutes', align: 'center', sortable: false },
  { title: 'Biaya Input', key: 'totalInputCost', align: 'end', sortable: true },
  { title: 'Status', key: 'isActive', align: 'center', sortable: false },
  { title: 'Aksi', key: 'actions', align: 'center', sortable: false },
]

// Context menu
const contextMenuOpen = ref(false)
const contextMenuTarget = ref<HTMLElement | null>(null)
const selectedBOM = ref<ProductionBOM | null>(null)

const openContextMenu = (bom: ProductionBOM, event: MouseEvent) => {
  selectedBOM.value = bom
  contextMenuTarget.value = event.target as HTMLElement
  contextMenuOpen.value = true
}

onMounted(() => {
  // Load data from API
})
</script>

<template>
  <div class="production-boms-page">
    <!-- Page Header -->
    <VCard>
      <VCardText class="pa-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="d-flex align-center gap-2 text-h5 font-weight-medium">
              <VIcon
                icon="tabler-book"
                size="32"
              />
              Resep Produksi
            </div>
            <p class="text-medium-emphasis mb-0">
              Kelola resep dan formula produksi Anda
            </p>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="createBOM"
          >
            Buat Baru
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- Stats Cards -->
    <div class="stats-grid mt-5">
      <VCard class="stat-card stat-total">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-book-2"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Total BOM
              </div>
              <div class="stat-value">
                {{ stats.total }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="stat-card stat-active">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-circle-check"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Aktif
              </div>
              <div class="stat-value">
                {{ stats.active }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="stat-card stat-inactive">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-circle-x"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Tidak Aktif
              </div>
              <div class="stat-value">
                {{ stats.inactive }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="stat-card stat-cooking">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-chef-hat"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Memasak
              </div>
              <div class="stat-value">
                {{ stats.cooking }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="stat-card stat-assembly">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-tools"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Perakitan
              </div>
              <div class="stat-value">
                {{ stats.assembly }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </div>

    <!-- Filters -->
    <VCard class="filters-card">
      <VCardText>
        <div class="d-flex gap-2">
          <VSelect
            v-model="perPage"
            :items="perPages"
            placeholder="Jumlah Data"
            prepend-inner-icon="tabler-list"
            density="comfortable"
            label="Per Page"
            hide-details
            style="max-inline-size: 120px !important;"
          />
          <VSpacer />
          <VSelect
            v-model="productionTypeFilter"
            :items="productionTypeOptions"
            item-title="label"
            item-value="value"
            placeholder="Filter Tipe Produksi"
            prepend-inner-icon="tabler-category"
            density="comfortable"
            hide-details
          />

          <VSelect
            v-model="statusFilter"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            placeholder="Filter Status"
            prepend-inner-icon="tabler-filter"
            density="comfortable"
            hide-details
          />

          <VTextField
            v-model="searchQuery"
            placeholder="Cari kode atau nama BOM..."
            prepend-inner-icon="tabler-search"
            density="comfortable"
            clearable
            hide-details
          />
        </div>
      </VCardText>
    </VCard>

    <!-- BOMs Table -->
    <VCard class="boms-table-card">
      <VDataTableServer
        :headers="tableHeaders"
        :items="filteredBOMs"
        :loading="isLoading"
        loading-text="Memuat data BOM..."
        class="text-wrap elevation-1"
        :items-per-page="perPage"
        :items-length="filteredBOMs.length"
      >
        <!-- Loading Skeleton -->
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

        <template #item="{ item }">
          <tr
            class="bom-row cursor-pointer"
            :class="{ 'bom-inactive': !item.isActive }"
            @click="viewBOM(item.productionBomId)"
          >
            <!-- Kode BOM -->
            <td style="min-inline-size: 180px;">
              <div class="d-flex align-center">
                <VIcon
                  :icon="getProductionTypeConfig(item.productionType).icon"
                  size="20"
                  class="me-3"
                  color="primary"
                />
                <div>
                  <div class="font-weight-bold text-primary">
                    {{ item.bomCode }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    v{{ item.version }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Nama Resep -->
            <td style="min-inline-size: 250px;">
              <div class="font-weight-medium">
                {{ item.bomName }}
              </div>
            </td>

            <!-- Tipe Produksi -->
            <td>
              <VChip
                :prepend-icon="getProductionTypeConfig(item.productionType).icon"
                size="small"
                variant="tonal"
                color="primary"
              >
                {{ getProductionTypeConfig(item.productionType).label }}
              </VChip>
            </td>

            <!-- Base Qty -->
            <td class="text-center">
              <div class="d-flex align-center justify-center">
                <span class="font-weight-bold">{{ item.baseQuantity }}</span>
                <span class="text-caption text-medium-emphasis ms-1">{{ item.baseUnit }}</span>
              </div>
            </td>

            <!-- Input/Output -->
            <td class="text-center">
              <div class="d-flex align-center justify-center gap-2">
                <VChip
                  size="x-small"
                  color="warning"
                  variant="tonal"
                  prepend-icon="tabler-arrow-down"
                >
                  {{ item.inputsCount }}
                </VChip>
                <VChip
                  size="x-small"
                  color="success"
                  variant="tonal"
                  prepend-icon="tabler-arrow-up"
                >
                  {{ item.outputsCount }}
                </VChip>
              </div>
            </td>

            <!-- Waktu -->
            <td class="text-center">
              <div
                v-if="item.totalTimeMinutes"
                class="d-flex align-center justify-center"
              >
                <VIcon
                  icon="tabler-clock"
                  size="16"
                  class="me-1 text-medium-emphasis"
                />
                <span class="text-body-2">{{ formatTime(item.totalTimeMinutes) }}</span>
              </div>
              <span
                v-else
                class="text-medium-emphasis"
              >-</span>
            </td>

            <!-- Biaya Input -->
            <td class="text-end">
              <span class="font-weight-bold">{{ formatCurrency(item.totalInputCost) }}</span>
            </td>

            <!-- Status -->
            <td class="text-center">
              <VChip
                :color="item.isActive ? 'success' : 'error'"
                :icon="item.isActive ? 'tabler-check' : 'tabler-x'"
                size="small"
                variant="tonal"
              >
                {{ item.isActive ? 'Aktif' : 'Nonaktif' }}
              </VChip>
            </td>

            <!-- Aksi -->
            <td class="text-center">
              <VBtn
                icon="tabler-dots-vertical"
                variant="text"
                size="small"
                @click.stop="openContextMenu(item, $event)"
              />
            </td>
          </tr>
        </template>

        <!-- No Data -->
        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-book-off"
              size="64"
              color="disabled"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              Tidak ada data BOM
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Belum ada BOM yang ditambahkan atau sesuai dengan filter pencarian
            </p>
            <VBtn
              color="primary"
              variant="elevated"
              @click="createBOM"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah BOM Pertama
            </VBtn>
          </div>
        </template>

        <!-- Bottom Pagination -->
        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-space-between align-center mt-2">
              <div class="text-body-2 text-medium-emphasis">
                Menampilkan {{ filteredBOMs.length }} dari {{ boms.length }} BOM
              </div>
            </div>
          </VCardText>
        </template>
      </VDataTableServer>

      <!-- Context Menu -->
      <VMenu
        v-model="contextMenuOpen"
        :target="contextMenuTarget"
        location="bottom start"
        location-strategy="connected"
        scroll-strategy="reposition"
        :offset="0"
        :close-on-content-click="true"
      >
        <VList
          v-if="selectedBOM"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            @click="viewBOM(selectedBOM.productionBomId)"
          />
          <VListItem
            title="Edit"
            prepend-icon="tabler-edit"
            @click="editBOM(selectedBOM.productionBomId)"
          />
          <VListItem
            title="Clone"
            prepend-icon="tabler-copy"
            @click="cloneBOM(selectedBOM.productionBomId)"
          />
          <VListItem
            :title="selectedBOM.isActive ? 'Nonaktifkan' : 'Aktifkan'"
            :prepend-icon="selectedBOM.isActive ? 'tabler-x' : 'tabler-check'"
            @click="toggleStatus(selectedBOM.productionBomId)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.production-boms-page {
  min-block-size: 100vh;
}

.stats-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-block-end: 24px;

  .stat-card {
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 10%);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 10%);
      transform: translateY(-4px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-primary), 0.2) 100%);
        block-size: 64px;
        color: rgb(var(--v-theme-primary));
        inline-size: 64px;
      }

      .stat-info {
        flex: 1;

        .stat-label {
          color: #718096;
          font-size: 13px;
          margin-block-end: 4px;
        }

        .stat-value {
          color: #1a202c;
          font-size: 28px;
          font-weight: 700;
        }
      }
    }

    &.stat-active .stat-icon {
      background: linear-gradient(135deg, rgba(16, 185, 129, 10%) 0%, rgba(16, 185, 129, 20%) 100%);
      color: #10b981;
    }

    &.stat-inactive .stat-icon {
      background: linear-gradient(135deg, rgba(107, 114, 128, 10%) 0%, rgba(107, 114, 128, 20%) 100%);
      color: #6b7280;
    }

    &.stat-cooking .stat-icon {
      background: linear-gradient(135deg, rgba(245, 158, 11, 10%) 0%, rgba(245, 158, 11, 20%) 100%);
      color: #f59e0b;
    }

    &.stat-assembly .stat-icon {
      background: linear-gradient(135deg, rgba(59, 130, 246, 10%) 0%, rgba(59, 130, 246, 20%) 100%);
      color: #3b82f6;
    }
  }
}

.filters-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 10%);
  margin-block-end: 24px;
}

.boms-table-card {
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 10%);

  .v-data-table__thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    th {
      padding: 16px;
      color: white !important;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
  }

  .bom-row {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(var(--v-theme-primary), 0.05);
    }

    &.bom-inactive {
      opacity: 0.6;
    }

    td {
      padding: 16px;
      border-block-end: 1px solid rgba(0, 0, 0, 5%);
    }
  }

  .empty-state {
    padding-block: 80px;
    padding-inline: 24px;
    text-align: center;

    .empty-icon {
      color: #cbd5e0;
      margin-block-end: 16px;
    }

    .empty-title {
      color: #2d3748;
      font-size: 20px;
      font-weight: 600;
      margin-block-end: 8px;
    }

    .empty-subtitle {
      color: #718096;
      font-size: 14px;
    }
  }
}
</style>
```
