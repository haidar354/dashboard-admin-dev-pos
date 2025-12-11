<script setup lang="ts">
import { useDashboardStore } from '@/stores/product/dashboardStore'

const dashboardStore = useDashboardStore()
const { data, isLoadingFetchData } = storeToRefs(dashboardStore)

const productCategorySummaries = computed(() => {
  return [
    {
      title: 'Total Kategori Produk',
      stats: data?.value?.summary?.totalCategories ?? 0,
      icon: 'tabler-box',
      color: 'primary',
    },
    {
      title: 'Kategori Aktif',
      stats: data?.value?.summary?.activeCategories ?? 0,
      icon: 'tabler-check',
      color: 'success',
    },
    {
      title: 'Kategori Non-Aktif',
      stats: data?.value?.summary?.inactiveCategories ?? 0,
      icon: 'tabler-x',
      color: 'error',
    },
    {
      title: 'Kategori di POS',
      stats: data?.value?.summary?.posCategories ?? 0,
      icon: 'tabler-shopping-cart',
      color: 'info',
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
            Statistik Kategori Produk
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
            v-for="statistics in productCategorySummaries"
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
