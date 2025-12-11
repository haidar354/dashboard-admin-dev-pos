<script setup lang="ts">
import dayjs from 'dayjs'
import { useTheme } from 'vuetify'

import { hexToRgb } from '@layouts/utils'

const props = defineProps<{
  data?: number[] | null
  isLoading?: boolean
}>()

const vuetifyTheme = useTheme()

const chartConfig = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  const labelPrimaryColor = `rgba(${hexToRgb(currentTheme.primary)},${variableTheme['dragged-opacity']})`
  const legendColor = `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['high-emphasis-opacity']})`
  const borderColor = `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`
  const labelColor = `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`

  return {
    chartOptions: {
      chart: {
        parentHeightOffset: 0,
        type: 'bar',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '70%',
          borderRadiusApplication: 'end',
          borderRadius: 4,
          distributed: true,
          dataLabels: {
            position: 'top',
          },
        },
      },
      grid: {
        show: false,
        padding: {
          top: 0,
          bottom: 0,
          left: -10,
          right: -10,
        },
      },
      colors: Array.from({ length: 12 }, (_, index) => {
        const currentMonth = dayjs().month()

        return index === currentMonth
          ? `rgba(${hexToRgb(currentTheme.primary)}, 1)`
          : labelPrimaryColor
      }),
      dataLabels: {
        enabled: true,
        formatter(val: unknown) {
          return `${val}`
        },
        offsetY: -25,
        style: {
          fontSize: '15px',
          colors: [legendColor],
          fontWeight: '600',
          fontFamily: 'Public Sans',
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        axisBorder: {
          show: true,
          color: borderColor,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: labelColor,
            fontSize: '13px',
            fontFamily: 'Public Sans',
          },
        },
      },
      yaxis: {
        labels: {
          offsetX: -15,
          formatter(val: number) {
            return `${(val)}`
          },
          style: {
            fontSize: '13px',
            colors: labelColor,
            fontFamily: 'Public Sans',
          },
          min: 0,
          max: 60000,
          tickAmount: 6,
        },
      },
      responsive: [
        {
          breakpoint: 1441,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '70%',
              },
            },
          },
        },
        {
          breakpoint: 590,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '80%',
              },
            },
            yaxis: {
              labels: {
                show: false,
              },
            },
            dataLabels: {
              style: {
                fontSize: '12px',
                fontWeight: '400',
              },
            },
          },
        },
      ],
    },
    series: [
      {
        data: props.data || [],
      },
    ],
  }
})
</script>

<template>
  <VCard
    title="Statistik Kunjungan Tamu"
    subtitle="Menampilkan riwayat statistik tamu yang datang"
  >
    <VDivider />
    <VCardText>
      <VSkeletonLoader
        v-if="isLoading"
        type="paragraph, paragraph"
        class="fill-height"
      />
      <VueApexCharts
        v-show="!isLoading"
        :options="chartConfig.chartOptions"
        :series="chartConfig.series"
        height="230"
        class="mt-3"
      />
    </VCardText>
  </VCard>
</template>
