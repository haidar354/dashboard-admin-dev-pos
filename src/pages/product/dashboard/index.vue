<script setup lang="ts">
import DashboardProduct from '@/views/pages/product/dashboard/DashboardProduct.vue'

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
  <DashboardProduct />
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart";
</style>
