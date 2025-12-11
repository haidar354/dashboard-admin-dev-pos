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
const password = ref('')
const isPasswordVisible = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

const goBack = () => {
  router.push('/pos/cashiers')
}

const switchToPin = () => {
  router.push('/pos/cashiers/pin')
}

const handleLogin = () => {
  errorMessage.value = ''
  
  if (!password.value) {
    errorMessage.value = 'Password tidak boleh kosong'
    return
  }

  isLoading.value = true

  // Simulasi login
  setTimeout(() => {
    if (password.value === selectedCashier.value?.password) {
      // Login berhasil, lanjut ke input tunai
      router.push('/pos/cashiers/cash')
    } else {
      errorMessage.value = 'Password salah, silakan coba lagi'
    }
    isLoading.value = false
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
              Keluar Dari Laman Kasir
            </h2>
            <p class="text-body-1 text-medium-emphasis">
              Untuk kembali ke laman pemilihan cabang, silahkan konfirmasi kembali bahwa ini adalah anda
            </p>
          </div>

          <!-- Login Card -->
          <VCard class="login-card pa-8">
            <div class="text-center mb-6">
              <VAvatar
                :image="selectedCashier?.avatar"
                size="120"
                class="mb-4"
              />
              <h3 class="text-h5 font-weight-bold mb-1">
                {{ selectedCashier?.name || 'Tsana Jasmine' }}
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                {{ selectedCashier?.email || 'ts******02@gmail.com' }}
              </p>
            </div>

            <VForm @submit.prevent="handleLogin">
              <div class="mb-4">
                <label class="text-body-2 font-weight-medium mb-2 d-block">
                  Kata Sandi
                </label>
                <VTextField
                  v-model="password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  placeholder="••••••••"
                  variant="outlined"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  :error-messages="errorMessage"
                  autofocus
                />
              </div>

              <VBtn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="isLoading"
                class="mb-4"
              >
                Konfirmasi
              </VBtn>

              <div class="text-center">
                <VBtn
                  variant="text"
                  color="primary"
                  @click="switchToPin"
                >
                  Lupa PIN?
                </VBtn>
              </div>
            </VForm>
          </VCard>

          <!-- Info Text -->
          <div class="text-center mt-6">
            <p class="text-caption text-medium-emphasis">
              Untuk demo: Password kasir adalah "kasir123"
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

.login-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
