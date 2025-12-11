<!-- eslint-disable indent -->
<script setup lang="ts">
import { useDisplay } from 'vuetify/lib/framework.mjs'
import hrNavItems from '@/navigation/vertical/hr'
import inventoryNavItems from '@/navigation/vertical/inventory'
import productNavItems from '@/navigation/vertical/product'
import productionNavItems from '@/navigation/vertical/production'
import purchaseNavItems from '@/navigation/vertical/purchase'
import salesNavItems from '@/navigation/vertical/sales'
import settingNavItems from '@/navigation/vertical/setting'

import { useNavigationStore } from '@/stores/navigationStore'
import type { Module } from '@/types/utils'

const route = useRoute()
const router = useRouter()

const navigationStore = useNavigationStore()
const { setNavigation } = useNavigationStore()
const { activeModule } = storeToRefs(navigationStore)
const { mdAndUp } = useDisplay()

// 🧩 flag untuk tahu ini initial (reload) atau user switch module
const isInitialLoad = ref(true)

const updateNavigation = (module: Module) => {
  switch (module.value) {
    case 'product': setNavigation(productNavItems)
      break
    case 'inventory': setNavigation(inventoryNavItems)
      break
    case 'sales': setNavigation(salesNavItems)
      break
    case 'setting': setNavigation(settingNavItems)
      break
    case 'hr': setNavigation(hrNavItems)
      break
    case 'production': setNavigation(productionNavItems)
      break
    case 'purchase': setNavigation(purchaseNavItems)
      break
    default: setNavigation([])
  }
}

// 🔁 trigger saat module berubah
watch(activeModule, async (newModule, oldModule) => {
  if (!newModule || newModule === oldModule)
    return

  updateNavigation(newModule)

  // ⚙️ hanya redirect kalau BUKAN initial load
  if (!isInitialLoad.value && newModule.redirect) {
    await nextTick()
    router.push(newModule.redirect)
  }

  // reset flag setelah pertama kali
  if (isInitialLoad.value)
    isInitialLoad.value = false
})

// 🔍 kalau user buka page langsung (reload)
onMounted(() => {
  const moduleName = route.path.split('/')[1]
  const foundModule = MODULES.find(m => m.value === moduleName)

  if (foundModule) {
    activeModule.value = foundModule
    updateNavigation(foundModule)
  }

  // tandai kalau sudah initial
  isInitialLoad.value = true
})

// tab click handler
const onModuleChange = (value: Module) => {
  // set flag supaya redirect aktif
  isInitialLoad.value = false
  activeModule.value = value
}
</script>

<template>
  <VTabs
    v-if="mdAndUp"
    class="v-tabs-pill"
    align-tabs="center"
    show-arrows
    center-active
    :model-value="activeModule"
  >
    <VTab
      v-for="module in MODULES"
      :key="module.value"
      :value="module"
      color="primary"
      :prepend-icon="module.icon"
      variant="flat"
      size="small"
      :disabled="module.status === 'coming-soon'"
      @click="onModuleChange(module)"
    >
      <div class="d-flex align-center justify-center flex-column">
        <span>{{ module.name }}</span>
        <span
          v-if="module.status === 'coming-soon'"
          class="text-xs text-warning"
        >
          Coming Soon
        </span>
      </div>
    </VTab>
  </VTabs>
</template>
