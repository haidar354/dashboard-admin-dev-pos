<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import enums from '@/../docs/enums.json'

// Types
interface KitchenTask {
  productionTaskId: string
  taskNumber: string
  taskType: keyof typeof enums.productionTaskTypes
  station: keyof typeof enums.stationTypes
  status: keyof typeof enums.productionTaskStatus
  priority: number
  outputs: Array<{
    itemSku: {
      skuName: string
    }
    quantityPlanned: number
    unit: string
  }>
  sourceOrder?: {
    orderNumber: string
    tableNumber?: string
  }
  queuedAt: string
  notes?: string
}

// State
const selectedStation = ref<string>('ALL')
const tasks = ref<KitchenTask[]>([])
const currentTime = ref(new Date())
const autoRefreshInterval = ref<number | null>(null)

// Mock Data
const mockTasks: KitchenTask[] = [
  {
    productionTaskId: '1',
    taskNumber: 'KT-001',
    taskType: 'KITCHEN',
    station: 'KITCHEN',
    status: 'QUEUED',
    priority: 10,
    outputs: [
      {
        itemSku: { skuName: 'Nasi Goreng Special' },
        quantityPlanned: 2,
        unit: 'porsi',
      },
    ],
    sourceOrder: {
      orderNumber: 'POS-001',
      tableNumber: 'A-05',
    },
    queuedAt: '2025-11-27T12:30:00+07:00',
    notes: 'Pedas level 3',
  },
  {
    productionTaskId: '2',
    taskNumber: 'KT-002',
    taskType: 'KITCHEN',
    station: 'GRILL',
    status: 'IN_PROGRESS',
    priority: 9,
    outputs: [
      {
        itemSku: { skuName: 'Steak Wagyu' },
        quantityPlanned: 1,
        unit: 'porsi',
      },
    ],
    sourceOrder: {
      orderNumber: 'POS-002',
      tableNumber: 'B-12',
    },
    queuedAt: '2025-11-27T12:25:00+07:00',
    notes: 'Medium rare',
  },
  {
    productionTaskId: '3',
    taskNumber: 'CF-003',
    taskType: 'COFFEE',
    station: 'COFFEE',
    status: 'QUEUED',
    priority: 8,
    outputs: [
      {
        itemSku: { skuName: 'Cappuccino' },
        quantityPlanned: 3,
        unit: 'cup',
      },
    ],
    sourceOrder: {
      orderNumber: 'POS-003',
      tableNumber: 'C-08',
    },
    queuedAt: '2025-11-27T12:32:00+07:00',
  },
  {
    productionTaskId: '4',
    taskNumber: 'KT-004',
    taskType: 'KITCHEN',
    station: 'KITCHEN',
    status: 'QUEUED',
    priority: 7,
    outputs: [
      {
        itemSku: { skuName: 'Mie Goreng Seafood' },
        quantityPlanned: 1,
        unit: 'porsi',
      },
    ],
    sourceOrder: {
      orderNumber: 'POS-004',
      tableNumber: 'A-03',
    },
    queuedAt: '2025-11-27T12:33:00+07:00',
  },
  {
    productionTaskId: '5',
    taskNumber: 'BAR-005',
    taskType: 'BAR',
    station: 'BAR',
    status: 'IN_PROGRESS',
    priority: 6,
    outputs: [
      {
        itemSku: { skuName: 'Mojito' },
        quantityPlanned: 2,
        unit: 'glass',
      },
    ],
    sourceOrder: {
      orderNumber: 'POS-005',
      tableNumber: 'D-15',
    },
    queuedAt: '2025-11-27T12:28:00+07:00',
  },
]

// Computed
const stationOptions = computed(() => {
  return [
    { value: 'ALL', label: 'Semua Stasiun', icon: 'tabler-layout-grid' },
    ...Object.entries(enums.stationTypes).map(([key, value]) => ({
      value: key,
      label: value.label,
      icon: value.icon,
    })),
  ]
})

const filteredTasks = computed(() => {
  let result = tasks.value

  if (selectedStation.value !== 'ALL')
    result = result.filter(task => task.station === selectedStation.value)

  // Sort by priority (highest first) then by queued time
  return result.sort((a, b) => {
    if (a.priority !== b.priority)
      return b.priority - a.priority

    return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
  })
})

const queuedTasks = computed(() => filteredTasks.value.filter(t => t.status === 'QUEUED'))
const inProgressTasks = computed(() => filteredTasks.value.filter(t => t.status === 'IN_PROGRESS'))

const stats = computed(() => {
  return {
    total: filteredTasks.value.length,
    queued: queuedTasks.value.length,
    inProgress: inProgressTasks.value.length,
  }
})

// Methods
const getStatusConfig = (status: keyof typeof enums.productionTaskStatus) => {
  return enums.productionTaskStatus[status] || {}
}

const getStationConfig = (station: keyof typeof enums.stationTypes) => {
  return enums.stationTypes[station] || {}
}

const getTaskTypeConfig = (taskType: keyof typeof enums.productionTaskTypes) => {
  return enums.productionTaskTypes[taskType] || {}
}

const getWaitingTime = (queuedAt: string) => {
  const now = currentTime.value
  const queued = new Date(queuedAt)
  const diff = Math.floor((now.getTime() - queued.getTime()) / 1000 / 60) // minutes

  if (diff < 1)
    return 'Baru saja'
  if (diff < 60)
    return `${diff} menit`
  const hours = Math.floor(diff / 60)
  const mins = diff % 60

  return `${hours}j ${mins}m`
}

const getWaitingTimeClass = (queuedAt: string) => {
  const now = currentTime.value
  const queued = new Date(queuedAt)
  const diff = Math.floor((now.getTime() - queued.getTime()) / 1000 / 60) // minutes

  if (diff < 5)
    return 'time-normal'
  if (diff < 10)
    return 'time-warning'

  return 'time-critical'
}

const getPriorityClass = (priority: number) => {
  if (priority >= 9)
    return 'priority-critical'
  if (priority >= 7)
    return 'priority-high'
  if (priority >= 5)
    return 'priority-medium'

  return 'priority-low'
}

const startTask = (taskId: string) => {
  const task = tasks.value.find(t => t.productionTaskId === taskId)
  if (task)
    task.status = 'IN_PROGRESS'
}

const completeTask = (taskId: string) => {
  const index = tasks.value.findIndex(t => t.productionTaskId === taskId)
  if (index !== -1)
    tasks.value.splice(index, 1)
}

const loadTasks = () => {
  tasks.value = [...mockTasks]
}

const refreshTasks = () => {
  // Simulate real-time updates
  loadTasks()
}

// Lifecycle
onMounted(() => {
  loadTasks()

  // Update current time every second
  const timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Auto refresh tasks every 10 seconds
  autoRefreshInterval.value = setInterval(() => {
    refreshTasks()
  }, 10000) as unknown as number

  onUnmounted(() => {
    clearInterval(timeInterval)
    if (autoRefreshInterval.value)
      clearInterval(autoRefreshInterval.value)
  })
})
</script>

<template>
  <div class="kitchen-display-page">
    <!-- Header -->
    <div class="display-header">
      <div class="header-left">
        <h1 class="display-title">
          <VIcon
            icon="tabler-chef-hat"
            size="36"
            class="title-icon"
          />
          Kitchen Display System
        </h1>
        <div class="current-time">
          {{ currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
        </div>
      </div>

      <div class="header-stats">
        <div class="stat-badge stat-total">
          <VIcon
            icon="tabler-clipboard-list"
            size="24"
          />
          <div class="stat-info">
            <div class="stat-value">
              {{ stats.total }}
            </div>
            <div class="stat-label">
              Total
            </div>
          </div>
        </div>
        <div class="stat-badge stat-queued">
          <VIcon
            icon="tabler-clock"
            size="24"
          />
          <div class="stat-info">
            <div class="stat-value">
              {{ stats.queued }}
            </div>
            <div class="stat-label">
              Antrian
            </div>
          </div>
        </div>
        <div class="stat-badge stat-progress">
          <VIcon
            icon="tabler-tools"
            size="24"
          />
          <div class="stat-info">
            <div class="stat-value">
              {{ stats.inProgress }}
            </div>
            <div class="stat-label">
              Proses
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Station Filter -->
    <div class="station-filter">
      <VBtn
        v-for="station in stationOptions"
        :key="station.value"
        :color="selectedStation === station.value ? 'primary' : 'default'"
        :variant="selectedStation === station.value ? 'flat' : 'tonal'"
        size="large"
        class="station-btn"
        @click="selectedStation = station.value"
      >
        <VIcon
          :icon="station.icon"
          class="me-2"
        />
        {{ station.label }}
      </VBtn>
    </div>

    <!-- Tasks Display -->
    <div class="tasks-container">
      <!-- Queued Tasks -->
      <div class="tasks-column queued-column">
        <div class="column-header">
          <VIcon
            icon="tabler-clock"
            size="24"
          />
          <h2 class="column-title">
            Antrian
          </h2>
          <VChip
            color="warning"
            size="small"
          >
            {{ queuedTasks.length }}
          </VChip>
        </div>

        <div class="tasks-list">
          <VCard
            v-for="task in queuedTasks"
            :key="task.productionTaskId"
            class="task-card queued-task"
            :class="[getPriorityClass(task.priority)]"
          >
            <VCardText>
              <!-- Task Header -->
              <div class="task-card-header">
                <div class="task-number-badge">
                  {{ task.taskNumber }}
                </div>
                <div
                  class="priority-badge"
                  :class="getPriorityClass(task.priority)"
                >
                  <VIcon
                    icon="tabler-flag"
                    size="16"
                  />
                  {{ task.priority }}
                </div>
              </div>

              <!-- Order Info -->
              <div
                v-if="task.sourceOrder"
                class="order-info"
              >
                <div class="order-number">
                  <VIcon
                    icon="tabler-receipt"
                    size="18"
                  />
                  {{ task.sourceOrder.orderNumber }}
                </div>
                <div
                  v-if="task.sourceOrder.tableNumber"
                  class="table-number"
                >
                  <VIcon
                    icon="tabler-armchair"
                    size="18"
                  />
                  Meja {{ task.sourceOrder.tableNumber }}
                </div>
              </div>

              <!-- Item Info -->
              <div class="item-info">
                <div class="item-name">
                  {{ task.outputs[0].itemSku.skuName }}
                </div>
                <div class="item-quantity">
                  <VIcon
                    icon="tabler-package"
                    size="18"
                  />
                  {{ task.outputs[0].quantityPlanned }} {{ task.outputs[0].unit }}
                </div>
              </div>

              <!-- Station Badge -->
              <VChip
                :color="getStationConfig(task.station).color || 'default'"
                size="small"
                class="station-badge"
              >
                {{ getStationConfig(task.station).icon }} {{ getStationConfig(task.station).label }}
              </VChip>

              <!-- Notes -->
              <div
                v-if="task.notes"
                class="task-notes"
              >
                <VIcon
                  icon="tabler-note"
                  size="16"
                />
                {{ task.notes }}
              </div>

              <!-- Waiting Time -->
              <div
                class="waiting-time"
                :class="getWaitingTimeClass(task.queuedAt)"
              >
                <VIcon
                  icon="tabler-clock"
                  size="18"
                />
                {{ getWaitingTime(task.queuedAt) }}
              </div>

              <!-- Action Button -->
              <VBtn
                color="primary"
                size="large"
                block
                class="mt-4"
                @click="startTask(task.productionTaskId)"
              >
                <VIcon
                  icon="tabler-player-play"
                  class="me-2"
                />
                Mulai Masak
              </VBtn>
            </VCardText>
          </VCard>

          <!-- Empty State -->
          <div
            v-if="queuedTasks.length === 0"
            class="empty-state"
          >
            <VIcon
              icon="tabler-check-circle"
              size="60"
            />
            <p>Tidak ada antrian</p>
          </div>
        </div>
      </div>

      <!-- In Progress Tasks -->
      <div class="tasks-column progress-column">
        <div class="column-header">
          <VIcon
            icon="tabler-tools"
            size="24"
          />
          <h2 class="column-title">
            Sedang Diproses
          </h2>
          <VChip
            color="primary"
            size="small"
          >
            {{ inProgressTasks.length }}
          </VChip>
        </div>

        <div class="tasks-list">
          <VCard
            v-for="task in inProgressTasks"
            :key="task.productionTaskId"
            class="task-card progress-task"
            :class="[getPriorityClass(task.priority)]"
          >
            <VCardText>
              <!-- Task Header -->
              <div class="task-card-header">
                <div class="task-number-badge">
                  {{ task.taskNumber }}
                </div>
                <div
                  class="priority-badge"
                  :class="getPriorityClass(task.priority)"
                >
                  <VIcon
                    icon="tabler-flag"
                    size="16"
                  />
                  {{ task.priority }}
                </div>
              </div>

              <!-- Order Info -->
              <div
                v-if="task.sourceOrder"
                class="order-info"
              >
                <div class="order-number">
                  <VIcon
                    icon="tabler-receipt"
                    size="18"
                  />
                  {{ task.sourceOrder.orderNumber }}
                </div>
                <div
                  v-if="task.sourceOrder.tableNumber"
                  class="table-number"
                >
                  <VIcon
                    icon="tabler-armchair"
                    size="18"
                  />
                  Meja {{ task.sourceOrder.tableNumber }}
                </div>
              </div>

              <!-- Item Info -->
              <div class="item-info">
                <div class="item-name">
                  {{ task.outputs[0].itemSku.skuName }}
                </div>
                <div class="item-quantity">
                  <VIcon
                    icon="tabler-package"
                    size="18"
                  />
                  {{ task.outputs[0].quantityPlanned }} {{ task.outputs[0].unit }}
                </div>
              </div>

              <!-- Station Badge -->
              <VChip
                :color="getStationConfig(task.station).color || 'primary'"
                size="small"
                class="station-badge"
              >
                {{ getStationConfig(task.station).icon }} {{ getStationConfig(task.station).label }}
              </VChip>

              <!-- Notes -->
              <div
                v-if="task.notes"
                class="task-notes"
              >
                <VIcon
                  icon="tabler-note"
                  size="16"
                />
                {{ task.notes }}
              </div>

              <!-- Processing Time -->
              <div class="waiting-time time-progress">
                <VIcon
                  icon="tabler-clock-play"
                  size="18"
                />
                {{ getWaitingTime(task.queuedAt) }}
              </div>

              <!-- Action Button -->
              <VBtn
                color="success"
                size="large"
                block
                class="mt-4"
                @click="completeTask(task.productionTaskId)"
              >
                <VIcon
                  icon="tabler-check"
                  class="me-2"
                />
                Selesai
              </VBtn>
            </VCardText>
          </VCard>

          <!-- Empty State -->
          <div
            v-if="inProgressTasks.length === 0"
            class="empty-state"
          >
            <VIcon
              icon="tabler-clock-pause"
              size="60"
            />
            <p>Tidak ada yang diproses</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.kitchen-display-page {
  padding: 20px;
  min-block-size: 100vh;
}

.display-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 30%);
  margin-block-end: 24px;

  .header-left {
    .display-title {
      display: flex;
      align-items: center;
      font-size: 32px;
      font-weight: 800;
      gap: 12px;
      margin-block: 0 8px;
      margin-inline: 0;

      .title-icon {
        color: #fbbf24;
      }
    }

    .current-time {
      color: #10b981;
      font-family: "Courier New", monospace;
      font-size: 24px;
      font-weight: 700;
    }
  }

  .header-stats {
    display: flex;
    gap: 16px;

    .stat-badge {
      display: flex;
      align-items: center;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 10%);
      gap: 12px;
      padding-block: 16px;
      padding-inline: 24px;

      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 800;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.8;
          text-transform: uppercase;
        }
      }

      &.stat-total {
        border-inline-start: 4px solid #6366f1;
      }

      &.stat-queued {
        border-inline-start: 4px solid #f59e0b;
      }

      &.stat-progress {
        border-inline-start: 4px solid #3b82f6;
      }
    }
  }
}

.station-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-block-end: 24px;

  .station-btn {
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: none;
  }
}

.tasks-container {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 1fr;

  .tasks-column {
    .column-header {
      display: flex;
      align-items: center;
      border-radius: 12px;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      gap: 12px;
      margin-block-end: 16px;
      padding-block: 16px;
      padding-inline: 20px;

      .column-title {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 700;
      }
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-block-size: calc(100vh - 300px);
      overflow-y: auto;
      padding-inline-end: 8px;

      &::-webkit-scrollbar {
        inline-size: 8px;
      }

      &::-webkit-scrollbar-track {
        border-radius: 4px;
        background: rgba(255, 255, 255, 5%);
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background: rgba(255, 255, 255, 20%);

        &:hover {
          background: rgba(255, 255, 255, 30%);
        }
      }

      .task-card {
        border-radius: 12px;
        border-inline-start: 6px solid transparent;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 30%);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 40%);
          transform: translateX(4px);
        }

        &.priority-critical {
          background: linear-gradient(135deg, rgba(239, 68, 68, 10%) 0%, rgba(239, 68, 68, 5%) 100%);
          border-inline-start-color: #ef4444;
        }

        &.priority-high {
          background: linear-gradient(135deg, rgba(249, 115, 22, 10%) 0%, rgba(249, 115, 22, 5%) 100%);
          border-inline-start-color: #f97316;
        }

        &.priority-medium {
          border-inline-start-color: #f59e0b;
        }

        &.priority-low {
          border-inline-start-color: #6b7280;
        }

        .task-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-block-end: 16px;

          .task-number-badge {
            color: rgb(var(--v-theme-primary));
            font-size: 18px;
            font-weight: 800;
          }

          .priority-badge {
            display: flex;
            align-items: center;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            gap: 4px;
            padding-block: 4px;
            padding-inline: 12px;

            &.priority-critical {
              background: #ef4444;
              color: white;
            }

            &.priority-high {
              background: #f97316;
              color: white;
            }

            &.priority-medium {
              background: #f59e0b;
              color: white;
            }

            &.priority-low {
              background: #6b7280;
              color: white;
            }
          }
        }

        .order-info {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 5%);
          margin-block-end: 16px;

          .order-number,
          .table-number {
            display: flex;
            align-items: center;
            font-size: 14px;
            font-weight: 600;
            gap: 8px;
          }

          .table-number {
            color: #fbbf24;
          }
        }

        .item-info {
          margin-block-end: 16px;

          .item-name {
            color: white;
            font-size: 20px;
            font-weight: 700;
            margin-block-end: 8px;
          }

          .item-quantity {
            display: flex;
            align-items: center;
            color: #94a3b8;
            font-size: 16px;
            gap: 8px;
          }
        }

        .station-badge {
          font-weight: 600;
          margin-block-end: 12px;
        }

        .task-notes {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 10%);
          color: #93c5fd;
          font-size: 14px;
          gap: 8px;
          margin-block-end: 12px;
        }

        .waiting-time {
          display: flex;
          align-items: center;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          gap: 8px;
          padding-block: 8px;
          padding-inline: 12px;

          &.time-normal {
            background: rgba(16, 185, 129, 20%);
            color: #10b981;
          }

          &.time-warning {
            background: rgba(245, 158, 11, 20%);
            color: #f59e0b;
          }

          &.time-critical {
            animation: pulse 2s infinite;
            background: rgba(239, 68, 68, 20%);
            color: #ef4444;
          }

          &.time-progress {
            background: rgba(59, 130, 246, 20%);
            color: #3b82f6;
          }
        }
      }

      .empty-state {
        color: #64748b;
        padding-block: 60px;
        padding-inline: 20px;
        text-align: center;

        i {
          margin-block-end: 16px;
          opacity: 0.5;
        }

        p {
          font-size: 16px;
          font-weight: 600;
        }
      }
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}
</style>
