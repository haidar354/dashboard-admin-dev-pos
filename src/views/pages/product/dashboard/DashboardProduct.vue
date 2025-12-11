<script setup lang="ts">
import { useDashboardStore } from '@/stores/product/dashboardStore'
import ProductCategorySummary from '@/views/pages/product/dashboard/components/ProductCategorySummary.vue'
import ProductSummary from '@/views/pages/product/dashboard/components/ProductSummary.vue'
import UnitSummary from '@/views/pages/product/dashboard/components/UnitSummary.vue'

const dashboardStore = useDashboardStore()

onMounted(async () => {
  await dashboardStore.fetchData()
})
</script>

<template>
  <ProductSummary />
  <VSpacer class="my-6" />
  <ProductCategorySummary />
  <VSpacer class="my-6" />
  <UnitSummary />
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart";
</style>
