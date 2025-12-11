<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  stats?: string | null
  isLoading?: boolean
  color: string
  icon: string
  title: string
  to?: RouteLocationRaw
}>()
</script>

<template>
  <VSkeletonLoader
    v-if="isLoading"
    type="paragraph"
    class="fill-height"
  />
  <CardStatisticsBasic
    v-else
    class="fill-height"
    :color="color"
    :icon="icon"
    :title="title"
    :stats="stats || '0'"
    :to="to"
  />
</template>
