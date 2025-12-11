<script setup lang="ts">
import SalesDashboard from '@/views/pages/sales/dashboard/SalesDashboard.vue'

definePage({
  meta: {
    name: 'Dashboard',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})
</script>

<template>
  <SalesDashboard />
</template>
