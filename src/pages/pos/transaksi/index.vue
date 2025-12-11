<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    layout: 'blank',
  },
})

const router = useRouter()
const searchQuery = ref('')
const selectedFilter = ref('semua')
const expandedTransactions = ref<number[]>([])

// Dummy data transaksi (10 items)
const transactions = ref([
  {
    id: 1,
    orderId: '#012832132',
    type: 'dine-in',
    customerName: 'Defasta Abid Pradana',
    date: '19:23 WIB, 12 September 2022',
    cashier: 'Kasir: Defasta Abid',
    total: 120000,
    status: 'selesai',
    items: [
      {
        name: 'Nasi + Paha Atas Geprek + Aneka Sambal',
        variant: 'Paha Bawah (+2000)',
        toppings: ['Telur Dadar', 'Nugget', 'Bawang Bombay'],
        quantity: 2,
        price: 35000,
        total: 70000,
        notes: 'Disajikan pakai mangkok khusus.',
      },
    ],
  },
  {
    id: 2,
    orderId: '#012832132',
    type: 'take-away',
    customerName: 'Peter Cetera',
    date: '19:23 WIB, 12 September 2022',
    location: 'Bonita Jaden',
    cashier: 'Kasir: Defasta Abid',
    total: 170000,
    status: 'gagal',
    items: [
      {
        name: 'Ayam Utuh Krispi',
        variant: 'Dada Mentok',
        toppings: [],
        quantity: 1,
        price: 25000,
        total: 25000,
        notes: '',
      },
    ],
  },
  {
    id: 3,
    orderId: '#012832132',
    type: 'online',
    customerName: 'Peter Cetera',
    date: '19:23 WIB, 12 September 2022',
    location: 'Lisia Sonia',
    cashier: 'Kasir: Defasta Abid',
    total: 120000,
    status: 'selesai',
    items: [
      {
        name: 'Paket Hemat Nashville',
        variant: '',
        toppings: ['Kerupuk', 'Sambal Extra'],
        quantity: 2,
        price: 60000,
        total: 120000,
        notes: '',
      },
    ],
  },
  {
    id: 4,
    orderId: '#012832132',
    type: 'take-away',
    customerName: 'Peter Cetera',
    date: '19:23 WIB, 11 September 2022',
    location: 'Julia Smith',
    cashier: 'Kasir: Defasta Abid',
    total: 150000,
    status: 'gagal',
    items: [
      {
        name: 'Nasi Goreng Special',
        variant: 'Pedas Level 3',
        toppings: ['Telur Mata Sapi', 'Kerupuk'],
        quantity: 3,
        price: 50000,
        total: 150000,
        notes: '',
      },
    ],
  },
  {
    id: 5,
    orderId: '#012832132',
    type: 'dine-in',
    customerName: 'Peter Cetera',
    date: '19:23 WIB, 11 September 2022',
    location: 'Miracle Boy',
    cashier: 'Kasir: Defasta Abid',
    total: 120000,
    status: 'selesai',
    items: [
      {
        name: 'Mie Ayam Jumbo',
        variant: '',
        toppings: ['Pangsit', 'Bakso'],
        quantity: 2,
        price: 60000,
        total: 120000,
        notes: '',
      },
    ],
  },
  {
    id: 6,
    orderId: '#012832132',
    type: 'online',
    customerName: 'Kevin Hart',
    date: '19:23 WIB, 13 September 2022',
    cashier: 'Kasir: Defasta Abid',
    total: 200000,
    status: 'selesai',
    items: [
      {
        name: 'Paket Keluarga',
        variant: 'Extra Porsi',
        toppings: ['Sayur Asem', 'Tempe Goreng', 'Tahu Goreng'],
        quantity: 1,
        price: 200000,
        total: 200000,
        notes: '',
      },
    ],
  },
  {
    id: 7,
    orderId: '#012832132',
    type: 'online',
    customerName: 'Kevin Hart',
    date: '19:23 WIB, 13 September 2022',
    cashier: 'Kasir: Defasta Abid',
    total: 200000,
    status: 'selesai',
    items: [
      {
        name: 'Soto Ayam Lamongan',
        variant: '',
        toppings: ['Telur', 'Perkedel'],
        quantity: 2,
        price: 100000,
        total: 200000,
        notes: '',
      },
    ],
  },
  {
    id: 8,
    orderId: '#012832132',
    type: 'take-away',
    customerName: 'Peter Cetera',
    date: '19:23 WIB, 12 September 2022',
    cashier: 'Kasir: Defasta Abid',
    total: 120000,
    status: 'batal',
    items: [
      {
        name: 'Es Teh Manis Jumbo',
        variant: '',
        toppings: [],
        quantity: 4,
        price: 30000,
        total: 120000,
        notes: '',
      },
    ],
  },
  {
    id: 9,
    orderId: '#012832132',
    type: 'dine-in',
    customerName: 'Peter Cetera',
    date: '19:23 WIB, 12 September 2022',
    cashier: 'Kasir: Defasta Abid',
    total: 120000,
    status: 'selesai',
    items: [
      {
        name: 'Nasi + Paha Atas Geprek + Aneka Sambal',
        variant: 'Paha Bawah (+2000)',
        toppings: ['Telur Dadar', 'Nugget'],
        quantity: 2,
        price: 60000,
        total: 120000,
        notes: 'Disajikan pakai mangkok khusus.',
      },
    ],
  },
  {
    id: 10,
    orderId: '#012832132',
    type: 'online',
    customerName: 'Lusia Amanda',
    date: '19:23 WIB, 10 September 2022',
    cashier: 'Kasir: Defasta Abid',
    total: 95000,
    status: 'refund',
    items: [
      {
        name: 'Burger Spesial',
        variant: 'Double Patty',
        toppings: ['Keju', 'Lettuce'],
        quantity: 1,
        price: 95000,
        total: 95000,
        notes: '',
      },
    ],
  },
])

const filters = [
  { id: 'semua', name: 'Semua', icon: 'tabler-list' },
  { id: 'dine-in', name: 'Dine-In', icon: 'tabler-tools-kitchen-2' },
  { id: 'take-away', name: 'Take Away', icon: 'tabler-package' },
  { id: 'online', name: 'Online', icon: 'tabler-device-mobile' },
]

const stats = ref([
  {
    title: 'Total Penjualan',
    value: '1237',
    icon: 'tabler-clipboard-list',
    color: 'primary',
  },
  {
    title: 'Seluruh Penjualan',
    value: 'Rp. 12.823.000,00',
    icon: 'tabler-receipt',
    color: 'info',
  },
  {
    title: 'Penjualan Hari Ini',
    value: '12',
    icon: 'tabler-calendar-check',
    color: 'success',
  },
  {
    title: 'Penjualan Hari Ini',
    value: 'Rp. 600.000',
    icon: 'tabler-cash',
    color: 'warning',
  },
])

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (selectedFilter.value !== 'semua') {
    filtered = filtered.filter(t => t.type === selectedFilter.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter(t =>
      t.orderId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.value.toLowerCase())
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

const toggleExpand = (transactionId: number) => {
  const index = expandedTransactions.value.indexOf(transactionId)
  if (index >= 0) {
    expandedTransactions.value.splice(index, 1)
  } else {
    expandedTransactions.value.push(transactionId)
  }
}

const isExpanded = (transactionId: number) => {
  return expandedTransactions.value.includes(transactionId)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'selesai': return 'success'
    case 'gagal': return 'error'
    case 'batal': return 'error'
    case 'refund': return 'info'
    case 'menunggu': return 'warning'
    default: return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'selesai': return 'Selesai'
    case 'gagal': return 'Gagal'
    case 'batal': return 'Batal'
    case 'refund': return 'Refund'
    case 'menunggu': return 'Menunggu Pembayaran'
    default: return status
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'dine-in': return 'tabler-tools-kitchen-2'
    case 'take-away': return 'tabler-package'
    case 'online': return 'tabler-device-mobile'
    default: return 'tabler-receipt'
  }
}

const goToPOS = () => {
  router.push('/pos/posProduct')
}

const goToBeranda = () => {
  router.push('/pos/beranda')
}
</script>

<template>
  <div class="transaction-page">
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
              variant="text"
              color="default"
              v-bind="props"
              @click="goToBeranda"
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
              variant="flat"
              color="primary"
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
    <div class="transaction-main">
      <!-- Header -->
      <div class="transaction-header">
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
                Senin, 23 Juni 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="transaction-content">
        <VContainer fluid>
          <!-- Stats Cards -->
          <VRow class="mb-6">
            <VCol
              v-for="stat in stats"
              :key="stat.title"
              cols="12"
              sm="6"
              md="3"
            >
              <VCard class="stat-card">
                <VCardText>
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      :color="stat.color"
                      variant="tonal"
                      size="48"
                    >
                      <VIcon
                        :icon="stat.icon"
                        size="28"
                      />
                    </VAvatar>
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">
                        {{ stat.title }}
                      </p>
                      <h3 class="text-h6 font-weight-bold">
                        {{ stat.value }}
                      </h3>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>

          <!-- Filter Tabs -->
          <VCard class="mb-4">
            <VCardText class="py-3">
              <div class="d-flex align-center justify-space-between flex-wrap gap-3">
                <div class="filter-tabs">
                  <VBtn
                    v-for="filter in filters"
                    :key="filter.id"
                    :variant="selectedFilter === filter.id ? 'flat' : 'text'"
                    :color="selectedFilter === filter.id ? 'primary' : 'default'"
                    class="me-2"
                    @click="selectedFilter = filter.id"
                  >
                    <VIcon
                      :icon="filter.icon"
                      class="me-2"
                      size="20"
                    />
                    {{ filter.name }}
                  </VBtn>
                </div>

                <div class="d-flex gap-2">
                  <VTextField
                    v-model="searchQuery"
                    placeholder="Cari transaksi..."
                    prepend-inner-icon="tabler-search"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 300px"
                  />
                  <VBtn
                    variant="outlined"
                    color="primary"
                  >
                    <VIcon
                      icon="tabler-filter"
                      class="me-2"
                    />
                    Filter
                  </VBtn>
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Transactions List -->
          <div class="transactions-list">
            <VCard
              v-for="transaction in filteredTransactions"
              :key="transaction.id"
              class="transaction-card mb-3"
              :class="{ expanded: isExpanded(transaction.id) }"
            >
              <VCardText class="pa-4">
                <div
                  class="transaction-header-row"
                  @click="toggleExpand(transaction.id)"
                >
                  <div class="d-flex align-center gap-3 flex-grow-1">
                    <VAvatar
                      :color="getStatusColor(transaction.status)"
                      variant="tonal"
                      size="48"
                    >
                      <VIcon
                        :icon="getTypeIcon(transaction.type)"
                        size="24"
                      />
                    </VAvatar>

                    <div class="flex-grow-1">
                      <div class="d-flex align-center gap-2 mb-1">
                        <h4 class="text-body-1 font-weight-bold">
                          {{ transaction.orderId }}
                        </h4>
                        <VChip
                          size="small"
                          class="text-capitalize"
                        >
                          {{ transaction.type === 'dine-in' ? 'Dine In' : transaction.type === 'take-away' ? 'Take Away' : 'Online' }}
                        </VChip>
                        <span class="text-body-2">{{ transaction.customerName }}</span>
                      </div>
                      <p class="text-caption text-medium-emphasis mb-0">
                        {{ transaction.date }} • {{ transaction.cashier }}
                      </p>
                    </div>

                    <div class="text-end">
                      <h4 class="text-h6 font-weight-bold mb-1">
                        {{ formatCurrency(transaction.total) }}
                      </h4>
                      <VChip
                        :color="getStatusColor(transaction.status)"
                        size="small"
                      >
                        {{ getStatusText(transaction.status) }}
                      </VChip>
                    </div>

                    <VBtn
                      icon
                      variant="text"
                      size="small"
                    >
                      <VIcon :icon="isExpanded(transaction.id) ? 'tabler-chevron-up' : 'tabler-chevron-down'" />
                    </VBtn>
                  </div>
                </div>

                <!-- Expanded Details -->
                <VExpandTransition>
                  <div
                    v-if="isExpanded(transaction.id)"
                    class="transaction-details mt-4"
                  >
                    <VDivider class="mb-4" />

                    <div
                      v-for="(item, index) in transaction.items"
                      :key="index"
                      class="order-item mb-4"
                    >
                      <div class="d-flex justify-space-between align-start mb-2">
                        <div class="flex-grow-1">
                          <h5 class="text-body-1 font-weight-bold mb-2">
                            {{ item.name }}
                          </h5>
                          <p
                            v-if="item.variant"
                            class="text-caption text-medium-emphasis mb-1"
                          >
                            Varian: {{ item.variant }}
                          </p>
                          <p
                            v-if="item.toppings.length > 0"
                            class="text-caption text-medium-emphasis mb-1"
                          >
                            Topping: {{ item.toppings.join(', ') }}
                          </p>
                          <p class="text-body-2 font-weight-medium">
                            {{ formatCurrency(item.price) }} x {{ item.quantity }} = {{ formatCurrency(item.total) }}
                          </p>
                          <p
                            v-if="item.notes"
                            class="text-caption text-medium-emphasis mt-2"
                          >
                            Catatan: {{ item.notes }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <VDivider class="my-3" />

                    <div class="d-flex justify-space-between align-center">
                      <VBtn
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        <VIcon
                          icon="tabler-printer"
                          class="me-2"
                        />
                        Cetak Ulang
                      </VBtn>

                      <div class="text-end">
                        <p class="text-body-2 text-medium-emphasis mb-1">
                          Total Pembayaran
                        </p>
                        <h4 class="text-h6 font-weight-bold text-primary">
                          {{ formatCurrency(transaction.total) }} (+PPN)
                        </h4>
                      </div>
                    </div>
                  </div>
                </VExpandTransition>
              </VCardText>
            </VCard>

            <div
              v-if="filteredTransactions.length === 0"
              class="text-center py-12"
            >
              <VIcon
                icon="tabler-receipt-off"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />
              <p class="text-body-1 text-medium-emphasis">
                Tidak ada transaksi ditemukan
              </p>
            </div>
          </div>
        </VContainer>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.transaction-page {
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

.transaction-main {
  flex: 1;
  margin-left: 72px;
  display: flex;
  flex-direction: column;
}

.transaction-header {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.transaction-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.stat-card {
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.transactions-list {
  max-width: 1200px;
}

.transaction-card {
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.expanded {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.transaction-header-row {
  cursor: pointer;
  user-select: none;
}

.transaction-details {
  padding-top: 1rem;
}

.order-item {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
}
</style>
