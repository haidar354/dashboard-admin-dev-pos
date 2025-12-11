<script setup lang="ts">
import { useMenuItemStore } from '@/stores/menuItemStore'
import { useMenuStore } from '@/stores/menuStore'
import { useItemStore } from '@/stores/product/itemStore'
import type { MenuItem } from '@/types/models/menu-item'

// Meta
definePage({
  meta: {
    name: 'Menu Detail',
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
const menuItemStore = useMenuItemStore()
const itemStore = useItemStore()

// Router
const route = useRoute()

// Reactive data
const showAddItemDialog = ref(false)
const editingItem = ref<MenuItem | null>(null)
const itemSortBy = ref([{ key: 'sortOrder', order: 'asc' }])

// Headers for menu items table
const itemHeaders = [
  {
    title: 'Item',
    key: 'itemId',
    sortable: true,
  },
  {
    title: 'Tipe',
    key: 'type',
    sortable: false,
  },
  {
    title: 'Status',
    key: 'status',
    sortable: false,
  },
  {
    title: 'Urutan',
    key: 'sortOrder',
    sortable: true,
  },
  {
    title: 'Aksi',
    key: 'actions',
    sortable: false,
    width: '120px',
  },
]

// Computed
const availableItems = computed(() => itemStore.data.filter(item => item.isSellable && item.isActive))

// Methods
function formatCurrency(amount: string | number) {
  const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numAmount)
}

function getItemName(itemId: string) {
  const item = availableItems.value.find(item => item.itemId === itemId)

  return item?.name || itemId
}

function getItemType(itemId: string) {
  const item = availableItems.value.find(item => item.itemId === itemId)

  return item?.type || 'unknown'
}

async function loadMenuItems() {
  await menuItemStore.fetchData()
}

function editMenuItem(item: MenuItem) {
  editingItem.value = item
  menuItemStore.setFormData(item)
  showAddItemDialog.value = true
}

function closeItemDialog() {
  showAddItemDialog.value = false
  editingItem.value = null
  menuItemStore.resetForm()
}

async function handleItemSubmit() {
  try {
    const menuId = route.params.menuId as string

    if (editingItem.value)
      await menuItemStore.update(editingItem.value.menuItemId)
    else
      await menuItemStore.create(menuId)

    await menuItemStore.fetchData()
    closeItemDialog()
  }
  catch (error) {
    console.error('Error saving menu item:', error)
  }
}

// Lifecycle
onMounted(async () => {
  const menuId = route.params.menuId as string

  // Set menu ID for menu items filter
  menuItemStore.setMenuId(menuId)

  await Promise.all([
    menuStore.fetchDetail(menuId),
    menuItemStore.fetchData(),
    itemStore.fetchAllData(),
  ])
})

// Watch for sort changes
watch(itemSortBy, newSortBy => {
  if (newSortBy.length > 0)
    menuItemStore.onSortBy(newSortBy)
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
        <div class="d-flex align-center justify-space-between">
          <div>
            <VCardTitle class="text-h4 font-weight-bold d-flex align-center">
              <VIcon
                icon="tabler-chef-hat"
                class="me-3"
                color="primary"
              />
              {{ menuStore.selectedMenu.name || 'Menu Detail' }}
            </VCardTitle>
            <VCardSubtitle class="text-body-1">
              Kelola menu dan item menu dengan mudah
            </VCardSubtitle>
          </div>
          <div class="d-flex gap-2">
            <VBtn
              color="warning"
              variant="outlined"
              prepend-icon="tabler-edit"
              :to="{ name: 'sales-menus-menu-id-edit', params: { menuId: route.params.menuId } }"
            >
              Edit Menu
            </VBtn>
            <VBtn
              color="secondary"
              variant="outlined"
              prepend-icon="tabler-arrow-left"
              :to="{ name: 'sales-menus' }"
            >
              Kembali
            </VBtn>
          </div>
        </div>
      </VCardItem>
    </VCard>

    <!-- Menu Information -->
    <VCard
      class="mb-6"
      elevation="1"
    >
      <VCardItem>
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="tabler-info-circle"
            class="me-2"
            color="primary"
          />
          Informasi Menu
        </VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <div class="info-item">
              <label>Nama Menu</label>
              <p>{{ menuStore.selectedMenu.name }}</p>
            </div>
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="info-item">
              <label>Urutan</label>
              <VChip
                size="small"
                variant="outlined"
                color="secondary"
              >
                #{{ menuStore.selectedMenu.sortOrder }}
              </VChip>
            </div>
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="info-item">
              <label>Menu ID</label>
              <p class="font-family-monospace text-caption">
                {{ menuStore.selectedMenu.menuId }}
              </p>
            </div>
          </VCol>
        </VRow>

        <VRow class="mt-4">
          <VCol cols="12">
            <div class="info-item">
              <label>Harga per Tipe Order</label>
              <div class="d-flex gap-2 flex-wrap">
                <VChip
                  color="success"
                  variant="tonal"
                  prepend-icon="tabler-utensils"
                >
                  Dine In: {{ formatCurrency(menuStore.selectedMenu.priceDineIn) }}
                </VChip>
                <VChip
                  color="warning"
                  variant="tonal"
                  prepend-icon="tabler-package"
                >
                  Take Away: {{ formatCurrency(menuStore.selectedMenu.priceTakeAway) }}
                </VChip>
                <VChip
                  color="info"
                  variant="tonal"
                  prepend-icon="tabler-device-mobile"
                >
                  Online: {{ formatCurrency(menuStore.selectedMenu.priceOnlineOrder) }}
                </VChip>
              </div>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Menu Items Section -->
    <VCard elevation="1">
      <VCardItem>
        <VCardTitle class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon
              icon="tabler-list"
              class="me-2"
              color="primary"
            />
            <span>Menu Items</span>
            <VChip
              v-if="menuItemStore.data.length > 0"
              size="small"
              color="primary"
              variant="tonal"
              class="ms-2"
            >
              {{ menuItemStore.data.length }} items
            </VChip>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            variant="elevated"
            @click="showAddItemDialog = true"
          >
            Tambah Item
          </VBtn>
        </VCardTitle>
      </VCardItem>
      <VCardText>
        <!-- Toolbar -->
        <VRow class="mb-4">
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="menuItemStore.requestQuery.search"
              placeholder="Cari menu item..."
              prepend-inner-icon="tabler-search"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="menuItemStore.applyFilter()"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
            class="text-end"
          >
            <VBtn
              color="success"
              variant="outlined"
              prepend-icon="tabler-download"
              :loading="menuItemStore.isLoadingExport"
              @click="menuItemStore.exportData()"
            >
              Export Items
            </VBtn>
          </VCol>
        </VRow>

        <!-- Menu Items Table -->
        <VDataTableServer
          v-model:items-per-page="menuItemStore.requestQuery.perPage"
          v-model:page="menuItemStore.requestQuery.page"
          v-model:sort-by="itemSortBy"
          :headers="itemHeaders"
          :items="menuItemStore.data"
          :items-length="menuItemStore.paginateData.total || 0"
          :loading="menuItemStore.isLoadingFetchData"
          item-value="menuItemId"
          show-current-page
          loading-text="Memuat menu items..."
          class="elevation-0"
          @update:options="loadMenuItems"
        >
          <!-- Item -->
          <template #item.itemId="{ item }">
            <div class="d-flex align-center">
              <VAvatar
                size="32"
                color="primary"
                class="me-3"
              >
                <VIcon
                  :icon="item.isKitchenItem ? 'tabler-chef-hat' : 'tabler-package'"
                  size="16"
                />
              </VAvatar>
              <div>
                <div class="text-body-1 font-weight-medium">
                  {{ getItemName(item.itemId) }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  ID: {{ item.menuItemId.slice(-8) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Type -->
          <template #item.type="{ item }">
            <div class="d-flex gap-1 flex-wrap">
              <VChip
                v-if="item.isKitchenItem"
                size="x-small"
                color="info"
                variant="tonal"
                prepend-icon="tabler-chef-hat"
              >
                Kitchen Item
              </VChip>
              <VChip
                v-if="item.isToppingOnly"
                size="x-small"
                color="warning"
                variant="tonal"
                prepend-icon="tabler-star"
              >
                Topping Only
              </VChip>
              <VChip
                v-if="!item.isKitchenItem && !item.isToppingOnly"
                size="x-small"
                color="secondary"
                variant="tonal"
                prepend-icon="tabler-package"
              >
                Regular Item
              </VChip>
            </div>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <VChip
              size="small"
              :color="item.isActive ? 'success' : 'error'"
              variant="flat"
              :prepend-icon="item.isActive ? 'tabler-check' : 'tabler-x'"
            >
              {{ item.isActive ? 'Aktif' : 'Tidak Aktif' }}
            </VChip>
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

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <VTooltip text="Edit Item">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    icon="tabler-edit"
                    size="small"
                    variant="tonal"
                    color="warning"
                    @click="editMenuItem(item)"
                  />
                </template>
              </VTooltip>

              <VTooltip text="Hapus Item">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    icon="tabler-trash"
                    size="small"
                    variant="tonal"
                    color="error"
                    :loading="menuItemStore.isLoadingDelete"
                    @click="menuItemStore.onDeleteMenuItem(item)"
                  />
                </template>
              </VTooltip>
            </div>
          </template>

          <!-- No Data -->
          <template #no-data>
            <div class="text-center py-12">
              <VIcon
                icon="tabler-list-x"
                size="64"
                color="disabled"
                class="mb-4"
              />
              <h3 class="text-h6 text-disabled mb-2">
                Belum ada menu item
              </h3>
              <p class="text-body-2 text-disabled mb-6">
                Tambahkan item pertama untuk menu ini agar dapat dijual
              </p>
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                variant="elevated"
                @click="showAddItemDialog = true"
              >
                Tambah Item Pertama
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
                Memuat menu items...
              </div>
            </div>
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>

    <!-- Add/Edit Menu Item Dialog -->
    <VDialog
      v-model="showAddItemDialog"
      max-width="800px"
      persistent
    >
      <VCard>
        <VCardItem>
          <VCardTitle class="d-flex align-center">
            <VIcon
              :icon="editingItem ? 'tabler-edit' : 'tabler-plus'"
              class="me-2"
              :color="editingItem ? 'warning' : 'primary'"
            />
            {{ editingItem ? 'Edit Menu Item' : 'Tambah Menu Item' }}
          </VCardTitle>
        </VCardItem>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VAutocomplete
                v-model="menuItemStore.form.itemId"
                :items="availableItems"
                item-title="name"
                item-value="itemId"
                label="Pilih Item"
                placeholder="Ketik untuk mencari item..."
                variant="outlined"
                :error-messages="menuItemStore.formErrors.itemId"
                :loading="itemStore.isLoadingFetchData"
                clearable
                required
                prepend-inner-icon="tabler-search"
              >
                <template #item="{ props, item }">
                  <VListItem v-bind="props">
                    <template #prepend>
                      <VAvatar
                        size="32"
                        color="primary"
                      >
                        <VIcon
                          :icon="item.raw.type === 'finished' ? 'tabler-chef-hat' : 'tabler-package'"
                          size="16"
                        />
                      </VAvatar>
                    </template>
                    <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
                    <VListItemSubtitle>
                      <div class="d-flex gap-1">
                        <VChip
                          size="x-small"
                          :color="item.raw.type === 'finished' ? 'success' : 'primary'"
                          variant="tonal"
                        >
                          {{ item.raw.type === 'finished' ? 'Kitchen Item' : 'Regular Item' }}
                        </VChip>
                        <VChip
                          v-if="item.raw.isTopping"
                          size="x-small"
                          color="warning"
                          variant="tonal"
                        >
                          Topping
                        </VChip>
                      </div>
                    </VListItemSubtitle>
                  </VListItem>
                </template>
              </VAutocomplete>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="menuItemStore.form.isKitchenItem"
                label="Kitchen Item"
                color="primary"
                hide-details
                prepend-icon="tabler-chef-hat"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="menuItemStore.form.isToppingOnly"
                label="Topping Only"
                color="primary"
                hide-details
                prepend-icon="tabler-star"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="menuItemStore.form.isActive"
                label="Aktif"
                color="primary"
                hide-details
                prepend-icon="tabler-check"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.number="menuItemStore.form.sortOrder"
                label="Urutan"
                variant="outlined"
                type="number"
                min="1"
                :error-messages="menuItemStore.formErrors.sortOrder"
                prepend-inner-icon="tabler-sort-ascending"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            prepend-icon="tabler-x"
            @click="closeItemDialog"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            variant="elevated"
            :prepend-icon="editingItem ? 'tabler-check' : 'tabler-plus'"
            :loading="editingItem ? menuItemStore.isLoadingUpdate : menuItemStore.isLoadingCreate"
            @click="handleItemSubmit"
          >
            {{ editingItem ? 'Perbarui' : 'Tambah' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
  <div>
    <!-- Page Header -->
    <VCard class="mb-6">
      <VCardItem>
        <div class="d-flex align-center justify-space-between">
          <div>
            <VCardTitle class="text-2xl font-weight-bold">
              {{ menuStore.selectedMenu.name || 'Menu Detail' }}
            </VCardTitle>
            <VCardSubtitle>
              Kelola menu dan item menu
            </VCardSubtitle>
          </div>
          <div class="d-flex gap-2">
            <VBtn
              color="warning"
              variant="outlined"
              prepend-icon="mdi-pencil"
              :to="{ name: 'sales-menus-menu-id-edit', params: { menuId: route.params.menuId } }"
            >
              Edit Menu
            </VBtn>
            <VBtn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              :to="{ name: 'sales-menus' }"
            >
              Kembali
            </VBtn>
          </div>
        </div>
      </VCardItem>
    </VCard>

    <!-- Menu Information -->
    <VCard class="mb-6">
      <VCardTitle>Informasi Menu</VCardTitle>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <div class="text-body-2 text-medium-emphasis mb-1">
              Nama Menu
            </div>
            <div class="text-body-1 font-weight-medium">
              {{ menuStore.selectedMenu.name }}
            </div>
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="text-body-2 text-medium-emphasis mb-1">
              Urutan
            </div>
            <VChip
              size="small"
              variant="outlined"
            >
              {{ menuStore.selectedMenu.sortOrder }}
            </VChip>
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="text-body-2 text-medium-emphasis mb-1">
              Menu ID
            </div>
            <div class="text-body-2 font-family-monospace">
              {{ menuStore.selectedMenu.menuId }}
            </div>
          </VCol>
        </VRow>

        <VRow class="mt-4">
          <VCol cols="12">
            <div class="text-body-2 text-medium-emphasis mb-2">
              Harga per Tipe Order
            </div>
            <div class="d-flex gap-4">
              <VChip
                color="success"
                variant="tonal"
              >
                Dine In: {{ formatCurrency(menuStore.selectedMenu.priceDineIn) }}
              </VChip>
              <VChip
                color="warning"
                variant="tonal"
              >
                Take Away: {{ formatCurrency(menuStore.selectedMenu.priceTakeAway) }}
              </VChip>
              <VChip
                color="info"
                variant="tonal"
              >
                Online: {{ formatCurrency(menuStore.selectedMenu.priceOnlineOrder) }}
              </VChip>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Menu Items Section -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>Menu Items</span>
        <VBtn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showAddItemDialog = true"
        >
          Tambah Item
        </VBtn>
      </VCardTitle>
      <VCardText>
        <!-- Toolbar -->
        <VRow class="mb-4">
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="menuItemStore.requestQuery.search"
              placeholder="Cari menu item..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="menuItemStore.applyFilter()"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
            class="text-end"
          >
            <VBtn
              color="success"
              variant="outlined"
              prepend-icon="mdi-download"
              :loading="menuItemStore.isLoadingExport"
              @click="menuItemStore.exportData()"
            >
              Export Items
            </VBtn>
          </VCol>
        </VRow>

        <!-- Menu Items Table -->
        <VDataTableServer
          v-model:items-per-page="menuItemStore.requestQuery.perPage"
          v-model:page="menuItemStore.requestQuery.page"
          v-model:sort-by="itemSortBy"
          :headers="itemHeaders"
          :items="menuItemStore.data"
          :items-length="menuItemStore.paginateData.total || 0"
          :loading="menuItemStore.isLoadingFetchData"
          item-value="menuItemId"
          show-current-page
          @update:options="loadMenuItems"
        >
          <!-- Item ID -->
          <template #item.itemId="{ item }">
            <div>
              <div class="text-body-1 font-weight-medium">
                {{ item.itemId }}
              </div>
              <div class="text-caption text-medium-emphasis">
                ID: {{ item.menuItemId.slice(-8) }}
              </div>
            </div>
          </template>

          <!-- Price -->
          <template #item.price="{ item }">
            <VChip
              color="success"
              variant="tonal"
              size="small"
            >
              {{ formatCurrency(item.price) }}
            </VChip>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <VTooltip text="Edit Item">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="warning"
                    @click="editMenuItem(item)"
                  />
                </template>
              </VTooltip>

              <VTooltip text="Hapus Item">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="menuItemStore.onDeleteMenuItem(item)"
                  />
                </template>
              </VTooltip>
            </div>
          </template>

          <!-- No Data -->
          <template #no-data>
            <div class="text-center py-8">
              <VIcon
                icon="mdi-food-off"
                size="64"
                class="text-disabled mb-4"
              />
              <div class="text-h6 text-disabled mb-2">
                Belum ada menu item
              </div>
              <div class="text-body-2 text-disabled mb-4">
                Tambahkan item pertama untuk menu ini
              </div>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="showAddItemDialog = true"
              >
                Tambah Item Pertama
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </VCardText>
    </VCard>

    <!-- Add/Edit Menu Item Dialog -->
    <VDialog
      v-model="showAddItemDialog"
      max-width="600px"
      persistent
    >
      <VCard>
        <VCardTitle>
          {{ editingItem ? 'Edit Menu Item' : 'Tambah Menu Item' }}
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="menuItemStore.form.itemId"
                label="Item ID"
                placeholder="Masukkan ID item"
                variant="outlined"
                :error-messages="menuItemStore.formErrors.itemId"
                required
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="menuItemStore.form.isKitchenItem"
                label="Kitchen Item"
                color="primary"
                hide-details
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="menuItemStore.form.isToppingOnly"
                label="Topping Only"
                color="primary"
                hide-details
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="menuItemStore.form.isActive"
                label="Aktif"
                color="primary"
                hide-details
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.number="menuItemStore.form.sortOrder"
                label="Urutan"
                variant="outlined"
                type="number"
                :error-messages="menuItemStore.formErrors.sortOrder"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="closeItemDialog"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            :loading="editingItem ? menuItemStore.isLoadingUpdate : menuItemStore.isLoadingCreate"
            @click="handleItemSubmit"
          >
            {{ editingItem ? 'Perbarui' : 'Tambah' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss" scoped>
.info-item {
  margin-block-end: 1rem;

  label {
    display: block;
    color: rgb(var(--v-theme-on-surface));
    font-size: 0.875rem;
    font-weight: 500;
    margin-block-end: 0.25rem;
  }

  p {
    margin: 0;
    color: rgb(var(--v-theme-on-surface));
    font-size: 1rem;
    font-weight: 500;
  }
}
</style>
