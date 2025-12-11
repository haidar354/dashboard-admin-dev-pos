<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  type VDataTable,
  VDataTableServer,
} from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { useCustomerStore } from '@/stores/sales/customerStore'
import type { Customer, CustomerType } from '@/types/models/sales/customer'
import { perPages } from '@/utils/constants'
import { customDebounce } from '@/utils/common'

definePage({
  meta: {
    name: 'Pelanggan (Customer)',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

type ReadonlyHeaders = VDataTable['$props']['headers']
const customerStore = useCustomerStore()

const { paginateData, isLoadingFetchData, requestQuery }
  = storeToRefs(customerStore)

const selectedCustomer = ref<Customer | null>(null)

const { smAndDown } = useDisplay()

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nama', key: 'name', align: 'start' },
  { title: 'Email', key: 'email', align: 'start' },
  { title: 'Telepon', key: 'phone', align: 'start' },
  { title: 'Kota', key: 'city', align: 'start' },
  { title: 'Tipe', key: 'customerType', align: 'center', sortable: false },
  { title: 'Total Belanja', key: 'totalSpending', align: 'end' },
  { title: 'Tanggal Daftar', key: 'createdAt', align: 'start', width: '12%' },
  {
    title: 'Aksi',
    key: 'actions',
    align: 'center',
    width: '10%',
    sortable: false,
  },
]

const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: Customer, event: MouseEvent | PointerEvent) => {
  selectedCustomer.value = item
  openFromEvent(event)
}

watch(
  () => requestQuery.value.search,
  customDebounce(() => {
    customerStore.fetchPaginatedData()
  }, 500),
)

const fetchPaginate = async () => {
  await customerStore.fetchPaginatedData()
}

onMounted(async () => {
  await fetchPaginate()
})

// Re-fetch on pagination changes
watch(
  () => requestQuery.value.page,
  async () => {
    await fetchPaginate()
  },
)

watch(
  () => requestQuery.value.perPage,
  async () => {
    requestQuery.value.page = 1
    await fetchPaginate()
  },
)

const getCustomerTypeColor = (type: CustomerType) => {
  const typeMap: Record<CustomerType, string> = {
    RETAIL: 'default',
    RESELLER: 'info',
    WHOLESALE: 'primary',
    VIP: 'warning',
    CORPORATE: 'success',
  }

  return typeMap[type] || 'default'
}

const getCustomerTypeLabel = (type: CustomerType) => {
  const labelMap: Record<CustomerType, string> = {
    RETAIL: 'Retail',
    RESELLER: 'Reseller',
    WHOLESALE: 'Grosir',
    VIP: 'VIP',
    CORPORATE: 'Corporate',
  }

  return labelMap[type] || type
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount / 100) // Convert from cents
}
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">Pelanggan (Customer)</span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end">
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="$router.push('/sales/customers/create')"
            >
              Tambah Pelanggan
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />

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
              style="max-inline-size: 8rem; min-inline-size: 5rem"
            />
            <VSpacer />

            <AppTextField
              v-model="requestQuery.search"
              class="ms-0 ms-sm-3 mt-3 mt-sm-0 flex-1-1-100 flex-sm-fill"
              placeholder="Cari nama, email, atau telepon pelanggan..."
              append-inner-icon="tabler-search"
              single-line
              hide-details
              dense
              outlined
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDataTableServer
        :headers="headers"
        :items="paginateData.data || []"
        :loading="isLoadingFetchData"
        loading-text="Memuat data..."
        class="text-no-wrap"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        @update:page="requestQuery.page = $event"
      >
        <template #item="{ index, item }">
          <tr
            class="cursor-pointer"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          >
            <td>
              {{
                ((requestQuery.page || 1) - 1) * (requestQuery.perPage || 10)
                  + index
                  + 1
              }}
            </td>
            <td>
              <div class="text-wrap">
                <strong>{{ item.name }}</strong>
                <VChip
                  v-if="item.isMember"
                  size="x-small"
                  color="success"
                  class="ms-2"
                >
                  Member
                </VChip>
              </div>
            </td>
            <td>
              {{ item.email || '-' }}
            </td>
            <td>
              {{ item.phone || '-' }}
            </td>
            <td>
              {{ item.city?.name || item.cityCode || '-' }}
            </td>
            <td class="text-center">
              <VChip
                :color="getCustomerTypeColor(item.customerType)"
                size="small"
                rounded
                class="font-weight-medium"
              >
                {{ getCustomerTypeLabel(item.customerType) }}
              </VChip>
            </td>
            <td class="text-end">
              {{ formatRupiah(item.totalSpending || 0) }}
            </td>
            <td>
              {{ dayjs(item.createdAt).format("DD-MM-YYYY") }}
            </td>
            <td class="text-center">
              <VBtn
                icon="tabler-dots-vertical"
                variant="text"
                @click="onRowClick(item, $event)"
                @contextmenu.prevent="openFromEvent"
              />
            </td>
          </tr>
        </template>

        <!-- No Data -->
        <template #no-data>
          <VAlert
            dense
            color="light-secondary"
          >
            <VIcon>tabler-alert-triangle</VIcon>
            <div>Data Pelanggan tidak tersedia</div>
          </VAlert>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-end mt-2">
              <VPagination
                v-model="requestQuery.page"
                :total-visible="smAndDown ? 3 : 5"
                :length="paginateData.meta?.lastPage || 1"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>

      <VMenu
        v-model="isOpen"
        :target="target"
        location="bottom start"
        location-strategy="connected"
        scroll-strategy="reposition"
        :offset="0"
        :close-on-content-click="true"
        @after-leave="onAfterLeave"
      >
        <VList
          v-if="selectedCustomer"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            @click="
              $router.push(`/sales/customers/${selectedCustomer.customerId}`)
            "
          />
          <VListItem
            title="Edit"
            prepend-icon="tabler-edit"
            @click="
              $router.push(
                `/sales/customers/${selectedCustomer.customerId}/edit`,
              )
            "
          />
          <VDivider class="my-1" />
          <VListItem
            title="Hapus"
            prepend-icon="tabler-trash"
            class="text-error"
            :loading="customerStore.isLoadingDelete"
            @click="async () => {
              if (selectedCustomer) {
                const deleted = await customerStore.onDeleteItem(selectedCustomer)
                if (deleted) fetchPaginate()
              }
            }"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
