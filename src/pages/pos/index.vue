<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    layout: 'blank',
  },
})

const router = useRouter()
const searchQuery = ref('')

// Dummy data outlets
const outlets = ref([
  {
    id: 1,
    name: 'Hara Chicken Gejayan',
    address: 'Jl. Merpati No. 45, Desa Sukamaju, Kel. Cempaka, Kec. Setiabudi, Kota Jakarta, Provinsi DKI Jakarta.',
    type: 'Pusat',
    image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=200&h=200&fit=crop',
  },
  {
    id: 2,
    name: 'Teknoreka Chicken Kaliurang',
    address: 'Jl. Kaliurang KM 5.5, Sleman, Yogyakarta.',
    type: 'Cabang',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop',
  },
  {
    id: 3,
    name: 'Ayam Geprek Semarang',
    address: 'Jl. Pandanaran No. 123, Semarang Tengah, Jawa Tengah.',
    type: 'Cabang',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop',
  },
])

const filteredOutlets = computed(() => {
  if (!searchQuery.value)
    return outlets.value

  return outlets.value.filter(outlet =>
    outlet.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const selectOutlet = (outlet: any) => {
  // Simpan outlet yang dipilih ke localStorage atau store
  localStorage.setItem('selectedOutlet', JSON.stringify(outlet))

  // Navigate ke halaman pilih kasir
  router.push('/pos/cashiers')
}
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
          <!-- Header -->
          <div class="mb-6">
            <div class="d-flex align-center mb-2">
              <VIcon
                icon="tabler-building-store"
                size="28"
                class="me-2"
              />
              <h1 class="text-h5 font-weight-bold">
                Teknoreka Chicken
              </h1>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              1 Outlet
            </p>
          </div>

          <!-- Title -->
          <div class="mb-6">
            <h2 class="text-h4 font-weight-bold mb-2">
              Pilih outlet
            </h2>
            <p class="text-body-1 text-medium-emphasis">
              Pilih outlet untuk melanjutkan menggunakan sistem
            </p>
          </div>

          <!-- Search Bar -->
          <VTextField
            v-model="searchQuery"
            placeholder="Cari Outlet..."
            prepend-inner-icon="tabler-search"
            variant="outlined"
            class="mb-6"
            hide-details
          />

          <!-- Outlets List -->
          <div class="outlets-list">
            <VCard
              v-for="outlet in filteredOutlets"
              :key="outlet.id"
              class="outlet-card mb-4"
              @click="selectOutlet(outlet)"
            >
              <div class="d-flex align-center pa-4">
                <VAvatar
                  :image="outlet.image"
                  size="64"
                  class="me-4"
                />
                <div class="flex-grow-1">
                  <h3 class="text-h6 font-weight-bold mb-1">
                    {{ outlet.name }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ outlet.address }}
                  </p>
                  <VChip
                    :color="outlet.type === 'Pusat' ? 'primary' : 'secondary'"
                    size="small"
                    class="mt-2"
                  >
                    {{ outlet.type }}
                  </VChip>
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

.outlet-card {
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
