<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import isoWeek from 'dayjs/plugin/isoWeek'
import { storeToRefs } from 'pinia'
import type { DateRange } from '@/types/models/sales/dashboard/dashboard'
import { useDashboardStore } from '@/stores/sales/dashboardStore'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'

dayjs.extend(isoWeek)
dayjs.locale(id)

const dashboard = useDashboardStore()
const { filters } = storeToRefs(dashboard)

const outletSidebarStore = useOutletSidebarStore()
const { selectedSidebarOutlet } = storeToRefs(outletSidebarStore)

const dateRanges = [{
  label: 'Hari Ini',
  value: 'today',
  icon: 'tabler-calendar-event',
}, {
  label: 'Minggu Ini',
  value: 'this_week',
  icon: 'tabler-calendar-event',
}, {
  label: 'Bulan Ini',
  value: 'this_month',
  icon: 'tabler-calendar-event',
}, {
  label: 'Tahun Ini',
  value: 'this_year',
  icon: 'tabler-calendar-event',
}, {
  label: 'Kustom',
  value: 'custom',
  icon: 'tabler-calendar-event',
}]

const selectedDateRange = ref<DateRange>('today')

const setDateRange = (value: string) => {
  selectedDateRange.value = value as DateRange
}

watch(
  filters,
  async () => {
    await dashboard.fetchDashboard()
  },
  { deep: true },
)

watch(
  selectedSidebarOutlet,
  async newOutlet => {
    filters.value.outletId = newOutlet ? newOutlet.outletId : null
  },
  { immediate: true },
)

watch(
  () => selectedDateRange.value,
  async value => {
    if (value === 'today') {
      const today = dayjs().format('YYYY-MM-DD')

      filters.value.from = today
      filters.value.to = today
      filters.value.groupBy = 'today'
    }
    else if (value === 'this_week') {
      filters.value.from = dayjs().startOf('week').format('YYYY-MM-DD')
      filters.value.to = dayjs().endOf('week').format('YYYY-MM-DD')
      filters.value.groupBy = 'day'
    }
    else if (value === 'this_month') {
      filters.value.from = dayjs().startOf('month').format('YYYY-MM-DD')
      filters.value.to = dayjs().endOf('month').format('YYYY-MM-DD')
      filters.value.groupBy = 'day'
    }
    else if (value === 'this_year') {
      filters.value.from = dayjs().startOf('year').format('YYYY-MM-DD')
      filters.value.to = dayjs().endOf('year').format('YYYY-MM-DD')
      filters.value.groupBy = 'month'
    }
  },
)
</script>

<template>
  <VCard>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="8"
        >
          <!--
            <AppSelect
            v-model="filters.groupBy"
            :items="['day', 'week', 'month']"
            label="Group By"
            />
          -->
          <label
            for="groupBy"
            class="mb-2 font-weight-bold"
          >Periode</label>

          <div class="d-flex flex-wrap gap-2">
            <VBtn
              v-for="option in dateRanges"
              :key="option.value"
              :color="selectedDateRange === option.value ? 'primary' : 'secondary'"
              variant="flat"
              height="40"
              :prepend-icon="option.icon"
              @click="setDateRange(option.value)"
            >
              {{ option.label }}
            </VBtn>
          </div>
        </VCol>
        <template v-if="selectedDateRange === 'custom'">
          <VCol
            cols="12"
            md="2"
          >
            <AppDateTimePicker
              v-model="filters.from"
              label="Dari"
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
          >
            <AppDateTimePicker
              v-model="filters.to"
              label="Sampai"
            />
          </VCol>
        </template>
      </VRow>
    </VCardText>
  </VCard>
</template>
