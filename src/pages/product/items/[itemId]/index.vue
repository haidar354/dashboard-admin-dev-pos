<script setup lang="ts">
import { VImg, VTable } from 'vuetify/lib/components/index.mjs'

import { useItemDetail } from '@/composables/product/useItemDetail'
import { manufacturingSourceLabel, productionSitePolicyLabel, saleFulfillmentLabel } from '@/constants/product/item'
import { useItemStore } from '@/stores/product/itemStore'
import type { ItemKind } from '@/types/models/product/item'

definePage({
  meta: {
    name: 'Detail Produk',
    navActiveLink: 'items',
    rules: [
      {
        action: 'manage',
        subject: 'Lihat Produk',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const route = useRoute()
const itemStore = useItemStore()
const { isLoadingFetchDetail, selectedItemDetail } = storeToRefs(itemStore)
const itemId = (route.params as { itemId: string }).itemId

const { initializeDetailData } = useItemDetail()

// Helper functions
function getProductTypeIcon(type: ItemKind): string {
  const icons: Record<ItemKind, string> = {
    material: 'tabler-package',
    product: 'tabler-tools',
    service: 'tabler-chef-hat',
    bundle: 'tabler-bottle',
  }

  return icons[type] ?? 'tabler-package'
}

// Computed property for quick info cards
const quickInfoCards = computed(() => [
  {
    icon: 'tabler-building-store',
    color: 'primary',
    value: selectedItemDetail.value?.itemOutlets?.length || 0,
    label: 'Outlet Aktif',
  },
  {
    icon: 'tabler-scale',
    color: 'success',
    value: selectedItemDetail.value?.units?.length || 0,
    label: 'Satuan',
  },
  {
    icon: 'tabler-package',
    color: 'info',
    value: selectedItemDetail.value?.modifiers?.length || 0,
    label: 'Total Ekstra',
  },
  {
    icon: 'tabler-chef-hat',
    color: 'warning',
    value: selectedItemDetail.value?.salesBom?.lines?.length || 0,
    label: 'Bahan Resep',
  },
])

onMounted(async () => {
  if (itemId)
    await initializeDetailData(itemId, true)
})
</script>

<template>
  <!-- Main Loading State for Entire Page -->
  <div
    v-if="isLoadingFetchDetail"
    class="loading-container"
  >
    <VRow>
      <!-- Header Section Loading -->
      <VCol cols="12">
        <VCard
          class="mb-6"
          elevation="3"
        >
          <VCardText>
            <VSkeletonLoader
              type="card-avatar, article"
              class="mx-2"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Quick Stats Loading -->
      <VCol cols="12">
        <VRow class="mb-6">
          <VCol
            v-for="n in 4"
            :key="n"
            cols="12"
            sm="6"
            md="3"
          >
            <VCard
              class="text-center pa-4"
              elevation="2"
            >
              <VSkeletonLoader type="avatar, text" />
            </VCard>
          </VCol>
        </VRow>
      </VCol>

      <!-- Content Sections Loading -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard
          v-for="n in 3"
          :key="n"
          class="mb-6"
          elevation="2"
        >
          <VCardItem>
            <VSkeletonLoader type="heading" />
          </VCardItem>
          <VCardText>
            <VSkeletonLoader type="paragraph, paragraph" />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Sidebar Loading -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard
          v-for="n in 2"
          :key="n"
          class="mb-6"
          elevation="2"
        >
          <VCardItem>
            <VSkeletonLoader type="heading" />
          </VCardItem>
          <VCardText>
            <VSkeletonLoader type="list-item-three-line" />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>

  <!-- Content with Fade Transition -->
  <VFadeTransition>
    <div
      v-if="!isLoadingFetchDetail"
      class="content-container"
    >
      <!-- Header Section -->
      <VCard
        class="mb-6"
        elevation="3"
      >
        <VCardText>
          <VRow align="center">
            <VCol
              cols="12"
              md="8"
            >
              <div class="d-flex align-center mb-2">
                <VAvatar
                  size="85"
                  color="primary"
                  class="me-4"
                  variant="elevated"
                  rounded
                >
                  <VImg
                    v-if="selectedItemDetail?.images?.length"
                    :src="selectedItemDetail?.images?.[0]?.imageUrlSmall"
                    alt="Item Image"
                    width="85"
                    height="85"
                  />
                  <VIcon
                    v-else
                    :icon="getProductTypeIcon(selectedItemDetail?.kind)"
                    size="32"
                  />
                </VAvatar>
                <div>
                  <h1 class="text-h4 font-weight-bold mb-1">
                    {{ selectedItemDetail?.name }}
                  </h1>
                  <div class="d-flex align-center gap-2 mb-2">
                    <VChip
                      :color="selectedItemDetail?.isActive ? 'success' : 'error'"
                      size="small"
                      variant="flat"
                    >
                      <VIcon
                        icon="tabler-circle-filled"
                        size="8"
                        class="me-1"
                      />
                      {{ selectedItemDetail?.isActive ? 'Aktif' : 'Tidak Aktif' }}
                    </VChip>
                    <VChip
                      v-if="selectedItemDetail?.hasVariant"
                      color="primary"
                      size="small"
                      variant="tonal"
                    >
                      <VIcon
                        icon="tabler-star"
                        size="14"
                        class="me-1"
                      />
                      Varian
                    </VChip>
                  </div>
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="4"
              class="text-md-end"
            >
              <VBtn
                color="warning"
                variant="outlined"
                prepend-icon="tabler-edit"
                :to="{
                  name: 'product-items-item-id-edit',
                  params: { itemId: selectedItemDetail?.itemId },
                }"
                class="me-2"
              >
                Edit
              </VBtn>
              <VBtn
                color="error"
                variant="outlined"
                prepend-icon="tabler-trash"
              >
                Hapus
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Quick Info Cards with Staggered Animation -->
      <VRow>
        <VCol
          v-for="(card, index) in quickInfoCards"
          :key="index"
          cols="12"
          sm="6"
          md="3"
        >
          <VSlideYTransition :delay="index * 100">
            <VCard
              class="text-center pa-4 quick-info-card"
              elevation="2"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <VIcon
                :icon="card.icon"
                size="32"
                :color="card.color"
                class="mb-2"
              />
              <h3 class="text-h6 font-weight-bold">
                {{ card.value }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ card.label }}
              </p>
            </VCard>
          </VSlideYTransition>
        </VCol>
      </VRow>

      <!-- Product Information -->
      <VRow>
        <VCol cols="12">
          <!-- Basic Information -->
          <VCard
            class="mb-6"
            elevation="2"
          >
            <VCardItem>
              <VCardTitle class="d-flex align-center">
                <VIcon
                  icon="tabler-info-circle"
                  class="me-2"
                  color="primary"
                />
                Informasi Produk
              </VCardTitle>
            </VCardItem>

            <VCardText>
              <VRow no-gutters>
                <!-- 🧩 Kategori -->
                <VCol
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="info-item">
                    <label>Kategori</label>
                    <p>{{ selectedItemDetail?.category?.name || '-' }}</p>
                  </div>
                </VCol>

                <!-- 🧬 Varian -->
                <VCol
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="info-item">
                    <label>Memiliki Varian?</label>
                    <p>
                      <VIcon
                        :icon="selectedItemDetail?.hasVariant ? 'tabler-check' : 'tabler-x'"
                        :color="selectedItemDetail?.hasVariant ? 'success' : 'error'"
                        size="16"
                        class="me-1"
                      />
                      {{ selectedItemDetail?.hasVariant ? 'Ya' : 'Tidak' }}
                    </p>
                  </div>
                </VCol>

                <!-- 🍧 Modifier -->
                <VCol
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="info-item">
                    <label>Memiliki Ekstra?</label>
                    <p>
                      <VIcon
                        :icon="selectedItemDetail?.hasModifier ? 'tabler-check' : 'tabler-x'"
                        :color="selectedItemDetail?.hasModifier ? 'success' : 'error'"
                        size="16"
                        class="me-1"
                      />
                      {{ selectedItemDetail?.hasModifier ? 'Ya' : 'Tidak' }}
                    </p>
                  </div>
                </VCol>

                <!-- 📝 Deskripsi -->
                <VCol
                  v-if="selectedItemDetail?.description"
                  cols="12"
                >
                  <div class="info-item">
                    <label>Deskripsi</label>
                    <p>{{ selectedItemDetail.description }}</p>
                  </div>
                </VCol>
              </VRow>

              <!-- ⚙️ Global Config (useSameConfig) -->
              <template v-if="selectedItemDetail?.useSameConfig">
                <VDivider class="my-4" />

                <div class="text-subtitle-1 font-weight-bold mb-2">
                  Pengaturan Global SKU
                </div>

                <VRow no-gutters>
                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Sumber Produk</label>
                      <p>{{ manufacturingSourceLabel[selectedItemDetail?.manufacturingSource] || '-' }}</p>
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Kebijakan Lokasi Produk</label>
                      <p>
                        {{ productionSitePolicyLabel[selectedItemDetail?.sourcingSitePolicy || 'NONE'] || '-' }}
                        <span v-if="selectedItemDetail?.centralKitchenOutlet?.name">
                          ({{ selectedItemDetail.centralKitchenOutlet.name }})
                        </span>
                      </p>
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Mode Penjualan</label>
                      <p>{{ saleFulfillmentLabel[selectedItemDetail?.saleFulfillmentMode || 'NONE'] || '-' }}</p>
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Ukuran Batch Produksi</label>
                      <p>{{ Number(selectedItemDetail?.batchSize) || '-' }}</p>
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Lead Time Produksi (hari)</label>
                      <p>{{ Number(selectedItemDetail?.leadTimeDays) || 0 }}</p>
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Kelola Stok?</label>
                      <p>
                        <VIcon
                          :icon="selectedItemDetail?.manageStock ? 'tabler-check' : 'tabler-x'"
                          :color="selectedItemDetail?.manageStock ? 'success' : 'error'"
                          size="16"
                          class="me-1"
                        />
                        {{ selectedItemDetail?.manageStock ? 'Ya' : 'Tidak' }}
                      </p>
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Izinkan Stok Negatif?</label>
                      <p>
                        <VIcon
                          :icon="selectedItemDetail?.allowNegativeStock ? 'tabler-check' : 'tabler-x'"
                          :color="selectedItemDetail?.allowNegativeStock ? 'success' : 'error'"
                          size="16"
                          class="me-1"
                        />
                        {{ selectedItemDetail?.allowNegativeStock ? 'Ya' : 'Tidak' }}
                      </p>
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Batas Minimum Stok</label>
                      <p>{{ selectedItemDetail?.minStockAlert ?? 0 }}</p>
                    </div>
                  </VCol>

                  <VCol
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="info-item">
                      <label>Batas Maksimum Stok</label>
                      <p>{{ selectedItemDetail?.maxStockAlert ?? '-' }}</p>
                    </div>
                  </VCol>
                </VRow>
              </template>
            </VCardText>
          </VCard>

          <!-- Outlets Data -->
          <VCard
            class="mb-6"
            elevation="2"
          >
            <VCardItem>
              <VCardTitle class="d-flex align-center">
                <VIcon
                  icon="tabler-building-store"
                  class="me-2"
                  color="primary"
                />
                Data Outlet
              </VCardTitle>
            </VCardItem>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>Nama Outlet</th>
                    <th width="10%">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="itemOutlet in selectedItemDetail?.itemOutlets || []"
                    :key="itemOutlet.outletId"
                  >
                    <td>{{ itemOutlet?.outlet?.name }}</td>
                    <td>
                      <VChip :color="itemOutlet?.isActive ? 'success' : 'error'">
                        {{ itemOutlet?.isActive ? 'Aktif' : 'Tidak Aktif' }}
                      </VChip>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Units Data -->
          <!--
            <VCard
            class="mb-6"
            elevation="2"
            >
            <VCardItem>
            <VCardTitle class="d-flex align-center">
            <VIcon
            icon="tabler-scale"
            class="me-2"
            color="primary"
            />
            Data Satuan & Harga
            </VCardTitle>
            </VCardItem>
            <VCardText>
            <VTable>
            <thead>
            <tr>
            <th>
            Nama Satuan
            </th>
            <th
            v-if="!selectedItemDetail?.hasVariant"
            width="150px"
            >
            Konversi
            </th>
            <th
            width="150px"
            class="text-center"
            >
            Min. Pembelian
            </th>

            <template v-if="!selectedItemDetail?.hasVariant">
            <th
            width="150px"
            class="text-right"
            >
            Harga Beli
            </th>
            <th
            width="150px"
            class="text-right"
            >
            Harga Jual
            </th>
            </template>
            </tr>
            </thead>
            <tbody>
            <tr
            v-for="unit in selectedItemDetail?.itemUnits || []"
            :key="unit.itemUnitId"
            >
            <td>{{ unit?.unit?.name }}</td>
            <td v-if="!selectedItemDetail?.hasVariant">
            {{ unit.isBase ? '-' : `${Number(unit?.conversion)} ${defaultUnit?.unit?.code}` }}
            </td>
            <td class="text-center">
            {{ Number(unit?.minSalesQty) }}
            </td>
            <template v-if="!selectedItemDetail?.hasVariant">
            <td class="text-right">
            {{ formatRupiah(unit?.activeItemPrice?.referenceCost || 0) }}
            </td>
            <td class="text-right">
            {{ formatRupiah(unit?.activeItemPrice?.price || 0) }}
            </td>
            </template>
            </tr>
            </tbody>
            </VTable>
            </VCardText>
            </VCard>
          -->

          <!-- SKU Data -->

          <VCard
            v-if="selectedItemDetail?.skus?.length"
            class="mb-6"
            elevation="2"
          >
            <VCardItem>
              <VCardTitle class="d-flex align-center">
                <VIcon
                  icon="tabler-package"
                  class="me-2"
                  color="primary"
                />
                Data SKU
              </VCardTitle>
            </VCardItem>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>
                      Nama SKU
                    </th>
                    <th>
                      Kode SKU
                    </th>
                    <th>
                      Barcode
                    </th>
                    <th
                      v-if="selectedItemDetail.manufacturingSource === 'PURCHASED'"
                      class="text-right"
                    >
                      Harga Beli
                    </th>
                    <th class="text-right">
                      Harga Jual
                    </th>
                    <th class="text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(sku, index) in selectedItemDetail?.skus || []"
                    :key="index"
                  >
                    <td class="py-1">
                      <div class="text-wrap">
                        {{ sku.displayName }}
                      </div>
                    </td>
                    <td>{{ sku.code ?? '-' }}</td>
                    <td>{{ sku.barcode ?? '-' }}</td>
                    <td
                      v-if="selectedItemDetail.manufacturingSource === 'PURCHASED'"
                      class="text-right"
                    >
                      {{ formatRupiah(sku?.cost?.cost || 0) }}
                    </td>
                    <td class="text-right">
                      {{ formatRupiah(sku?.price?.price || 0) }}
                    </td>
                    <td class="text-center">
                      <VChip
                        :color="sku.isActive ? 'success' : 'error'"
                        size="small"
                        variant="flat"
                      >
                        {{ sku.isActive ? 'Aktif' : 'Tidak Aktif' }}
                      </VChip>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Modifiers Data -->
          <VCard
            v-if="selectedItemDetail?.modifiers?.length"
            class="mb-6"
            elevation="2"
          >
            <VCardItem>
              <VCardTitle class="d-flex align-center">
                <VIcon
                  icon="tabler-scale"
                  class="me-2"
                  color="primary"
                />
                Data Ekstra (Topping/Isian)
              </VCardTitle>
            </VCardItem>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>
                      Nama Ekstra
                    </th>
                    <th>
                      Pilihan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="modifier in selectedItemDetail?.modifiers || []"
                    :key="modifier.itemModifierGroupId"
                  >
                    <td style="vertical-align: top;">
                      {{ modifier.group?.name }}
                    </td>
                    <td>
                      <ul class="mb-0">
                        <li
                          v-for="option in modifier.group?.options || []"
                          :key="option.modifierOptionId"
                        >
                          {{ option.name }} ({{ formatRupiah(option.defaultPrice || 0) }})
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>

          <!-- Recipe Data -->
          <VCard
            v-if="(selectedItemDetail?.salesBom?.lines?.length || 0) > 0"
            class="mb-6"
            elevation="2"
          >
            <VCardItem>
              <VCardTitle class="d-flex align-center">
                <VIcon
                  icon="tabler-building-store"
                  class="me-2"
                  color="primary"
                />
                Data Resep / Bahan Baku
              </VCardTitle>
            </VCardItem>
            <VCardText>
              <VTable>
                <thead>
                  <tr>
                    <th>
                      Nama Bahan
                    </th>
                    <th>
                      Takaran
                    </th>
                    <th>
                      Perkiraan Modal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="bom in selectedItemDetail.salesBom?.lines"
                    :key="bom.itemBomId"
                  >
                    <td>{{ bom?.materialSku?.displayName }}</td>
                    <td>{{ Number(bom?.quantity) }} {{ bom?.materialSku?.itemUnit?.unit?.code || '' }}</td>
                    <td>{{ formatCurrency((bom?.materialSku?.cost?.cost * Number(bom?.quantity)) || 0) }}</td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </vfadetransition>
</template>

<style lang="scss" scoped>
.info-item {
  margin-block-end: 1rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-block-end: 0.25rem;
  }

  p {
    display: flex;
    align-items: center;
    margin: 0;
    color: rgb(var(--v-theme-on-background));
    font-size: 1rem;
    font-weight: 500;
  }
}

.summary-item {
  border-block-end: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  padding-block: 0.75rem;
  padding-inline: 0;

  &:last-child {
    border-block-end: none;
  }

  span {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 500;
  }
}

.v-card {
  border-radius: 12px;

  &.elevation-2 {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 10%);
  }

  &.elevation-3 {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 15%);
  }
}

.v-avatar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 10%);
}

.v-chip {
  font-weight: 500;
}

.v-btn {
  border-radius: 8px;
  font-weight: 500;
}

.border-primary {
  border-width: 2px !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

.text-decoration-none {
  text-decoration: none !important;

  &:hover {
    text-decoration: underline !important;
  }
}

// Loading animations
.loading-container {
  animation: fadeIn 0.3s ease-in-out;
}

.content-container {
  animation: slideUp 0.5s ease-out;
}

.quick-info-card {
  animation: slideUp 0.6s ease-out both;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 15%);
    transform: translateY(-2px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Skeleton loader customization
:deep(.v-skeleton-loader) {
  background: transparent;

  .v-skeleton-loader__bone {
    border-radius: 8px;
    animation: shimmer 1.5s infinite;
    background:
      linear-gradient(90deg,
        rgba(var(--v-theme-surface-variant), 0.1) 25%,
        rgba(var(--v-theme-surface-variant), 0.2) 50%,
        rgba(var(--v-theme-surface-variant), 0.1) 75%);
    background-size: 200% 100%;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

// Enhanced loading states
.v-data-table-server {
  :deep(.v-data-table__loading) {
    backdrop-filter: blur(2px);
    background: rgba(var(--v-theme-surface), 0.8);
  }
}
</style>
