<script setup lang="ts">
import { computed, ref } from 'vue'
import PosSidebar from '@/components/pos/PosSidebar.vue'

definePage({
  meta: {
    layout: 'blank',
  },
})

const searchQuery = ref('')
const showAddDialog = ref(false)
const editingItem = ref<any>(null)

// Form data
const satuanForm = ref({
  name: '',
  code: '',
})

// Dummy data satuan
const satuans = ref([
  {
    id: 1,
    name: 'Pieces',
    code: 'PCS',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Kilogram',
    code: 'KG',
    createdAt: '2024-01-15',
  },
  {
    id: 3,
    name: 'Liter',
    code: 'LTR',
    createdAt: '2024-01-16',
  },
  {
    id: 4,
    name: 'Box',
    code: 'BOX',
    createdAt: '2024-01-16',
  },
  {
    id: 5,
    name: 'Paket',
    code: 'PKT',
    createdAt: '2024-01-17',
  },
  {
    id: 6,
    name: 'Porsi',
    code: 'PRS',
    createdAt: '2024-01-17',
  },
  {
    id: 7,
    name: 'Gram',
    code: 'GR',
    createdAt: '2024-01-18',
  },
  {
    id: 8,
    name: 'Botol',
    code: 'BTL',
    createdAt: '2024-01-18',
  },
])

const filteredSatuans = computed(() => {
  if (!searchQuery.value)
    return satuans.value

  return satuans.value.filter(satuan =>
    satuan.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    || satuan.code.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const openAddDialog = () => {
  editingItem.value = null
  satuanForm.value = {
    name: '',
    code: '',
  }
  showAddDialog.value = true
}

const openEditDialog = (satuan: any) => {
  editingItem.value = satuan
  satuanForm.value = {
    name: satuan.name,
    code: satuan.code,
  }
  showAddDialog.value = true
}

const saveSatuan = () => {
  if (editingItem.value) {
    // Update existing
    const index = satuans.value.findIndex(s => s.id === editingItem.value.id)
    if (index !== -1) {
      satuans.value[index] = {
        ...satuans.value[index],
        name: satuanForm.value.name,
        code: satuanForm.value.code,
      }
    }
  }
  else {
    // Add new
    const newSatuan = {
      id: satuans.value.length + 1,
      name: satuanForm.value.name,
      code: satuanForm.value.code,
      createdAt: new Date().toISOString().split('T')[0],
    }

    satuans.value.push(newSatuan)
  }

  showAddDialog.value = false
  resetForm()
}

const deleteSatuan = (id: number) => {
  if (confirm('Apakah Anda yakin ingin menghapus satuan ini?')) {
    const index = satuans.value.findIndex(s => s.id === id)
    if (index !== -1)
      satuans.value.splice(index, 1)
  }
}

const resetForm = () => {
  satuanForm.value = {
    name: '',
    code: '',
  }
  editingItem.value = null
}
</script>

<template>
  <div class="pos-satuan-page">
    <PosSidebar active-page="satuan" />

    <!-- Main Content -->
    <div class="pos-main">
      <!-- Header -->
      <div class="pos-header">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h5 font-weight-bold mb-1">
              Satuan Produk
            </h2>
            <p class="text-body-2 text-medium-emphasis">
              Kelola satuan produk untuk sistem inventory
            </p>
          </div>

          <div class="d-flex align-center gap-4">
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="openAddDialog"
            >
              Tambah Satuan
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
          <!-- Search -->
          <VTextField
            v-model="searchQuery"
            placeholder="Cari satuan..."
            prepend-inner-icon="tabler-search"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-6"
          />

          <!-- Satuan Table -->
          <VCard>
            <VTable>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">
                    NO
                  </th>
                  <th class="text-left font-weight-bold">
                    NAMA SATUAN
                  </th>
                  <th class="text-left font-weight-bold">
                    KODE
                  </th>
                  <th class="text-left font-weight-bold">
                    TANGGAL DIBUAT
                  </th>
                  <th class="text-center font-weight-bold">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(satuan, index) in filteredSatuans"
                  :key="satuan.id"
                >
                  <td>{{ index + 1 }}</td>
                  <td class="font-weight-medium">
                    {{ satuan.name }}
                  </td>
                  <td>
                    <VChip
                      color="primary"
                      size="small"
                      variant="tonal"
                    >
                      {{ satuan.code }}
                    </VChip>
                  </td>
                  <td class="text-medium-emphasis">
                    {{ new Date(satuan.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }) }}
                  </td>
                  <td class="text-center">
                    <VBtn
                      icon
                      size="small"
                      variant="text"
                      color="primary"
                      @click="openEditDialog(satuan)"
                    >
                      <VIcon icon="tabler-edit" />
                    </VBtn>
                    <VBtn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteSatuan(satuan.id)"
                    >
                      <VIcon icon="tabler-trash" />
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>

            <div
              v-if="filteredSatuans.length === 0"
              class="text-center py-16"
            >
              <VIcon
                icon="tabler-package-off"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />
              <p class="text-body-1 text-medium-emphasis">
                Tidak ada satuan ditemukan
              </p>
            </div>
          </VCard>
        </VContainer>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <VDialog
      v-model="showAddDialog"
      max-width="600"
      persistent
    >
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between pa-6">
          <div>
            <h3 class="text-h5 font-weight-bold mb-1">
              {{ editingItem ? 'Edit Satuan' : 'Tambah Satuan' }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ editingItem ? 'Ubah data satuan produk' : 'Tambahkan satuan produk baru' }}
            </p>
          </div>
          <VBtn
            icon
            variant="text"
            @click="showAddDialog = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-6">
          <VTextField
            v-model="satuanForm.name"
            label="Nama Satuan*"
            placeholder="Contoh: Kilogram, Pieces, Liter"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          />

          <VTextField
            v-model="satuanForm.code"
            label="Kode Satuan*"
            placeholder="Contoh: KG, PCS, LTR"
            variant="outlined"
            density="comfortable"
          />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-6">
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="showAddDialog = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            :disabled="!satuanForm.name || !satuanForm.code"
            @click="saveSatuan"
          >
            {{ editingItem ? 'Update' : 'Simpan' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped lang="scss">
.pos-satuan-page {
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
</style>
