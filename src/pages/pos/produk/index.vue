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
const showAddProductDialog = ref(false)
const productImage = ref<File | null>(null)
const productImagePreview = ref('')

// Form data
const productForm = ref({
  name: '',
  category: '',
  dineInPrice: '',
  takeawayPrice: '',
  hpp: '',
  stock: '',
  status: 'Tersedia',
  isStockActive: true,
})

// Dummy data produk
const products = ref([
  {
    id: 1,
    name: 'Nasi Goreng Seafood Special',
    category: 'Hidangan Utama',
    price: 120000,
    stock: 120,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Baso Obyak Mang Cilor Special',
    category: 'Promo',
    price: 120000,
    stock: 120,
    status: 'Draft',
    image: 'https://images.unsplash.com/photo-1623318044826-f971d6f33a0c?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    name: 'Nasi Padang Paket Ceban',
    category: 'Hidangan Utama',
    price: 120000,
    stock: 5,
    status: 'Tersedia',
    stockWarning: 'Stok mulai habis. Perbarui Stok!',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Sate Ayam',
    category: 'Hidangan Utama',
    price: 80000,
    stock: 10,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    name: 'Gado-Gado Spesial',
    category: 'Hidangan Pembuka',
    price: 50000,
    stock: 8,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
  },
  {
    id: 6,
    name: 'Rendang Daging',
    category: 'Hidangan Utama',
    price: 150000,
    stock: 3,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1562967916-ca8ed48f87ea?w=400&h=300&fit=crop',
  },
])

const categories = [
  { id: 'semua', name: 'Semua', count: 30 },
  { id: 'promo', name: 'Promo', count: 15 },
  { id: 'hidangan-utama', name: 'Hidangan Utama', count: 5 },
  { id: 'makanan', name: 'Makanan', count: 3 },
]

const categoryOptions = [
  { title: 'Hidangan Utama', value: 'hidangan-utama' },
  { title: 'Hidangan Pembuka', value: 'hidangan-pembuka' },
  { title: 'Promo', value: 'promo' },
  { title: 'Makanan', value: 'makanan' },
  { title: 'Minuman', value: 'minuman' },
]

const filteredProducts = computed(() => {
  let filtered = products.value

  if (selectedCategory.value !== 'semua')
    filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.value.replace('-', ' '))

  if (searchQuery.value) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
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

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    productImage.value = file

    const reader = new FileReader()

    reader.onload = e => {
      productImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const resetForm = () => {
  productForm.value = {
    name: '',
    category: '',
    dineInPrice: '',
    takeawayPrice: '',
    hpp: '',
    stock: '',
    status: 'Tersedia',
    isStockActive: true,
  }
  productImage.value = null
  productImagePreview.value = ''
}

const saveProduct = () => {
  // Logic untuk save produk
  console.log('Saving product:', productForm.value)
  showAddProductDialog.value = false
  resetForm()
}
</script>

<template>
  <div class="pos-produk-page">
    <PosSidebar active-page="produk" />

    <!-- Main Content -->
    <div class="pos-main">
      <!-- Header -->
      <div class="pos-header">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold mb-1">
              Data Produk
            </h2>
          </div>

          <div class="d-flex align-center gap-4">
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="showAddProductDialog = true"
            >
              Tambah Produk
            </VBtn>
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
          <div class="d-flex align-center justify-space-between mb-4">
            <VTabs
              v-model="selectedCategory"
              color="primary"
            >
              <VTab
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }} ({{ category.count }})
              </VTab>
            </VTabs>

            <VBtn
              variant="outlined"
              prepend-icon="tabler-filter"
            >
              Filter
            </VBtn>
          </div>

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

          <!-- Products Grid -->
          <div class="products-grid">
            <VCard
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
            >
              <div class="product-image-wrapper">
                <VImg
                  :src="product.image"
                  :alt="product.name"
                  cover
                  height="200"
                />
                <div class="product-number">
                  {{ product.id }}
                </div>
              </div>
              <VCardText class="pa-4">
                <h4 class="text-h6 font-weight-bold mb-2">
                  {{ product.name }}
                </h4>
                <div class="d-flex align-center gap-2 mb-3">
                  <VChip
                    size="small"
                    color="secondary"
                  >
                    {{ product.category }}
                  </VChip>
                  <VIcon
                    icon="tabler-point-filled"
                    size="8"
                    color="medium-emphasis"
                  />
                  <span class="text-caption">Stok: {{ product.stock }}</span>
                </div>
                <div
                  v-if="product.stockWarning"
                  class="stock-warning mb-3"
                >
                  <VIcon
                    icon="tabler-alert-circle"
                    size="16"
                    color="warning"
                    class="me-1"
                  />
                  <span class="text-caption text-warning">{{ product.stockWarning }}</span>
                </div>
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <p class="text-h6 font-weight-bold text-primary mb-0">
                      {{ formatCurrency(product.price) }}
                    </p>
                  </div>
                  <VChip
                    :color="product.status === 'Tersedia' ? 'success' : 'default'"
                    size="small"
                  >
                    {{ product.status }}
                  </VChip>
                </div>
              </VCardText>
              <VCardActions class="pa-4 pt-0">
                <VBtn
                  icon
                  variant="text"
                  size="small"
                >
                  <VIcon icon="tabler-chevron-right" />
                </VBtn>
              </VCardActions>
            </VCard>
          </div>
        </VContainer>
      </div>
    </div>

    <!-- Add Product Dialog -->
    <VDialog
      v-model="showAddProductDialog"
      max-width="900"
      persistent
    >
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between pa-6">
          <div>
            <h3 class="text-h5 font-weight-bold mb-1">
              Tambah Produk
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Tambahkan produk dan sesuaikan dengan kebutuhan pasar
            </p>
          </div>
          <VBtn
            icon
            variant="text"
            @click="showAddProductDialog = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-6">
          <VRow>
            <!-- Image Upload -->
            <VCol
              cols="12"
              md="4"
            >
              <VCard
                variant="outlined"
                class="image-upload-card"
              >
                <VCardText class="pa-6 text-center">
                  <div
                    v-if="!productImagePreview"
                    class="upload-placeholder"
                  >
                    <VIcon
                      icon="tabler-photo"
                      size="48"
                      color="primary"
                      class="mb-4"
                    />
                    <h4 class="text-body-1 font-weight-bold mb-2">
                      Pilih Foto Produk Terbaik
                    </h4>
                    <p class="text-caption text-medium-emphasis mb-4">
                      Dengan rekomendasi 500x500px<br>(.PNG, .JPG, .JPEG) untuk hasil terbaik
                    </p>
                    <VBtn
                      color="primary"
                      variant="outlined"
                      prepend-icon="tabler-upload"
                      @click="() => $refs.fileInput.click()"
                    >
                      Pilih Foto
                    </VBtn>
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      hidden
                      @change="handleImageUpload"
                    >
                  </div>
                  <div
                    v-else
                    class="image-preview"
                  >
                    <VImg
                      :src="productImagePreview"
                      cover
                      height="300"
                      class="rounded mb-4"
                    />
                    <VBtn
                      color="error"
                      variant="outlined"
                      size="small"
                      @click="productImagePreview = ''"
                    >
                      Hapus Foto
                    </VBtn>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Form Fields -->
            <VCol
              cols="12"
              md="8"
            >
              <h4 class="text-h6 font-weight-bold mb-4">
                Data Produk
              </h4>

              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="productForm.name"
                    label="Nama Produk*"
                    placeholder="Nama Produk"
                    variant="outlined"
                    density="comfortable"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="productForm.category"
                    label="Kategori Produk*"
                    placeholder="Pilih Kategori"
                    :items="categoryOptions"
                    variant="outlined"
                    density="comfortable"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="productForm.dineInPrice"
                    label="Harga Dine In & Takeaway*"
                    placeholder="Rp. Harga Satuan Produk"
                    variant="outlined"
                    density="comfortable"
                    prefix="Rp"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="productForm.hpp"
                    label="HPP*"
                    placeholder="Rp. Harga Satuan Produk"
                    variant="outlined"
                    density="comfortable"
                    prefix="Rp"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="productForm.stock"
                    label="Jumlah Stok*"
                    placeholder="Jumlah Stok"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="productForm.status"
                    label="Status*"
                    :items="[{ title: 'Tersedia', value: 'Tersedia' }, { title: 'Draft', value: 'Draft' }]"
                    variant="outlined"
                    density="comfortable"
                  />
                </VCol>
              </VRow>

              <div class="d-flex align-center justify-space-between mb-6">
                <div class="d-flex align-center gap-2">
                  <VCheckbox
                    v-model="productForm.isStockActive"
                    hide-details
                  />
                  <span class="text-body-2">Stok Aktif</span>
                </div>
                <div class="d-flex align-center gap-2">
                  <VCheckbox hide-details />
                  <span class="text-body-2">Something Active</span>
                </div>
              </div>

              <!-- Varian Produk -->
              <VCard
                variant="outlined"
                class="pa-4 mb-4"
              >
                <div class="d-flex align-center justify-space-between mb-4">
                  <h4 class="text-body-1 font-weight-bold">
                    Varian Produk
                  </h4>
                  <VBtn
                    color="primary"
                    variant="outlined"
                    size="small"
                    prepend-icon="tabler-plus"
                  >
                    Tambah Varian
                  </VBtn>
                </div>
                <VCard
                  variant="tonal"
                  class="pa-6 text-center"
                >
                  <VIcon
                    icon="tabler-box"
                    size="48"
                    color="warning"
                    class="mb-2"
                  />
                  <p class="text-body-2 text-medium-emphasis mb-2">
                    No Variant yet for this products..
                  </p>
                  <p class="text-caption text-medium-emphasis">
                    Add Variant so you can input one or more
                  </p>
                </VCard>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-6">
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="showAddProductDialog = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            prepend-icon="tabler-device-floppy"
            @click="saveProduct"
          >
            Simpan Produk
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped lang="scss">
.pos-produk-page {
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
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

.product-number {
  position: absolute;
  top: 12px;
  left: 12px;
  background: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.875rem;
}

.stock-warning {
  display: flex;
  align-items: center;
  background-color: rgba(255, 152, 0, 0.1);
  padding: 8px;
  border-radius: 4px;
}

.image-upload-card {
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  padding: 2rem;
}
</style>
