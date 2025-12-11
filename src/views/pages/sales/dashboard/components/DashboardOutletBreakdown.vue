<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useDashboardStore } from '@/stores/sales/dashboardStore'

const { byOutlet } = storeToRefs(useDashboardStore())
const vuetifyTheme = useTheme()

// 🔹 Bar data
const series = computed(() => [
  {
    name: 'Net Sales',
    data: byOutlet.value.map(o => Number(o.netSales) || 0),
  },
])

// 🔹 Dynamic theme colors
const chartOptions = computed(() => {
  const themeColors = vuetifyTheme.current.value.colors
  const isDark = vuetifyTheme.global.name.value === 'dark'

  const labelColor = isDark
    ? themeColors['high-emphasis'] || '#E0E0E0'
    : themeColors['on-background'] || '#212121'

  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
  const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'

  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      foreColor: labelColor,
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: '40%',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: byOutlet.value.map(o => o.outletName || '—'),
      labels: {
        rotate: -15,
        trim: true,
        style: {
          colors: Array(byOutlet.value.length).fill(labelColor),
          fontSize: '12px',
        },
      },
      axisBorder: { color: axisColor },
      axisTicks: { color: axisColor },
    },
    yaxis: {
      labels: {
        style: { colors: [labelColor], fontSize: '12px' },
        formatter: (val: number) => `Rp${val.toLocaleString('id-ID')}`,
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 3,
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val: number) => `Rp ${val.toLocaleString('id-ID')}`,
      },
    },
    colors: [themeColors.primary],
  }
})
</script>

<template>
  <VCard
    class="pa-5 h-100 d-flex flex-column"
    elevation="1"
  >
    <div class="d-flex justify-space-between align-center mb-3">
      <div class="text-h6 font-weight-semibold">
        Penjualan per Outlet
      </div>
      <VChip
        color="primary"
        variant="tonal"
        size="small"
      >
        {{ byOutlet.length }} Outlet
      </VChip>
    </div>

    <div class="flex-grow-1">
      <VueApexCharts
        type="bar"
        height="100%"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </VCard>
</template>
