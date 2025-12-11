<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/sales/dashboardStore'

const { heatmap } = storeToRefs(useDashboardStore())

function hourLabel(h: number) {
  return `${h}:00`
}
</script>

<template>
  <VCard
    class="pa-4"
    elevation="1"
  >
    <div class="text-h6 mb-2">
      Jam Ramai Penjualan
    </div>
    <VTable density="comfortable">
      <thead>
        <tr>
          <th>Jam</th>
          <th>Order</th>
          <th>Gross Sales</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="h in heatmap"
          :key="h.hourOfDay"
        >
          <td>{{ hourLabel(h.hourOfDay) }}</td>
          <td>{{ h.orderCount }}</td>
          <td>{{ h.grossSales.toLocaleString() }}</td>
        </tr>
      </tbody>
    </VTable>
  </VCard>
</template>
