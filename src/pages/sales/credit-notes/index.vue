<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { useCreditNoteStore } from '@/stores/sales/creditNoteStore'
import { CreditNoteStatus } from '@/types/models/sales/credit-note'
import { formatCurrency, translateStatus } from '@/utils/common'

definePage({
  meta: {
    name: 'Credit Notes',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const creditNoteStore = useCreditNoteStore()
const { paginateData, isLoadingFetchData, requestQuery } = storeToRefs(creditNoteStore)

const search = ref('')

const headers = [
  { title: 'Nomor', key: 'creditNoteNumber', sortable: true },
  { title: 'Tanggal', key: 'creditNoteDate', sortable: true },
  { title: 'Pelanggan', key: 'customer.name' },
  { title: 'Jumlah', key: 'amount', align: 'end', sortable: true },
  { title: 'Terpakai', key: 'usedAmount', align: 'end', sortable: true },
  { title: 'Status', key: 'status' },
  { title: 'Aksi', key: 'actions', sortable: false, align: 'end' },
]

const statusOptions = [
  { title: 'Semua', value: undefined },
  { title: translateStatus(CreditNoteStatus.DRAFT), value: CreditNoteStatus.DRAFT },
  { title: translateStatus(CreditNoteStatus.APPROVED), value: CreditNoteStatus.APPROVED },
  { title: translateStatus(CreditNoteStatus.USED), value: CreditNoteStatus.USED },
  { title: translateStatus(CreditNoteStatus.VOID), value: CreditNoteStatus.VOID },
]

const statusColor = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'secondary'
    case 'APPROVED': return 'success'
    case 'USED': return 'info'
    case 'VOID': return 'error'
    default: return 'default'
  }
}

// Watchers
watch(search, newValue => {
  requestQuery.value.search = newValue
  requestQuery.value.page = 1
  creditNoteStore.fetchPaginatedData()
})

const onUpdateOptions = (options: any) => {
  requestQuery.value.page = options.page
  requestQuery.value.perPage = options.itemsPerPage
  if (options.sortBy?.length > 0)
    creditNoteStore.onSortBy(options.sortBy)
  else
    creditNoteStore.fetchPaginatedData()
}

onMounted(() => {
  creditNoteStore.fetchPaginatedData()
})
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center py-4">
        <span>Daftar Nota Kredit</span>
        <VSpacer />
        <VBtn
          prepend-icon="tabler-plus"
          to="/sales/credit-notes/create"
        >
          Buat Nota Kredit
        </VBtn>
      </VCardTitle>

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
              v-model="search"
              class="ms-0 ms-sm-3 mt-3 mt-sm-0 flex-1-1-100 flex-sm-fill"
              placeholder="Cari nomor nota kredit atau nama pelanggan..."
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
        :items="paginateData.data"
        :items-length="paginateData.meta?.total || 0"
        :loading="isLoadingFetchData"
        :items-per-page="requestQuery.perPage"
        class="text-no-wrap"
        @update:options="onUpdateOptions"
      >
        <template #item.creditNoteDate="{ item }">
          {{ dayjs(item.creditNoteDate).format('DD MMM YYYY') }}
        </template>

        <template #item.customer.name="{ item }">
          {{ item.customer?.name || '-' }}
        </template>

        <template #item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>

        <template #item.usedAmount="{ item }">
          {{ formatCurrency(item.usedAmount) }}
        </template>

        <template #item.status="{ item }">
          <VChip
            :color="statusColor(item.status)"
            size="small"
            label
            class="text-uppercase"
          >
            {{ translateStatus(item.status) }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            color="default"
            size="x-small"
            :to="`/sales/credit-notes/${item.creditNoteId}`"
          >
            <VIcon
              icon="tabler-eye"
              size="22"
            />
          </VBtn>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
