<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ProductionTask } from '@/types/models/production/production-task'
import { useProductionTaskStore } from '@/stores/production/productionTaskStore'

const route = useRoute()
const router = useRouter()
const productionTaskStore = useProductionTaskStore()

const task = ref<ProductionTask | null>(null)
const loading = ref(true)

const taskId = route.params.id as string

onMounted(async () => {
  try {
    task.value = await productionTaskStore.fetchTaskDetail(taskId)
  }
  catch (error) {
    console.error('Failed to fetch task detail:', error)
  }
  finally {
    loading.value = false
  }
})

const handleStartTask = async () => {
  if (!task.value)
    return

  try {
    task.value = await productionTaskStore.startTask(task.value.productionTaskId)
  }
  catch (error) {
    console.error('Failed to start task:', error)
  }
}

const handleCompleteTask = async () => {
  if (!task.value)
    return

  try {
    task.value = await productionTaskStore.completeTask(task.value.productionTaskId, {
      quantityCompleted: task.value.outputs[0]?.quantityPlanned || 0,
      notes: '',
    })
  }
  catch (error) {
    console.error('Failed to complete task:', error)
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'IN_PROGRESS':
      return 'info'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'error'
    default:
      return 'default'
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD MMM YYYY HH:mm')
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <span>Task Details</span>
            <VBtn
              icon
              variant="text"
              @click="router.back()"
            >
              <VIcon>tabler-x</VIcon>
            </VBtn>
          </VCardTitle>

          <VDivider />

          <VCardText v-if="loading">
            <div class="text-center py-4">
              Loading task details...
            </div>
          </VCardText>

          <VCardText v-else-if="task">
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Task ID
                  </div>
                  <div class="text-body-1">
                    {{ task.productionTaskId }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Task Name
                  </div>
                  <div class="text-body-1">
                    {{ task.taskNumber }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Status
                  </div>
                  <VChip
                    :color="getStatusColor(task.status)"
                    size="small"
                    class="mt-1"
                  >
                    {{ task.status }}
                  </VChip>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Station
                  </div>
                  <div class="text-body-1">
                    {{ task.station }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Task Type
                  </div>
                  <div class="text-body-1">
                    {{ task.taskType }}
                  </div>
                </div>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Expected Quantity
                  </div>
                  <div class="text-body-1">
                    {{ task.outputs[0]?.quantityPlanned || 0 }} {{ task.outputs[0]?.unit || '' }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Created At
                  </div>
                  <div class="text-body-1">
                    {{ formatDate(task.createdAt) }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Scheduled Start
                  </div>
                  <div class="text-body-1">
                    {{ task.scheduledAt ? formatDate(task.scheduledAt) : '-' }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Scheduled End
                  </div>
                  <div class="text-body-1">
                    {{ task.scheduledAt ? formatDate(task.scheduledAt) : '-' }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis">
                    Assigned To
                  </div>
                  <div class="text-body-1">
                    {{ task.assignedTo?.name || '-' }}
                  </div>
                </div>
              </VCol>

              <VCol cols="12">
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">
                    Description
                  </div>
                  <div class="text-body-1">
                    {{ task.notes || '-' }}
                  </div>
                </div>
              </VCol>

              <VCol
                v-if="task.notes"
                cols="12"
              >
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis">
                    Notes
                  </div>
                  <div class="text-body-1">
                    {{ task.notes }}
                  </div>
                </div>
              </VCol>
            </VRow>

            <VDivider class="my-4" />

            <div class="d-flex gap-2">
              <VBtn
                v-if="task.status === 'PENDING'"
                color="primary"
                @click="handleStartTask"
              >
                Start Task
              </VBtn>

              <VBtn
                v-if="task.status === 'IN_PROGRESS'"
                color="success"
                @click="handleCompleteTask"
              >
                Complete Task
              </VBtn>

              <VBtn
                variant="outlined"
                @click="router.push({ name: 'production-tasks-edit', params: { id: task.productionTaskId } })"
              >
                Edit
              </VBtn>
            </div>
          </VCardText>

          <VCardText v-else>
            <div class="text-center py-4">
              Failed to load task details
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
