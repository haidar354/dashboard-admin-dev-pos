<script setup lang="ts">
import { computed, ref } from 'vue'
import PosSidebar from '../components/PosSidebar.vue'

definePage({
  meta: {
    layout: 'blank',
  },
})

const searchQuery = ref('')
const selectedCategory = ref('semua')
const selectedOrderType = ref('dine-in')
const showProductModal = ref(false)
const showPaymentModal = ref(false)
const showSuccessModal = ref(false)
const showReceiptModal = ref(false)
const selectedProduct = ref<any>(null)
const orderItems = ref<any[]>([])
const promoCode = ref('')
const currentOrderId = ref('')
const completedOrder = ref<any>(null)

// Dummy data produk
const products = ref([
  {
    id: 1,
    name: 'Nasi Ayam Utuh Hot Nashville + Es Manis..',
    price: 15000,
    originalPrice: 25000,
    category: 'promo',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
    variants: [
      { id: 1, name: 'Dada Mentok', stock: 25, price: 0 },
      { id: 2, name: 'Paha Tengah', stock: 5, price: 0 },
      { id: 3, name: 'Paha Bawah (+2000)', stock: 25, price: 2000 },
      { id: 4, name: 'Paha Atas (+2000)', stock: 25, price: 2000 },
    ],
    toppings: [
      { id: 1, name: 'Nugget', price: 5000, stock: 25 },
      { id: 2, name: 'Telur Dadar', price: 5000, stock: 25 },
      { id: 3, name: 'Kue Coklat', price: 7000, stock: 15 },
      { id: 4, name: 'Sate Ayam', price: 8000, stock: 20 },
      { id: 5, name: 'Pasta Carbonara', price: 7500, stock: 10 },
    ],
  },
  {
    id: 2,
    name: 'Nasi Ayam Utuh Hot Nashville + Es Manis..',
    price: 15000,
    category: 'hidangan-utama',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400&h=300&fit=crop',
    variants: [
      { id: 1, name: 'Dada Mentok', stock: 25, price: 0 },
      { id: 2, name: 'Paha Tengah', stock: 5, price: 0 },
    ],
    toppings: [],
  },
  {
    id: 3,
    name: 'Nasi Ayam Utuh Hot Nashville + Es Manis..',
    price: 15000,
    category: 'hidangan-utama',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    variants: [],
    toppings: [],
  },
  {
    id: 4,
    name: 'Nasi Ayam Utuh Hot Nashville + Es Manis..',
    price: 15000,
    category: 'hidangan-utama',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
    variants: [],
    toppings: [],
  },
  {
    id: 5,
    name: 'Paket Extra Hura Hot Nashville',
    price: 15000,
    category: 'hidangan-utama',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400&h=300&fit=crop',
    variants: [],
    toppings: [],
  },
  {
    id: 6,
    name: 'Nasi Ayam Utuh Hot Nashville Krisbar',
    price: 15000,
    category: 'hidangan-utama',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    variants: [],
    toppings: [],
  },
  {
    id: 7,
    name: 'EXTRA',
    price: 15000,
    category: 'makanan',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1562967916-ca8ed48f87ea?w=400&h=300&fit=crop',
    variants: [],
    toppings: [],
  },
  {
    id: 8,
    name: 'Paket Hemat',
    price: 15000,
    category: 'makanan',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    variants: [],
    toppings: [],
  },
  {
    id: 9,
    name: 'Paket Hemat',
    price: 15000,
    originalPrice: 25000,
    category: 'promo',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
    variants: [],
    toppings: [],
  },
  {
    id: 10,
    name: 'Paket Komplit',
    price: 15000,
    category: 'minuman',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    variants: [],
    toppings: [],
  },
])

const categories = [
  { id: 'semua', name: 'Semua', count: 30 },
  { id: 'promo', name: 'Promo', count: 15 },
  { id: 'hidangan-utama', name: 'Hidangan Utama', count: 5 },
  { id: 'makanan', name: 'Makanan', count: 3 },
  { id: 'minuman', name: 'Minuman', count: 3 },
  { id: 'snack', name: 'Snack', count: 3 },
]

// Product modal state
const productModalData = ref({
  quantity: 1,
  selectedVariant: null as any,
  selectedToppings: [] as any[],
  notes: '',
  hasDiscount: false,
  discountType: 'diskon',
  discountAmount: 0,
})

// Payment modal state
const paymentModalData = ref({
  paymentMethod: 'tunai',
  cashAmount: '',
  discount: 0,
})

const filteredProducts = computed(() => {
  let filtered = products.value

  if (selectedCategory.value !== 'semua')
    filtered = filtered.filter(p => p.category === selectedCategory.value)

  if (searchQuery.value) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  return filtered
})

const currentTime = ref(new Date())

setInterval(() => {
  currentTime.value = new Date()
}, 1000)

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const orderSummary = computed(() => {
  const subtotal = orderItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
  const discount = 0
  const ppn = Math.round(subtotal * 0.1)
  const rounding = 400
  const total = subtotal - discount + ppn + rounding

  return {
    subtotal,
    discount,
    ppn,
    rounding,
    total,
  }
})

const productModalTotal = computed(() => {
  if (!selectedProduct.value)
    return 0

  let total = selectedProduct.value.price * productModalData.value.quantity

  if (productModalData.value.selectedVariant?.price)
    total += productModalData.value.selectedVariant.price * productModalData.value.quantity

  productModalData.value.selectedToppings.forEach(topping => {
    total += topping.price * productModalData.value.quantity
  })

  if (productModalData.value.hasDiscount)
    total -= productModalData.value.discountAmount

  return total
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const openProductModal = (product: any) => {
  selectedProduct.value = { ...product }
  productModalData.value = {
    quantity: 1,
    selectedVariant: product.variants?.[0] || null,
    selectedToppings: [],
    notes: '',
    hasDiscount: false,
    discountType: 'diskon',
    discountAmount: 0,
  }
  showProductModal.value = true
}

const toggleTopping = (topping: any) => {
  const index = productModalData.value.selectedToppings.findIndex(t => t.id === topping.id)
  if (index >= 0)
    productModalData.value.selectedToppings.splice(index, 1)
  else
    productModalData.value.selectedToppings.push(topping)
}

const addToOrder = () => {
  const orderItem = {
    id: Date.now(),
    productId: selectedProduct.value.id,
    name: selectedProduct.value.name,
    image: selectedProduct.value.image,
    basePrice: selectedProduct.value.price,
    quantity: productModalData.value.quantity,
    variant: productModalData.value.selectedVariant,
    toppings: [...productModalData.value.selectedToppings],
    notes: productModalData.value.notes,
    totalPrice: productModalTotal.value,
  }

  orderItems.value.push(orderItem)
  showProductModal.value = false
}

const removeOrderItem = (index: number) => {
  orderItems.value.splice(index, 1)
}

const updateOrderQuantity = (index: number, delta: number) => {
  const item = orderItems.value[index]
  const newQuantity = item.quantity + delta

  if (newQuantity > 0) {
    item.quantity = newQuantity
    item.totalPrice = (item.basePrice + (item.variant?.price || 0) + item.toppings.reduce((sum: number, t: any) => sum + t.price, 0)) * newQuantity
  }
}

const openPaymentModal = () => {
  if (orderItems.value.length === 0)
    return
  showPaymentModal.value = true
}

const generateOrderId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = '#'
  for (let i = 0; i < 7; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length))

  return result
}

const processPayment = () => {
  // Save completed order
  completedOrder.value = {
    orderId: generateOrderId(),
    items: [...orderItems.value],
    summary: { ...orderSummary.value },
    orderType: selectedOrderType.value,
    paymentMethod: paymentModalData.value.paymentMethod,
    timestamp: new Date(),
  }

  currentOrderId.value = completedOrder.value.orderId

  // Close payment modal and show success modal
  showPaymentModal.value = false
  showSuccessModal.value = true

  // Clear order items
  orderItems.value = []
}

const printReceipt = () => {
  showSuccessModal.value = false
  showReceiptModal.value = true
}

const handlePrint = () => {
  window.print()
}

const handleDownloadPDF = () => {
  // In production, use library like jsPDF
  alert('Download PDF fitur akan segera tersedia')
}

const handleShareReceipt = () => {
  // In production, implement share functionality
  alert('Share nota fitur akan segera tersedia')
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  completedOrder.value = null
}
</script>

<template>
  <div class="pos-product-page">
    <PosSidebar active-page="pos" />

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

      <!-- Content Area -->
      <div class="pos-content">
        <!-- Products Section -->
        <div class="products-section">
          <!-- Category Tabs -->
          <VTabs
            v-model="selectedCategory"
            color="primary"
            class="mb-4"
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
            class="mb-4"
          />

          <!-- Products Grid -->
          <div class="products-grid">
            <VCard
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
              @click="openProductModal(product)"
            >
              <div class="product-image-wrapper">
                <VImg
                  :src="product.image"
                  :alt="product.name"
                  cover
                  height="160"
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
                <h4 class="text-body-1 font-weight-bold mb-2 text-truncate">
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
          </div>
        </div>

        <!-- Order Panel -->
        <div class="order-panel">
          <VCard class="order-card">
            <VCardTitle class="text-h6 font-weight-bold">
              Pesanan Saat Ini
            </VCardTitle>

            <VCardText>
              <!-- Visitor Name -->
              <VTextField
                placeholder="Nama Pengunjung"
                variant="outlined"
                density="comfortable"
                hide-details
                class="mb-4"
              >
                <template #append-inner>
                  <VIcon icon="tabler-pencil" />
                </template>
              </VTextField>

              <!-- Order Type -->
              <div class="order-type-buttons mb-4">
                <VBtn
                  :variant="selectedOrderType === 'dine-in' ? 'flat' : 'outlined'"
                  :color="selectedOrderType === 'dine-in' ? 'primary' : 'default'"
                  block
                  @click="selectedOrderType = 'dine-in'"
                >
                  Dine In
                </VBtn>
                <VBtn
                  :variant="selectedOrderType === 'take-away' ? 'flat' : 'outlined'"
                  :color="selectedOrderType === 'take-away' ? 'primary' : 'default'"
                  block
                  @click="selectedOrderType = 'take-away'"
                >
                  Take Away
                </VBtn>
                <VBtn
                  :variant="selectedOrderType === 'online' ? 'flat' : 'outlined'"
                  :color="selectedOrderType === 'online' ? 'primary' : 'default'"
                  block
                  @click="selectedOrderType = 'online'"
                >
                  Online
                </VBtn>
              </div>

              <!-- Order Items -->
              <div class="order-items">
                <div
                  v-if="orderItems.length === 0"
                  class="text-center py-8"
                >
                  <VIcon
                    icon="tabler-shopping-cart-off"
                    size="48"
                    color="grey-lighten-1"
                    class="mb-2"
                  />
                  <p class="text-body-2 text-medium-emphasis">
                    Belum ada pesanan
                  </p>
                </div>

                <div
                  v-for="(item, index) in orderItems"
                  :key="item.id"
                  class="order-item mb-3"
                >
                  <div class="d-flex gap-3">
                    <VImg
                      :src="item.image"
                      width="80"
                      height="80"
                      cover
                      class="rounded"
                    />
                    <div class="flex-grow-1">
                      <h5 class="text-body-2 font-weight-bold mb-1">
                        {{ item.name }}
                      </h5>
                      <p
                        v-if="item.variant"
                        class="text-caption text-medium-emphasis mb-1"
                      >
                        Varian: {{ item.variant.name }}
                      </p>
                      <p
                        v-if="item.toppings.length > 0"
                        class="text-caption text-medium-emphasis mb-1"
                      >
                        Topping: {{ item.toppings.map((t: any) => t.name).join(', ') }}
                      </p>
                      <p class="text-body-2 font-weight-bold text-primary mb-2">
                        {{ formatCurrency(item.totalPrice) }}
                      </p>

                      <div class="d-flex align-center gap-2">
                        <VBtn
                          icon
                          size="x-small"
                          color="error"
                          variant="text"
                          @click="removeOrderItem(index)"
                        >
                          <VIcon icon="tabler-trash" />
                        </VBtn>
                        <div class="quantity-control">
                          <VBtn
                            icon
                            size="x-small"
                            color="primary"
                            variant="outlined"
                            @click="updateOrderQuantity(index, -1)"
                          >
                            <VIcon icon="tabler-minus" />
                          </VBtn>
                          <span class="px-3 font-weight-bold">{{ item.quantity }}</span>
                          <VBtn
                            icon
                            size="x-small"
                            color="primary"
                            variant="outlined"
                            @click="updateOrderQuantity(index, 1)"
                          >
                            <VIcon icon="tabler-plus" />
                          </VBtn>
                        </div>
                        <VBtn
                          icon
                          size="x-small"
                          color="default"
                          variant="text"
                        >
                          <VIcon icon="tabler-dots-vertical" />
                        </VBtn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </VCardText>

            <VCardActions class="pa-4">
              <VBtn
                block
                color="primary"
                size="large"
                :disabled="orderItems.length === 0"
                @click="openPaymentModal"
              >
                <VIcon
                  icon="tabler-check"
                  class="me-2"
                />
                Konfirmasi Pesanan
              </VBtn>
            </VCardActions>
          </VCard>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <VDialog
      v-model="showProductModal"
      max-width="900"
    >
      <VCard v-if="selectedProduct">
        <VCardTitle class="d-flex align-center justify-space-between">
          <span class="text-h6">Detail Produk</span>
          <VBtn
            icon
            variant="text"
            @click="showProductModal = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="5"
            >
              <VImg
                :src="selectedProduct.image"
                :alt="selectedProduct.name"
                cover
                height="300"
                class="rounded"
              />
            </VCol>

            <VCol
              cols="12"
              md="7"
            >
              <h3 class="text-h6 font-weight-bold mb-2">
                {{ selectedProduct.name }}
              </h3>
              <p class="text-h5 font-weight-bold text-primary mb-4">
                {{ formatCurrency(selectedProduct.price) }}
              </p>

              <!-- Notes -->
              <VTextarea
                v-model="productModalData.notes"
                label="Catatan"
                placeholder="Tambah Catatan"
                variant="outlined"
                rows="2"
                class="mb-4"
              />

              <!-- Discount Toggle -->
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-1">Aktifkan Potongan?</span>
                <VSwitch
                  v-model="productModalData.hasDiscount"
                  color="primary"
                  hide-details
                />
              </div>

              <VSelect
                v-if="productModalData.hasDiscount"
                v-model="productModalData.discountType"
                :items="[{ value: 'diskon', title: 'Diskon' }]"
                label="Masukan/Diskon"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />

              <!-- Variants -->
              <div
                v-if="selectedProduct.variants && selectedProduct.variants.length > 0"
                class="mb-4"
              >
                <h4 class="text-body-1 font-weight-bold mb-2">
                  Pilih Varian
                </h4>
                <VRadioGroup
                  v-model="productModalData.selectedVariant"
                  hide-details
                >
                  <VRadio
                    v-for="variant in selectedProduct.variants"
                    :key="variant.id"
                    :value="variant"
                  >
                    <template #label>
                      <div class="d-flex align-center justify-space-between w-100">
                        <span>{{ variant.name }}</span>
                        <span class="text-caption text-medium-emphasis">Stok: {{ variant.stock }}</span>
                      </div>
                    </template>
                  </VRadio>
                </VRadioGroup>
              </div>

              <!-- Toppings -->
              <div
                v-if="selectedProduct.toppings && selectedProduct.toppings.length > 0"
                class="mb-4"
              >
                <h4 class="text-body-1 font-weight-bold mb-2">
                  Pilih Topping
                </h4>
                <div class="toppings-list">
                  <VCheckbox
                    v-for="topping in selectedProduct.toppings"
                    :key="topping.id"
                    :model-value="productModalData.selectedToppings.some(t => t.id === topping.id)"
                    hide-details
                    @update:model-value="toggleTopping(topping)"
                  >
                    <template #label>
                      <div class="d-flex align-center justify-space-between w-100">
                        <span>+{{ topping.name }} <span class="text-warning">+{{ topping.price }}</span></span>
                        <span class="text-caption text-medium-emphasis">Stok: {{ topping.stock }}</span>
                      </div>
                    </template>
                  </VCheckbox>
                </div>
              </div>

              <!-- Summary -->
              <VDivider class="my-4" />
              <div class="summary mb-4">
                <div class="d-flex justify-space-between mb-2">
                  <span>Diskon</span>
                  <span>- {{ formatCurrency(productModalData.discountAmount) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Tambahan</span>
                  <span>{{ formatCurrency(0) }}</span>
                </div>
                <VDivider class="my-2" />
                <div class="d-flex justify-space-between">
                  <span class="font-weight-bold">Total Pembayaran</span>
                  <span class="font-weight-bold text-h6 text-primary">
                    {{ formatCurrency(productModalTotal) }}
                  </span>
                </div>
              </div>

              <!-- Quantity & Add Button -->
              <div class="d-flex align-center gap-3">
                <div class="quantity-control">
                  <VBtn
                    icon
                    color="primary"
                    variant="outlined"
                    @click="productModalData.quantity = Math.max(1, productModalData.quantity - 1)"
                  >
                    <VIcon icon="tabler-minus" />
                  </VBtn>
                  <span class="px-4 font-weight-bold text-h6">{{ productModalData.quantity }}</span>
                  <VBtn
                    icon
                    color="primary"
                    variant="outlined"
                    @click="productModalData.quantity++"
                  >
                    <VIcon icon="tabler-plus" />
                  </VBtn>
                </div>
                <VBtn
                  color="primary"
                  size="large"
                  class="flex-grow-1"
                  @click="addToOrder"
                >
                  Masukan ke Pesanan
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Payment Confirmation Modal -->
    <VDialog
      v-model="showPaymentModal"
      max-width="900"
    >
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span class="text-h6">Konfirmasi Pemesanan</span>
          <VBtn
            icon
            variant="text"
            @click="showPaymentModal = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VCardText>
          <p class="text-center text-body-2 text-medium-emphasis mb-6">
            Pastikan kembali data telah sesuai dan benar
          </p>

          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <h4 class="text-body-1 font-weight-bold mb-3">
                Opsi Pembayaran
              </h4>

              <div class="payment-methods mb-4">
                <VCard
                  class="payment-method-card"
                  :class="{ active: paymentModalData.paymentMethod === 'tunai' }"
                  @click="paymentModalData.paymentMethod = 'tunai'"
                >
                  <VCardText class="text-center pa-4">
                    <VIcon
                      icon="tabler-wallet"
                      size="32"
                      color="primary"
                      class="mb-2"
                    />
                    <p class="text-body-1 font-weight-bold mb-0">
                      Tunai
                    </p>
                    <p class="text-caption text-medium-emphasis">
                      0
                    </p>
                  </VCardText>
                </VCard>

                <VCard
                  class="payment-method-card"
                  :class="{ active: paymentModalData.paymentMethod === 'qris' }"
                  @click="paymentModalData.paymentMethod = 'qris'"
                >
                  <VCardText class="text-center pa-4">
                    <VIcon
                      icon="tabler-qrcode"
                      size="32"
                      color="primary"
                      class="mb-2"
                    />
                    <p class="text-body-1 font-weight-bold mb-0">
                      QRIS
                    </p>
                    <p class="text-caption text-medium-emphasis">
                      0
                    </p>
                  </VCardText>
                </VCard>

                <VCard
                  class="payment-method-card"
                  :class="{ active: paymentModalData.paymentMethod === 'edc' }"
                  @click="paymentModalData.paymentMethod = 'edc'"
                >
                  <VCardText class="text-center pa-4">
                    <VIcon
                      icon="tabler-credit-card"
                      size="32"
                      color="primary"
                      class="mb-2"
                    />
                    <p class="text-body-1 font-weight-bold mb-0">
                      EDC
                    </p>
                    <p class="text-caption text-medium-emphasis">
                      0
                    </p>
                  </VCardText>
                </VCard>
              </div>

              <VTextField
                v-if="paymentModalData.paymentMethod === 'tunai'"
                v-model="paymentModalData.cashAmount"
                label="Nominal Tunai*"
                placeholder="Rp."
                variant="outlined"
                class="mb-3"
              >
                <template #append-inner>
                  <VIcon icon="tabler-copy" />
                </template>
              </VTextField>

              <p class="text-caption text-warning mb-0">
                Kembali: {{ formatCurrency(10000) }}
              </p>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <h4 class="text-body-1 font-weight-bold mb-3">
                Ringkasan Pembayaran
              </h4>

              <!-- Promo Code -->
              <div class="d-flex gap-2 mb-4">
                <VTextField
                  v-model="promoCode"
                  placeholder="Kode Promo"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
                <VBtn
                  color="primary"
                  variant="flat"
                >
                  Klaim
                </VBtn>
              </div>

              <!-- Summary -->
              <div class="payment-summary">
                <div class="d-flex justify-space-between mb-2">
                  <span>Total</span>
                  <span class="font-weight-bold">{{ formatCurrency(orderSummary.subtotal) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Diskon</span>
                  <span>{{ formatCurrency(orderSummary.discount) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>PPN (10%)</span>
                  <span>{{ formatCurrency(orderSummary.ppn) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Jumlah Total</span>
                  <span class="font-weight-bold">{{ formatCurrency(orderSummary.subtotal + orderSummary.ppn) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-3">
                  <span>Pembulatan</span>
                  <span>{{ formatCurrency(orderSummary.rounding) }}</span>
                </div>
                <VDivider class="my-3" />
                <div class="d-flex justify-space-between">
                  <span class="text-body-1 font-weight-bold">Total Pembayaran</span>
                  <span class="text-h6 font-weight-bold text-primary">
                    {{ formatCurrency(orderSummary.total) }}
                  </span>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions class="pa-4">
          <VBtn
            block
            color="primary"
            size="large"
            @click="processPayment"
          >
            Bayar Sekarang
            <VIcon
              icon="tabler-arrow-right"
              class="ms-2"
            />
          </VBtn>
        </VCardActions>

        <VCardActions class="pa-4 pt-0">
          <VBtn
            block
            variant="outlined"
            size="large"
          >
            Bayar Nanti
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Success Transaction Modal -->
    <VDialog
      v-model="showSuccessModal"
      max-width="600"
      persistent
    >
      <VCard class="text-center">
        <VCardTitle class="d-flex align-center justify-space-between">
          <span class="text-h6">Transaksi Berhasil Dibuat!</span>
          <VBtn
            icon
            variant="text"
            @click="closeSuccessModal"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VCardText class="py-8">
          <!-- Chef Illustration Placeholder -->
          <div class="success-illustration mb-6">
            <VAvatar
              size="120"
              color="success"
              class="mb-4"
            >
              <VIcon
                icon="tabler-chef-hat"
                size="64"
                color="white"
              />
            </VAvatar>
          </div>

          <!-- Order ID -->
          <div class="success-badge mb-4">
            <VIcon
              icon="tabler-circle-check"
              color="success"
              size="24"
              class="me-2"
            />
            <span class="text-h5 font-weight-bold text-success">
              {{ currentOrderId }}
            </span>
          </div>

          <p class="text-body-1 text-medium-emphasis mb-6">
            Pembayaran telah diterima dan terkirim ke dapur, cetak nota<br>
            dan jangan lupa berikan kepada tamu!
          </p>

          <VBtn
            color="primary"
            size="large"
            block
            @click="printReceipt"
          >
            <VIcon
              icon="tabler-printer"
              class="me-2"
            />
            Cetak Nota
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Receipt/Nota Modal -->
    <VDialog
      v-model="showReceiptModal"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span class="text-h6">Nota Pembayaran</span>
          <VBtn
            icon
            variant="text"
            @click="showReceiptModal = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VCardText>
          <div
            v-if="completedOrder"
            class="receipt-container"
          >
            <!-- Receipt Content -->
            <div class="receipt-paper">
              <div class="receipt-header text-center mb-4">
                <h3 class="text-h6 font-weight-bold mb-1">
                  Teknoreka Chicken
                </h3>
                <p class="text-caption text-medium-emphasis mb-0">
                  Jl. Gejayan No. 45, Yogyakarta
                </p>
                <p class="text-caption text-medium-emphasis">
                  Telp: (0274) 123456
                </p>
              </div>

              <VDivider class="my-3" />

              <div class="receipt-info mb-3">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption">Tanggal</span>
                  <span class="text-caption font-weight-bold">
                    {{ new Date().toLocaleDateString('id-ID') }} - {{ new Date().toLocaleTimeString('id-ID') }}
                  </span>
                </div>
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption">Order ID</span>
                  <span class="text-caption font-weight-bold">{{ completedOrder.orderId }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-caption">Customer</span>
                  <span class="text-caption font-weight-bold">Tamu</span>
                </div>
              </div>

              <VDivider class="my-3" />

              <!-- Order Items -->
              <div class="receipt-items mb-3">
                <div
                  v-for="(item, index) in completedOrder.items"
                  :key="index"
                  class="mb-3"
                >
                  <div class="text-body-2 font-weight-bold mb-1">
                    {{ item.name }}
                  </div>
                  <div
                    v-if="item.variant"
                    class="text-caption text-medium-emphasis mb-1"
                  >
                    Varian: {{ item.variant.name }}
                  </div>
                  <div
                    v-if="item.toppings.length > 0"
                    class="text-caption text-medium-emphasis mb-1"
                  >
                    Topping: {{ item.toppings.map((t: any) => t.name).join(', ') }}
                  </div>
                  <div class="d-flex justify-space-between">
                    <span class="text-caption">{{ item.quantity }}x @ {{ formatCurrency(item.basePrice) }}</span>
                    <span class="text-caption font-weight-bold">{{ formatCurrency(item.totalPrice) }}</span>
                  </div>
                </div>
              </div>

              <VDivider class="my-3" />

              <!-- Summary -->
              <div class="receipt-summary">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption">Subtotal</span>
                  <span class="text-caption">{{ formatCurrency(completedOrder.summary.subtotal) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption">Diskon</span>
                  <span class="text-caption">{{ formatCurrency(completedOrder.summary.discount) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption">PPN (10%)</span>
                  <span class="text-caption">{{ formatCurrency(completedOrder.summary.ppn) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-caption">Pembulatan</span>
                  <span class="text-caption">{{ formatCurrency(completedOrder.summary.rounding) }}</span>
                </div>
                <VDivider class="my-2" />
                <div class="d-flex justify-space-between">
                  <span class="text-body-1 font-weight-bold">Total</span>
                  <span class="text-body-1 font-weight-bold">{{ formatCurrency(completedOrder.summary.total) }}</span>
                </div>
              </div>

              <VDivider class="my-3" />

              <div class="receipt-footer text-center">
                <p class="text-caption mb-2">
                  Tunai: {{ formatCurrency(completedOrder.summary.total) }}
                </p>
                <p class="text-caption mb-2">
                  Kembalian: {{ formatCurrency(0) }}
                </p>
                <p class="text-caption font-weight-bold mt-4">
                  Terima Kasih
                </p>
                <p class="text-caption text-medium-emphasis">
                  Pembelian Anda gratis jika tidak diberi struk
                </p>
              </div>
            </div>
          </div>
        </VCardText>

        <VCardActions class="pa-4">
          <VRow>
            <VCol cols="4">
              <VBtn
                variant="outlined"
                block
                @click="handlePrint"
              >
                <VIcon
                  icon="tabler-printer"
                  class="me-2"
                />
                Print
              </VBtn>
            </VCol>
            <VCol cols="4">
              <VBtn
                variant="outlined"
                block
                @click="handleDownloadPDF"
              >
                <VIcon
                  icon="tabler-download"
                  class="me-2"
                />
                PDF
              </VBtn>
            </VCol>
            <VCol cols="4">
              <VBtn
                variant="outlined"
                block
                @click="handleShareReceipt"
              >
                <VIcon
                  icon="tabler-share"
                  class="me-2"
                />
                Share
              </VBtn>
            </VCol>
          </VRow>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped lang="scss">
.pos-product-page {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f9;
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
}

.pos-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.products-section {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
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

.order-panel {
  width: 420px;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
  overflow-y: auto;
  padding: 1rem;
}

.order-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.order-type-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.order-items {
  max-height: 400px;
  overflow-y: auto;
}

.order-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.payment-method-card {
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgb(var(--v-theme-primary));
  }

  &.active {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
}

.payment-summary {
  background-color: #f5f5f9;
  padding: 1rem;
  border-radius: 8px;
}

.toppings-list {
  max-height: 200px;
  overflow-y: auto;
}

.success-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-badge {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.receipt-container {
  max-height: 600px;
  overflow-y: auto;
}

.receipt-paper {
  background: white;
  padding: 1.5rem;
  font-family: 'Courier New', monospace;
}

.receipt-header,
.receipt-info,
.receipt-items,
.receipt-summary,
.receipt-footer {
  line-height: 1.6;
}

@media print {
  .receipt-paper {
    width: 80mm;
    padding: 10mm;
  }
}
</style>
