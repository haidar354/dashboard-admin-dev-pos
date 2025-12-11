<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { useDirectPurchaseDetail } from '@/composables/purchase/useDirectPurchaseDetail'
import { directPurchaseItemHeaders } from '@/constants/purchase/tableHeaders'
import { usePurchaseDirectStore } from '@/stores/purchase/purchaseDirectStore'

definePage({
  meta: {
    name: 'Detail Pembelian Langsung',
    rules: [{ action: 'manage', subject: 'default' }],
  },
})

dayjs.locale(id)

const route = useRoute()
const router = useRouter()
const purchaseDirectStore = usePurchaseDirectStore()
const { fetchDetail } = purchaseDirectStore
const directPurchaseId = (route.params as { directPurchaseId: string }).directPurchaseId

const {
  purchaseDirect,
  isLoadingFetchDetail,
  isLoadingUpdate,
  isLoadingDelete,
  statusColor,
  statusText,
  statusIcon,
  canEdit,
  canComplete,
  canCancel,
  handleEdit,
  handleComplete,
  handleCancel,
  handleDelete,
  downloadDocument,
} = useDirectPurchaseDetail(directPurchaseId)

// Lifecycle
onMounted(async () => {
  if (directPurchaseId)
    await fetchDetail(directPurchaseId)
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <VCard
      v-if="isLoadingFetchDetail"
      class="mb-4"
      elevation="2"
    >
      <VCardText>
        <div class="d-flex align-center justify-center pa-8">
          <VProgressCircular
            indeterminate
            color="primary"
            size="48"
          />
          <span class="ms-4 text-h6">Memuat detail pembelian langsung...</span>
        </div>
      </VCardText>
    </VCard>

    <!-- Main Content -->
    <template v-else-if="purchaseDirect.purchaseDirectId">
      <!-- Header Section -->
      <VCard
        class="mb-4"
        elevation="2"
      >
        <VCardText>
          <div class="d-flex flex-wrap justify-space-between align-center">
            <div class="d-flex align-center">
              <VBtn
                icon
                variant="text"
                color="default"
                class="me-3"
                @click="router.go(-1)"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
              <div class="d-flex gap-2 align-center">
                <VIcon
                  icon="tabler-shopping-cart"
                  class="me-2"
                  color="primary"
                  size="30"
                />
                <div>
                  <div class="text-h5">
                    Detail Pembelian Langsung
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ purchaseDirect.supplier?.name }} - {{ dayjs(purchaseDirect.purchasedAt).format('DD MMMM YYYY') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Badge -->
            <VChip
              :color="statusColor"
              :icon="statusIcon"
              variant="flat"
              size="large"
              class="font-weight-bold"
            >
              {{ statusText }}
            </VChip>
          </div>
        </VCardText>

        <VDivider />

        <!-- Action Buttons -->
        <VCardText class="pb-2">
          <div class="d-flex flex-wrap gap-2">
            <VBtn
              v-if="canEdit && ($can('manage', 'Edit Pembelian Langsung') || $can('manage', 'default'))"
              color="warning"
              variant="elevated"
              prepend-icon="tabler-edit"
              :loading="isLoadingUpdate"
              @click="handleEdit"
            >
              Edit
            </VBtn>

            <VBtn
              v-if="canComplete && ($can('manage', 'Edit Pembelian Langsung') || $can('manage', 'default'))"
              color="success"
              variant="elevated"
              prepend-icon="tabler-check"
              :loading="isLoadingUpdate"
              @click="handleComplete"
            >
              Selesaikan
            </VBtn>

            <VBtn
              v-if="canCancel && ($can('manage', 'Edit Pembelian Langsung') || $can('manage', 'default'))"
              color="error"
              variant="outlined"
              prepend-icon="tabler-x"
              :loading="isLoadingUpdate"
              @click="handleCancel"
            >
              Batalkan
            </VBtn>

            <VBtn
              v-if="purchaseDirect.document"
              color="info"
              variant="outlined"
              prepend-icon="tabler-download"
              @click="downloadDocument"
            >
              Download Dokumen
            </VBtn>

            <VSpacer />

            <VBtn
              v-if="$can('manage', 'Hapus Pembelian Langsung') || $can('manage', 'default')"
              color="error"
              variant="outlined"
              prepend-icon="tabler-trash"
              :loading="isLoadingDelete"
              @click="handleDelete"
            >
              Hapus
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <!-- Purchase Information -->
      <VRow>
        <VCol
          cols="12"
          md="8"
        >
          <!-- Purchase Details Card -->
          <VCard
            class="mb-4"
            elevation="2"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon
                icon="tabler-info-circle"
                class="me-2"
                color="primary"
              />
              Informasi Pembelian
            </VCardTitle>
            <VDivider />
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Outlet</label>
                    <div class="d-flex align-center">
                      <VAvatar
                        size="24"
                        color="primary"
                        class="me-2"
                      >
                        <VIcon
                          icon="tabler-building-store"
                          size="14"
                        />
                      </VAvatar>
                      <span class="text-body-1 font-weight-medium">
                        {{ purchaseDirect.outlet?.name || '-' }}
                      </span>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Supplier</label>
                    <div class="d-flex align-center">
                      <VAvatar
                        size="24"
                        color="secondary"
                        class="me-2"
                      >
                        <VIcon
                          icon="tabler-truck"
                          size="14"
                        />
                      </VAvatar>
                      <span class="text-body-1 font-weight-medium">
                        {{ purchaseDirect.supplier?.name || '-' }}
                      </span>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Tanggal Pembelian</label>
                    <div class="d-flex align-center">
                      <VAvatar
                        size="24"
                        color="info"
                        class="me-2"
                      >
                        <VIcon
                          icon="tabler-calendar"
                          size="14"
                        />
                      </VAvatar>
                      <span class="text-body-1 font-weight-medium">
                        {{ dayjs(purchaseDirect.purchasedAt).format('DD MMMM YYYY, HH:mm') }}
                      </span>
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  sm="6"
                >
                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Total Pembelian</label>
                    <div class="d-flex align-center">
                      <VAvatar
                        size="24"
                        color="success"
                        class="me-2"
                      >
                        <VIcon
                          icon="tabler-currency-dollar"
                          size="14"
                        />
                      </VAvatar>
                      <span class="text-h6 font-weight-bold text-success">
                        {{ formatRupiah(purchaseDirect.totalAmount) }}
                      </span>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Dibuat Pada</label>
                    <div class="d-flex align-center">
                      <VAvatar
                        size="24"
                        color="warning"
                        class="me-2"
                      >
                        <VIcon
                          icon="tabler-clock"
                          size="14"
                        />
                      </VAvatar>
                      <span class="text-body-1">
                        {{ dayjs(purchaseDirect.createdAt).format('DD MMMM YYYY, HH:mm') }}
                      </span>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="text-body-2 text-medium-emphasis mb-1 d-block">Diperbarui Pada</label>
                    <div class="d-flex align-center">
                      <VAvatar
                        size="24"
                        color="warning"
                        class="me-2"
                      >
                        <VIcon
                          icon="tabler-clock-edit"
                          size="14"
                        />
                      </VAvatar>
                      <span class="text-body-1">
                        {{ dayjs(purchaseDirect.updatedAt).format('DD MMMM YYYY, HH:mm') }}
                      </span>
                    </div>
                  </div>
                </VCol>
              </VRow>

              <!-- Notes Section -->
              <div
                v-if="purchaseDirect.note"
                class="mt-4"
              >
                <label class="text-body-2 text-medium-emphasis mb-2 d-block">Catatan</label>
                <VCard
                  variant="outlined"
                  color="info"
                >
                  <VCardText class="pa-3">
                    <div class="d-flex">
                      <VIcon
                        icon="tabler-note"
                        class="me-2 mt-1"
                        color="info"
                        size="18"
                      />
                      <span class="text-body-1">{{ purchaseDirect.note }}</span>
                    </div>
                  </VCardText>
                </VCard>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <!-- Summary Card -->
          <VCard
            class="mb-4"
            elevation="2"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon
                icon="tabler-receipt"
                class="me-2"
                color="primary"
              />
              Ringkasan
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-body-2">Jumlah Item:</span>
                <VChip
                  size="small"
                  color="primary"
                  variant="flat"
                >
                  {{ purchaseDirect.purchaseDirectItems?.length || 0 }} item
                </VChip>
              </div>

              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-body-2">Kuantitas:</span>
                <span class="font-weight-medium">
                  {{ Math.round(purchaseDirect.purchaseDirectItems?.reduce((sum, item) => sum + item.qty, 0) || 0) }}
                </span>
              </div>

              <VDivider class="my-3" />

              <div class="d-flex justify-space-between align-center">
                <span class="text-h6 font-weight-bold">Total:</span>
                <span class="text-h6 font-weight-bold text-success">
                  {{ formatRupiah(purchaseDirect.totalAmount) }}
                </span>
              </div>
            </VCardText>
          </VCard>

          <!-- Document Card -->
          <VCard
            v-if="purchaseDirect.document"
            class="mb-4"
            elevation="2"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon
                icon="tabler-file"
                class="me-2"
                color="primary"
              />
              Dokumen
            </VCardTitle>
            <VDivider />
            <VCardText>
              <VBtn
                block
                color="info"
                variant="outlined"
                prepend-icon="tabler-download"
                @click="downloadDocument"
              >
                Download Dokumen
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Items Table -->
      <VCard elevation="2">
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="tabler-list"
            class="me-2"
            color="primary"
          />
          Daftar Item Pembelian
        </VCardTitle>
        <VDivider />

        <VDataTable
          :headers="directPurchaseItemHeaders"
          :items="purchaseDirect.purchaseDirectItems || []"
          :loading="isLoadingFetchDetail"
          loading-text="Memuat daftar item..."
          class="text-no-wrap"
          :items-per-page="-1"
          hide-default-footer
        >
          <template #item.index="{ index }">
            <span class="text-body-2 font-weight-medium">{{ index + 1 }}</span>
          </template>

          <template #item.itemOutlet.item.name="{ item }">
            <div class="d-flex align-center">
              <VAvatar
                size="32"
                color="primary"
                class="me-3"
              >
                <VIcon
                  icon="tabler-package"
                  size="16"
                />
              </VAvatar>
              <div>
                <div class="font-weight-medium">
                  {{ item.itemOutlet?.item?.name || '-' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.itemOutlet?.item?.code || '-' }}
                </div>
              </div>
            </div>
          </template>

          <template #item.itemOutlet.item.code="{ item }">
            <VChip
              size="small"
              variant="outlined"
              color="info"
            >
              {{ item.itemOutlet?.item?.code || '-' }}
            </VChip>
          </template>

          <template #item.qty="{ item }">
            <div class="text-end">
              <VChip
                size="small"
                color="primary"
                variant="flat"
              >
                {{ item.qty }}
              </VChip>
            </div>
          </template>

          <template #item.itemUnit.name="{ item }">
            <VChip
              size="small"
              variant="outlined"
              color="secondary"
            >
              {{ item.itemUnit?.unit?.name || '-' }}
            </VChip>
          </template>

          <template #item.price="{ item }">
            <div class="text-end font-weight-medium">
              {{ formatRupiah(item.price) }}
            </div>
          </template>

          <template #item.total="{ item }">
            <div class="text-end font-weight-bold text-success">
              {{ formatRupiah(item.qty * item.price) }}
            </div>
          </template>

          <template #no-data>
            <div class="text-center pa-8">
              <VIcon
                icon="tabler-package-off"
                size="64"
                color="disabled"
                class="mb-4"
              />
              <h3 class="text-h6 mb-2">
                Tidak ada item
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                Belum ada item yang ditambahkan dalam pembelian ini
              </p>
            </div>
          </template>

          <template #bottom>
            <div class="pa-4 border-t">
              <div class="d-flex justify-end">
                <div class="text-right">
                  <div class="text-h6 font-weight-bold text-success">
                    Total: {{ formatRupiah(purchaseDirect.totalAmount) }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ purchaseDirect.purchaseDirectItems?.length || 0 }} barang
                  </div>
                </div>
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </template>

    <!-- Error State -->
    <VCard
      v-else
      class="mb-4"
      elevation="2"
    >
      <VCardText>
        <div class="text-center pa-8">
          <VIcon
            icon="tabler-alert-circle"
            size="64"
            color="error"
            class="mb-4"
          />
          <h3 class="text-h6 mb-2">
            Data tidak ditemukan
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Pembelian langsung yang Anda cari tidak dapat ditemukan atau telah dihapus.
          </p>
          <VBtn
            color="primary"
            variant="elevated"
            @click="router.push({ name: 'purchase-direct-purchases' })"
          >
            Kembali ke Daftar Pembelian Langsung
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
