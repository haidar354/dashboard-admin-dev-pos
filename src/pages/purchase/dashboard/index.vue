<script setup lang="ts">
import AdminDashboard from '@/views/pages/dashboards/AdminDashboard.vue'

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
  <AdminDashboard />
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart";
</style>
