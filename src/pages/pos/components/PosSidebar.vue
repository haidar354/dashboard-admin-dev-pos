<script setup lang="ts">
import { useRouter } from 'vue-router'

type PosPage = 'beranda' | 'pos' | 'transaksi' | 'pengeluaran' | 'produk' | 'settings' | 'profil'

const props = defineProps<{
  activePage: PosPage
}>()

const router = useRouter()

const getButtonStyle = (page: PosPage) => ({
  variant: props.activePage === page ? 'flat' : 'text',
  color: props.activePage === page ? 'primary' : 'default',
})

const goToBeranda = () => router.push('/pos/beranda')
const goToPOS = () => router.push('/pos/posProduct')
const goToTransaksi = () => router.push('/pos/transaksi')
</script>

<template>
  <div class="pos-sidebar">
    <div class="sidebar-header">
      <VAvatar
        size="48"
        color="primary"
        class="mb-2"
      >
        <VIcon
          icon="tabler-building-store"
          size="28"
        />
      </VAvatar>
    </div>

    <div class="sidebar-menu">
      <VTooltip location="end">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon
            v-bind="{ ...tooltipProps, ...getButtonStyle('beranda') }"
            @click="goToBeranda"
          >
            <VIcon
              icon="tabler-home"
              size="20"
            />
          </VBtn>
        </template>
        <span>Beranda</span>
      </VTooltip>

      <VTooltip location="end">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon
            v-bind="{ ...tooltipProps, ...getButtonStyle('pos') }"
            @click="goToPOS"
          >
            <VIcon
              icon="tabler-receipt"
              size="20"
            />
          </VBtn>
        </template>
        <span>POS</span>
      </VTooltip>

      <VTooltip location="end">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon
            v-bind="{ ...tooltipProps, ...getButtonStyle('transaksi') }"
            @click="goToTransaksi"
          >
            <VIcon
              icon="tabler-list"
              size="20"
            />
          </VBtn>
        </template>
        <span>Transaksi</span>
      </VTooltip>

      <VTooltip location="end">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon
            variant="text"
            color="default"
            v-bind="tooltipProps"
          >
            <VIcon
              icon="tabler-package"
              size="20"
            />
          </VBtn>
        </template>
        <span>Pengeluaran</span>
      </VTooltip>

      <VTooltip location="end">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon
            variant="text"
            color="default"
            v-bind="tooltipProps"
          >
            <VIcon
              icon="tabler-box"
              size="20"
            />
          </VBtn>
        </template>
        <span>Produk</span>
      </VTooltip>

      <VTooltip location="end">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon
            variant="text"
            color="default"
            v-bind="tooltipProps"
          >
            <VIcon
              icon="tabler-settings"
              size="20"
            />
          </VBtn>
        </template>
        <span>Settings</span>
      </VTooltip>

      <VTooltip location="end">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            icon
            variant="text"
            color="default"
            v-bind="tooltipProps"
          >
            <VIcon
              icon="tabler-user"
              size="20"
            />
          </VBtn>
        </template>
        <span>Profil</span>
      </VTooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pos-sidebar {
  width: 72px;
  background: white;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;

  .sidebar-header {
    margin-bottom: 2rem;
  }

  .sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
