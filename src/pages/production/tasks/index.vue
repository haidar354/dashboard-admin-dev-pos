<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import { type VDataTable } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { ProductionStatus, SourceType, Station, TaskType } from '@/types/models/production/production-task'
import { useProductionTaskStore } from '@/stores/production/productionTaskStore'

definePage({
  meta: {
    name: 'Production Tasks',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const productionTaskStore = useProductionTaskStore()
const search = ref('')
const selectedStatus = ref<ProductionStatus | undefined>()
const selectedStation = ref<Station | undefined>()
const selectedTaskType = ref<TaskType | undefined>()
const selectedSourceType = ref<SourceType | undefined>()

const {
  productionTasks,
  isLoading,
  pagination,
} = storeToRefs(productionTaskStore)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Task Number', key: 'taskNumber', align: 'start' },
  { title: 'Source', key: 'sourceType', align: 'start' },
  { title: 'Task Type', key: 'taskType', align: 'start' },
  { title: 'Station', key: 'station', align: 'start' },
  { title: 'Output', key: 'outputs', align: 'start' },
  { title: 'Status', key: 'status', align: 'center', width: '10%' },
  { title: 'Priority', key: 'priority', align: 'center', width: '8%' },
  { title: 'Created', key: 'createdAt', align: 'start', width: '10%' },
  { title: 'Actions', key: 'actions', align: 'center', width: '10%', sortable: false },
]

const statusOptions = [
  { title: 'All', value: undefined },
  { title: 'Pending', value: ProductionStatus.PENDING },
  { title: 'Queued', value: ProductionStatus.QUEUED },
  { title: 'In Progress', value: ProductionStatus.IN_PROGRESS },
  { title: 'Completed', value: ProductionStatus.COMPLETED },
  { title: 'Cancelled', value: ProductionStatus.CANCELLED },
]

const stationOptions = [
  { title: 'All', value: undefined },
  { title: 'Kitchen', value: Station.KITCHEN },
  { title: 'Bar', value: Station.BAR },
  { title: 'Coffee', value: Station.COFFEE },
]

const taskTypeOptions = [
  { title: 'All', value: undefined },
  { title: 'Kitchen', value: TaskType.KITCHEN },
  { title: 'Bar', value: TaskType.BAR },
  { title: 'Coffee', value: TaskType.COFFEE },
  { title: 'Assembly', value: TaskType.ASSEMBLY },
  { title: 'Prep', value: TaskType.PREP },
  { title: 'Bulk', value: TaskType.BULK },
  { title: 'Custom', value: TaskType.CUSTOM },
]

const sourceTypeOptions = [
  { title: 'All', value: undefined },
  { title: 'Stock', value: SourceType.STOCK },
  { title: 'POS Order', value: SourceType.POS_ORDER },
  { title: 'Sales Order', value: SourceType.SALES_ORDER },
  { title: 'Manual', value: SourceType.MANUAL },
]

const statusColors: Record<ProductionStatus, string> = {
  [ProductionStatus.PENDING]: 'secondary',
  [ProductionStatus.QUEUED]: 'info',
  [ProductionStatus.IN_PROGRESS]: 'warning',
  [ProductionStatus.COMPLETED]: 'success',
  [ProductionStatus.CANCELLED]: 'error',
}

watch(search, customDebounce((newValue: string) => {
  productionTaskStore.setFilters({ search: newValue })
  loadData()
}, 500))

watch([selectedStatus, selectedStation, selectedTaskType, selectedSourceType], () => {
  const filters: any = {}
  if (selectedStatus.value)
    filters.status = selectedStatus.value
  if (selectedStation.value)
    filters.station = selectedStation.value
  if (selectedTaskType.value)
    filters.taskType = selectedTaskType.value
  if (selectedSourceType.value)
    filters.sourceType = selectedSourceType.value

  productionTaskStore.setFilters(filters)
  loadData()
})

async function loadData() {
  await productionTaskStore.fetchProductionTasks(pagination.value.currentPage, pagination.value.perPage)
}

function handlePageChange(page: number) {
  productionTaskStore.fetchProductionTasks(page, pagination.value.perPage)
}

function viewDetail(taskId: string) {
  useRouter().push(`/production/tasks/${taskId}`)
}

function createNewTask() {
  useRouter().push({
    name: 'production-tasks-create',
  })
}

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div>
    <VCard
      class="mb-4"
      elevation="2"
    >
      <VSkeletonLoader
        v-if="isLoading && !productionTasks.length"
        type="heading"
        class="mx-4 my-4"
      />
      <template v-else>
        <VCardText class="d-flex flex-wrap justify-space-between">
          <span class="text-h5 d-inline my-auto">
            <VIcon
              icon="tabler-list-check"
              class="me-2"
              color="primary"
            />
            Production Tasks
          </span>
          <div class="mt-3 mt-md-0 flex-fill">
            <div class="w-auto d-flex flex-wrap justify-end">
              <VBtn
                v-if="$can('manage', 'Create Production Task') || $can('manage', 'default')"
                color="primary"
                variant="elevated"
                :to="{ name: 'production-tasks-create' }"
              >
                <VIcon
                  start
                  icon="tabler-plus"
                />
                Create Task
              </VBtn>
            </div>
          </div>
        </VCardText>
      </template>

      <VDivider />

      <VCardText>
        <VSkeletonLoader
          v-if="isLoading && !productionTasks.length"
          type="actions"
          class="mx-2"
        />
        <template v-else>
          <VRow>
            <VCol
              cols="12"
              md="3"
            >
              <VSelect
                v-model="selectedStatus"
                :items="statusOptions"
                label="Filter by Status"
                hide-details
                clearable
                dense
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VSelect
                v-model="selectedStation"
                :items="stationOptions"
                label="Filter by Station"
                hide-details
                clearable
                dense
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VSelect
                v-model="selectedTaskType"
                :items="taskTypeOptions"
                label="Filter by Task Type"
                hide-details
                clearable
                dense
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VSelect
                v-model="selectedSourceType"
                :items="sourceTypeOptions"
                label="Filter by Source"
                hide-details
                clearable
                dense
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <AppTextField
                v-model="search"
                placeholder="Search tasks..."
                append-inner-icon="tabler-search"
                single-line
                hide-details
                dense
              />
            </VCol>
          </VRow>
        </template>
      </VCardText>

      <VDataTableServer
        :headers="headers"
        :items="productionTasks"
        :loading="isLoading"
        loading-text="Loading production tasks..."
        class="text-no-wrap elevation-1"
        :items-per-page="pagination.perPage"
        :items-length="pagination.total"
        @update:page="handlePageChange"
      >
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

        <template #item.index="{ index }">
          <span class="text-body-2 font-weight-medium">{{ ((pagination.currentPage - 1) * pagination.perPage) + index + 1 }}</span>
        </template>

        <template #item.taskNumber="{ item }">
          <div class="font-weight-medium text-primary">
            {{ item.taskNumber }}
          </div>
        </template>

        <template #item.sourceType="{ item }">
          <VChip
            size="small"
            variant="tonal"
          >
            {{ item.sourceType }}
          </VChip>
          <div
            v-if="item.sourceOrder"
            class="text-caption text-medium-emphasis mt-1"
          >
            {{ item.sourceOrder.orderNumber }}
            <span v-if="item.sourceOrder.tableNumber"> • {{ item.sourceOrder.tableNumber }}</span>
          </div>
        </template>

        <template #item.taskType="{ item }">
          <div class="text-body-2">
            {{ item.taskType }}
          </div>
        </template>

        <template #item.station="{ item }">
          <div
            v-if="item.station"
            class="text-body-2"
          >
            {{ item.station }}
          </div>
          <div
            v-else
            class="text-caption text-medium-emphasis"
          >
            -
          </div>
        </template>

        <template #item.outputs="{ item }">
          <div
            v-for="output in item.outputs.slice(0, 2)"
            :key="output.outputId"
            class="text-body-2"
          >
            <strong>{{ output.quantityPlanned }} {{ output.unit }}</strong> {{ output.itemSku?.skuName || output.itemSkuId }}
          </div>
          <div
            v-if="item.outputs.length > 2"
            class="text-caption text-medium-emphasis"
          >
            +{{ item.outputs.length - 2 }} more
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="statusColors[item.status]"
            size="small"
            label
          >
            {{ item.status.replace(/_/g, ' ') }}
          </VChip>
        </template>

        <template #item.priority="{ item }">
          <VChip
            :color="item.priority >= 80 ? 'error' : item.priority >= 50 ? 'warning' : 'info'"
            size="x-small"
          >
            {{ item.priority }}
          </VChip>
        </template>

        <template #item.createdAt="{ item }">
          <div class="text-body-2">
            <div>{{ dayjs(item.createdAt).format('DD-MM-YYYY') }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ dayjs(item.createdAt).format('HH:mm') }}
            </div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center">
            <VTooltip text="View Detail">
              <template #activator="{ props }">
                <IconBtn
                  v-bind="props"
                  color="primary"
                  variant="tonal"
                  size="small"
                  @click="viewDetail(item.productionTaskId)"
                >
                  <VIcon
                    icon="tabler-eye"
                    size="18"
                  />
                </IconBtn>
              </template>
            </VTooltip>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-list-check"
              size="64"
              color="disabled"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              No production tasks
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              No production tasks found or matching your search
            </p>
            <VBtn
              v-if="$can('manage', 'Create Production Task') || $can('manage', 'default')"
              color="primary"
              variant="elevated"
              :to="{ name: 'production-tasks-create' }"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Create First Task
            </VBtn>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-space-between align-center mt-2">
              <div class="text-body-2 text-medium-emphasis">
                Showing {{ ((pagination.currentPage - 1) * pagination.perPage) + 1 }} - {{ Math.min(pagination.currentPage * pagination.perPage, pagination.total) }} of {{ pagination.total }} tasks
              </div>
              <VPagination
                v-model="pagination.currentPage"
                :total-visible="smAndDown ? 3 : 5"
                :length="pagination.lastPage"
                color="primary"
                variant="elevated"
                @update:model-value="handlePageChange"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
