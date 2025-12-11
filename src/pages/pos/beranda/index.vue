<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    layout: 'blank',
  },
})

const router = useRouter()
const currentShift = ref<any>(null)
const currentTime = ref(new Date())

// Update time every second
setInterval(() => {
  currentTime.value = new Date()
}, 1000)

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit' 
  })
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const formattedCash = computed(() => {
  if (!currentShift.value?.startCash) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 0 
  }).format(parseInt(currentShift.value.startCash))
})

const logout = () => {
  // Clear shift data
  localStorage.removeItem('currentShift')
  localStorage.removeItem('selectedCashier')
  localStorage.removeItem('selectedOutlet')
  
  // Redirect ke halaman pilih outlet
  router.push('/pos')
}

onMounted(() => {
  // Load current shift data
  const shift = localStorage.getItem('currentShift')
  
  if (shift) {
    currentShift.value = JSON.parse(shift)
  } else {
    // Jika tidak ada shift aktif, redirect ke halaman pilih outlet
    router.push('/pos')
  }
})
</script>

<template>
  <div class="pos-beranda">
    <!-- Header -->
    <div class="pos-header">
      <VContainer fluid>
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VAvatar
              size="48"
              color="primary"
              class="me-3"
            >
              <VIcon
                icon="tabler-building-store"
                size="28"
              />
            </VAvatar>
            <div>
              <h2 class="text-h6 font-weight-bold">
                {{ currentShift?.outlet?.name || 'Teknoreka Chicken' }}
              </h2>
              <p class="text-caption text-medium-emphasis mb-0">
                {{ currentShift?.cashier?.name || 'Kasir' }} - {{ formattedDate }}
              </p>
            </div>
          </div>
          <div class="d-flex align-center gap-3">
            <div class="text-end me-4">
              <p class="text-h5 font-weight-bold mb-0">
                {{ formattedTime }}
              </p>
              <p class="text-caption text-medium-emphasis">
                Shift Aktif
              </p>
            </div>
            <VBtn
              color="error"
              variant="outlined"
              @click="logout"
            >
              <VIcon
                icon="tabler-logout"
                class="me-2"
              />
              Keluar
            </VBtn>
          </div>
        </div>
      </VContainer>
    </div>

    <!-- Main Content -->
    <VContainer
      fluid
      class="py-8"
    >
      <!-- Stats Cards -->
      <VRow class="mb-6">
        <VCol
          cols="12"
          md="3"
        >
          <VCard class="stat-card">
            <VCardText>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">
                    Saldo Awal
                  </p>
                  <h3 class="text-h5 font-weight-bold">
                    {{ formattedCash }}
                  </h3>
                </div>
                <VAvatar
                  color="primary"
                  variant="tonal"
                  size="48"
                >
                  <VIcon
                    icon="tabler-cash"
                    size="28"
                  />
                </VAvatar>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VCard class="stat-card">
            <VCardText>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">
                    Transaksi Hari Ini
                  </p>
                  <h3 class="text-h5 font-weight-bold">
                    0
                  </h3>
                </div>
                <VAvatar
                  color="success"
                  variant="tonal"
                  size="48"
                >
                  <VIcon
                    icon="tabler-shopping-cart"
                    size="28"
                  />
                </VAvatar>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VCard class="stat-card">
            <VCardText>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">
                    Total Penjualan
                  </p>
                  <h3 class="text-h5 font-weight-bold">
                    Rp 0
                  </h3>
                </div>
                <VAvatar
                  color="warning"
                  variant="tonal"
                  size="48"
                >
                  <VIcon
                    icon="tabler-chart-line"
                    size="28"
                  />
                </VAvatar>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VCard class="stat-card">
            <VCardText>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">
                    Durasi Shift
                  </p>
                  <h3 class="text-h5 font-weight-bold">
                    {{ Math.floor((new Date().getTime() - new Date(currentShift?.startTime || new Date()).getTime()) / 60000) }} menit
                  </h3>
                </div>
                <VAvatar
                  color="info"
                  variant="tonal"
                  size="48"
                >
                  <VIcon
                    icon="tabler-clock"
                    size="28"
                  />
                </VAvatar>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Quick Actions -->
      <VRow class="mb-6">
        <VCol cols="12">
          <h3 class="text-h6 font-weight-bold mb-4">
            Menu Cepat
          </h3>
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VCard
            class="action-card text-center pa-6"
            hover
          >
            <VAvatar
              color="primary"
              size="64"
              class="mb-4"
            >
              <VIcon
                icon="tabler-shopping-cart-plus"
                size="32"
              />
            </VAvatar>
            <h4 class="text-h6 font-weight-bold mb-2">
              Transaksi Baru
            </h4>
            <p class="text-body-2 text-medium-emphasis">
              Mulai transaksi penjualan baru
            </p>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VCard
            class="action-card text-center pa-6"
            hover
          >
            <VAvatar
              color="success"
              size="64"
              class="mb-4"
            >
              <VIcon
                icon="tabler-list"
                size="32"
              />
            </VAvatar>
            <h4 class="text-h6 font-weight-bold mb-2">
              Daftar Transaksi
            </h4>
            <p class="text-body-2 text-medium-emphasis">
              Lihat semua transaksi hari ini
            </p>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VCard
            class="action-card text-center pa-6"
            hover
          >
            <VAvatar
              color="warning"
              size="64"
              class="mb-4"
            >
              <VIcon
                icon="tabler-report-money"
                size="32"
              />
            </VAvatar>
            <h4 class="text-h6 font-weight-bold mb-2">
              Laporan Shift
            </h4>
            <p class="text-body-2 text-medium-emphasis">
              Lihat laporan shift kasir
            </p>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VCard
            class="action-card text-center pa-6"
            hover
          >
            <VAvatar
              color="info"
              size="64"
              class="mb-4"
            >
              <VIcon
                icon="tabler-settings"
                size="32"
              />
            </VAvatar>
            <h4 class="text-h6 font-weight-bold mb-2">
              Pengaturan
            </h4>
            <p class="text-body-2 text-medium-emphasis">
              Atur preferensi POS
            </p>
          </VCard>
        </VCol>
      </VRow>

      <!-- Recent Transactions -->
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardTitle class="d-flex align-center justify-space-between">
              <span>Transaksi Terakhir</span>
              <VBtn
                variant="text"
                color="primary"
                size="small"
              >
                Lihat Semua
              </VBtn>
            </VCardTitle>
            <VCardText>
              <div class="text-center py-12">
                <VIcon
                  icon="tabler-receipt-off"
                  size="64"
                  color="grey-lighten-1"
                  class="mb-4"
                />
                <p class="text-h6 text-medium-emphasis">
                  Belum ada transaksi
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  Transaksi akan muncul di sini setelah Anda membuat transaksi pertama
                </p>
                <VBtn
                  color="primary"
                  class="mt-4"
                >
                  <VIcon
                    icon="tabler-plus"
                    class="me-2"
                  />
                  Buat Transaksi
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<style scoped lang="scss">
.pos-beranda {
  min-height: 100vh;
  background-color: #f5f5f9;
}

.pos-header {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card {
  height: 100%;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.action-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
