<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { useOutletStore } from '@/stores/outletStore'
import noImage from '@images/illustrations/outlet.png'

definePage({
  meta: {
    name: 'Detail Outlet',
    navActiveLink: 'setting-outlets',
    rules: [
      {
        action: 'manage',
        subject: 'Lihat Outlet',
      },
      {
        action: 'manage',
        subject: 'Lihat Semua Outlet',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

dayjs.locale(id)

const route = useRoute()
const router = useRouter()
const outletStore = useOutletStore()
const { isLoadingFetchDetail, selectedOutlet } = storeToRefs(outletStore)
const outletId = (route.params as { outletId: string }).outletId

// Mock data for demonstration - replace with actual API calls
const outletStats = ref({
  totalSales: 0,
  totalOrders: 0,
  totalCustomers: 0,
  avgOrderValue: 0,
})

const recentActivities: any = ref([
])

onMounted(() => {
  if (outletId) {
    outletStore.fetchDetail(outletId, {
      include: [
        'province',
        'city',
        'district',
        'village',
      ],
    }).catch(() => {
      router.push({ name: 'setting-outlets' })
    })
  }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <div>
    <VSkeletonLoader
      v-if="isLoadingFetchDetail"
      type="card,divider,card,divider,card"
    />
    <template v-else>
      <!-- Header Card -->
      <VCard class="mb-6">
        <VCardItem>
          <VCardTitle class="d-flex justify-space-between flex-wrap gap-2">
            <div class="d-flex align-center gap-3">
              <VBtn
                icon
                variant="text"
                @click="router.push({ name: 'setting-outlets' })"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
              <span>Detail Outlet</span>
            </div>
            <div class="d-flex gap-2">
              <VBtn
                v-if="$can('manage', 'Edit Outlet') || $can('manage', 'Edit Semua Outlet') || $can('manage', 'default')"
                color="primary"
                variant="outlined"
                :to="{
                  name: 'setting-outlets-outlet-id-edit',
                  params: { outletId: selectedOutlet.outletId },
                }"
              >
                <VIcon
                  start
                  icon="tabler-edit"
                />
                Edit Outlet
              </VBtn>
            </div>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <div class="d-flex gap-6 flex-column flex-md-row">
            <!-- Outlet Image -->
            <div class="flex-shrink-0">
              <VImg
                width="200"
                height="200"
                :src="selectedOutlet.logo ? selectedOutlet.logo : noImage"
                class="rounded-lg"
              />
            </div>

            <!-- Outlet Information -->
            <div class="flex-grow-1">
              <div class="d-flex align-center gap-3 mb-3">
                <div class="text-h4 font-weight-bold">
                  {{ selectedOutlet.name }}
                </div>
                <VChip
                  :color="selectedOutlet.isCentral ? 'primary' : 'secondary'"
                  size="small"
                >
                  {{ selectedOutlet.isCentral ? 'Pusat' : 'Cabang' }}
                </VChip>
              </div>

              <VRow class="mb-4">
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-phone"
                        size="16"
                        class="me-1"
                      />
                      No. Telepon
                    </div>
                    <div class="text-body-1">
                      {{ selectedOutlet.phone || '-' }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <!--
                    <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                    <VIcon
                    icon="tabler-clock"
                    size="16"
                    class="me-1"
                    />
                    Jam Operasional
                    </div>
                    <div class="text-body-1">
                    <span v-if="selectedOutlet.openingTime && selectedOutlet.closingTime">
                    {{ selectedOutlet.openingTime }} - {{ selectedOutlet.closingTime }}
                    </span>
                    <span v-else>Belum diatur</span>
                    </div>
                    </div>
                  -->

                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-calendar"
                        size="16"
                        class="me-1"
                      />
                      Dibuat Pada
                    </div>
                    <div class="text-body-1">
                      {{ dayjs(selectedOutlet.createdAt).format('DD MMMM YYYY, HH:mm') }}
                    </div>
                  </div>
                </VCol>
              </VRow>

              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-building-warehouse"
                        size="16"
                        class="me-1"
                      />
                      Lokasi Administratif
                    </div>
                    <div class="text-body-1">
                      <div>
                        {{ selectedOutlet.village?.name || '-' }},
                        {{ selectedOutlet.district?.name || '-' }},
                        {{ selectedOutlet.city?.name || '-' }},
                        {{ selectedOutlet.province?.name || '-' }}
                      </div>
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <!-- Location Information -->
                  <div
                    v-if="selectedOutlet.latitude && selectedOutlet.longitude"
                    class="mb-3"
                  >
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-map-2"
                        size="16"
                        class="me-1"
                      />
                      Koordinat Lokasi
                    </div>
                    <div class="text-body-1">
                      {{ selectedOutlet.latitude }}, {{ selectedOutlet.longitude }}
                      <VBtn
                        size="small"
                        variant="text"
                        color="primary"
                        :href="`https://maps.google.com/?q=${selectedOutlet.latitude},${selectedOutlet.longitude}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="ms-2"
                      >
                        <VIcon
                          icon="tabler-external-link"
                          size="16"
                        />
                        Lihat di Maps
                      </VBtn>
                    </div>
                  </div>
                </VCol>
                <VCol cols="12">
                  <!-- Alamat Lengkap -->
                  <div class="text-body-2 text-medium-emphasis mb-1">
                    <VIcon
                      icon="tabler-map-pin"
                      size="16"
                      class="me-1"
                    />
                    Alamat Lengkap
                  </div>
                  <div class="text-body-1">
                    {{ selectedOutlet.address || '-' }}
                  </div>
                </VCol>
              </VRow>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Statistics Cards -->
      <VRow class="mb-6">
        <VCol
          cols="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center">
              <VAvatar
                size="40"
                color="success"
                variant="tonal"
                class="me-3"
              >
                <VIcon icon="tabler-currency-dollar" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  Total Penjualan
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ formatCurrency(outletStats.totalSales) }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center">
              <VAvatar
                size="40"
                color="primary"
                variant="tonal"
                class="me-3"
              >
                <VIcon icon="tabler-shopping-cart" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  Total Pesanan
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ outletStats.totalOrders.toLocaleString() }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center">
              <VAvatar
                size="40"
                color="info"
                variant="tonal"
                class="me-3"
              >
                <VIcon icon="tabler-users" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  Total Pelanggan
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ outletStats.totalCustomers.toLocaleString() }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center">
              <VAvatar
                size="40"
                color="warning"
                variant="tonal"
                class="me-3"
              >
                <VIcon icon="tabler-chart-line" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  Rata-rata Pesanan
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ formatCurrency(outletStats.avgOrderValue) }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Recent Activities -->
      <VCard>
        <VCardItem>
          <VCardTitle>Aktivitas Terbaru</VCardTitle>
        </VCardItem>

        <VCardText>
          <VList>
            <VListItem
              v-for="(activity, index) in recentActivities"
              :key="activity.id"
              :class="{ 'border-b': index < recentActivities.length - 1 }"
            >
              <template #prepend>
                <VAvatar
                  size="40"
                  :color="activity.color"
                  variant="tonal"
                >
                  <VIcon :icon="activity.icon" />
                </VAvatar>
              </template>

              <VListItemTitle>{{ activity.description }}</VListItemTitle>
              <VListItemSubtitle>
                {{ dayjs(activity.timestamp).format('DD MMM YYYY, HH:mm') }}
              </VListItemSubtitle>

              <template #append>
                <div
                  v-if="activity.amount"
                  class="text-success font-weight-medium"
                >
                  {{ formatCurrency(activity.amount) }}
                </div>
              </template>
            </VListItem>
          </VList>

          <div
            v-if="recentActivities.length === 0"
            class="text-center py-8"
          >
            <VIcon
              icon="tabler-inbox"
              size="48"
              class="text-disabled mb-3"
            />
            <div class="text-body-1 text-medium-emphasis">
              Belum ada aktivitas terbaru
            </div>
          </div>
        </VCardText>
      </VCard>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.border-b {
  border-block-end: 1px solid rgb(var(--v-theme-surface-variant));
}
</style>
