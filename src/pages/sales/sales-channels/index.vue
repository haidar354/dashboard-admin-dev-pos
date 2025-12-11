<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { SalesChannel } from '@/types/models/sales/salesChannel'
import { useSalesChannelStore } from '@/stores/sales/salesChannelStore'

definePage({
  meta: {
    name: 'Sales Channels',
    rules: [
      { action: 'manage', subject: 'default' },
    ],
  },
})

const router = useRouter()
const store = useSalesChannelStore()
const { data: channels, isLoadingFetchData } = storeToRefs(store)

const showModal = ref(false)
const editing = ref<SalesChannel | null>(null)

const form = ref<Omit<SalesChannel, 'salesChannelId'>>({
  code: '',
  name: '',
  type: 'POS',
  fulfillment: '',
  vendor: null,
  isActive: true,
  description: '',
})

function openCreate() {
  editing.value = null
  form.value = {
    code: '',
    name: '',
    type: 'POS',
    fulfillment: '',
    vendor: null,
    isActive: true,
    description: '',
  }
  showModal.value = true
}

function openEdit(item: SalesChannel) {
  editing.value = item
  form.value = {
    code: item.code,
    name: item.name,
    type: item.type,
    fulfillment: item.fulfillment,
    vendor: item.vendor ?? null,
    isActive: item.isActive,
    description: item.description ?? '',
  }
  showModal.value = true
}

async function save() {
  if (editing.value && editing.value.salesChannelId)
    await store.updateChannel(editing.value.salesChannelId, form.value)

  else
    await store.createChannel(form.value)

  showModal.value = false
}

async function remove(id?: string) {
  if (!id)
    return

  if (!confirm('Hapus channel ini?'))
    return

  await store.deleteChannel(id)
}

onMounted(async () => {
  await store.fetchAllData()
})

const rows = computed(() => channels.value || [])
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h6">
                Sales Channels
              </div>
              <div class="text-caption">
                Manage sales channels (POS, Marketplace, etc.)
              </div>
            </div>
            <div>
              <VBtn
                color="primary"
                @click="openCreate"
              >
                <VIcon
                  icon="tabler-plus"
                  class="me-2"
                />Tambah Channel
              </VBtn>
            </div>
          </VCardTitle>
          <VCardText>
            <VDataTable
              :items="rows"
              :loading="isLoadingFetchData"
            >
              <template #item.actions="{ item }">
                <VBtn
                  variant="text"
                  size="small"
                  @click="openEdit(item)"
                >
                  Edit
                </VBtn>
                <VBtn
                  variant="text"
                  size="small"
                  color="error"
                  @click="remove(item.salesChannelId)"
                >
                  Hapus
                </VBtn>
              </template>
              <template #item.isActive="{ item }">
                <VChip
                  :color="item.isActive ? 'success' : 'secondary'"
                  size="x-small"
                >
                  {{ item.isActive ? 'Aktif' : 'Nonaktif' }}
                </VChip>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VDialog
      v-model="showModal"
      width="600"
    >
      <VCard>
        <VCardTitle>{{ editing ? 'Edit Channel' : 'Tambah Channel' }}</VCardTitle>
        <VCardText>
          <VTextField
            v-model="form.code"
            label="Code"
          />
          <VTextField
            v-model="form.name"
            label="Name"
            class="mt-3"
          />
          <VSelect
            v-model="form.type"
            :items="['POS', 'MARKETPLACE', 'WHOLESALE', 'ONLINE', 'QR', 'KIOSK']"
            label="Type"
            class="mt-3"
          />
          <VTextField
            v-model="form.fulfillment"
            label="Fulfillment"
            class="mt-3"
          />
          <VTextField
            v-model="form.vendor"
            label="Vendor"
            class="mt-3"
          />
          <VSwitch
            v-model="form.isActive"
            label="Active"
            class="mt-3"
          />
          <VTextarea
            v-model="form.description"
            label="Description"
            class="mt-3"
            rows="3"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="showModal = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            @click="save"
          >
            Simpan
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
