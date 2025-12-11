<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { VDataTable } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import MenuCategoryReorderDialog from '@/views/pages/sales/menu-categories/MenuCategoryReorderDialog.vue'
import MenuCategoryDialog from '@/views/pages/sales/menu-categories/MenuCategoryDialog.vue'
import { customDebounce } from '@/utils/common'
import { useMenuCategoryStore } from '@/stores/menuCategoryStore'

definePage({
  meta: {
    name: 'Kategori Menu',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const menuCategoryStore = useMenuCategoryStore()

const {
  data,
  isLoadingFetchData,
  requestQuery,
  isFilterVisible,
  additionalFilter,
} = storeToRefs(menuCategoryStore)

const { smAndDown, mdAndDown } = useDisplay()
const search = ref('')
const viewMode = ref<'grid' | 'table'>('grid')
const showReorderDialog = ref(false)

// Computed properties
const filteredData = computed(() => {
  if (!search.value)
    return data.value

  return data.value.filter(category =>
    category.name.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const gridCols = computed(() => {
  if (smAndDown.value)
    return 1
  if (mdAndDown.value)
    return 2

  return 3
})

type ReadonlyHeaders = VDataTable['$props']['headers']

// Table headers
const tableHeaders: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '60px', sortable: false },
  { title: 'Nama Kategori', key: 'name', align: 'start' },
  { title: 'Urutan', key: 'sortOrder', align: 'center', width: '100px' },
  { title: 'Status POS', key: 'showInPOS', align: 'center', width: '120px' },
  { title: 'Dibuat', key: 'createdAt', align: 'center', width: '150px' },
  { title: 'Aksi', key: 'actions', align: 'center', width: '120px', sortable: false },
]

// Watchers
watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

watch(
  () => requestQuery,
  async () => {
    await menuCategoryStore.fetchData()
  },
  { deep: true },
)

// Lifecycle
onMounted(async () => {
  await menuCategoryStore.fetchData()
})

// Methods
const getStatusColor = (showInPOS: boolean) => {
  return showInPOS ? 'success' : 'secondary'
}

const getStatusText = (showInPOS: boolean) => {
  return showInPOS ? 'Aktif' : 'Nonaktif'
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('DD/MM/YYYY')
}

const onCreateCategory = () => {
  menuCategoryStore.openCreateDialog()
}

const onEditCategory = (category: any) => {
  menuCategoryStore.openEditDialog(category)
}

const onDeleteCategory = (category: any) => {
  menuCategoryStore.onDeleteMenuCategory(category)
}

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}

const resetFilter = () => {
  menuCategoryStore.resetFilter()
}

const applyFilter = () => {
  menuCategoryStore.applyFilter()
}
</script>

<template>
  <div>
    <!-- Header Card -->
    <VCard class="mb-6">
      <VCardText>
        <div class="d-flex flex-column flex-md-row justify-space-between align-center gap-4">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary mb-2">
              <VIcon
                icon="tabler-category"
                class="me-3"
              />
              Kategori Menu
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Kelola kategori menu untuk mengorganisir produk Anda dengan lebih baik
            </p>
          </div>
          <div class="d-flex gap-2">
            <VBtn
              v-if="data.length > 1"
              color="secondary"
              variant="outlined"
              prepend-icon="tabler-arrows-sort"
              @click="showReorderDialog = true"
            >
              Atur Urutan
            </VBtn>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="onCreateCategory"
            >
              Tambah Kategori
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Controls Card -->
    <VCard class="mb-6">
      <VCardText>
        <VRow align="center">
          <!-- Search -->
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="search"
              placeholder="Cari kategori menu..."
              prepend-inner-icon="tabler-search"
              clearable
              hide-details
            />
          </VCol>

          <!-- View Mode Toggle -->
          <VCol
            cols="12"
            md="4"
            class="d-flex justify-center"
          >
            <VBtnToggle
              v-model="viewMode"
              mandatory
              variant="outlined"
              divided
            >
              <VTooltip text="Tampilan Grid">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    value="grid"
                    icon="tabler-layout-grid"
                    size="small"
                  />
                </template>
              </VTooltip>
              <VTooltip text="Tampilan Tabel">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    value="table"
                    icon="tabler-table"
                    size="small"
                  />
                </template>
              </VTooltip>
            </VBtnToggle>
          </VCol>

          <!-- Filter Toggle -->
          <VCol
            cols="12"
            md="4"
            class="d-flex justify-end"
          >
            <VBtn
              variant="outlined"
              prepend-icon="tabler-filter"
              @click="toggleFilter"
            >
              Filter
            </VBtn>
          </VCol>
        </VRow>

        <!-- Filter Section -->
        <VExpandTransition>
          <VCard
            v-if="isFilterVisible"
            variant="outlined"
            class="mt-4"
          >
            <VCardItem>
              <VCardTitle>Filter Kategori</VCardTitle>
            </VCardItem>
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppSelect
                    v-model="additionalFilter.showInPOS"
                    :items="[
                      { title: 'Semua Status', value: '' },
                      { title: 'Aktif di POS', value: 'true' },
                      { title: 'Nonaktif di POS', value: 'false' },
                    ]"
                    label="Status POS"
                    clearable
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                  class="d-flex align-end gap-2"
                >
                  <VBtn
                    color="error"
                    variant="outlined"
                    @click="resetFilter"
                  >
                    Reset
                  </VBtn>
                  <VBtn
                    color="primary"
                    @click="applyFilter"
                  >
                    Terapkan
                  </VBtn>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VExpandTransition>
      </VCardText>
    </VCard>

    <!-- Content -->
    <div v-if="isLoadingFetchData">
      <VRow>
        <VCol
          v-for="n in 6"
          :key="n"
          :cols="12 / gridCols"
        >
          <VSkeletonLoader
            type="card"
            height="200"
          />
        </VCol>
      </VRow>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="filteredData.length === 0">
        <VCard>
          <VCardText class="text-center py-12">
            <VIcon
              icon="tabler-category-off"
              size="64"
              color="disabled"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              Belum ada kategori menu
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Tambahkan kategori pertama untuk mulai mengorganisir menu Anda
            </p>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="onCreateCategory"
            >
              Tambah Kategori Pertama
            </VBtn>
          </VCardText>
        </VCard>
      </div>

      <VRow v-else>
        <VCol
          v-for="(category, index) in filteredData"
          :key="index"
          :cols="12 / gridCols"
        >
          <VCard
            class="h-100 category-card"
            hover
          >
            <VCardItem>
              <div class="d-flex justify-space-between align-start">
                <div class="flex-grow-1">
                  <VCardTitle class="text-wrap pb-2">
                    {{ category.name }}
                  </VCardTitle>
                  <div class="d-flex align-center gap-2 mb-2">
                    <VChip
                      :color="getStatusColor(category.showInPOS)"
                      size="small"
                      variant="tonal"
                    >
                      <VIcon
                        :icon="category.showInPOS ? 'tabler-eye' : 'tabler-eye-off'"
                        size="14"
                        class="me-1"
                      />
                      {{ getStatusText(category.showInPOS) }}
                    </VChip>
                    <VChip
                      color="primary"
                      size="small"
                      variant="outlined"
                    >
                      Urutan: {{ category.sortOrder }}
                    </VChip>
                  </div>
                </div>
                <VMenu>
                  <template #activator="{ props }">
                    <VBtn
                      icon="tabler-dots-vertical"
                      variant="text"
                      size="small"
                      v-bind="props"
                    />
                  </template>
                  <VList>
                    <VListItem
                      prepend-icon="tabler-edit"
                      title="Edit"
                      @click="onEditCategory(category)"
                    />
                    <VListItem
                      prepend-icon="tabler-trash"
                      title="Hapus"
                      @click="onDeleteCategory(category)"
                    />
                  </VList>
                </VMenu>
              </div>
            </VCardItem>

            <VDivider />

            <VCardText>
              <div class="d-flex justify-space-between align-center text-caption text-medium-emphasis">
                <span>Dibuat: {{ formatDate(category.createdAt) }}</span>
                <span>ID: {{ category.menuCategoryId.slice(-8) }}</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- Table View -->
    <VCard v-else>
      <VDataTable
        :headers="tableHeaders"
        :items="filteredData"
        :loading="isLoadingFetchData"
        loading-text="Memuat data..."
        class="text-no-wrap"
        :items-per-page="requestQuery.perPage"
        :sort-by="[{ key: requestQuery.orderField || '', order: requestQuery.orderDirection || 'asc' }]"
        @update:sort-by="menuCategoryStore.onSortBy"
      >
        <template #item.index="{ index }">
          <span class="font-weight-medium">{{ index + 1 }}</span>
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              color="primary"
              variant="tonal"
              size="32"
              class="me-3"
            >
              <VIcon icon="tabler-category" />
            </VAvatar>
            <div>
              <div class="font-weight-medium">
                {{ item.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                ID: {{ item.menuCategoryId.slice(-8) }}
              </div>
            </div>
          </div>
        </template>

        <template #item.sortOrder="{ item }">
          <VChip
            color="primary"
            variant="outlined"
            size="small"
          >
            {{ item.sortOrder }}
          </VChip>
        </template>

        <template #item.showInPOS="{ item }">
          <VChip
            :color="getStatusColor(item.showInPOS)"
            size="small"
            variant="tonal"
          >
            <VIcon
              :icon="item.showInPOS ? 'tabler-eye' : 'tabler-eye-off'"
              size="14"
              class="me-1"
            />
            {{ getStatusText(item.showInPOS) }}
          </VChip>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1 justify-center">
            <VTooltip
              location="top"
              text="Edit Kategori"
            >
              <template #activator="{ props }">
                <VBtn
                  v-bind="props"
                  icon
                  variant="text"
                  size="small"
                  color="warning"
                  @click="onEditCategory(item)"
                >
                  <VIcon icon="tabler-edit" />
                </VBtn>
              </template>
            </VTooltip>

            <VTooltip
              location="top"
              text="Hapus Kategori"
            >
              <template #activator="{ props }">
                <VBtn
                  v-bind="props"
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="onDeleteCategory(item)"
                >
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </template>
            </VTooltip>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8">
            <VIcon
              icon="tabler-category-off"
              size="48"
              color="disabled"
              class="mb-4"
            />
            <div class="text-h6 mb-2">
              Belum ada kategori menu
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Tambahkan kategori pertama untuk mulai mengorganisir menu Anda
            </div>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="onCreateCategory"
            >
              Tambah Kategori Pertama
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Statistics Footer -->
    <VCard class="mt-6">
      <VCardText>
        <VRow>
          <VCol
            cols="6"
            md="3"
          >
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-primary">
                {{ data.length }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Total Kategori
              </div>
            </div>
          </VCol>
          <VCol
            cols="6"
            md="3"
          >
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-success">
                {{ data.filter(c => c.showInPOS).length }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Aktif di POS
              </div>
            </div>
          </VCol>
          <VCol
            cols="6"
            md="3"
          >
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-warning">
                {{ data.filter(c => !c.showInPOS).length }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Nonaktif di POS
              </div>
            </div>
          </VCol>
          <VCol
            cols="6"
            md="3"
          >
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-info">
                {{ Math.max(...data.map(c => c.sortOrder), 0) }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Urutan Tertinggi
              </div>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Dialogs -->
    <MenuCategoryDialog />
    <MenuCategoryReorderDialog v-model="showReorderDialog" />
  </div>
</template>

<style lang="scss" scoped>
.category-card {
  border: 2px solid transparent;
  transition: all 0.2s ease-in-out;
}

.category-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.15);
  transform: translateY(-2px);
}

.v-btn-toggle {
  border-radius: 8px;
}
</style>
