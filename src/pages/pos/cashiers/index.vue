<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    layout: 'blank',
  },
})

const router = useRouter()
const searchQuery = ref('')
const selectedOutlet = ref<any>(null)

// Dummy data kasir
const cashiers = ref([
  {
    id: 1,
    name: 'Yola Tamara',
    role: 'Kasir',
    avatar: 'https://i.pravatar.cc/150?img=5',
    pin: '123456',
    password: 'kasir123',
  },
  {
    id: 2,
    name: 'Dilla Vindhi',
    role: 'Kasir',
    avatar: 'https://i.pravatar.cc/150?img=9',
    pin: '654321',
    password: 'kasir456',
  },
  {
    id: 3,
    name: 'Andre Permana',
    role: 'Kasir',
    avatar: 'https://i.pravatar.cc/150?img=12',
    pin: '111222',
    password: 'kasir789',
  },
])

const filteredCashiers = computed(() => {
  if (!searchQuery.value)
    return cashiers.value

  return cashiers.value.filter(cashier =>
    cashier.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const selectCashier = (cashier: any) => {
  // Simpan kasir yang dipilih
  localStorage.setItem('selectedCashier', JSON.stringify(cashier))

  // Navigate ke halaman login kasir
  router.push('/pos/cashiers/login')
}

const goBack = () => {
  router.push('/pos')
}

onMounted(() => {
  // Load selected outlet
  const outlet = localStorage.getItem('selectedOutlet')
  if (outlet) {
    selectedOutlet.value = JSON.parse(outlet)
  }
  else {
    // Jika tidak ada outlet yang dipilih, redirect ke halaman pilih outlet
    router.push('/pos')
  }
})
</script>

<template>
  <div class="pos-layout">
    <!-- Sidebar -->
    <div class="pos-sidebar">
      <div class="sidebar-content">
        <div class="logo-section">
          <VAvatar
            size="80"
            color="white"
            class="mb-4"
          >
            <VIcon
              icon="tabler-building-store"
              size="48"
            />
          </VAvatar>
          <h2 class="text-h4 font-weight-bold text-white mb-2">
            BAKOELKU
          </h2>
          <p class="text-body-2 text-white opacity-90">
            Cerdas kelola, lancar jualan.
          </p>
        </div>
      </div>
      <div class="sidebar-footer">
        <p class="text-caption text-white opacity-70">
          Copyright ©{{ new Date().getFullYear() }} Bakoelku POS
        </p>
        <p class="text-caption text-white opacity-70">
          Made with ❤️ By Teknoreka
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="pos-main-content">
      <VContainer fluid>
        <div class="content-wrapper">
          <!-- Header with Back Button -->
          <div class="mb-6">
            <div class="d-flex align-center mb-4">
              <VBtn
                icon
                variant="text"
                @click="goBack"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
            </div>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <VAvatar
                  v-if="selectedOutlet?.image"
                  :image="selectedOutlet.image"
                  size="48"
                  class="me-3"
                />
                <div>
                  <h1 class="text-h6 font-weight-bold">
                    {{ selectedOutlet?.name || 'Teknoreka Chicken' }}
                  </h1>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ selectedOutlet?.address?.substring(0, 30) || 'Cabang Kaliurang' }}...
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Title -->
          <div class="mb-6">
            <h2 class="text-h4 font-weight-bold mb-2">
              Pilih Kasir
            </h2>
            <p class="text-body-1 text-medium-emphasis">
              Pilih kasir yang akan menjalankan shift untuk bekerja saat ini
            </p>
          </div>

          <!-- Search Bar -->
          <VTextField
            v-model="searchQuery"
            placeholder="Cari Kasir..."
            prepend-inner-icon="tabler-search"
            variant="outlined"
            class="mb-6"
            hide-details
          />

          <!-- Cashiers List -->
          <div class="cashiers-list">
            <VCard
              v-for="cashier in filteredCashiers"
              :key="cashier.id"
              class="cashier-card mb-4"
              @click="selectCashier(cashier)"
            >
              <div class="d-flex align-center pa-4">
                <VAvatar
                  :image="cashier.avatar"
                  size="64"
                  class="me-4"
                />
                <div class="flex-grow-1">
                  <h3 class="text-h6 font-weight-bold mb-1">
                    {{ cashier.name }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ cashier.role }}
                  </p>
                </div>
                <VBtn
                  icon
                  color="primary"
                  size="large"
                  variant="flat"
                >
                  <VIcon icon="tabler-arrow-right" />
                </VBtn>
              </div>
            </VCard>
          </div>
        </div>
      </VContainer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pos-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f9;
}

.pos-sidebar {
  width: 450px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  .sidebar-content {
    position: relative;
    z-index: 1;
  }

  .logo-section {
    text-align: center;
    padding-top: 4rem;
  }

  .sidebar-footer {
    text-align: center;
    position: relative;
    z-index: 1;
  }
}

.pos-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.content-wrapper {
  max-width: 900px;
}

.cashier-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
