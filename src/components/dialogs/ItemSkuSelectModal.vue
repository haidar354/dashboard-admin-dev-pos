<script setup lang="ts">
import { useItemSkuStore } from '@/stores/product/itemSkuStore'
import type { ItemSkuView } from '@/types/models/product/item'

interface Props {
  modelValue: boolean
  outletId: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', item: ItemSkuView[]): void
}

const props = withDefaults(defineProps<Props>(), {
})

const emit = defineEmits<Emits>()

const itemSkuStore = useItemSkuStore()

const { paginateData, isLoadingFetchData, requestQuery }
  = storeToRefs(itemSkuStore)

const search = ref('')
const selectedItems = ref<ItemSkuView[]>([])

const headers = [
  { title: 'Kode SKU', key: 'code', width: '15%', sortable: true },
  { title: 'Nama Produk', key: 'displayName', width: '35%', sortable: true },
  {
    title: 'Kategori',
    key: 'item.category.name',
    width: '20%',
    sortable: true,
  },
  {
    title: 'Harga Jual',
    key: 'price',
    width: '20%',
    align: 'end' as const,
    sortable: true,
  },
] as const

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

watch(
  search,
  customDebounce((newValue: string) => {
    requestQuery.value.search = newValue
    requestQuery.value.page = 1
  }, 400),
)

const fetchData = async () => {
  await itemSkuStore.fetchPaginate({
    include: ['item', 'item.category', 'price'],
    filter: {
      outletId: props.outletId,
    },
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const getPrice = (item: ItemSkuView) => {
  return item.price?.price || 0
}

const handleConfirm = () => {
  if (selectedItems.value.length > 0) {
    emit('select', selectedItems.value)
    selectedItems.value = []
  }
  isOpen.value = false
}

const handleClose = () => {
  selectedItems.value = []
  isOpen.value = false
}

watch(isOpen, newValue => {
  if (newValue) {
    fetchData()
  }
  else {
    search.value = ''
    requestQuery.value.page = 1
    selectedItems.value = []
  }
})

// Refetch when outletId changes
watch(
  () => props.outletId,
  () => {
    if (isOpen.value)
      fetchData()
  },
)
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="900"
    scrollable
  >
    <DialogCloseBtn
      :disabled="isLoadingFetchData"
      @click="handleClose"
    />

    <VCard title="Pilih Produk">
      <VDivider class="mt-4" />
      <VCardText>
        <VRow class="mb-2 d-flex justify-end">
          <VCol
            cols="12"
            md="6"
            lg="4"
          >
            <VTextField
              v-model="search"
              placeholder="Cari berdasarkan nama, kode SKU, atau barcode..."
              prepend-inner-icon="tabler-search"
              hide-details
              clearable
            />
          </VCol>
        </VRow>

        <VDataTableServer
          v-model="selectedItems"
          :headers="headers"
          :items="paginateData.data"
          :loading="isLoadingFetchData"
          :items-length="paginateData.meta?.total || 0"
          :items-per-page="requestQuery.perPage"
          show-select
          :return-object="true"
          item-value="itemSkuId"
          hover
          @update:page="requestQuery.page = $event"
        >
          <!-- Code Column -->
          <template #item.code="{ item }">
            <div class="font-weight-medium">
              {{ item.code || item.barcode || "-" }}
            </div>
          </template>

          <!-- Product Name Column -->
          <template #item.displayName="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.displayName }}
              </div>
              <div
                v-if="item.item?.description"
                class="text-caption text-disabled"
              >
                {{ item.item.description }}
              </div>
            </div>
          </template>

          <!-- Category Column -->
          <template #item.item.category.name="{ item }">
            <VChip
              v-if="item.item?.category?.name"
              size="small"
              variant="tonal"
            >
              {{ item.item.category.name }}
            </VChip>
            <span
              v-else
              class="text-disabled"
            >-</span>
          </template>

          <!-- Price Column -->
          <template #item.price="{ item }">
            <div class="text-end font-weight-medium">
              {{ formatCurrency(getPrice(item)) }}
            </div>
          </template>

          <!-- Loading State -->
          <template #loading>
            <VSkeletonLoader type="table-row@5" />
          </template>

          <!-- No Data State -->
          <template #no-data>
            <div class="text-center py-8">
              <VIcon
                icon="tabler-package-off"
                size="48"
                color="disabled"
                class="mb-2"
              />
              <div class="text-body-1 text-disabled mb-1">
                Tidak ada produk ditemukan
              </div>
              <div class="text-caption text-disabled">
                {{
                  search
                    ? "Coba ubah kata kunci pencarian"
                    : "Belum ada produk yang tersedia"
                }}
              </div>
            </div>
          </template>

          <!-- Pagination -->
          <template #bottom>
            <VDivider />
            <div class="d-flex align-center justify-space-between pa-4">
              <div class="text-body-2 text-disabled">
                Menampilkan {{ paginateData.meta?.from || 0 }} -
                {{ paginateData.meta?.to || 0 }} dari
                {{ paginateData.meta?.total || 0 }} produk
              </div>
              <VPagination
                v-model="requestQuery.page"
                :length="paginateData.meta?.lastPage || 0"
                :total-visible="5"
                size="small"
              />
            </div>
          </template>
        </VDataTableServer>
      </VCardText>

      <VDivider />
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          variant="outlined"
          @click="handleClose"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="selectedItems.length === 0"
          @click="handleConfirm"
        >
          Pilih
          {{ selectedItems.length > 0 ? `(${selectedItems.length})` : "" }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">
// Minimal styling - let Vuetify handle most of it
</style>
