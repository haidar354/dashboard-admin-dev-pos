<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import {
  type VDataTable,
} from 'vuetify/lib/components/index.mjs'
import type { SalesChannel } from '@/types/models/sales/salesChannel'
import { useSalesChannelStore } from '@/stores/sales/salesChannelStore'

interface Emit {
  (e: 'update:dialog', value: boolean): void
  (e: 'update:modelValue', value: SalesChannel | undefined): void
  (e: 'update:selectedId', value: string | undefined): void
  (e: 'itemSelected', value: SalesChannel | undefined): void
}

const props = defineProps<{
  modelValue?: SalesChannel | undefined
  value?: SalesChannel | undefined
  dialog?: boolean
  label?: string
  placeholder?: string
  hint?: string
  persistentPlaceholder?: boolean
  persistentHint?: boolean
}>()

const emits = defineEmits<Emit>()

type ReadonlyHeaders = VDataTable['$props']['headers']
const store = useSalesChannelStore()
const { paginateData, isLoadingFetchData, requestQuery } = storeToRefs(store)

const isDialogOpen = ref<boolean>(false)
const search = ref('')
const selected = ref<SalesChannel[] | undefined>(undefined)
const selectedSingle = ref<SalesChannel | undefined>(undefined)

const items = computed(() => paginateData.value.data || [])

const selectedSalesChannelName = computed(() => {
  if (props.modelValue && isDialogOpen.value === false)
    return props.modelValue.name
  if (selectedSingle.value)
    return selectedSingle.value.name

  return ''
})

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nama', key: 'name', align: 'start' },
  { title: 'Tipe', key: 'type', align: 'center', sortable: false },
  { title: 'Keterangan', key: 'description', align: 'start' },

]

async function fetchCustomers(q = '') {
  await store.fetchPaginatedData({ search: q })
}

function close() {
  emits('update:dialog', false)
  isDialogOpen.value = false
}

function confirm() {
  selectedSingle.value = selected.value?.[0]
  emits('itemSelected', selectedSingle.value)
  emits('update:modelValue', selectedSingle.value)
  emits('update:selectedId', selectedSingle.value?.salesChannelId)
  close()
}

watch(() => props.modelValue, v => {
  if (v) {
    const find = items.value.find(i => i.salesChannelId === v.salesChannelId)
    if (find)
      selected.value = [find]

    else
      selected.value = undefined
  }
  console.log('props.modelValue changed:', v, selected.value)
})

watch(() => isDialogOpen.value, v => {
  if (v)
    fetchCustomers()
})

watch(
  () => search.value,
  customDebounce(() => {
    fetchCustomers(search.value)
  }, 500),
)

watch(
  () => requestQuery.value,
  v => {
    if (v)
      fetchCustomers()
  },
  { deep: true },
)

onMounted(() => {
  if (isDialogOpen.value)
    fetchCustomers()
})
</script>

<template>
  <VDialog
    v-model="isDialogOpen"
    width="800"
  >
    <template #activator>
      <slot name="activator">
        <VTextField
          :model-value="selectedSalesChannelName"
          readonly
          :label="label"
          :placeholder="placeholder"
          :hint="hint"
          :persistent-placeholder="persistentPlaceholder"
          :persistent-hint="persistentHint"
          @click="isDialogOpen = true"
        />
      </slot>
    </template>
    <template #default>
      <DialogCloseBtn @click="close" />
      <VCard>
        <VCardTitle>
          Pilih Saluran Penjualan
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model="search"
            append-icon="tabler-search"
            label="Cari saluran penjualan"
            density="compact"
          />
          <VDataTableServer
            v-model="selected"
            v-model:items-per-page="requestQuery.perPage"
            v-model:page="requestQuery.page"
            :headers="headers"
            :items="items"
            :loading="isLoadingFetchData"
            item-value="customerId"
            show-select
            select-strategy="single"
            return-object
            :items-length="paginateData.meta?.total || 0"
          >
            <template #item.index="{ index }">
              <div>
                {{ (paginateData.meta?.from || 0) + index }}
              </div>
            </template>
            <template #item.name="{ item }">
              <div>
                <div class="font-weight-medium">
                  {{ item.name }}
                </div>
                <div class="text-caption">
                  {{ item.fulfillment || '' }}
                </div>
              </div>
            </template>
          </VDataTableServer>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="isDialogOpen = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            @click="confirm"
          >
            Pilih
          </VBtn>
        </VCardActions>
      </VCard>
    </template>
  </VDialog>
</template>
