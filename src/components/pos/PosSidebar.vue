<script setup lang="ts">
import { useRouter } from 'vue-router'

type PosPage =
  | 'beranda'
  | 'pos'
  | 'transaksi'
  | 'kategori'
  | 'produk'
  | 'satuan'

const props = defineProps<{
  activePage: PosPage
}>()

const router = useRouter()

const items: Array<{ value: PosPage; label: string; icon: string; route: string }> = [
  { value: 'beranda', label: 'Beranda', icon: 'tabler-home', route: '/pos/beranda' },
  { value: 'pos', label: 'POS', icon: 'tabler-receipt', route: '/pos/posProduct' },
  { value: 'transaksi', label: 'Transaksi', icon: 'tabler-list', route: '/pos/transaksi' },
  { value: 'kategori', label: 'Kategori', icon: 'tabler-package', route: '/pos/kategori' },
  { value: 'produk', label: 'Produk', icon: 'tabler-box', route: '/pos/produk' },
  { value: 'satuan', label: 'Satuan', icon: 'tabler-scale', route: '/pos/satuan' },
]

const goTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="pos-sidebar">
    <div class="sidebar-header">
      <VAvatar
        size="48"
        color="primary"
        variant="tonal"
        class="mb-2"
      >
        <VIcon
          icon="tabler-building-store"
          size="28"
        />
      </VAvatar>
    </div>

    <div class="sidebar-menu">
      <VTooltip
        v-for="item in items"
        :key="item.value"
        location="end"
      >
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon
            v-bind="tooltipProps"
            :variant="props.activePage === item.value ? 'flat' : 'text'"
            :color="props.activePage === item.value ? 'primary' : 'default'"
            @click="goTo(item.route)"
          >
            <VIcon
              :icon="item.icon"
              size="20"
            />
          </VBtn>
        </template>
        <span>{{ item.label }}</span>
      </VTooltip>
    </div>
  </div>
</template>
