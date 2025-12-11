<script setup lang="ts">
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useNavigationStore } from '@/stores/navigationStore'

const navigationStore = useNavigationStore()
const { activeModule } = storeToRefs(navigationStore)
const { smAndDown } = useDisplay()
</script>

<template>
  <div
    v-if="smAndDown"
    class="mt-4"
  >
    <label
      class="font-weight-bold text-secondary"
      for="modules"
    >Menu
    </label>
    <VRow
      no-gutters
      class="gap-2 mt-1"
    >
      <VCol
        v-for="module in MODULES"
        :key="module.value"
      >
        <VCard
          :color="activeModule.value === module.value ? 'primary' : 'default'"
          @click="activeModule = module"
        >
          <VCardText class="pa-2 text-center">
            {{ module.name }}
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
