<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import enums from '@/../docs/enums.json'

// Types
interface ProductionTask {
  productionTaskId: string
  taskNumber: string
  taskType: keyof typeof enums.productionTaskTypes
  status: keyof typeof enums.productionTaskStatus
  sourceType: keyof typeof enums.productionSourceTypes
  outputs: Array<{
    itemSku: {
      skuName: string
    }
    quantityPlanned: number
    quantityProduced?: number
    unit: string
  }>
  assignedTo?: {
    name: string
  }
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  priority?: number
}

// Router
const router = useRouter()

// State
const searchQuery = ref('')
const statusFilter = ref<string>('ALL')
const taskTypeFilter = ref<string>('ALL')
const currentPage = ref(1)
const perPage = ref(20)
const isLoading = ref(false)

// Mock Data
const tasks = ref<ProductionTask[]>([
  {
    productionTaskId: '1',
    taskNumber: 'KT-20251127-001',
    taskType: 'KITCHEN',
    status: 'IN_PROGRESS',
    sourceType: 'SALES_ORDER',
    outputs: [
      {
        itemSku: { skuName: 'Nasi Goreng Special' },
        quantityPlanned: 50,
        quantityProduced: 30,
        unit: 'porsi',
      },
    ],
    assignedTo: { name: 'Chef Budi' },
    scheduledAt: '2025-11-27T06:00:00+07:00',
    startedAt: '2025-11-27T06:05:00+07:00',
    priority: 10,
  },
  {
    productionTaskId: '2',
    taskNumber: 'CF-20251127-002',
    taskType: 'COFFEE',
    status: 'QUEUED',
    sourceType: 'POS_ORDER',
    outputs: [
      {
        itemSku: { skuName: 'Cappuccino' },
        quantityPlanned: 5,
        unit: 'cup',
      },
    ],
    assignedTo: { name: 'Barista Ani' },
    scheduledAt: '2025-11-27T07:00:00+07:00',
    priority: 8,
  },
  {
    productionTaskId: '3',
    taskNumber: 'PR-20251127-003',
    taskType: 'PREP',
    status: 'COMPLETED',
    sourceType: 'STOCK',
    outputs: [
      {
        itemSku: { skuName: 'Bumbu Dasar' },
        quantityPlanned: 10,
        quantityProduced: 10,
        unit: 'kg',
      },
    ],
    assignedTo: { name: 'Staff Dapur' },
    scheduledAt: '2025-11-27T05:00:00+07:00',
    startedAt: '2025-11-27T05:10:00+07:00',
    completedAt: '2025-11-27T06:30:00+07:00',
  },
  {
    productionTaskId: '4',
    taskNumber: 'KT-20251127-004',
    taskType: 'KITCHEN',
    status: 'PENDING',
    sourceType: 'SALES_ORDER',
    outputs: [
      {
        itemSku: { skuName: 'Ayam Goreng Crispy' },
        quantityPlanned: 100,
        unit: 'pcs',
      },
    ],
    assignedTo: { name: 'Chef Budi' },
    scheduledAt: '2025-11-27T08:00:00+07:00',
    priority: 5,
  },
  {
    productionTaskId: '5',
    taskNumber: 'BK-20251127-005',
    taskType: 'BULK',
    status: 'IN_PROGRESS',
    sourceType: 'STOCK',
    outputs: [
      {
        itemSku: { skuName: 'Nasi Kotak Premium' },
        quantityPlanned: 200,
        quantityProduced: 150,
        unit: 'box',
      },
    ],
    assignedTo: { name: 'Tim Produksi' },
    scheduledAt: '2025-11-27T04:00:00+07:00',
    startedAt: '2025-11-27T04:15:00+07:00',
    priority: 9,
  },
])

// Computed
const filteredTasks = computed(() => {
  let result = tasks.value

  // Filter by status
  if (statusFilter.value !== 'ALL')
    result = result.filter(task => task.status === statusFilter.value)

  // Filter by task type
  if (taskTypeFilter.value !== 'ALL')
    result = result.filter(task => task.taskType === taskTypeFilter.value)

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()

    result = result.filter(task =>
      task.taskNumber.toLowerCase().includes(query)
      || task.outputs.some(o => o.itemSku.skuName.toLowerCase().includes(query)),
    )
  }

  return result
})

const statusOptions = computed(() => {
  return [
    { value: 'ALL', label: 'Semua Status' },
    ...Object.entries(enums.productionTaskStatus).map(([key, value]) => ({
      value: key,
      label: value.label,
    })),
  ]
})

const taskTypeOptions = computed(() => {
  return [
    { value: 'ALL', label: 'Semua Tipe' },
    ...Object.entries(enums.productionTaskTypes).map(([key, value]) => ({
      value: key,
      label: value.label,
    })),
  ]
})

const stats = computed(() => {
  const total = tasks.value.length
  const pending = tasks.value.filter(t => t.status === 'PENDING').length
  const queued = tasks.value.filter(t => t.status === 'QUEUED').length
  const inProgress = tasks.value.filter(t => t.status === 'IN_PROGRESS').length
  const completed = tasks.value.filter(t => t.status === 'COMPLETED').length

  return { total, pending, queued, inProgress, completed }
})

// Methods
const getStatusConfig = (status: keyof typeof enums.productionTaskStatus) => {
  return enums.productionTaskStatus[status] || {}
}

const getTaskTypeConfig = (taskType: keyof typeof enums.productionTaskTypes) => {
  return enums.productionTaskTypes[taskType] || {}
}

const getSourceTypeConfig = (sourceType: keyof typeof enums.productionSourceTypes) => {
  return enums.productionSourceTypes[sourceType] || {}
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getProgressPercentage = (task: ProductionTask) => {
  if (!task.outputs[0].quantityProduced)
    return 0

  return Math.round((task.outputs[0].quantityProduced / task.outputs[0].quantityPlanned) * 100)
}

const viewTask = (taskId: string) => {
  router.push(`/production/production-tasks/${taskId}`)
}

const createTask = () => {
  router.push('/production/production-tasks/create')
}

const startTask = (taskId: string) => {
  console.log('Start task:', taskId)
}

const completeTask = (taskId: string) => {
  console.log('Complete task:', taskId)
}

onMounted(() => {
  // Load data from API
})
</script>

<template>
  <div class="production-tasks-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <VIcon
              icon="tabler-tools-kitchen-2"
              size="32"
              class="title-icon"
            />
            Tugas Produksi
          </h1>
          <p class="page-subtitle">
            Kelola semua tugas produksi Anda
          </p>
        </div>
        <VBtn
          color="primary"
          size="large"
          prepend-icon="tabler-plus"
          @click="createTask"
        >
          Buat Tugas Baru
        </VBtn>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <VCard class="stat-card stat-total">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-clipboard-list"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Total Tugas
              </div>
              <div class="stat-value">
                {{ stats.total }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="stat-card stat-pending">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-clock"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Menunggu
              </div>
              <div class="stat-value">
                {{ stats.pending }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="stat-card stat-queued">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-list"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Antrian
              </div>
              <div class="stat-value">
                {{ stats.queued }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="stat-card stat-progress">
        <VCardText>
          <div class="stat-content">
            <div class="stat-icon">
              <VIcon
                icon="tabler-progress"
                size="40"
              />
            </div>
            <div class="stat-info">
              <div class="stat-label">
                Sedang Dikerjakan
              </div>
              <div class="stat-value">
                {{ stats.inProgress }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <VCard class="stat-card stat-completed">
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
                Selesai
              </div>
              <div class="stat-value">
                {{ stats.completed }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </div>

    <!-- Filters -->
    <VCard class="filters-card">
      <VCardText>
        <div class="filters-grid">
          <VTextField
            v-model="searchQuery"
            placeholder="Cari nomor tugas atau nama item..."
            prepend-inner-icon="tabler-search"
            density="comfortable"
            clearable
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

          <VSelect
            v-model="taskTypeFilter"
            :items="taskTypeOptions"
            item-title="label"
            item-value="value"
            placeholder="Filter Tipe Tugas"
            prepend-inner-icon="tabler-category"
            density="comfortable"
            hide-details
          />
        </div>
      </VCardText>
    </VCard>

    <!-- Tasks Grid -->
    <div class="tasks-grid">
      <VCard
        v-for="task in filteredTasks"
        :key="task.productionTaskId"
        class="task-card"
        :class="`task-${task.status.toLowerCase()}`"
        @click="viewTask(task.productionTaskId)"
      >
        <VCardText>
          <!-- Task Header -->
          <div class="task-header">
            <div class="task-number-section">
              <VIcon
                :icon="getTaskTypeConfig(task.taskType).icon"
                size="24"
                class="task-type-icon"
              />
              <div>
                <div class="task-number">
                  {{ task.taskNumber }}
                </div>
                <div class="task-type">
                  {{ getTaskTypeConfig(task.taskType).label }}
                </div>
              </div>
            </div>
            <VChip
              :color="getStatusConfig(task.status).color"
              size="small"
              class="status-chip"
            >
              {{ getStatusConfig(task.status).icon }} {{ getStatusConfig(task.status).label }}
            </VChip>
          </div>

          <!-- Task Output -->
          <div class="task-output">
            <div class="output-name">
              <VIcon
                icon="tabler-package"
                size="18"
                class="me-2"
              />
              {{ task.outputs[0].itemSku.skuName }}
            </div>
            <div class="output-quantity">
              <span class="quantity-produced">{{ task.outputs[0].quantityProduced || 0 }}</span>
              <span class="quantity-separator">/</span>
              <span class="quantity-planned">{{ task.outputs[0].quantityPlanned }}</span>
              <span class="quantity-unit">{{ task.outputs[0].unit }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div
            v-if="task.status === 'IN_PROGRESS'"
            class="task-progress"
          >
            <VProgressLinear
              :model-value="getProgressPercentage(task)"
              :color="getProgressPercentage(task) === 100 ? 'success' : 'primary'"
              height="8"
              rounded
            />
            <div class="progress-text">
              {{ getProgressPercentage(task) }}% Selesai
            </div>
          </div>

          <!-- Task Info -->
          <div class="task-info-grid">
            <div class="info-item">
              <VIcon
                icon="tabler-user"
                size="16"
                class="info-icon"
              />
              <span class="info-text">{{ task.assignedTo?.name || 'Belum ditugaskan' }}</span>
            </div>
            <div class="info-item">
              <VIcon
                icon="tabler-source-code"
                size="16"
                class="info-icon"
              />
              <span class="info-text">{{ getSourceTypeConfig(task.sourceType).label }}</span>
            </div>
            <div class="info-item">
              <VIcon
                icon="tabler-clock"
                size="16"
                class="info-icon"
              />
              <span class="info-text">{{ formatDateTime(task.scheduledAt) }}</span>
            </div>
            <div
              v-if="task.priority"
              class="info-item"
            >
              <VIcon
                icon="tabler-flag"
                size="16"
                class="info-icon"
              />
              <span class="info-text">Prioritas: {{ task.priority }}</span>
            </div>
          </div>

          <!-- Task Actions -->
          <div class="task-actions">
            <VBtn
              v-if="task.status === 'PENDING'"
              color="primary"
              size="small"
              variant="tonal"
              block
              @click.stop="startTask(task.productionTaskId)"
            >
              <VIcon
                icon="tabler-player-play"
                class="me-2"
              />
              Mulai Tugas
            </VBtn>
            <VBtn
              v-else-if="task.status === 'IN_PROGRESS'"
              color="success"
              size="small"
              variant="tonal"
              block
              @click.stop="completeTask(task.productionTaskId)"
            >
              <VIcon
                icon="tabler-check"
                class="me-2"
              />
              Selesaikan
            </VBtn>
            <VBtn
              v-else
              color="default"
              size="small"
              variant="text"
              block
              @click.stop="viewTask(task.productionTaskId)"
            >
              <VIcon
                icon="tabler-eye"
                class="me-2"
              />
              Lihat Detail
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredTasks.length === 0"
      class="empty-state-card"
    >
      <VCard>
        <VCardText class="empty-state">
          <VIcon
            icon="tabler-clipboard-off"
            size="80"
            class="empty-icon"
          />
          <h3 class="empty-title">
            Tidak ada tugas produksi
          </h3>
          <p class="empty-subtitle">
            Belum ada tugas produksi yang dibuat
          </p>
          <VBtn
            color="primary"
            class="mt-4"
            @click="createTask"
          >
            <VIcon
              icon="tabler-plus"
              class="me-2"
            />
            Buat Tugas Pertama
          </VBtn>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.production-tasks-page {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-block-size: 100vh;
}

.page-header {
  margin-block-end: 24px;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .title-section {
    .page-title {
      display: flex;
      align-items: center;
      margin: 0;
      color: #1a202c;
      font-size: 28px;
      font-weight: 700;
      gap: 12px;

      .title-icon {
        color: rgb(var(--v-theme-primary));
      }
    }

    .page-subtitle {
      color: #718096;
      font-size: 14px;
      margin-block: 4px 0;
      margin-inline: 0;
    }
  }
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

    &.stat-pending .stat-icon {
      background: linear-gradient(135deg, rgba(245, 158, 11, 10%) 0%, rgba(245, 158, 11, 20%) 100%);
      color: #f59e0b;
    }

    &.stat-queued .stat-icon {
      background: linear-gradient(135deg, rgba(249, 115, 22, 10%) 0%, rgba(249, 115, 22, 20%) 100%);
      color: #f97316;
    }

    &.stat-progress .stat-icon {
      background: linear-gradient(135deg, rgba(59, 130, 246, 10%) 0%, rgba(59, 130, 246, 20%) 100%);
      color: #3b82f6;
    }

    &.stat-completed .stat-icon {
      background: linear-gradient(135deg, rgba(16, 185, 129, 10%) 0%, rgba(16, 185, 129, 20%) 100%);
      color: #10b981;
    }
  }
}

.filters-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 10%);
  margin-block-end: 24px;

  .filters-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: 2fr 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
}

.tasks-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));

  .task-card {
    border-radius: 12px;
    border-inline-start: 4px solid transparent;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 10%);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 15%);
      transform: translateY(-4px);
    }

    &.task-pending {
      border-inline-start-color: #f59e0b;
    }

    &.task-queued {
      border-inline-start-color: #f97316;
    }

    &.task-in_progress {
      border-inline-start-color: #3b82f6;
    }

    &.task-completed {
      border-inline-start-color: #10b981;
    }

    .task-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-block-end: 16px;

      .task-number-section {
        display: flex;
        align-items: center;
        gap: 12px;

        .task-type-icon {
          color: rgb(var(--v-theme-primary));
        }

        .task-number {
          color: #1a202c;
          font-size: 16px;
          font-weight: 700;
        }

        .task-type {
          color: #718096;
          font-size: 12px;
        }
      }

      .status-chip {
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
    }

    .task-output {
      padding: 12px;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.1) 100%);
      margin-block-end: 16px;

      .output-name {
        display: flex;
        align-items: center;
        color: #1a202c;
        font-weight: 600;
        margin-block-end: 8px;
      }

      .output-quantity {
        font-size: 20px;
        font-weight: 700;

        .quantity-produced {
          color: rgb(var(--v-theme-primary));
        }

        .quantity-separator {
          color: #cbd5e0;
          margin-block: 0;
          margin-inline: 4px;
        }

        .quantity-planned {
          color: #4a5568;
        }

        .quantity-unit {
          color: #718096;
          font-size: 14px;
          font-weight: 500;
          margin-inline-start: 8px;
        }
      }
    }

    .task-progress {
      margin-block-end: 16px;

      .progress-text {
        color: #718096;
        font-size: 12px;
        font-weight: 600;
        margin-block-start: 8px;
        text-align: center;
      }
    }

    .task-info-grid {
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr 1fr;
      margin-block-end: 16px;

      .info-item {
        display: flex;
        align-items: center;
        color: #4a5568;
        font-size: 12px;
        gap: 6px;

        .info-icon {
          color: #718096;
        }

        .info-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .task-actions {
      border-block-start: 1px solid rgba(0, 0, 0, 5%);
      margin-block-start: 16px;
      padding-block-start: 16px;
    }
  }
}

.empty-state-card {
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
