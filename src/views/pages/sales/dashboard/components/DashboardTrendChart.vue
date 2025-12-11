<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useTheme } from 'vuetify'

import { useDashboardStore } from '@/stores/sales/dashboardStore'
import { getLineChartSimpleConfig } from '@core/libs/apex-chart/apexCharConfig'

const vuetifyTheme = useTheme()
const { trend } = storeToRefs(useDashboardStore())

// 🔹 Ambil base config dari Vuexy
const baseConfig = computed(() => getLineChartSimpleConfig(vuetifyTheme.current.value))

// 🔹 Series data - EXPLICITLY set axisTicks for each series
const series = computed(() => {
  const data = trend.value ?? []

  return [
    {
      name: 'Net Sales',
      type: 'line',
      data: data.map(t => Number(t.netSales ?? 0)),
    },
    {
      name: 'COGS (HPP)',
      type: 'line',
      data: data.map(t => Number(t.cogsTotal ?? 0)),
    },
    {
      name: 'Gross Profit',
      type: 'line',
      data: data.map(t => Number(t.grossProfit ?? 0)),
    },
    {
      name: 'Order Count',
      type: 'column',
      data: data.map(t => t.orderCount ?? 0),
    },
  ]
})

// 🔹 Label sumbu X (tanggal / periode)
const categories = computed(() => trend.value?.map(t => t.period) ?? [])

// 🔹 Chart Config Override
const chartOptions = computed(() => {
  const theme = vuetifyTheme.current.value
  const isDark = theme.dark

  const colors = [
    theme.colors.primary,
    theme.colors.error,
    theme.colors.success,
    theme.colors.info,
  ]

  return {
    ...baseConfig.value,
    chart: {
      ...baseConfig.value.chart,
      type: 'line',
      stacked: false,
      toolbar: { show: false },
      foreColor: isDark ? theme.colors['on-surface'] : theme.colors['on-background'],
    },
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    colors,
    fill: {
      opacity: [1, 1, 1, 0.3], // 👈 Line solid (1), Bar transparan (0.3)
      type: ['solid', 'solid', 'solid', 'solid'],
    },
    stroke: {
      width: [3, 3, 3, 0],
      curve: 'smooth',
    },
    grid: {
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      strokeDashArray: 3,
    },
    xaxis: {
      categories: categories.value,
      labels: {
        style: {
          colors: isDark ? '#BBB' : '#555',
          fontSize: '12px',
        },
      },
    },
    yaxis: [
      {
        // Axis 0 - untuk Net Sales, COGS, Gross Profit
        seriesName: ['Net Sales', 'COGS (HPP)', 'Gross Profit'],
        title: {
          text: 'Sales (Rp)',
        },
        labels: {
          formatter: (val: number) => `Rp ${val.toLocaleString('id-ID')}`,
        },
      },
      {
        // Axis 1 - HANYA untuk Order Count
        seriesName: 'Order Count',
        opposite: true,
        title: {
          text: 'Order Count',
        },
        labels: {
          formatter: (val: number) => {
            if (!val)
              return '0'

            return val.toFixed(0)
          },
        },
      },
    ],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, opts: any) => {
          if (!val)
            return '0'

          // Jika series Order Count (index 3)
          if (opts.seriesIndex === 3)
            return `${val} orders`

          return `Rp ${val.toLocaleString('id-ID')}`
        },
      },
    },
  }
})
</script>

<template>
  <VCard
    class="pa-4"
    elevation="1"
  >
    <div class="text-h6 font-weight-semibold mb-2">
      Trend Penjualan (Simple Line)
    </div>

    <VueApexCharts
      type="line"
      height="400"
      :options="chartOptions"
      :series="series"
    />
  </VCard>
</template>
