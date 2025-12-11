<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboardStore'
import { useUtilStore } from '@/stores/utilStore'
import EventBarChartCard from '@/views/pages/dashboards/EventBarChartCard.vue'
import GuestVisitBarChartCard from '@/views/pages/dashboards/GuestVisitBarChartCard.vue'
import IncomingLetterChartCard from '@/views/pages/dashboards/IncomingLetterChartCard.vue'
import OutgoingLetterChartCard from '@/views/pages/dashboards/OutgoingLetterChartCard.vue'
import PrincipalInformationCard from '@/views/pages/dashboards/PrincipalInformationCard.vue'
import StatisticCountCard from '@/views/pages/dashboards/StatisticCountCard.vue'
import Welcome from '@/views/pages/dashboards/welcome.vue'

const utilStore = useUtilStore()
const dashboardStore = useDashboardStore()
const { fetchData } = dashboardStore
const { data, isLoadingFetchData } = storeToRefs(dashboardStore)
const { year } = storeToRefs(utilStore)

watch(() => year.value,
  () => {
    fetchData({ year: year.value })
  })

onMounted(() => {
  fetchData({ year: year.value })
})
</script>

<template>
  <VRow class="match-height">
    <VCol
      cols="12"
      class="d-flex justify-end"
    >
      <div>
        <VSelect
          v-model="year"
          :items="getYears(2010)"
          label="Pilih Tahun"
          clearable
        />
      </div>
    </VCol>
    <VCol
      cols="12"
      md="6"
    >
      <Welcome />
    </VCol>
    <VCol
      cols="12"
      md="6"
    >
      <PrincipalInformationCard
        :data="data.current_principal_event"
        :is-loading="isLoadingFetchData"
      />
    </VCol>
  </VRow>

  <VRow>
    <VCol
      cols="6"
      md="3"
    >
      <StatisticCountCard
        color="primary"
        icon="tabler-mail-up"
        title="Surat Masuk"
        :stats="data?.incoming_letter_count?.toString() || '0'"
        :is-loading="isLoadingFetchData"
        :to="{
          name: 'incoming-letters',
        }"
      />
    </VCol>
    <VCol
      cols="6"
      md="3"
    >
      <StatisticCountCard
        color="default"
        icon="tabler-mail-down"
        title="Surat Keluar"
        :stats="data?.outgoing_letter_count?.toString() || '0'"
        :is-loading="isLoadingFetchData"
        :to="{
          name: 'outgoing-letters',
        }"
      />
    </VCol>
    <VCol
      cols="6"
      md="3"
    >
      <StatisticCountCard
        color="warning"
        icon="tabler-calendar"
        title="Total Agenda"
        :stats="data?.event_count?.toString() || '0'"
        :is-loading="isLoadingFetchData"
        :to="{
          name: 'events',
        }"
      />
    </VCol>
    <VCol
      cols="6"
      md="3"
    >
      <StatisticCountCard
        color="success"
        icon="tabler-book-2"
        title="Total Tamu"
        :stats="data?.guest_visit_count?.toString() || '0'"
        :is-loading="isLoadingFetchData"
        :to="{
          name: 'guest-visits',
        }"
      />
    </VCol>
  </VRow>
  <VRow>
    <VCol
      cols="12"
      md="6"
    >
      <EventBarChartCard
        :data="data.event"
        :is-loading="isLoadingFetchData"
      />
    </VCol>
    <VCol
      cols="12"
      md="6"
    >
      <GuestVisitBarChartCard
        :data="data.guest"
        :is-loading="isLoadingFetchData"
      />
    </VCol>
  </VRow>
  <VRow>
    <VCol
      cols="12"
      md="6"
    >
      <IncomingLetterChartCard
        :data="data.incoming_letter"
        :is-loading="isLoadingFetchData"
      />
    </VCol>
    <VCol
      cols="12"
      md="6"
    >
      <OutgoingLetterChartCard
        :data="data.outgoing_letter"
        :is-loading="isLoadingFetchData"
      />
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart";
</style>
