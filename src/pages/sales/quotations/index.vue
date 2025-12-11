<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import type { VDataTable } from 'vuetify/lib/components/index.mjs'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useCursorTargetMenu } from '@/composables/utils/useCursorMenu'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import { useSalesQuotationStore } from '@/stores/sales/salesQuotationStore'
import type { RequestQueryModel } from '@/types/api/request'
import type { SalesQuotation } from '@/types/models/sales/quotation'

definePage({
  meta: {
    name: 'Penawaran Penjualan (SQ)',
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

const quotationStore = useSalesQuotationStore()
const { smAndDown } = useDisplay()

const {
  paginateData,
  isLoadingFetchData,
  requestQuery,
  isFilterVisible,
  additionalFilter,
  isLoadingDelete,
} = storeToRefs(quotationStore)

const search = ref('')

const statusOptions = [
  { title: 'Draft', value: 'draft', color: 'secondary' },
  { title: 'Terkirim', value: 'sent', color: 'info' },
  { title: 'Diterima', value: 'accepted', color: 'success' },
  { title: 'Ditolak', value: 'rejected', color: 'error' },
  { title: 'Dikonversi', value: 'converted', color: 'primary' },
  { title: 'Kadaluarsa', value: 'expired', color: 'warning' },
]

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  {
    title: 'Nomor Penawaran (SQ)',
    key: 'quotationNumber',
    align: 'start',
    width: '15%',
  },
  { title: 'Tanggal', key: 'quotationDate', align: 'start', width: '12%' },
  {
    title: 'Pelanggan',
    key: 'customerName',
    align: 'start',
    width: '20%',
    sortable: false,
  },
  {
    title: 'Total',
    key: 'totalAmount',
    align: 'end',
    width: '15%',
    sortable: false,
  },
  {
    title: 'Status',
    key: 'status',
    align: 'center',
    width: '12%',
    sortable: false,
  },
  {
    title: 'Aksi',
    key: 'actions',
    align: 'center',
    width: '8%',
    sortable: false,
  },
]

watch(
  search,
  customDebounce((newValue: string) => {
    requestQuery.value.search = newValue
  }, 500),
)

const fetchPaginatedData = async (payload: RequestQueryModel = {}) => {
  const params = {
    ...payload,
    include: ['customer', 'createdBy'],
  }

  await quotationStore.fetchPaginatedData(params)
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
  return (
    statusOptions.find(option => option.value === status) || statusOptions[0]
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

async function handleDelete(item: any) {
  await quotationStore.onDeleteItem(item).then(() => {
    fetchPaginatedData()
  })
}

const applyFilter = () => {
  fetchPaginatedData(additionalFilter.value)
}

const selectedQuotation = ref<SalesQuotation | null>(null)
const { isOpen, target, openFromEvent, onAfterLeave } = useCursorTargetMenu()

const onRowClick = (item: SalesQuotation, event: MouseEvent | PointerEvent) => {
  selectedQuotation.value = item
  openFromEvent(event)
}

const handleConvert = async (item: SalesQuotation) => {
  const isConfirmed = await useConfirmDialogStore().openGenericDialog(
    `Yakin ingin mengkonversi penawaran (SQ) "${item.quotationNumber}" ini menjadi Pesanan Penjualan (SO)?`,
    {
      title: 'Konfirmasi Konversi',
      confirmText: 'Ya, Konversi',
      cancelText: 'Batal',
      color: 'primary',
      icon: 'tabler-file-export',
    },
  )

  if (!isConfirmed)
    return

  try {
    await quotationStore.convertToSalesOrder(item.quotationId)
    await fetchPaginatedData()
  }
  catch (error) {
    // Error handling sudah di store
  }
}
</script>

<template>
  <div>
    <VCard elevation="2">
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          Daftar Penawaran Penjualan (SQ)
        </span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end">
            <VBtn
              v-if="$can('manage', 'default')"
              color="primary"
              variant="elevated"
              :to="{ name: 'sales-quotations-create' }"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Penawaran (SQ)
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />

      <!-- Search and Filter Section -->
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
              placeholder="Cari nomor penawaran (SQ) / pelanggan..."
              append-inner-icon="tabler-search"
              single-line
              hide-details
              dense
              outlined
            />
          </VCol>
        </VRow>
      </VCardText>

      <!-- Filter Section -->
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
            <VForm @submit.prevent="applyFilter">
              <VRow>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Tanggal Dari</label>
                  <VTextField
                    v-model="additionalFilter.dateFrom"
                    type="date"
                    variant="outlined"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="3"
                >
                  <label class="v-label text-body-2 text-high-emphasis">Tanggal Sampai</label>
                  <VTextField
                    v-model="additionalFilter.dateTo"
                    type="date"
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
                    @click="quotationStore.resetFilter()"
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

      <!-- Data Table -->
      <VDataTableServer
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoadingFetchData"
        loading-text="Memuat data penawaran (SQ)..."
        class="text-no-wrap elevation-1"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        :sort-by="[
          {
            key: requestQuery.orderField || '',
            order: requestQuery.orderDirection || 'desc',
          },
        ]"
        @update:page="requestQuery.page = $event"
        @update:sort-by="quotationStore.onSortBy"
        @click:row="(_event: any, { item }: { item: SalesQuotation }) => onRowClick(item, _event)"
      >
        <template #item.index="{ index }">
          <span class="text-body-2 font-weight-medium">{{
            (paginateData.meta?.from || 0) + index
          }}</span>
        </template>

        <template #item.quotationDate="{ item }">
          <div class="text-body-2">
            <div>{{ dayjs(item.quotationDate).format("DD-MM-YYYY") }}</div>
          </div>
        </template>

        <template #item.totalAmount="{ item }">
          <div class="text-end font-weight-medium">
            {{ formatCurrency(item.totalAmount) }}
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="getStatusConfig(item.status).color"
            size="small"
            variant="flat"
          >
            {{ getStatusConfig(item.status).title }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon="tabler-dots-vertical"
            variant="text"
            @click="onRowClick(item, $event)"
            @contextmenu.prevent="openFromEvent"
          />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-basket-off"
              size="64"
              color="disabled"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              Tidak ada data penawaran (SQ)
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Belum ada penawaran (SQ) yang ditambahkan atau sesuai dengan
              filter pencarian
            </p>
            <VBtn
              v-if="$can('manage', 'default')"
              color="primary"
              variant="elevated"
              :to="{ name: 'sales-quotations-create' }"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Penawaran (SQ) Pertama
            </VBtn>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex flex-wrap justify-space-between align-center mt-2">
              <div class="text-body-2 text-medium-emphasis">
                Menampilkan {{ paginateData.meta?.from || 0 }} -
                {{ paginateData.meta?.to || 0 }} dari
                {{ paginateData.meta?.total || 0 }}
                penawaran (SQ)
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
          v-if="selectedQuotation"
          class="py-2"
        >
          <VListItem
            title="Detail"
            prepend-icon="tabler-eye"
            @click="
              $router.push(`/sales/quotations/${selectedQuotation.quotationId}`)
            "
          />
          <VListItem
            title="Download PDF"
            prepend-icon="tabler-file-download"
            :loading="quotationStore.isLoadingDownload"
            @click="quotationStore.downloadPdf(selectedQuotation)"
          />
          <template
            v-if="
              selectedQuotation.status === 'draft'
                || selectedQuotation.status === 'sent'
            "
          >
            <VListItem
              title="Konversi ke SO"
              prepend-icon="tabler-file-export"
              :loading="quotationStore.isLoadingConvert"
              @click="handleConvert(selectedQuotation)"
            />
          </template>
          <VListItem
            v-if="selectedQuotation.status === 'draft'"
            title="Edit"
            prepend-icon="tabler-edit"
            @click="
              $router.push(
                `/sales/quotations/${selectedQuotation.quotationId}/edit`,
              )
            "
          />
          <VDivider class="my-1" />
          <VListItem
            v-if="selectedQuotation.status === 'draft'"
            title="Hapus"
            prepend-icon="tabler-trash"
            class="text-error"
            :loading="isLoadingDelete"
            @click="handleDelete(selectedQuotation)"
          />
        </VList>
      </VMenu>
    </VCard>
  </div>
</template>
