<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
    day: 'numeric',
    month: 'long', 
    year: 'numeric' 
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

// Dummy data statistik
const stats = ref({
  shiftSales: 24100000,
  cash: 20000000,
  qr: 4000000,
  edc: 100000,
  dineIn: 20000000,
  takeAway: 4000000,
  online: 100000,
})

// Dummy data produk terlaris
const topProducts = ref([
  {
    id: 1,
    name: 'Nasi Ayam Utuh Hot Nashville + Es Manis..',
    price: 15000,
    originalPrice: 25000,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
    stock: 12,
  },
  {
    id: 2,
    name: 'Paket Dada Hot Nashville',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400&h=300&fit=crop',
    stock: 12,
  },
])

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const logout = () => {
  // Clear shift data
  localStorage.removeItem('currentShift')
  localStorage.removeItem('selectedCashier')
  localStorage.removeItem('selectedOutlet')
  
  // Redirect ke halaman pilih outlet
  router.push('/pos')
}

const goToPOS = () => {
  router.push('/pos/posProduct')
}

onMounted(() => {
  // Load current shift data
  const shift = localStorage.getItem('currentShift')
  
  if (shift) {
    currentShift.value = JSON.parse(shift)
  }
})
</script>

<template>
  <div class="pos-beranda">
    <!-- Sidebar -->
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
          <template #activator="{ props }">
            <VBtn
              icon
              variant="flat"
              color="primary"
              v-bind="props"
            >
              <VIcon icon="tabler-home" />
            </VBtn>
          </template>
          <span>Beranda</span>
        </VTooltip>

        <VTooltip location="end">
          <template #activator="{ props }">
            <VBtn
              icon
              variant="text"
              color="default"
              v-bind="props"
              @click="goToPOS"
            >
              <VIcon icon="tabler-receipt" />
            </VBtn>
          </template>
          <span>POS</span>
        </VTooltip>

        <VTooltip location="end">
          <template #activator="{ props }">
            <VBtn
              icon
              variant="text"
              color="default"
              v-bind="props"
            >
              <VIcon icon="tabler-list" />
            </VBtn>
          </template>
          <span>Transaksi</span>
        </VTooltip>

        <VTooltip location="end">
          <template #activator="{ props }">
            <VBtn
              icon
              variant="text"
              color="default"
              v-bind="props"
            >
              <VIcon icon="tabler-package" />
            </VBtn>
          </template>
          <span>Pengeluaran</span>
        </VTooltip>

        <VTooltip location="end">
          <template #activator="{ props }">
            <VBtn
              icon
              variant="text"
              color="default"
              v-bind="props"
            >
              <VIcon icon="tabler-box" />
            </VBtn>
          </template>
          <span>Produk</span>
        </VTooltip>

        <VTooltip location="end">
          <template #activator="{ props }">
            <VBtn
              icon
              variant="text"
              color="default"
              v-bind="props"
            >
              <VIcon icon="tabler-settings" />
            </VBtn>
          </template>
          <span>Settings</span>
        </VTooltip>

        <VTooltip location="end">
          <template #activator="{ props }">
            <VBtn
              icon
              variant="text"
              color="default"
              v-bind="props"
            >
              <VIcon icon="tabler-user" />
            </VBtn>
          </template>
          <span>Profil</span>
        </VTooltip>
      </div>
    </div>

    <!-- Main Content -->
    <div class="pos-main">
      <!-- Header -->
      <div class="pos-header">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VAvatar
              size="56"
              class="me-3"
              image="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100&h=100&fit=crop"
            />
            <div>
              <h2 class="text-h6 font-weight-bold mb-0">
                Teknoreka Chicken
              </h2>
              <p class="text-caption text-medium-emphasis mb-0">
                <VIcon
                  icon="tabler-map-pin"
                  size="14"
                  class="me-1"
                />
                Cabang Gejayan
              </p>
            </div>
          </div>

          <div class="d-flex align-center gap-4">
            <div class="text-end">
              <p class="text-caption text-medium-emphasis mb-0">
                {{ formattedDate }}
              </p>
              <div class="d-flex align-center">
                <VAvatar
                  size="32"
                  class="me-2"
                  image="https://i.pravatar.cc/150?img=5"
                />
                <div>
                  <p class="text-body-2 font-weight-bold mb-0">
                    Putri Salsabilla
                  </p>
                  <p class="text-caption text-medium-emphasis mb-0">
                    Kasir
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="pos-content">
        <VContainer fluid>
          <!-- Stats Cards - Top Row -->
          <VRow class="mb-4">
            <VCol
              cols="12"
              md="3"
            >
              <VCard class="stat-card stat-card-primary">
                <VCardText>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">
                        Penjualan Shift Ini
                      </p>
                      <h3 class="text-h5 font-weight-bold">
                        {{ formatCurrency(stats.shiftSales) }}
                      </h3>
                    </div>
                    <VAvatar
                      color="success"
                      variant="tonal"
                      size="56"
                    >
                      <VIcon
                        icon="tabler-currency-dollar"
                        size="32"
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
                        Tunai
                      </p>
                      <h3 class="text-h5 font-weight-bold">
                        {{ formatCurrency(stats.cash) }}
                      </h3>
                    </div>
                    <VAvatar
                      color="success"
                      variant="tonal"
                      size="56"
                    >
                      <VIcon
                        icon="tabler-receipt"
                        size="32"
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
                        QR
                      </p>
                      <h3 class="text-h5 font-weight-bold">
                        {{ formatCurrency(stats.qr) }}
                      </h3>
                    </div>
                    <VAvatar
                      color="success"
                      variant="tonal"
                      size="56"
                    >
                      <VIcon
                        icon="tabler-qrcode"
                        size="32"
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
                        EDC
                      </p>
                      <h3 class="text-h5 font-weight-bold">
                        {{ formatCurrency(stats.edc) }}
                      </h3>
                    </div>
                    <VAvatar
                      color="success"
                      variant="tonal"
                      size="56"
                    >
                      <VIcon
                        icon="tabler-credit-card"
                        size="32"
                      />
                    </VAvatar>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>

          <!-- Stats Cards - Second Row -->
          <VRow class="mb-6">
            <VCol
              cols="12"
              md="4"
            >
              <VCard class="stat-card">
                <VCardText>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">
                        Dine In
                      </p>
                      <h3 class="text-h5 font-weight-bold">
                        {{ formatCurrency(stats.dineIn) }}
                      </h3>
                    </div>
                    <VAvatar
                      color="primary"
                      variant="tonal"
                      size="56"
                    >
                      <VIcon
                        icon="tabler-tools-kitchen-2"
                        size="32"
                      />
                    </VAvatar>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <VCol
              cols="12"
              md="4"
            >
              <VCard class="stat-card">
                <VCardText>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">
                        Take Away
                      </p>
                      <h3 class="text-h5 font-weight-bold">
                        {{ formatCurrency(stats.takeAway) }}
                      </h3>
                    </div>
                    <VAvatar
                      color="warning"
                      variant="tonal"
                      size="56"
                    >
                      <VIcon
                        icon="tabler-shopping-bag"
                        size="32"
                      />
                    </VAvatar>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <VCol
              cols="12"
              md="4"
            >
              <VCard class="stat-card">
                <VCardText>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">
                        Online
                      </p>
                      <h3 class="text-h5 font-weight-bold">
                        {{ formatCurrency(stats.online) }}
                      </h3>
                    </div>
                    <VAvatar
                      color="info"
                      variant="tonal"
                      size="56"
                    >
                      <VIcon
                        icon="tabler-device-mobile"
                        size="32"
                      />
                    </VAvatar>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>

          <!-- Top Products Section -->
          <VRow>
            <VCol cols="12">
              <h3 class="text-h6 font-weight-bold mb-4">
                Chart 5 Kategori terlaris
              </h3>
            </VCol>

            <VCol
              v-for="product in topProducts"
              :key="product.id"
              cols="12"
              sm="6"
              md="3"
            >
              <VCard class="product-card">
                <div class="product-image-wrapper">
                  <VImg
                    :src="product.image"
                    :alt="product.name"
                    cover
                    height="200"
                  />
                  <VChip
                    color="primary"
                    size="small"
                    class="stock-badge"
                  >
                    {{ product.stock }}
                  </VChip>
                </div>
                <VCardText class="pa-3">
                  <h4 class="text-body-1 font-weight-bold mb-2">
                    {{ product.name }}
                  </h4>
                  <div class="d-flex align-center gap-2">
                    <span class="text-h6 font-weight-bold text-primary">
                      {{ formatCurrency(product.price) }}
                    </span>
                    <span
                      v-if="product.originalPrice"
                      class="text-caption text-decoration-line-through text-medium-emphasis"
                    >
                      {{ formatCurrency(product.originalPrice) }}
                    </span>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VContainer>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pos-beranda {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f9;
}

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

.pos-main {
  flex: 1;
  margin-left: 72px;
  display: flex;
  flex-direction: column;
}

.pos-header {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pos-content {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
}

.stat-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  &.stat-card-primary {
    background: linear-gradient(135deg, #f5f5f9 0%, #fff 100%);
  }
}

.product-card {
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.product-image-wrapper {
  position: relative;
}

.stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
