<script setup lang="ts">
import dayjs from 'dayjs'
import { useTheme } from 'vuetify'

import { hexToRgb } from '@layouts/utils'

import type { IncomingLetterStats } from '@/types/models/dashboard'

const props = defineProps<{
  data?: IncomingLetterStats | null
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
        data: props.data?.accumulation || [],
      },
    ],
  }
})
</script>

<template>
  <VCard
    title="Statistik Surat Masuk"
    subtitle="Menampilkan statistik surat masuk"
    class="fill-height"
  >
    <VDivider />
    <VSkeletonLoader
      v-if="isLoading"
      type="paragraph, paragraph, paragraph"
      class="fill-height"
    />

    <VCardText v-else>
      <VRow>
        <VCol
          cols="12"
          sm="3"
          md="4"
          lg="3"
          xl="2"
          class="d-flex flex-column align-self-center"
        >
          <div class="d-flex align-center gap-2 mb-3 flex-wrap">
            <h4 class="text-h2">
              {{ data?.total || 0 }}
            </h4>
          </div>

          <span class="text-sm text-medium-emphasis">
            Total Surat Masuk
          </span>
        </VCol>

        <VCol
          cols="12"
          sm="9"
          md="8"
          lg="9"
          xl="10"
        >
          <VueApexCharts
            v-show="!isLoading"
            :options="chartConfig.chartOptions"
            :series="chartConfig.series"
            height="230"
            class="mt-3"
          />
        </VCol>
      </VRow>

      <div class="border rounded mt-5 pa-5">
        <VRow>
          <VCol
            cols="12"
            sm="4"
          >
            <div class="d-flex align-center">
              <VAvatar
                rounded
                size="26"
                color="warning"
                variant="tonal"
                class="me-2"
              >
                <VIcon
                  size="18"
                  icon="tabler-ticket"
                />
              </VAvatar>

              <h6 class="text-base font-weight-regular">
                Baru
              </h6>
            </div>
            <h6 class="text-h4 my-2">
              {{ data?.new_count || 0 }}
            </h6>
            <VProgressLinear
              :model-value="data?.new_count || 0"
              :min="0"
              :max="data?.total || 0"
              color="warning"
              height="4"
              rounded
              rounded-bar
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <div class="d-flex align-center">
              <VAvatar
                rounded
                size="26"
                color="primary"
                variant="tonal"
                class="me-2"
              >
                <VIcon
                  size="18"
                  icon="tabler-chart-pie-2"
                />
              </VAvatar>

              <h6 class="text-base font-weight-regular">
                Diproses
              </h6>
            </div>
            <h6 class="text-h4 my-2">
              {{ data?.processed_count || 0 }}
            </h6>
            <VProgressLinear
              :model-value="data?.processed_count || 0"
              :min="0"
              :max="data?.total || 0"
              color="primary"
              height="4"
              rounded
              rounded-bar
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <div class="d-flex align-center">
              <VAvatar
                rounded
                size="26"
                color="success"
                variant="tonal"
                class="me-2"
              >
                <VIcon
                  size="18"
                  icon="tabler-circle-check"
                />
              </VAvatar>

              <h6 class="text-base font-weight-regular">
                Selesai
              </h6>
            </div>
            <h6 class="text-h4 my-2">
              {{ data?.finished_count || 0 }}
            </h6>
            <VProgressLinear
              :model-value="data?.finished_count || 0"
              :min="0"
              :max="data?.total || 0"
              color="success"
              height="4"
              rounded
              rounded-bar
            />
          </VCol>
        </VRow>
      </div>
    </VCardText>
  </VCard>
</template>
