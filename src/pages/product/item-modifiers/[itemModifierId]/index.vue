<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useModifierStore } from '@/stores/product/modifierStore'
import type { ModifierOption } from '@/types/models/product/item-modifier/modifier-option'

type Decimalish = number | string

// ===== stores & state =====
const route = useRoute()
const modifierStore = useModifierStore()
const loading = ref(true)
const error = ref<string | null>(null)
const { selectedModifierGroupDetail: data } = storeToRefs(modifierStore)

const formatRp = (v: Decimalish | undefined) => {
  if (v == null || v === '')
    return '–'
  const n = typeof v === 'string' ? Number(v) : v
  if (!Number.isFinite(n))
    return '–'

  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

const toNum = (v: Decimalish | undefined) => {
  if (v == null || v === '')
    return 0
  const n = typeof v === 'string' ? Number(v) : v

  return Number.isFinite(n) ? n : 0
}

// cost = sum( (qty / conversion) * purchasePrice ), jika kedua angka tersedia
const calcOptionCost = (opt: ModifierOption) => {
  if (!opt?.sku)
    return 0

  const qty = toNum(opt.quantity)
  const purchasePrice = toNum(opt?.sku?.costs?.[0]?.cost)

  if (purchasePrice === 0)
    return 0

  return (qty || 1) * purchasePrice
}

const calcOptionMargin = (opt: ModifierOption) => {
  const sellDelta = toNum(opt.defaultPrice)
  const cost = calcOptionCost(opt)

  return sellDelta - cost
}

const totalOptions = computed(() => data.value?.options?.length ?? 0)

onMounted(async () => {
  try {
    const id = String(route.params.itemModifierId ?? route.params.id ?? '')

    // Fetch dengan include/fields supaya komponen punya unit+harga
    await modifierStore.fetchDetail(id, {
      include: [
        'options.sku.prices',
        'options.sku.costs',
      ],
    })
  }
  catch (e: any) {
    error.value = e?.message ?? 'Gagal memuat data'
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <VCard elevation="2">
    <VCardItem>
      <VCardTitle class="text-h5 font-weight-bold d-flex align-center gap-2">
        {{ data?.name ?? '–' }}
        <VChip
          v-if="data"
          :color="data.isActive ? 'success' : 'grey'"
          size="small"
          class="ms-2"
          label
        >
          {{ data.isActive ? 'Aktif' : 'Nonaktif' }}
        </VChip>
      </VCardTitle>
      <VCardSubtitle class="text-body-1">
        Tipe: <strong>{{ data?.type ?? '–' }}</strong>
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VRow
        v-if="loading"
        class="py-6"
      >
        <VCol cols="12">
          <VSkeletonLoader type="article, actions" />
        </VCol>
      </VRow>

      <VAlert
        v-else-if="error"
        type="error"
        border="start"
        variant="tonal"
        class="mb-4"
      >
        {{ error }}
      </VAlert>

      <template v-else>
        <VRow
          class="mb-4"
          dense
        >
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VSheet class="pa-4 rounded-lg border">
              <div class="text-caption text-medium-emphasis">
                Mode Pilih
              </div>
              <div class="text-body-1 font-weight-medium">
                {{ data?.multiple ? 'Pilih Beberapa' : 'Pilih Salah Satu' }}
              </div>
            </VSheet>
          </VCol>
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VSheet class="pa-4 rounded-lg border">
              <div class="text-caption text-medium-emphasis">
                Batas Pilihan
              </div>
              <div
                v-if="data?.minSelect === 1 || data?.maxSelect === 1"
                class="text-body-1 font-weight-medium"
              >
                Pilih salah satu
              </div>
              <div
                v-else-if="data?.minSelect || data?.maxSelect"
                class="text-body-1 font-weight-medium"
              >
                {{ data?.minSelect }} – {{ data?.maxSelect }}
              </div>
              <div
                v-else
                class="text-body-1 font-weight-medium"
              >
                Bebas
              </div>
            </VSheet>
          </VCol>
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VSheet class="pa-4 rounded-lg border">
              <div class="text-caption text-medium-emphasis">
                Jumlah Opsi
              </div>
              <div class="text-body-1 font-weight-medium">
                {{ totalOptions }}
              </div>
            </VSheet>
          </VCol>
        </VRow>
        <div>
          Pilihan:
        </div>
        <VExpansionPanels
          variant="accordion"
          class="mt-2"
        >
          <VExpansionPanel
            v-for="(opt, index) in (data?.options ?? [])"
            :key="opt.modifierOptionId"
            elevation="1"
            class="mb-2"
          >
            <VExpansionPanelTitle>
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-medium">{{ index + 1 }}. {{ opt.name }}</span>
                  <VChip
                    v-if="opt.isDefault"
                    color="primary"
                    size="x-small"
                    label
                  >
                    Default
                  </VChip>
                  <VChip
                    :color="opt.isActive ? 'success' : 'grey'"
                    size="x-small"
                    variant="tonal"
                    label
                  >
                    {{ opt.isActive ? 'Aktif' : 'Nonaktif' }}
                  </VChip>
                </div>
                <div class="text-subtitle-2 d-flex align-center gap-4">
                  <span>Harga Jual: <strong>{{ formatRp(opt.defaultPrice) }}</strong></span>
                  <span v-if="calcOptionCost(opt)">
                    Perkiraan Biaya: <strong>{{ formatRp(calcOptionCost(opt)) }}</strong>
                  </span>
                  <VChip
                    v-if="calcOptionCost(opt) || toNum(opt.salesPrice) !== 0"
                    :color="toNum(opt.salesPrice) - calcOptionCost(opt) >= 0 ? 'success' : 'error'"
                    size="small"
                    label
                  >
                    Margin: {{ formatRp(calcOptionMargin(opt)) }}
                  </VChip>
                </div>
              </div>
            </VExpansionPanelTitle>

            <VExpansionPanelText>
              <VTable density="comfortable">
                <thead>
                  <tr>
                    <th>Nama Produk</th>
                    <th style="width: 140px;">
                      Takaran
                    </th>
                    <th style="width: 140px;">
                      Harga Modal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="opt?.sku">
                    <td class="pa-3">
                      <div class="d-flex flex-column">
                        <span class="font-weight-medium">{{ opt?.sku?.displayName ?? '–' }}</span>
                        <span class="text-caption text-medium-emphasis">SKU: {{ opt?.sku?.skuCode || '-' }}</span>
                      </div>
                    </td>
                    <td>
                      {{ toNum(opt.quantity) }}
                    </td>
                    <td class="text-right">
                      {{ formatRp(opt?.sku?.costs?.[0]?.cost) }}
                    </td>
                  </tr>
                  <tr v-else>
                    <td
                      colspan="3"
                      class="text-center text-medium-emphasis py-6"
                    >
                      Tidak Memakai Produk
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </template>
    </VCardText>
  </VCard>
</template>
