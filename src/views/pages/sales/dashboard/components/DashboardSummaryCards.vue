<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useDashboardStore } from '@/stores/sales/dashboardStore'

const dashboard = useDashboardStore()
const { summary, isLoading } = storeToRefs(dashboard)
const theme = useTheme()

// 🔹 Format angka rupiah / default
function formatCurrency(value: number): string {
  if (isLoading.value)
    return '-'

  return `Rp ${value.toLocaleString('id-ID')}`
}
function formatNumber(value: number): string {
  if (isLoading.value)
    return '-'

  return value.toLocaleString('id-ID')
}

// 🔹 Card list
const cards = computed(() => [
  {
    title: 'Gross Sales',
    value: formatCurrency(summary.value.grossSales),
    icon: 'tabler-cash',
    color: 'primary',
  },
  {
    title: 'Net Sales',
    value: formatCurrency(summary.value.netSales),
    icon: 'tabler-coin',
    color: 'success',
  },
  {
    title: 'Gross Profit',
    value: formatCurrency(summary.value.grossProfit),
    icon: 'tabler-chart-bar',
    color: 'info',
  },
  {
    title: 'Margin %',
    value: isLoading.value ? '-' : `${summary.value.marginPct.toFixed(1)}%`,
    icon: 'tabler-percentage',
    color: 'warning',
  },
  {
    title: 'Orders',
    value: formatNumber(summary.value.orderCount),
    icon: 'tabler-receipt-2',
    color: 'secondary',
  },
  {
    title: 'Avg Ticket',
    value: formatCurrency(summary.value.avgTicket),
    icon: 'tabler-ticket',
    color: 'pink',
  },
])
</script>

<template>
  <VRow>
    <VCol
      v-for="card in cards"
      :key="card.title"
      cols="12"
      sm="6"
      md="4"
      lg="2"
    >
      <VCard
        class="pa-4"
        elevation="1"
        :color="theme.global.name.value === 'dark' ? 'surface' : 'white'"
      >
        <VRow
          no-gutters
          align="center"
        >
          <VCol
            cols="auto"
            class="me-3"
          >
            <VAvatar
              size="40"
              :color="card.color"
              variant="tonal"
            >
              <VIcon
                :icon="card.icon"
                size="22"
              />
            </VAvatar>
          </VCol>

          <VCol>
            <div class="text-caption text-medium-emphasis">
              {{ card.title }}
            </div>
            <div class="text-h6 font-weight-bold">
              {{ card.value }}
            </div>
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>
</template>
