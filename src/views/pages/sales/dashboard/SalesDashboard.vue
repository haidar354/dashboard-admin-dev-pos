<script setup lang="ts">
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/sales/dashboardStore'
import DashboardFilterBar from '@/views/pages/sales/dashboard/components/DashboardFilterBar.vue'
import DashboardHeatmap from '@/views/pages/sales/dashboard/components/DashboardHeatmap.vue'
import DashboardOutletBreakdown from '@/views/pages/sales/dashboard/components/DashboardOutletBreakdown.vue'
import DashboardSummaryCards from '@/views/pages/sales/dashboard/components/DashboardSummaryCards.vue'
import DashboardTopProducts from '@/views/pages/sales/dashboard/components/DashboardTopProducts.vue'
import DashboardTrendChart from '@/views/pages/sales/dashboard/components/DashboardTrendChart.vue'

const dashboard = useDashboardStore()

onMounted(async () => {
  await dashboard.fetchDashboard()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <DashboardFilterBar />
    </VCol>

    <VCol cols="12">
      <DashboardSummaryCards />
    </VCol>

    <VCol cols="12">
      <VRow class="align-stretch">
        <VCol
          cols="12"
          md="8"
        >
          <DashboardTrendChart class="h-100" />
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <DashboardOutletBreakdown class="h-100" />
        </VCol>
      </VRow>
    </VCol>

    <VCol cols="12">
      <VRow class="align-stretch">
        <VCol
          cols="12"
          md="8"
        >
          <DashboardTopProducts class="h-100" />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <DashboardHeatmap class="h-100" />
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>
