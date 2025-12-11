<script setup lang="ts">
import { useDashboardStore } from '@/stores/product/dashboardStore'

const dashboardStore = useDashboardStore()
const { data, isLoadingFetchData } = storeToRefs(dashboardStore)

const unitsSummaries = computed(() => {
  return [
    {
      title: 'Total Produk Ekstra',
      stats: data?.value?.summary?.totalModifierGroups ?? 0,
      icon: 'tabler-scale',
      color: 'primary',
    },
  ]
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VRow no-gutters>
        <VCol cols="12">
          <div class="text-h5 font-weight-bold">
            Statistik Produk Ekstra
          </div>
        </VCol>
      </VRow>
      <VRow class="mt-0">
        <template v-if="isLoadingFetchData">
          <VCol
            v-for="i in 4"
            :key="i"
            cols="12"
            sm="6"
            md="3"
          >
            <VCard>
              <VSkeletonLoader
                type="card"
                :height="95"
              />
            </VCard>
          </VCol>
        </template>
        <template v-else>
          <VCol
            v-for="statistics in unitsSummaries"
            :key="statistics.title"
            cols="12"
            sm="6"
            md="3"
          >
            <CardStatisticsSimple v-bind="statistics" />
          </VCol>
        </template>
      </VRow>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart";
</style>
