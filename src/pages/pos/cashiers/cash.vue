<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    layout: 'blank',
  },
})

const router = useRouter()
const selectedCashier = ref<any>(null)
const selectedOutlet = ref<any>(null)
const cashAmount = ref('')
const isNominalConfirmed = ref(false)
const isLoading = ref(false)

const formatCurrency = (value: string) => {
  // Remove non-numeric characters
  const numericValue = value.replace(/\D/g, '')
  
  if (!numericValue) return ''
  
  // Format dengan pemisah ribuan
  return new Intl.NumberFormat('id-ID').format(parseInt(numericValue))
}

const handleCashInput = (e: any) => {
  const value = e.target.value.replace(/\D/g, '')
  cashAmount.value = value
}

const formattedCash = computed(() => {
  if (!cashAmount.value) return ''
  return formatCurrency(cashAmount.value)
})

const goBack = () => {
  router.push('/pos/cashiers/login')
}

const handleSubmit = () => {
  if (!cashAmount.value) {
    return
  }

  if (!isNominalConfirmed.value) {
    return
  }

  isLoading.value = true

  // Simpan data shift kasir
  const shiftData = {
    cashier: selectedCashier.value,
    outlet: selectedOutlet.value,
    startCash: cashAmount.value,
    startTime: new Date().toISOString(),
  }
  
  localStorage.setItem('currentShift', JSON.stringify(shiftData))

  // Simulasi proses
  setTimeout(() => {
    isLoading.value = false
    // Redirect ke halaman beranda POS
    router.push('/pos/beranda')
  }, 500)
}

onMounted(() => {
  // Load selected cashier and outlet
  const cashier = localStorage.getItem('selectedCashier')
  const outlet = localStorage.getItem('selectedOutlet')
  
  if (cashier) {
    selectedCashier.value = JSON.parse(cashier)
  }
  if (outlet) {
    selectedOutlet.value = JSON.parse(outlet)
  }
  
  if (!cashier) {
    router.push('/pos/cashiers')
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
              color="primary"
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
            <div class="d-flex align-center mb-4">
              <VBtn
                icon
                variant="text"
                @click="goBack"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
            </div>
            <div class="d-flex align-center mb-2">
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

          <!-- Title -->
          <div class="mb-8">
            <h2 class="text-h4 font-weight-bold mb-2">
              Pilih Kasir
            </h2>
            <p class="text-body-1 text-medium-emphasis">
              Pilih kasir yang akan menjalankan shift untuk bekerja saat ini
            </p>
          </div>

          <!-- Cash Input Card -->
          <VCard class="cash-card pa-8">
            <div class="text-center mb-6">
              <VAvatar
                :image="selectedCashier?.avatar"
                size="120"
                class="mb-4"
              />
              <h3 class="text-h5 font-weight-bold mb-1">
                {{ selectedCashier?.name || 'Yola Tamara' }}
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                {{ selectedCashier?.role || 'Kasir' }}
              </p>
            </div>

            <VForm @submit.prevent="handleSubmit">
              <div class="mb-6">
                <label class="text-body-2 font-weight-medium mb-2 d-block">
                  Masukan Tunai Laci <span class="text-error">*</span>
                </label>
                <VTextField
                  v-model="cashAmount"
                  type="text"
                  placeholder="Rp."
                  variant="outlined"
                  prepend-inner-icon="tabler-cash"
                  :model-value="formattedCash"
                  @input="handleCashInput"
                  autofocus
                >
                  <template #append-inner>
                    <span class="text-caption text-medium-emphasis">IDR</span>
                  </template>
                </VTextField>
              </div>

              <div class="mb-6">
                <VCheckbox
                  v-model="isNominalConfirmed"
                  label="Konfirmasi nominal"
                  hide-details
                />
              </div>

              <VBtn
                type="submit"
                color="primary"
                size="large"
                block
                :disabled="!cashAmount || !isNominalConfirmed"
                :loading="isLoading"
              >
                Simpan dan Lanjutkan
              </VBtn>
            </VForm>
          </VCard>

          <!-- Info Text -->
          <div class="text-center mt-6">
            <p class="text-caption text-medium-emphasis">
              Masukkan jumlah uang tunai yang ada di laci kasir saat memulai shift
            </p>
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
  max-width: 600px;
  margin: 0 auto;
}

.cash-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
