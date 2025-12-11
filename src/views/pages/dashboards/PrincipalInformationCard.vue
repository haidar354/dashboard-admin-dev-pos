<script setup lang="ts">
import { VCardText } from 'vuetify/lib/components/index.mjs'

import type { PrincipalEvent } from '@/types/models/dashboard'

defineProps<{
  data?: PrincipalEvent | null
  isLoading?: boolean
}>()
</script>

<template>
  <VSkeletonLoader
    v-if="isLoading"
    type="paragraph"
    class="fill-height"
  />
  <VCard
    v-else
    class="fill-height"
    color="warning "
  >
    <VCardText class="pa-3 d-flex h-100 gap-3 align-center">
      <VAvatar
        size="50"
        rounded
        variant="flat"
        color="#fff"
      >
        <VIcon icon="tabler-bell" />
      </VAvatar>
      <div class="d-flex gap-1 flex-column">
        <div class="text-h5 ma-0 font-weight-bold text-white">
          Informasi Kepala Sekolah
        </div>
        <div class="">
          Aktivitas Kepala Sekolah saat ini:
        </div>
        <div class="font-weight-bold">
          {{ data?.id ? `${data.type} - ${data.title}` : 'Tidak Ada' }}
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
