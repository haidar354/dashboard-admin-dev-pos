<script setup lang="ts">
import { computed, ref } from 'vue'
import PosSidebar from '@/components/pos/PosSidebar.vue'

definePage({
  meta: {
    layout: 'blank',
  },
})

const searchQuery = ref('')
const selectedCategory = ref('semua')

// Dummy data transaksi
const transactions = ref([
  {
    id: '#012832132',
    orderType: 'Dine In',
    orderTypeIcon: 'tabler-utensils',
    customer: 'Peter Cetera',
    location: 'Abid Pradana',
    cashier: 'Defasta Abid',
    time: '19:23 WIB, 12 September 2022',
    amount: 120000,
    status: 'Selesai',
    category: 'semua',
  },
  {
    id: '#012832132',
    orderType: 'Take Away',
    orderTypeIcon: 'tabler-shopping-bag',
    customer: 'Peter Cetera',
    location: 'Bonita Jaden',
    cashier: 'Defasta Abid',
    time: '19:23 WIB, 12 September 2022',
    amount: 170000,
    status: 'Gagal',
    category: 'semua',
  },
  {
    id: '#012832132',
    orderType: 'Online',
    orderTypeIcon: 'tabler-world',
    customer: 'Peter Cetera',
    location: 'Lisia Sonia',
    cashier: 'Defasta Abid',
    time: '19:23 WIB, 12 September 2022',
    amount: 120000,
    status: 'Selesai',
    category: 'semua',
  },
  {
    id: '#012832132',
    orderType: 'Dine In',
    orderTypeIcon: 'tabler-utensils',
    customer: 'Peter Cetera',
    location: 'Miracle Boy',
    cashier: 'Defasta Abid',
    time: '19:23 WIB, 11 September 2022',
    amount: 120000,
    status: 'Selesai',
    category: 'semua',
  },
  {
    id: '#012832132',
    orderType: 'Dine In',
    orderTypeIcon: 'tabler-utensils',
    customer: 'Peter Cetera',
    cashier: 'Defasta Abid',
    time: '19:23 WIB, 12 September 2022',
    amount: 120000,
    status: 'Selesai',
    category: 'semua',
  },
  {
    id: '#012832132',
    orderType: 'Take Away',
    orderTypeIcon: 'tabler-shopping-bag',
    customer: 'Siti Rahma',
    location: 'Gedung A',
    cashier: 'Defasta Abid',
    time: '10:15 WIB, 11 September 2022',
    amount: 85000,
    status: 'Selesai',
    category: 'promo',
  },
  {
    id: '#012832133',
    orderType: 'Online',
    orderTypeIcon: 'tabler-world',
    customer: 'Ahmad Yani',
    location: 'Tokopedia',
    cashier: 'Defasta Abid',
    time: '14:30 WIB, 10 September 2022',
    amount: 250000,
    status: 'Selesai',
    category: 'hidangan-utama',
  },
  {
    id: '#012832134',
    orderType: 'Dine In',
    orderTypeIcon: 'tabler-utensils',
    customer: 'Diana Putri',
    location: 'Table 5',
    cashier: 'Defasta Abid',
    time: '18:45 WIB, 10 September 2022',
    amount: 195000,
    status: 'Gagal',
    category: 'makanan',
  },
])

const categories = [
  { id: 'semua', name: 'Semua', count: 30 },
  { id: 'promo', name: 'Promo', count: 15 },
  { id: 'hidangan-utama', name: 'Hidangan Utama', count: 5 },
  { id: 'makanan', name: 'Makanan', count: 3 },
  { id: 'minuman', name: 'Minuman', count: 3 },
]

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (selectedCategory.value !== 'semua')
    filtered = filtered.filter(t => t.category === selectedCategory.value)

  if (searchQuery.value) {
    filtered = filtered.filter(t =>
      t.customer.toLowerCase().includes(searchQuery.value.toLowerCase())
      || t.id.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  return filtered
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
</script>

<template>
  <div class="pos-kategori-page">
    <PosSidebar active-page="kategori" />

    <!-- Main Content -->
    <div class="pos-main">
      <!-- Header -->
      <div class="pos-header">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold mb-1">
              Kategori
            </h2>
          </div>

          <div class="d-flex align-center gap-4">
            <VAvatar
              size="48"
              image="https://i.pravatar.cc/150?img=5"
            />
            <div>
              <p class="text-body-1 font-weight-bold mb-0">
                Putri Salsabilla
              </p>
              <p class="text-caption text-medium-emphasis mb-0">
                Kasir
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="pos-content">
        <VContainer fluid>
          <!-- Category Tabs -->
          <VTabs
            v-model="selectedCategory"
            color="primary"
            class="mb-6"
          >
            <VTab
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }} ({{ category.count }})
            </VTab>
          </VTabs>

          <!-- Search -->
          <VTextField
            v-model="searchQuery"
            placeholder="Cari sesuatu..."
            prepend-inner-icon="tabler-search"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-6"
          />

          <!-- Transactions List -->
          <div class="transactions-list">
            <VCard
              v-for="transaction in filteredTransactions"
              :key="transaction.id + transaction.time"
              class="transaction-card mb-4"
              elevation="1"
            >
              <div class="d-flex align-center pa-4">
                <!-- Icon -->
                <div class="transaction-icon me-4">
                  <VAvatar
                    size="48"
                    :color="transaction.status === 'Selesai' ? 'success' : 'error'"
                    variant="tonal"
                  >
                    <VIcon
                      :icon="transaction.orderTypeIcon"
                      size="24"
                    />
                  </VAvatar>
                </div>

                <!-- Details -->
                <div class="flex-grow-1">
                  <div class="d-flex align-center gap-2 mb-1">
                    <h4 class="text-body-1 font-weight-bold">
                      {{ transaction.id }} - {{ transaction.orderType }}
                    </h4>
                    <VIcon
                      icon="tabler-point-filled"
                      size="8"
                      color="medium-emphasis"
                    />
                    <span class="text-body-2 font-weight-medium">
                      {{ transaction.customer }}
                    </span>
                  </div>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ transaction.time }}
                    <template v-if="transaction.location">
                      {{ transaction.location }}
                    </template>
                    Kasir: {{ transaction.cashier }}
                  </p>
                </div>

                <!-- Amount & Status -->
                <div class="text-end">
                  <p class="text-h6 font-weight-bold mb-1">
                    {{ formatCurrency(transaction.amount) }}
                  </p>
                  <VChip
                    :color="transaction.status === 'Selesai' ? 'success' : 'error'"
                    size="small"
                  >
                    {{ transaction.status }}
                  </VChip>
                </div>

                <!-- Arrow -->
                <div class="ms-4">
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                  >
                    <VIcon icon="tabler-chevron-right" />
                  </VBtn>
                </div>
              </div>
            </VCard>
          </div>
        </VContainer>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pos-kategori-page {
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
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.pos-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 0;
}

.transactions-list {
  max-width: 1200px;
}

.transaction-card {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  }
}
</style>
