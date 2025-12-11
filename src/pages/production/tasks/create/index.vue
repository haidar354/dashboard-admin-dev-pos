<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductionTaskStore } from '@/stores/production/productionTaskStore'
import type { CreateProductionTaskRequest, SourceType, Station, TaskType } from '@/types/models/production/production-task'

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

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    await productionTaskStore.createProductionTask(form.value)
    router.push({ name: 'production-tasks' })
  }
  catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create production task'
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
          <VCardTitle>Create Production Task</VCardTitle>

          <VCardText>
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
                      Create Task
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
