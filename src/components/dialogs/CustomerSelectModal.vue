<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import {
  type VDataTable,
} from 'vuetify/lib/components/index.mjs'
import type { Customer } from '@/types/models/sales/customer'
import { useCustomerStore } from '@/stores/sales/customerStore'

interface Emit {
  (e: 'update:dialog', value: boolean): void
  (e: 'update:modelValue', value: Customer | undefined): void
  (e: 'update:selectedId', value: string | undefined): void
  (e: 'itemSelected', value: Customer | undefined): void
}

const props = defineProps<{
  modelValue?: Customer | undefined
  value?: Customer | undefined
  dialog?: boolean
  label?: string
  placeholder?: string
  hint?: string
  persistentPlaceholder?: boolean
  persistentHint?: boolean
}>()

const emits = defineEmits<Emit>()

type ReadonlyHeaders = VDataTable['$props']['headers']
const store = useCustomerStore()
const { paginateData, isLoadingFetchData } = storeToRefs(store)

const isDialogOpen = ref<boolean>(false)
const search = ref('')
const selected = ref<Customer[] | undefined>(undefined)
const selectedSingle = ref<Customer | undefined>(undefined)

const items = computed(() => paginateData.value.data || [])

const selectedCustomerName = computed(() => {
  if (props.modelValue && isDialogOpen.value === false)
    return props.modelValue.name
  if (selectedSingle.value)
    return selectedSingle.value.name

  return ''
})

const headers: ReadonlyHeaders = [
  { title: 'NO', key: 'index', align: 'start', width: '5%', sortable: false },
  { title: 'Nama', key: 'name', align: 'start' },
  { title: 'Email', key: 'email', align: 'start' },
  { title: 'Telepon', key: 'phone', align: 'start' },
  { title: 'Kota', key: 'city', align: 'start' },
  { title: 'Tipe', key: 'customerType', align: 'center', sortable: false },

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
  emits('update:selectedId', selectedSingle.value?.customerId)
  close()
}

watch(() => props.modelValue, v => {
  if (v) {
    const find = items.value.find(i => i.customerId === v.customerId)
    if (find) {
      selected.value = [find]

      selectedSingle.value = find
    }
    else {
      selected.value = undefined
      selectedSingle.value = undefined
    }
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
          :model-value="selectedCustomerName"
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
      <VCard>
        <VCardTitle>
          Pilih Pelanggan
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model="search"
            append-icon="tabler-search"
            label="Cari pelanggan"
            density="compact"
          />

          <VDataTable
            v-model="selected"
            :headers="headers"
            :items="items"
            :loading="isLoadingFetchData"
            item-value="customerId"
            show-select
            select-strategy="single"
            return-object
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
                  {{ item.email || item.phone || '' }}
                </div>
              </div>
            </template>
            <template #item.city="{ item }">
              <div>
                {{ item?.city?.name || '-' }}
              </div>
            </template>
          </VDataTable>
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
