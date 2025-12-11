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
const pin = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const pinButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

const goBack = () => {
  router.push('/pos/cashiers')
}

const addPin = (value: string) => {
  if (pin.value.length < 6) {
    pin.value += value
    errorMessage.value = ''
    
    // Auto submit ketika PIN 6 digit
    if (pin.value.length === 6) {
      setTimeout(() => {
        handleLogin()
      }, 300)
    }
  }
}

const removePin = () => {
  pin.value = pin.value.slice(0, -1)
  errorMessage.value = ''
}

const clearPin = () => {
  pin.value = ''
  errorMessage.value = ''
}

const handleLogin = () => {
  if (pin.value.length !== 6) {
    errorMessage.value = 'PIN harus 6 digit'
    return
  }

  isLoading.value = true

  // Simulasi login
  setTimeout(() => {
    if (pin.value === selectedCashier.value?.pin) {
      // Login berhasil, lanjut ke input tunai
      router.push('/pos/cashiers/cash')
    } else {
      errorMessage.value = 'PIN salah, silakan coba lagi'
      pin.value = ''
    }
    isLoading.value = false
  }, 500)
}

const switchToPassword = () => {
  router.push('/pos/cashiers/login')
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

          <!-- PIN Card -->
          <VCard class="pin-card pa-8">
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

            <!-- PIN Display -->
            <div class="pin-display mb-4">
              <div class="pin-dots">
                <div
                  v-for="i in 6"
                  :key="i"
                  class="pin-dot"
                  :class="{ 'pin-dot-filled': i <= pin.length }"
                >
                  <span v-if="i <= pin.length">•</span>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="text-center mb-4"
            >
              <p class="text-error text-body-2">
                {{ errorMessage }}
              </p>
            </div>

            <!-- PIN Keypad -->
            <div class="pin-keypad mb-4">
              <VBtn
                v-for="btn in pinButtons"
                :key="btn"
                class="pin-button"
                variant="outlined"
                size="x-large"
                @click="btn === '*' ? removePin() : btn === '#' ? clearPin() : addPin(btn)"
              >
                <span v-if="btn === '*'">
                  <VIcon icon="tabler-backspace" />
                </span>
                <span v-else-if="btn === '#'">
                  <VIcon icon="tabler-x" />
                </span>
                <span v-else class="text-h6">{{ btn }}</span>
              </VBtn>
            </div>

            <!-- Actions -->
            <div class="text-center">
              <p class="text-caption text-medium-emphasis mb-2">
                {{ errorMessage || 'Masukkan PIN 6 digit' }}
              </p>
              <VBtn
                variant="text"
                color="primary"
                @click="switchToPassword"
              >
                Lupa PIN?
              </VBtn>
            </div>
          </VCard>

          <!-- Info Text -->
          <div class="text-center mt-6">
            <p class="text-caption text-medium-emphasis">
              Untuk demo: PIN kasir adalah "123456"
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

.pin-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pin-display {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
}

.pin-dots {
  display: flex;
  gap: 1rem;
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 24px;
  line-height: 1;
  
  &.pin-dot-filled {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgb(var(--v-theme-primary));
    color: white;
  }
}

.pin-keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  max-width: 300px;
  margin: 0 auto;
}

.pin-button {
  aspect-ratio: 1;
  min-width: 0;
  height: auto;
}
</style>
