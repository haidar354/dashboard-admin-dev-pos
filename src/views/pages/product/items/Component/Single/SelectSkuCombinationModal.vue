<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{ modelValue: boolean; items: any[] | any }>()
const emit = defineEmits(['update:modelValue', 'add'])

const show = ref<boolean>(props.modelValue)

watch(() => props.modelValue, v => (show.value = v))
watch(show, v => emit('update:modelValue', v))

const headers = [
  { title: 'No', key: 'index', width: 60 },
  { title: 'Kombinasi', key: 'combination' },
  { title: 'Kode SKU', key: 'code', width: 220 },
]

// Normalize items prop: support plain array or a Ref/computed
const itemsList = computed<any[]>(() => {
  const p: any = (props as any).items
  if (!p)
    return []

  // If it's a ref/computed
  if (p && typeof p === 'object' && 'value' in p)
    return p.value || []

  return Array.isArray(p) ? p : []
})

const selectedRows = ref<any[]>([])

const close = () => {
  selectedRows.value = []
  show.value = false
}

const add = () => {
  emit('add', selectedRows.value)
  close()
}
</script>

<template>
  <VDialog
    v-model="show"
    max-width="900"
  >
    <VCard>
      <VCardTitle class="d-flex align-center">
        <div>Pilih Kombinasi SKU yang Belum Ada</div>
        <VSpacer />
        <VBtn
          icon
          @click="close"
        >
          <VIcon>tabler-x</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VDataTable
          v-model="selectedRows"
          :items="itemsList"
          :headers="headers"
          item-key="tempId"
          item-value="tempId"
          :return-object="true"
          show-select
        >
          <template #item.combination="{ item }">
            {{ item.displayName }}
          </template>
        </VDataTable>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          text
          @click="close"
        >
          Batal
        </VBtn>
        <VBtn
          :disabled="!selectedRows.length"
          color="primary"
          @click="add"
        >
          Tambah ({{ selectedRows.length }})
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.v-data-table .v-data-table__checkbox { width: 48px }
</style>
