<script setup lang="ts">
import { useDashboardStore } from '@/stores/product/dashboardStore'

const dashboardStore = useDashboardStore()
const { data, isLoadingFetchData } = storeToRefs(dashboardStore)

const productSummaries = computed(() => {
  return [
    {
      title: 'Total Produk',
      stats: data?.value?.summary?.totalProducts ?? 0,
      icon: 'tabler-box',
      color: 'primary',
    },
    {
      title: 'Produk Aktif',
      stats: data?.value?.summary?.activeProducts ?? 0,
      icon: 'tabler-check',
      color: 'success',
    },
    {
      title: 'Produk Non-Aktif',
      stats: data?.value?.summary?.inactiveProducts ?? 0,
      icon: 'tabler-x',
      color: 'error',
    },
    {
      title: 'Produk di POS',
      stats: data?.value?.summary?.posProducts ?? 0,
      icon: 'tabler-shopping-cart',
      color: 'info',
    },
    {
      title: 'Produk Dengan Varian',
      stats: data?.value?.summary?.withVariant ?? 0,
      icon: 'tabler-layers-subtract',
      color: 'warning',
    },
    {
      title: 'Produk Tanpa Varian',
      stats: data?.value?.summary?.withoutVariant ?? 0,
      icon: 'tabler-layers-off',
      color: 'secondary',
    },
    {
      title: 'Produk Ekstra',
      stats: data?.value?.summary?.totalModifierGroups ?? 0,
      icon: 'tabler-tags',
      color: 'primary',
    },
    {
      title: 'Produk Dengan Ekstra',
      stats: data?.value?.summary?.withModifier ?? 0,
      icon: 'tabler-tag',
      color: 'success',
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
            Statistik Produk
          </div>
        </VCol>
      </VRow>
      <VRow class="mt-0">
        <template v-if="isLoadingFetchData">
          <VCol
            v-for="i in 8"
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
            v-for="statistics in productSummaries"
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
