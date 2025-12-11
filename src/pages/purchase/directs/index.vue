<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { ref } from 'vue'
import { VAutocomplete, type VDataTable, VDataTableServer } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import { usePurchaseDirectStore } from '@/stores/purchase/purchaseDirectStore'
import { usePurchaseRequestStore } from '@/stores/purchase/purchaseRequestStore'
import { useSupplierStore } from '@/stores/purchase/supplierStore'

definePage({
  meta: {
    name: 'Pembelian Langsung',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

dayjs.locale(id)
type ReadonlyHeaders = VDataTable['$props']['headers']
const purchaseDirectStore = usePurchaseDirectStore()
const outletStore = useOutletSidebarStore()
const supplierStore = useSupplierStore()
const purchaseRequestStore = usePurchaseRequestStore()
const { getSelectedOutletId } = storeToRefs(outletStore)
const search = ref('')

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  isFilterVisible,
  additionalFilter,
  isLoadingDelete,
  isLoadingExport,
} = storeToRefs(purchaseDirectStore)

const {
  data: outlets,
  isLoadingFetchData: isLoadingFetchDataOutlets,
} = storeToRefs(outletStore)

const {
  data: suppliers,
  isLoadingFetchData: isLoadingFetchDataSuppliers,
} = storeToRefs(supplierStore)

const {
  data: purchaseRequests,
  isLoadingFetchData: isLoadingFetchDataPurchaseRequests,
} = storeToRefs(purchaseRequestStore)

const { smAndDown } = useDisplay()

const statusOptions = [
  { title: 'Draft', value: 'DRAFT', color: 'warning' },
  { title: 'Selesai', value: 'COMPLETED', color: 'success' },
  { title: 'Dibatalkan', value: 'CANCELLED', color: 'error' },
]

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Kode', key: 'documentCode', align: 'start', width: '10%', sortable: false },
  { title: 'Outlet', key: 'outlet.name', align: 'start', width: '15%', sortable: false },
  { title: 'Supplier', key: 'supplier.name', align: 'start', width: '15%', sortable: false },
  { title: 'Tanggal Pembelian', key: 'purchasedAt', align: 'start', width: '12%' },
  { title: 'Total Pembelian', key: 'grandTotal', align: 'end', width: '12%', sortable: false },
  { title: 'Status', key: 'status', align: 'center', width: '10%', sortable: false },

  // { title: 'Catatan', key: 'note', align: 'start', width: '15%', sortable: false },
  // { title: 'Dibuat Pada', key: 'createdAt', align: 'start', width: '10%' },
  { title: 'Aksi', key: 'actions', align: 'center', width: '6%', sortable: false },
]

watch(isFilterVisible, (newValue: boolean) => {
  if (newValue) {
    outletStore.fetchAllData()
    supplierStore.fetchAllData()
    purchaseRequestStore.fetchAllData()
  }
})

watch(getSelectedOutletId, (newValue: string | undefined) => {
  additionalFilter.value.outletId = newValue || ''
})

watch(search, customDebounce((newValue: string) => {
  requestQuery.value.search = newValue
}, 500))

const fetchPaginatedData = async () => {
  await purchaseDirectStore.fetchPaginatedData({
    include: ['outlet', 'supplier'],
  })
}

onMounted(async () => {
  await fetchPaginatedData()
})

watch(
  () => requestQuery,
  async () => {
    await fetchPaginatedData()
  },
  { deep: true },
)

function getStatusConfig(status: string) {
  return statusOptions.find(option => option.value === status) || statusOptions[0]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

async function handleStatusChange(item: any, newStatus: 'CANCELLED' | 'COMPLETED') {
  try {
    await purchaseDirectStore.updateStatus(item.purchaseDirectId, newStatus).then(() => {
      const pdFound = paginateData.value.data.find(pd => pd.purchaseDirectId === item.purchaseDirectId)
      if (pdFound)
        pdFound.status = newStatus
    })
  }
  catch (error) {
    console.error('Error updating status:', error)
  }
}

async function handleDelete(item: any) {
  await purchaseDirectStore.onDeleteItem(item).then(() => {
    fetchPaginatedData()
    showToast('Data berhasil dihapus', 'success')
  })
}
</script>

<template>
  <div>
    <!-- Header Section with Loading -->
    <VCard
      class="mb-4"
      elevation="2"
    >
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          <VIcon
            icon="tabler-shopping-cart-plus"
            class="me-2"
            color="primary"
          />
          Data Pembelian Langsung
        </span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end">
            <VBtn
              v-if="$can('manage', 'default')"
              color="primary"
              variant="outlined"
              :loading="isLoadingExport"
              @click="purchaseDirectStore.export()"
            >
              <VIcon
                start
                icon="tabler-screen-share"
              />
              Export
            </VBtn>

            <VBtn
              v-if="$can('manage', 'default')"
              class="ms-2"
              color="primary"
              variant="elevated"
              :to="{
                name: 'purchase-directs-create',
              }"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Data
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />

      <!-- Search and Filter Section with Loading -->
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            class="d-flex flex-row flex-wrap"
          >
            <VAutocomplete
              v-model="requestQuery.perPage"
              :items="perPages"
              hide-details
              dense
              outlined
              style="max-inline-size: 8rem;min-inline-size: 5rem;"
              prepend-inner-icon="tabler-list"
            />
            <VSpacer />

            <VBtn
              variant="outlined"
              append-icon="tabler-filter"
              color="primary"
              @click="isFilterVisible = !isFilterVisible"
            >
              Filter
            </VBtn>

            <AppTextField
              v-model="search"
              class="ms-0 ms-sm-3 mt-3 mt-sm-0 flex-1-1-100 flex-sm-fill"
              placeholder="Cari pembelian langsung..."
              append-inner-icon="tabler-search"
              single-line
              hide-details
              dense
              outlined
            />
          </VCol>
        </VRow>
      </VCardText>

      <!-- Filter Section with Loading -->
      <VExpandTransition>
        <VCard
          v-if="isFilterVisible"
          class="ma-6"
          variant="outlined"
          elevation="1"
        >
          <template #title>
            <div class="d-flex align-center">
              <VIcon
                icon="tabler-filter"
                class="me-2"
                color="primary"
              />
              Filter Tambahan
            </div>
          </template>
          <template #append>
            <div class="mt-n4 me-n2">
              <IconBtn color="disabled">
                <VIcon
                  icon="tabler-x"
                  @click="isFilterVisible = false"
                />
              </IconBtn>
            </div>
          </template>
          <VCardText>
            <VSkeletonLoader
              v-if="isLoadingFetchDataOutlets || isLoadingFetchDataSuppliers || isLoadingFetchDataPurchaseRequests"
              type="list-item-two-line"
              class="mb-4"
            />
            <VForm
              v-else
              @submit.prevent="purchaseDirectStore.applyFilter()"
            >
              <VRow>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Outlet</label>
                  <VAutocomplete
                    v-model="additionalFilter.outletId"
                    :items="outlets"
                    item-title="name"
                    item-value="outletId"
                    prepend-inner-icon="tabler-building-store"
                    :loading="isLoadingFetchDataOutlets"
                    clearable
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Supplier</label>
                  <VAutocomplete
                    v-model="additionalFilter.supplierId"
                    :items="suppliers"
                    item-title="name"
                    item-value="supplierId"
                    prepend-inner-icon="tabler-truck"
                    :loading="isLoadingFetchDataSuppliers"
                    clearable
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Status</label>
                  <VSelect
                    v-model="additionalFilter.status"
                    :items="statusOptions"
                    item-title="title"
                    item-value="value"
                    clearable
                    variant="outlined"
                    prepend-inner-icon="tabler-flag"
                  />
                </VCol>
                <VCol
                  cols="12"
                  class="d-flex justify-end"
                >
                  <VBtn
                    class="me-3"
                    color="error"
                    variant="outlined"
                    append-icon="tabler-reload"
                    @click="purchaseDirectStore.resetFilter()"
                  >
                    Reset
                  </VBtn>
                  <VBtn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    append-icon="tabler-device-floppy"
                  >
                    Terapkan
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VExpandTransition>

      <!-- Data Table with Enhanced Loading -->
      <VDataTableServer
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoadingFetchData"
        loading-text="Memuat data pembelian langsung..."
        class="text-no-wrap elevation-1"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        :sort-by="[{ key: requestQuery.orderField || '', order: requestQuery.orderDirection || 'desc' }]"
        @update:page="requestQuery.page = $event"
        @update:sort-by="purchaseDirectStore.onSortBy"
      >
        <!-- Loading Skeleton for Table -->
        <template #loading>
          <div class="pa-4">
            <VSkeletonLoader
              v-for="n in 5"
              :key="n"
              type="table-row-divider"
              class="mb-2"
            />
          </div>
        </template>

        <template #item.index="{ index }">
          <span class="text-body-2 font-weight-medium">{{ (paginateData.meta?.from || 0) + index }}</span>
        </template>

        <template #item.outlet.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="32"
              color="primary"
              class="me-3"
            >
              <VIcon
                icon="tabler-building-store"
                size="16"
              />
            </VAvatar>
            <div class="text-wrap">
              <div class="font-weight-medium">
                {{ item.outlet?.name }}
              </div>
            </div>
          </div>
        </template>

        <template #item.supplier.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="32"
              color="secondary"
              class="me-3"
            >
              <VIcon
                icon="tabler-truck"
                size="16"
              />
            </VAvatar>
            <div class="text-wrap">
              <div class="font-weight-medium">
                {{ item.supplier?.name || '-' }}
              </div>
            </div>
          </div>
        </template>

        <template #item.purchasedAt="{ item }">
          <div class="text-body-2">
            <div>{{ dayjs(item.purchasedAt).format('DD-MM-YYYY') }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ dayjs(item.purchasedAt).format('HH:mm') }}
            </div>
          </div>
        </template>

        <template #item.grandTotal="{ item }">
          <div class="text-end font-weight-medium">
            {{ formatCurrency(item.grandTotal) }}
          </div>
        </template>

        <template #item.status="{ item }">
          <VMenu offset-y>
            <template #activator="{ props }">
              <VChip
                v-bind="props"
                :color="getStatusConfig(item.status).color"
                size="small"
                variant="flat"
                clickable
              >
                {{ getStatusConfig(item.status).title }}
                <VIcon
                  icon="tabler-chevron-down"
                  size="16"
                  class="ms-1"
                />
              </VChip>
            </template>
            <VList>
              <VListItem
                v-for="status in statusOptions"
                :key="status.value"
                :disabled="item.status === status.value || (item.status === 'COMPLETED' || item.status === 'CANCELLED')"
                @click="handleStatusChange(item, status.value === 'COMPLETED' ? 'COMPLETED' : 'CANCELLED')"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.status === status.value ? 'tabler-check' : 'tabler-circle'"
                    :color="status.color"
                    size="16"
                  />
                </template>
                <VListItemTitle>{{ status.title }}</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
        </template>

        <template #item.note="{ item }">
          <div class="text-wrap">
            {{ item.note || '-' }}
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <div class="text-body-2">
            <div>{{ dayjs(item.createdAt).format('DD-MM-YYYY') }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ dayjs(item.createdAt).format('HH:mm') }}
            </div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center">
            <VTooltip text="Lihat Detail">
              <template #activator="{ props }">
                <IconBtn
                  v-if="$can('manage', 'default')"
                  v-bind="props"
                  :to="{ name: 'purchase-directs-direct-purchase-id', params: { directPurchaseId: item.purchaseDirectId } }"
                  color="primary"
                  variant="tonal"
                  size="small"
                >
                  <VIcon
                    icon="tabler-eye"
                    size="18"
                  />
                </IconBtn>
              </template>
            </VTooltip>

            <!--
              <VTooltip text="Edit Pembelian">
              <template #activator="{ props }">
              <IconBtn
              v-if="$can('manage', 'default') && item.status === 'DRAFT'"
              v-bind="props"
              :to="{
              name: 'purchase-directs-direct-purchase-id-edit',
              params: { directPurchaseId: item.purchaseDirectId },
              }"
              color="warning"
              variant="tonal"
              size="small"
              class="ms-1"
              >
              <VIcon
              icon="tabler-edit"
              size="18"
              />
              </IconBtn>
              </template>
              </VTooltip>
            -->

            <VTooltip text="Hapus Pembelian">
              <template #activator="{ props }">
                <IconBtn
                  v-if="$can('manage', 'default') && item.status === 'DRAFT'"
                  v-bind="props"
                  :loading="isLoadingDelete"
                  color="error"
                  variant="tonal"
                  size="small"
                  class="ms-1"
                  icon="tabler-trash"
                  @click="handleDelete(item)"
                >
                  <VIcon
                    icon="tabler-trash"
                    size="18"
                  />
                </IconBtn>
              </template>
            </VTooltip>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-shopping-cart-off"
              size="64"
              color="disabled"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              Tidak ada data pembelian langsung
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Belum ada pembelian langsung yang ditambahkan atau sesuai dengan filter pencarian
            </p>
            <VBtn
              v-if="$can('manage', 'default')"
              color="primary"
              variant="elevated"
              :to="{ name: 'purchase-directs-create' }"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Pembelian Pertama
            </VBtn>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-space-between align-center mt-2">
              <div class="text-body-2 text-medium-emphasis">
                Menampilkan {{ paginateData.meta?.from || 0 }} - {{ paginateData.meta?.to || 0 }} dari {{ paginateData.meta?.total || 0 }}
                pembelian
              </div>
              <VPagination
                v-model="requestQuery.page"
                :total-visible="smAndDown ? 3 : 5"
                :length="paginateData.meta?.lastPage || 0"
                color="primary"
                variant="elevated"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
