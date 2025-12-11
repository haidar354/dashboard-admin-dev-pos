<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/sales/dashboardStore'

const { topProducts } = storeToRefs(useDashboardStore())

// 💰 format helper
const formatCurrency = (v: number) => `Rp ${v.toLocaleString('id-ID')}`

// 🔹 ambil hanya 10 teratas
const products = computed(() =>
  [...(topProducts.value ?? [])].slice(0, 10),
)
</script>

<template>
  <VCard
    class="pa-4"
    elevation="1"
  >
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-h6 font-weight-semibold">
        Top Produk
      </div>
      <VChip
        color="primary"
        variant="tonal"
        size="small"
      >
        {{ products.length }} item
      </VChip>
    </div>

    <VTable density="comfortable">
      <thead>
        <tr>
          <th style="min-width: 200px;">
            Produk
          </th>
          <th class="text-right">
            Qty
          </th>
          <th class="text-right">
            Penjualan
          </th>
          <th class="text-right">
            Profit
          </th>
          <th class="text-right">
            % Margin
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(p, i) in products"
          :key="p.itemSkuId"
          :class="i === 0 ? 'bg-primary-lighten-5 font-weight-semibold' : ''"
        >
          <td>
            <div class="d-flex align-center py-1">
              <VAvatar
                color="primary"
                variant="tonal"
                size="45"
                class="me-3"
              >
                {{ p.name?.[0] || '?' }}
              </VAvatar>
              <div class="d-flex flex-column justify-center align-start">
                <span>{{ p.name }}</span>
                <span class="text-muted">{{ p.code }}</span>
              </div>
            </div>
          </td>
          <td class="text-right">
            {{ p.qtySold }}
          </td>
          <td class="text-right">
            {{ formatCurrency(p.netSales) }}
          </td>
          <td class="text-right">
            {{ formatCurrency(p.grossProfit) }}
          </td>
          <td class="text-right">
            {{ p.marginPct.toFixed(1) }}%
          </td>
        </tr>
        <tr v-if="!products.length">
          <td
            colspan="5"
            class="text-center text-medium-emphasis py-4"
          >
            Tidak ada data
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>
</template>

<style scoped>
.bg-primary-lighten-5 {
  background-color: rgba(var(--v-theme-primary), 0.06);
}
</style>
