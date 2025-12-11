<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VBtn, VCard, VCardText, VCardTitle, VCol, VForm, VRow, VSelect, VTextField, VTextarea } from 'vuetify/lib/components/index.mjs'
import type { CreateProductionTaskRequest, SourceType, Station, TaskType } from '@/types/models/production/production-task'
import { useProductionTaskStore } from '@/stores/production/productionTaskStore'

const route = useRoute()
const router = useRouter()
const productionTaskStore = useProductionTaskStore()

const form = ref<CreateProductionTaskRequest>({
  sourceType: 'MANUAL' as SourceType,
  taskType: 'KITCHEN' as TaskType,
  station: 'KITCHEN' as Station,
  priority: 1,
  notes: '',
})

const loading = ref(false)
const error = ref<string | null>(null)
const taskLoading = ref(true)

const taskId = route.params.id as string

const sourceTypeOptions = [
  { title: 'Stock', value: 'STOCK' },
  { title: 'POS Order', value: 'POS_ORDER' },
  { title: 'Sales Order', value: 'SALES_ORDER' },
  { title: 'Manual', value: 'MANUAL' },
]

const taskTypeOptions = [
  { title: 'Kitchen', value: 'KITCHEN' },
  { title: 'Bar', value: 'BAR' },
  { title: 'Coffee', value: 'COFFEE' },
  { title: 'Assembly', value: 'ASSEMBLY' },
  { title: 'Prep', value: 'PREP' },
  { title: 'Bulk', value: 'BULK' },
  { title: 'Custom', value: 'CUSTOM' },
]

const stationOptions = [
  { title: 'Kitchen', value: 'KITCHEN' },
  { title: 'Bar', value: 'BAR' },
  { title: 'Coffee', value: 'COFFEE' },
]

onMounted(async () => {
  try {
    const task = await productionTaskStore.fetchTaskDetail(taskId)

    // Map task data to form
    form.value = {
      sourceType: task.sourceType,
      taskType: task.taskType,
      station: task.station as Station || ('KITCHEN' as Station),
      priority: task.priority,
      notes: task.notes || '',
      sourceId: task.sourceId,
      orderLineId: task.orderLineId,
      productionBomId: task.productionBomId,
    }
  }
  catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load task details'
  }
  finally {
    taskLoading.value = false
  }
})

const handleSubmit = async () => {
  if (!taskId)
    return

  loading.value = true
  error.value = null

  try {
    // We'll need to implement update functionality in the store
    // For now, redirect back to detail page
    router.push({ name: 'production-tasks-detail', params: { id: taskId } })
  }
  catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update production task'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Edit Production Task</VCardTitle>

          <VCardText v-if="taskLoading">
            <div class="text-center py-4">
              Loading task details...
            </div>
          </VCardText>

          <VCardText v-else>
            <VForm @submit.prevent="handleSubmit">
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="form.sourceType"
                    :items="sourceTypeOptions"
                    label="Source Type"
                    required
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="form.taskType"
                    :items="taskTypeOptions"
                    label="Task Type"
                    required
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="form.station"
                    :items="stationOptions"
                    label="Station"
                    required
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model.number="form.priority"
                    label="Priority"
                    type="number"
                    min="1"
                    max="5"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="form.sourceId"
                    label="Source ID"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="form.orderLineId"
                    label="Order Line ID"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="form.productionBomId"
                    label="Production BOM ID"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextarea
                    v-model="form.notes"
                    label="Notes"
                    rows="3"
                  />
                </VCol>

                <VCol cols="12">
                  <div class="d-flex gap-2">
                    <VBtn
                      type="submit"
                      :loading="loading"
                      color="primary"
                    >
                      Update Task
                    </VBtn>

                    <VBtn
                      variant="outlined"
                      @click="router.back()"
                    >
                      Cancel
                    </VBtn>
                  </div>

                  <div
                    v-if="error"
                    class="text-error mt-2"
                  >
                    {{ error }}
                  </div>
                </VCol>
              </VRow>
            </VForm>
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
