<script setup lang="ts">
import { useMenuCategoryStore } from '@/stores/menuCategoryStore'
import { useMenuStore } from '@/stores/menuStore'
import { useOutletStore } from '@/stores/outletStore'
import { useItemStore } from '@/stores/product/itemStore'
import type { MenuItemForm, MenuOutletForm } from '@/types/models/menu'

// Meta
definePage({
  meta: {
    name: 'Tambah Menu',
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
const outletStore = useOutletStore()
const itemStore = useItemStore()

// Router
const router = useRouter()

// Reactive data
const isLoading = ref(false)
const isMultiOutlet = ref(false)
const selectedOutlets = ref<string[]>([])

// Single outlet pricing (for single outlet mode)
const singleOutletPricing = ref({
  priceDineIn: 0,
  priceTakeAway: 0,
  priceOnlineOrder: 0,
  menuCategoryId: '',
})

// Global pricing (for multi outlet mode)
const globalPricing = ref({
  priceDineIn: 0,
  priceTakeAway: 0,
  priceOnlineOrder: 0,
})

// Item selection dialog
const isItemSelectionDialogOpen = ref(false)
const selectedItemForMenu = ref('')

// Table headers for outlet selection
const outletHeaders = [
  { title: 'Outlet', key: 'name' },
  { title: 'Alamat', key: 'address' },
  { title: 'Kategori Menu', key: 'menuCategoryId' },
  { title: 'Dine In', key: 'priceDineIn' },
  { title: 'Take Away', key: 'priceTakeAway' },
  { title: 'Online Order', key: 'priceOnlineOrder' },
]

// Computed
const outlets = computed(() => outletStore.data)
const menuCategories = computed(() => menuCategoryStore.data)

const availableItems = computed(() =>
  itemStore.data.filter(item =>
    item.isSellable
    && item.isActive
    && !menuStore.form.items.some(menuItem => menuItem.itemId === item.itemId),
  ),
)

const { selectedSidebarOutlet } = storeToRefs(outletStore)

const isFormValid = computed(() => {
  if (isMultiOutlet.value) {
    return menuStore.form.name.trim() !== ''
           && menuStore.form.sortOrder > 0
           && selectedOutlets.value.length > 0
  }
  else {
    return menuStore.form.name.trim() !== ''
           && menuStore.form.sortOrder > 0
           && selectedSidebarOutlet.value?.outletId
           && singleOutletPricing.value.menuCategoryId
  }
})

const outletTableData = computed(() => {
  return selectedOutlets.value.map(outletId => {
    const outlet = outlets.value.find(o => o.outletId === outletId)
    const config = getOutletConfig(outletId)

    return {
      outletId,
      name: outlet?.name || 'Unknown',
      address: outlet?.address || '-',
      menuCategoryId: config?.menuCategoryId || '',
      priceDineIn: config?.priceDineIn || 0,
      priceTakeAway: config?.priceTakeAway || 0,
      priceOnlineOrder: config?.priceOnlineOrder || 0,
    }
  })
})

// Methods
function getOutletConfig(outletId: string): MenuOutletForm | undefined {
  return menuStore.form.outlets.find(outlet => outlet.outletId === outletId)
}

function getItemName(itemId: string): string {
  return itemStore.data.find(item => item.itemId === itemId)?.name || itemId
}

function updateOutletConfig(outletId: string, field: keyof MenuOutletForm, value: any) {
  const outlet = menuStore.form.outlets.find(outlet => outlet.outletId === outletId)
  if (outlet)
    (outlet as any)[field] = value
}

function syncFormWithMode() {
  menuStore.form.outlets = []

  if (isMultiOutlet.value) {
    // Multi outlet mode - create configs for selected outlets
    selectedOutlets.value.forEach(outletId => {
      const newOutlet: MenuOutletForm = {
        outletId,
        isActive: true,
        menuCategoryId: '',
        priceDineIn: globalPricing.value.priceDineIn,
        priceTakeAway: globalPricing.value.priceTakeAway,
        priceOnlineOrder: globalPricing.value.priceOnlineOrder,
      }

      menuStore.form.outlets.push(newOutlet)
    })
  }
  else {
    // Single outlet mode - use selected sidebar outlet
    if (selectedSidebarOutlet.value?.outletId) {
      const newOutlet: MenuOutletForm = {
        outletId: selectedSidebarOutlet.value.outletId,
        isActive: true,
        menuCategoryId: singleOutletPricing.value.menuCategoryId,
        priceDineIn: singleOutletPricing.value.priceDineIn,
        priceTakeAway: singleOutletPricing.value.priceTakeAway,
        priceOnlineOrder: singleOutletPricing.value.priceOnlineOrder,
      }

      menuStore.form.outlets.push(newOutlet)
    }
  }
}

function updateGlobalPricing() {
  if (isMultiOutlet.value) {
    selectedOutlets.value.forEach(outletId => {
      updateOutletConfig(outletId, 'priceDineIn', globalPricing.value.priceDineIn)
      updateOutletConfig(outletId, 'priceTakeAway', globalPricing.value.priceTakeAway)
      updateOutletConfig(outletId, 'priceOnlineOrder', globalPricing.value.priceOnlineOrder)
    })
  }
}

function updateSingleOutletPricing() {
  if (!isMultiOutlet.value && selectedSidebarOutlet.value?.outletId) {
    updateOutletConfig(selectedSidebarOutlet.value.outletId, 'priceDineIn', singleOutletPricing.value.priceDineIn)
    updateOutletConfig(selectedSidebarOutlet.value.outletId, 'priceTakeAway', singleOutletPricing.value.priceTakeAway)
    updateOutletConfig(selectedSidebarOutlet.value.outletId, 'priceOnlineOrder', singleOutletPricing.value.priceOnlineOrder)
    updateOutletConfig(selectedSidebarOutlet.value.outletId, 'menuCategoryId', singleOutletPricing.value.menuCategoryId)
  }
}

async function handleSubmit() {
  try {
    isLoading.value = true
    syncFormWithMode()

    const createdMenu = await menuStore.create()
    if (createdMenu) {
      await router.push({
        name: 'sales-menus-menu-id',
        params: { menuId: createdMenu.menuId },
      })
    }
  }
  catch (error) {
    console.error('Error creating menu:', error)
  }
  finally {
    isLoading.value = false
  }
}

function handleCancel() {
  router.push({ name: 'sales-menus' })
}

// Menu item management
function addMenuItem() {
  isItemSelectionDialogOpen.value = true
}

function confirmAddMenuItem() {
  if (selectedItemForMenu.value) {
    const selectedItem = itemStore.data.find(item => item.itemId === selectedItemForMenu.value)
    if (selectedItem) {
      const newItem: MenuItemForm = {
        itemId: selectedItem.itemId,
        isActive: true,
        isToppingOnly: selectedItem.isTopping,
        isKitchenItem: selectedItem.type === 'finished',
      }

      menuStore.form.items.push(newItem)
      isItemSelectionDialogOpen.value = false
      selectedItemForMenu.value = ''
    }
  }
}

function cancelAddMenuItem() {
  isItemSelectionDialogOpen.value = false
  selectedItemForMenu.value = ''
}

function toggleMenuItemStatus(index: number) {
  menuStore.form.items[index].isActive = !menuStore.form.items[index].isActive
}

function removeMenuItem(index: number) {
  menuStore.form.items.splice(index, 1)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Watch for mode changes
watch(isMultiOutlet, newValue => {
  if (newValue) {
    // Switching to multi outlet - initialize with current sidebar outlet if available
    if (selectedSidebarOutlet.value?.outletId)
      selectedOutlets.value = [selectedSidebarOutlet.value.outletId]
  }
  else {
    // Switching to single outlet - clear selected outlets
    selectedOutlets.value = []
  }
  syncFormWithMode()
})

watch(selectedOutlets, () => {
  if (isMultiOutlet.value)
    syncFormWithMode()
}, { deep: true })

watch(globalPricing, () => {
  updateGlobalPricing()
}, { deep: true })

watch(singleOutletPricing, () => {
  updateSingleOutletPricing()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  // Reset form and fetch data
  menuStore.resetForm()

  await Promise.all([
    outletStore.fetchAllData(),
    menuCategoryStore.fetchAllData(),
    itemStore.fetchAllData(),
  ])

  // Set default sort order
  if (menuStore.form.sortOrder === 0)
    menuStore.form.sortOrder = 1

  // Initialize with single outlet mode using sidebar outlet
  isMultiOutlet.value = false
  if (selectedSidebarOutlet.value?.outletId)
    syncFormWithMode()
})
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
                icon="tabler-plus"
                class="me-3"
                color="success"
              />
              Tambah Menu Baru
            </VCardTitle>
            <VCardSubtitle class="text-body-1">
              Buat menu baru untuk outlet Anda
            </VCardSubtitle>
          </div>
          <VBtn
            color="secondary"
            variant="outlined"
            prepend-icon="tabler-arrow-left"
            @click="handleCancel"
          >
            Kembali
          </VBtn>
        </div>
      </VCardItem>
    </VCard>

    <!-- Form -->
    <VCard elevation="1">
      <VCardText>
        <VForm @submit.prevent="handleSubmit">
          <!-- Basic Information -->
          <div class="mb-6">
            <h3 class="text-h6 mb-4 d-flex align-center">
              <VIcon
                icon="tabler-info-circle"
                class="me-2"
                color="primary"
              />
              Informasi Dasar
            </h3>
            <VRow>
              <VCol
                cols="12"
                md="8"
              >
                <VTextField
                  v-model="menuStore.form.name"
                  label="Nama Menu"
                  placeholder="Masukkan nama menu..."
                  variant="outlined"
                  :error-messages="menuStore.formErrors.name"
                  prepend-inner-icon="tabler-chef-hat"
                  required
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  v-model.number="menuStore.form.sortOrder"
                  label="Urutan Tampil"
                  placeholder="1"
                  variant="outlined"
                  type="number"
                  min="1"
                  :error-messages="menuStore.formErrors.sortOrder"
                  prepend-inner-icon="tabler-sort-ascending"
                  required
                />
              </VCol>
            </VRow>
          </div>

          <!-- Outlet Configuration -->
          <VDivider class="my-6" />

          <div class="mb-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 d-flex align-center">
                <VIcon
                  icon="tabler-building-store"
                  class="me-2"
                  color="primary"
                />
                Konfigurasi Outlet
              </h3>
              <VSwitch
                v-model="isMultiOutlet"
                color="primary"
                :label="isMultiOutlet ? 'Multi Outlet' : 'Single Outlet'"
                hide-details
              />
            </div>

            <!-- Single Outlet Mode -->
            <div v-if="!isMultiOutlet">
              <VAlert
                color="info"
                variant="tonal"
                icon="tabler-info-circle"
                class="mb-4"
              >
                <VAlertTitle>Mode Single Outlet</VAlertTitle>
                Menu ini akan diterapkan pada outlet: <strong>{{ selectedSidebarOutlet?.name || 'Tidak ada outlet dipilih' }}</strong>
              </VAlert>

              <VCard
                variant="tonal"
                color="primary"
                class="mb-4"
              >
                <VCardText>
                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VSelect
                        v-model="singleOutletPricing.menuCategoryId"
                        :items="menuCategories"
                        item-title="name"
                        item-value="menuCategoryId"
                        label="Kategori Menu"
                        variant="outlined"
                        prepend-inner-icon="tabler-category"
                        required
                      />
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>

              <!-- Single Outlet Pricing -->
              <VCard class="mb-4">
                <VCardText>
                  <h4 class="text-subtitle-1 mb-4 d-flex align-center">
                    <VIcon
                      icon="tabler-currency-dollar"
                      class="me-2"
                      color="success"
                    />
                    Harga Menu
                  </h4>
                  <VRow>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <VTextField
                        v-model.number="singleOutletPricing.priceDineIn"
                        label="Harga Dine In"
                        variant="outlined"
                        type="number"
                        min="0"
                        step="1000"
                        prepend-inner-icon="tabler-utensils"
                        suffix="IDR"
                        required
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <VTextField
                        v-model.number="singleOutletPricing.priceTakeAway"
                        label="Harga Take Away"
                        variant="outlined"
                        type="number"
                        min="0"
                        step="1000"
                        prepend-inner-icon="tabler-package"
                        suffix="IDR"
                        required
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <VTextField
                        v-model.number="singleOutletPricing.priceOnlineOrder"
                        label="Harga Online Order"
                        variant="outlined"
                        type="number"
                        min="0"
                        step="1000"
                        prepend-inner-icon="tabler-device-mobile"
                        suffix="IDR"
                        required
                      />
                    </VCol>

                    <!-- Price Preview -->
                    <VCol
                      v-if="singleOutletPricing.priceDineIn || singleOutletPricing.priceTakeAway || singleOutletPricing.priceOnlineOrder"
                      cols="12"
                    >
                      <VAlert
                        color="success"
                        variant="tonal"
                        icon="tabler-eye"
                        class="mb-4"
                      >
                        <VAlertTitle>Preview Harga</VAlertTitle>
                        <div class="d-flex gap-2 flex-wrap mt-2">
                          <VChip
                            color="success"
                            variant="flat"
                            prepend-icon="tabler-utensils"
                          >
                            Dine In: {{ formatCurrency(singleOutletPricing.priceDineIn || 0) }}
                          </VChip>
                          <VChip
                            color="warning"
                            variant="flat"
                            prepend-icon="tabler-package"
                          >
                            Take Away: {{ formatCurrency(singleOutletPricing.priceTakeAway || 0) }}
                          </VChip>
                          <VChip
                            color="info"
                            variant="flat"
                            prepend-icon="tabler-device-mobile"
                          >
                            Online: {{ formatCurrency(singleOutletPricing.priceOnlineOrder || 0) }}
                          </VChip>
                        </div>
                      </VAlert>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </div>

            <!-- Multi Outlet Mode -->
            <div v-else>
              <VAlert
                color="warning"
                variant="tonal"
                icon="tabler-alert-triangle"
                class="mb-4"
              >
                <VAlertTitle>Mode Multi Outlet</VAlertTitle>
                Pilih outlet yang akan menerapkan menu ini. Harga akan sama untuk semua outlet yang dipilih.
              </VAlert>

              <!-- Outlet Selection -->
              <VCard class="mb-4">
                <VCardText>
                  <h4 class="text-subtitle-1 mb-4 d-flex align-center">
                    <VIcon
                      icon="tabler-building-store"
                      class="me-2"
                      color="primary"
                    />
                    Pilih Outlet
                  </h4>
                  <VSelect
                    v-model="selectedOutlets"
                    :items="outlets"
                    item-title="name"
                    item-value="outletId"
                    label="Pilih Outlet"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                    prepend-inner-icon="tabler-building-store"
                    placeholder="Pilih satu atau lebih outlet..."
                  >
                    <template #item="{ props, item }">
                      <VListItem v-bind="props">
                        <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
                        <VListItemSubtitle>
                          <VIcon
                            icon="tabler-map-pin"
                            size="16"
                            class="me-1"
                          />
                          {{ item.raw.address || 'Alamat tidak tersedia' }}
                        </VListItemSubtitle>
                      </VListItem>
                    </template>
                  </VSelect>
                </VCardText>
              </VCard>

              <!-- Global Pricing for Multi Outlet -->
              <VCard class="mb-4">
                <VCardText>
                  <h4 class="text-subtitle-1 mb-4 d-flex align-center">
                    <VIcon
                      icon="tabler-currency-dollar"
                      class="me-2"
                      color="success"
                    />
                    Harga Global
                  </h4>
                  <VRow>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <VTextField
                        v-model.number="globalPricing.priceDineIn"
                        label="Harga Dine In"
                        variant="outlined"
                        type="number"
                        min="0"
                        step="1000"
                        prepend-inner-icon="tabler-utensils"
                        suffix="IDR"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <VTextField
                        v-model.number="globalPricing.priceTakeAway"
                        label="Harga Take Away"
                        variant="outlined"
                        type="number"
                        min="0"
                        step="1000"
                        prepend-inner-icon="tabler-package"
                        suffix="IDR"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <VTextField
                        v-model.number="globalPricing.priceOnlineOrder"
                        label="Harga Online Order"
                        variant="outlined"
                        type="number"
                        min="0"
                        step="1000"
                        prepend-inner-icon="tabler-device-mobile"
                        suffix="IDR"
                      />
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>

              <!-- Outlet Configuration Table -->
              <VCard v-if="selectedOutlets.length > 0">
                <VCardText>
                  <h4 class="text-subtitle-1 mb-4 d-flex align-center">
                    <VIcon
                      icon="tabler-settings"
                      class="me-2"
                      color="primary"
                    />
                    Konfigurasi per Outlet
                  </h4>
                  <VDataTable
                    :headers="outletHeaders"
                    :items="outletTableData"
                    item-key="outletId"
                    class="elevation-1"
                    hide-default-footer
                    disable-pagination
                  >
                    <template #item.name="{ item }">
                      <div class="d-flex align-center">
                        <VAvatar
                          color="primary"
                          size="32"
                          class="me-3"
                        >
                          <VIcon
                            icon="tabler-building-store"
                            color="white"
                            size="16"
                          />
                        </VAvatar>
                        <div>
                          <div class="font-weight-medium">
                            {{ item.name }}
                          </div>
                        </div>
                      </div>
                    </template>

                    <template #item.address="{ item }">
                      <div class="text-body-2">
                        <VIcon
                          icon="tabler-map-pin"
                          size="16"
                          class="me-1"
                        />
                        {{ item.address }}
                      </div>
                    </template>

                    <template #item.menuCategoryId="{ item }">
                      <VSelect
                        :model-value="item.menuCategoryId"
                        :items="menuCategories"
                        item-title="name"
                        item-value="menuCategoryId"
                        variant="outlined"
                        density="compact"
                        hide-details
                        placeholder="Pilih kategori"
                        @update:model-value="updateOutletConfig(item.outletId, 'menuCategoryId', $event)"
                      />
                    </template>

                    <template #item.priceDineIn="{ item }">
                      <div class="text-body-2 font-weight-medium">
                        {{ formatCurrency(item.priceDineIn) }}
                      </div>
                    </template>

                    <template #item.priceTakeAway="{ item }">
                      <div class="text-body-2 font-weight-medium">
                        {{ formatCurrency(item.priceTakeAway) }}
                      </div>
                    </template>

                    <template #item.priceOnlineOrder="{ item }">
                      <div class="text-body-2 font-weight-medium">
                        {{ formatCurrency(item.priceOnlineOrder) }}
                      </div>
                    </template>
                  </VDataTable>
                </VCardText>
              </VCard>

              <!-- Empty State for Multi Outlet -->
              <VCard
                v-else
                class="text-center py-8"
              >
                <VCardText>
                  <VIcon
                    icon="tabler-building-store-off"
                    size="64"
                    class="text-disabled mb-4"
                  />
                  <div class="text-h6 text-disabled mb-2">
                    Belum ada outlet dipilih
                  </div>
                  <div class="text-body-2 text-disabled">
                    Pilih outlet yang akan menerapkan menu ini
                  </div>
                </VCardText>
              </VCard>
            </div>
          </div>

          <!-- Menu Items Configuration -->
          <VDivider class="my-6" />

          <div class="mb-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 d-flex align-center">
                <VIcon
                  icon="tabler-chef-hat"
                  class="me-2"
                  color="primary"
                />
                Menu Items
                <VChip
                  color="primary"
                  variant="tonal"
                  size="small"
                  class="ml-2"
                >
                  {{ menuStore.form.items.length }} items
                </VChip>
              </h3>
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                size="small"
                variant="elevated"
                @click="addMenuItem"
              >
                Tambah Item
              </VBtn>
            </div>

            <div
              v-if="menuStore.form.items.length === 0"
              class="text-center py-12"
            >
              <VIcon
                icon="tabler-chef-hat-off"
                size="64"
                class="text-disabled mb-4"
              />
              <div class="text-h6 text-disabled mb-2">
                Belum ada menu item
              </div>
              <div class="text-body-2 text-disabled mb-4">
                Tambahkan item untuk menu ini agar dapat dijual
              </div>
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                variant="elevated"
                @click="addMenuItem"
              >
                Tambah Item Pertama
              </VBtn>
            </div>

            <div v-else>
              <VList class="bg-surface">
                <VListItem
                  v-for="(item, index) in menuStore.form.items"
                  :key="index"
                  class="px-4 py-3 border-b"
                >
                  <template #prepend>
                    <VAvatar
                      :color="item.isActive ? 'success' : 'error'"
                      size="40"
                      class="me-3"
                    >
                      <VIcon
                        :icon="item.isKitchenItem ? 'tabler-chef-hat' : 'tabler-package'"
                        color="white"
                      />
                    </VAvatar>
                  </template>

                  <VListItemTitle class="font-weight-medium">
                    {{ getItemName(item.itemId) }}
                  </VListItemTitle>
                  <VListItemSubtitle>
                    <div class="d-flex gap-1 flex-wrap mt-1">
                      <VChip
                        v-if="item.isToppingOnly"
                        size="x-small"
                        color="warning"
                        variant="tonal"
                      >
                        <VIcon
                          icon="tabler-plus"
                          size="12"
                          class="me-1"
                        />
                        Topping Only
                      </VChip>
                      <VChip
                        v-if="item.isKitchenItem"
                        size="x-small"
                        color="info"
                        variant="tonal"
                      >
                        <VIcon
                          icon="tabler-chef-hat"
                          size="12"
                          class="me-1"
                        />
                        Kitchen Item
                      </VChip>
                      <VChip
                        size="x-small"
                        :color="item.isActive ? 'success' : 'error'"
                        variant="tonal"
                      >
                        <VIcon
                          :icon="item.isActive ? 'tabler-check' : 'tabler-x'"
                          size="12"
                          class="me-1"
                        />
                        {{ item.isActive ? 'Aktif' : 'Tidak Aktif' }}
                      </VChip>
                    </div>
                  </VListItemSubtitle>

                  <template #append>
                    <div class="d-flex gap-1">
                      <VTooltip text="Toggle Status">
                        <template #activator="{ props }">
                          <VBtn
                            v-bind="props"
                            :icon="item.isActive ? 'tabler-eye-off' : 'tabler-eye'"
                            size="small"
                            variant="text"
                            :color="item.isActive ? 'warning' : 'success'"
                            @click="toggleMenuItemStatus(index)"
                          />
                        </template>
                      </VTooltip>
                      <VTooltip text="Hapus Item">
                        <template #activator="{ props }">
                          <VBtn
                            v-bind="props"
                            icon="tabler-trash"
                            size="small"
                            variant="text"
                            color="error"
                            @click="removeMenuItem(index)"
                          />
                        </template>
                      </VTooltip>
                    </div>
                  </template>
                </VListItem>
              </VList>
            </div>
          </div>

          <!-- Form Actions -->
          <VDivider class="my-6" />

          <div class="d-flex justify-end gap-4">
            <VBtn
              color="secondary"
              variant="outlined"
              prepend-icon="tabler-x"
              @click="handleCancel"
            >
              Batal
            </VBtn>
            <VBtn
              type="submit"
              color="primary"
              variant="elevated"
              prepend-icon="tabler-check"
              :loading="isLoading || menuStore.isLoadingCreate"
              :disabled="!isFormValid"
            >
              Simpan Menu
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>

    <!-- Item Selection Dialog -->
    <VDialog
      v-model="isItemSelectionDialogOpen"
      max-width="600"
      persistent
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="tabler-plus"
            class="me-2"
            color="primary"
          />
          Tambah Item ke Menu
        </VCardTitle>

        <VCardText>
          <VAutocomplete
            v-model="selectedItemForMenu"
            :items="availableItems"
            item-title="name"
            item-value="itemId"
            label="Pilih Item"
            variant="outlined"
            placeholder="Ketik untuk mencari item..."
            :loading="itemStore.isLoadingFetchData"
            clearable
            no-data-text="Tidak ada item ditemukan"
            prepend-inner-icon="tabler-search"
          >
            <template #item="{ props, item }">
              <VListItem v-bind="props">
                <template #prepend>
                  <VAvatar
                    :color="item.raw.type === 'finished' ? 'success' : 'primary'"
                    size="32"
                  >
                    <VIcon
                      :icon="item.raw.isTopping ? 'tabler-plus' : 'tabler-package'"
                      color="white"
                      size="16"
                    />
                  </VAvatar>
                </template>
                <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
                <VListItemSubtitle>
                  <div class="d-flex gap-1 mt-1">
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

          <VAlert
            v-if="availableItems.length === 0"
            color="warning"
            variant="tonal"
            icon="tabler-alert-circle"
            class="mt-4"
          >
            <VAlertTitle>Tidak ada item tersedia</VAlertTitle>
            Semua item yang dapat dijual sudah ditambahkan ke menu ini atau tidak ada item aktif.
          </VAlert>
        </VCardText>

        <VCardActions class="px-6 pb-6">
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            prepend-icon="tabler-x"
            @click="cancelAddMenuItem"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            variant="elevated"
            prepend-icon="tabler-check"
            :disabled="!selectedItemForMenu"
            @click="confirmAddMenuItem"
          >
            Tambah ke Menu
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
