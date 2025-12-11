<script setup lang="ts">
import { useMenuCategoryStore } from '@/stores/menuCategoryStore'
import { useMenuStore } from '@/stores/menuStore'

// Meta
definePage({
  meta: {
    name: 'Menu',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

// Stores
const menuStore = useMenuStore()
const menuCategoryStore = useMenuCategoryStore()

// Reactive data
const sortBy = ref([{ key: 'sortOrder', order: 'asc' }])

// Headers for data table
const headers = [
  {
    title: 'Menu',
    key: 'name',
    sortable: true,
  },
  {
    title: 'Kategori',
    key: 'menuCategoryId',
    sortable: false,
  },
  {
    title: 'Harga',
    key: 'prices',
    sortable: false,
  },
  {
    title: 'Urutan',
    key: 'sortOrder',
    sortable: true,
  },
  {
    title: 'Status',
    key: 'status',
    sortable: false,
  },
  {
    title: 'Aksi',
    key: 'actions',
    sortable: false,
    width: '150px',
  },
]

// Computed
const menuCategories = computed(() => menuCategoryStore.data)

// Methods
function getCategoryName(categoryId: string) {
  const category = menuCategories.value.find(cat => cat.menuCategoryId === categoryId)

  return category?.name || 'Tidak diketahui'
}

function formatCurrency(amount: string | number) {
  const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numAmount)
}

async function loadMenus() {
  await menuStore.fetchData()
}

function resetFilter() {
  menuStore.resetFilter()
  menuStore.applyFilter()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    menuStore.fetchData(),
    menuCategoryStore.fetchAllData(),
  ])
})

// Watch for sort changes
watch(sortBy, newSortBy => {
  if (newSortBy.length > 0)
    menuStore.onSortBy(newSortBy)
}, { deep: true })
</script>

<template>
  <div>
    <!-- Page Header -->
    <VCard
      class="mb-6"
      elevation="2"
    >
      <VCardItem>
        <VCardTitle class="text-h4 font-weight-bold d-flex align-center">
          <VIcon
            icon="tabler-menu-2"
            class="me-3"
            color="primary"
          />
          Menu Management
        </VCardTitle>
        <VCardSubtitle class="text-body-1">
          Kelola menu dan item menu untuk outlet Anda dengan mudah
        </VCardSubtitle>
      </VCardItem>
    </VCard>

    <!-- Toolbar -->
    <VCard
      class="mb-6"
      elevation="1"
    >
      <VCardText>
        <VRow
          align="center"
          justify="space-between"
        >
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="menuStore.requestQuery.search"
              placeholder="Cari menu..."
              prepend-inner-icon="tabler-search"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="menuStore.applyFilter()"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
            class="text-end"
          >
            <VBtn
              color="primary"
              :to="{ name: 'sales-menus-create' }"
              prepend-icon="tabler-plus"
              variant="elevated"
              class="me-2"
            >
              Tambah Menu
            </VBtn>
            <VBtn
              :color="menuStore.isFilterVisible ? 'primary' : 'secondary'"
              variant="outlined"
              prepend-icon="tabler-filter"
              @click="menuStore.isFilterVisible = !menuStore.isFilterVisible"
            >
              Filter
            </VBtn>
          </VCol>
        </VRow>

        <!-- Enhanced Filters -->
        <VExpandTransition>
          <div
            v-show="menuStore.isFilterVisible"
            class="mt-6"
          >
            <VDivider class="mb-4" />
            <VCard
              variant="outlined"
              elevation="0"
            >
              <VCardText>
                <VRow>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <VSelect
                      v-model="menuStore.additionalFilter.menuCategoryId"
                      :items="menuCategories"
                      item-title="name"
                      item-value="menuCategoryId"
                      label="Kategori Menu"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details
                      prepend-inner-icon="tabler-category"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <VSelect
                      v-model="menuStore.requestQuery.orderField"
                      :items="[
                        { title: 'Nama', value: 'name' },
                        { title: 'Urutan', value: 'sortOrder' },
                        { title: 'Tanggal Dibuat', value: 'createdAt' },
                      ]"
                      label="Urutkan Berdasarkan"
                      variant="outlined"
                      density="compact"
                      hide-details
                      prepend-inner-icon="tabler-sort-ascending"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <VSelect
                      v-model="menuStore.requestQuery.orderDirection"
                      :items="[
                        { title: 'A-Z / Terkecil', value: 'asc' },
                        { title: 'Z-A / Terbesar', value: 'desc' },
                      ]"
                      label="Arah Urutan"
                      variant="outlined"
                      density="compact"
                      hide-details
                      prepend-inner-icon="tabler-sort-descending"
                    />
                  </VCol>
                </VRow>
                <VRow class="mt-4">
                  <VCol>
                    <VBtn
                      color="primary"
                      variant="flat"
                      prepend-icon="tabler-check"
                      @click="menuStore.applyFilter()"
                    >
                      Terapkan Filter
                    </VBtn>
                    <VBtn
                      color="secondary"
                      variant="outlined"
                      prepend-icon="tabler-refresh"
                      class="ms-2"
                      @click="resetFilter"
                    >
                      Reset Filter
                    </VBtn>
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </div>
        </VExpandTransition>

        <VRow class="mt-4">
          <VCol>
            <VBtn
              color="success"
              variant="outlined"
              prepend-icon="tabler-download"
              :loading="menuStore.isLoadingExport"
              @click="menuStore.exportData()"
            >
              Export Data
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Menu List -->
    <VCard elevation="1">
      <VCardText>
        <VDataTableServer
          v-model:items-per-page="menuStore.requestQuery.perPage"
          v-model:page="menuStore.requestQuery.page"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="menuStore.data"
          :items-length="menuStore.paginateData.total || 0"
          :loading="menuStore.isLoadingFetchData"
          item-value="menuId"
          show-current-page
          loading-text="Memuat data menu..."
          class="elevation-0"
          @update:options="loadMenus"
        >
          <!-- Menu Name -->
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <VAvatar
                size="40"
                color="primary"
                class="me-3"
              >
                <VIcon icon="tabler-chef-hat" />
              </VAvatar>
              <div>
                <div class="text-body-1 font-weight-medium">
                  {{ item.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  ID: {{ item.menuId.slice(-8) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Category -->
          <template #item.menuCategoryId="{ item }">
            <VChip
              size="small"
              color="primary"
              variant="tonal"
              prepend-icon="tabler-tag"
            >
              {{ getCategoryName(item.menuCategoryId) }}
            </VChip>
          </template>

          <!-- Prices -->
          <template #item.prices="{ item }">
            <div class="text-body-2">
              <div class="d-flex align-center mb-1">
                <VIcon
                  icon="tabler-tools-kitchen-2"
                  size="14"
                  class="me-1"
                  color="success"
                />
                <span class="text-caption me-1">Dine In:</span>
                <VChip
                  size="x-small"
                  color="success"
                  variant="flat"
                >
                  {{ formatCurrency(item.priceDineIn) }}
                </VChip>
              </div>
              <div class="d-flex align-center mb-1">
                <VIcon
                  icon="tabler-package"
                  size="14"
                  class="me-1"
                  color="warning"
                />
                <span class="text-caption me-1">Take Away:</span>
                <VChip
                  size="x-small"
                  color="warning"
                  variant="flat"
                >
                  {{ formatCurrency(item.priceTakeAway) }}
                </VChip>
              </div>
              <div class="d-flex align-center">
                <VIcon
                  icon="tabler-device-mobile"
                  size="14"
                  class="me-1"
                  color="info"
                />
                <span class="text-caption me-1">Online:</span>
                <VChip
                  size="x-small"
                  color="info"
                  variant="flat"
                >
                  {{ formatCurrency(item.priceOnlineOrder) }}
                </VChip>
              </div>
            </div>
          </template>

          <!-- Sort Order -->
          <template #item.sortOrder="{ item }">
            <VChip
              size="small"
              variant="outlined"
              color="secondary"
            >
              #{{ item.sortOrder }}
            </VChip>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <VChip
              size="small"
              :color="item.isActive !== false ? 'success' : 'error'"
              variant="flat"
              :prepend-icon="item.isActive !== false ? 'tabler-check' : 'tabler-x'"
            >
              {{ item.isActive !== false ? 'Aktif' : 'Tidak Aktif' }}
            </VChip>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <VTooltip text="Lihat Detail">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    :to="{ name: 'sales-menus-menu-id', params: { menuId: item.menuId } }"
                    icon="tabler-eye"
                    size="small"
                    variant="tonal"
                    color="info"
                  />
                </template>
              </VTooltip>

              <VTooltip text="Edit Menu">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    :to="{ name: 'sales-menus-menu-id-edit', params: { menuId: item.menuId } }"
                    icon="tabler-edit"
                    size="small"
                    variant="tonal"
                    color="warning"
                  />
                </template>
              </VTooltip>

              <VTooltip text="Hapus Menu">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    icon="tabler-trash"
                    size="small"
                    variant="tonal"
                    color="error"
                    :loading="menuStore.isLoadingDelete"
                    @click="menuStore.onDeleteMenu(item)"
                  />
                </template>
              </VTooltip>
            </div>
          </template>

          <!-- No Data -->
          <template #no-data>
            <div class="text-center py-12">
              <VIcon
                icon="tabler-menu-off"
                size="64"
                color="disabled"
                class="mb-4"
              />
              <h3 class="text-h6 text-disabled mb-2">
                Tidak ada menu ditemukan
              </h3>
              <p class="text-body-2 text-disabled mb-6">
                Belum ada menu yang dibuat atau tidak ada yang sesuai dengan pencarian Anda
              </p>
              <VBtn
                color="primary"
                :to="{ name: 'sales-menus-create' }"
                prepend-icon="tabler-plus"
                variant="elevated"
              >
                Tambah Menu Pertama
              </VBtn>
            </div>
          </template>

          <!-- Loading -->
          <template #loading>
            <div class="text-center py-8">
              <VProgressCircular
                indeterminate
                color="primary"
                size="32"
              />
              <div class="text-body-2 text-disabled mt-2">
                Memuat data menu...
              </div>
            </div>
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>
  </div>
</template>
