<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { useCompanyStore } from '@/stores/companyStore'

definePage({
  meta: {
    name: 'Profil Perusahaan',
    rules: [
      {
        action: 'manage',
        subject: 'Lihat Profil Perusahaan',
      },
      {
        action: 'manage',
        subject: 'Lihat Semua Profil Perusahaan',
      },
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

dayjs.locale(id)

const companyStore = useCompanyStore()
const { isLoadingFetchDetail, selectedCompany } = storeToRefs(companyStore)

// Mock data for demonstration - replace with actual API calls
const companyStats = ref({
  totalOutlets: 0,
  totalOrders: 0,
  totalCustomers: 0,
  avgOrderValue: 0,
})

const recentActivities = ref([])

onMounted(() => {
  companyStore.fetchDetailAndSetForm()
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
              <span>Profil Perusahaan</span>
            </div>
            <div class="d-flex gap-2">
              <VBtn
                v-if="$can('manage', 'Edit Profil Perusahaan') || $can('manage', 'default')"
                color="primary"
                variant="outlined"
                :to="{
                  name: 'setting-profile-company-edit',
                }"
              >
                <VIcon
                  start
                  icon="tabler-edit"
                />
                Edit Profil Perusahaan
              </VBtn>
            </div>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <div class="d-flex gap-6 flex-column flex-md-row">
            <!-- Outlet Image -->
            <div class="flex-shrink-0">
              <VAvatar
                size="200"
                rounded
              >
                <VImg
                  v-if="selectedCompany.logo"
                  :src="selectedCompany.logo"
                />
                <VIcon
                  v-else
                  icon="tabler-building-skyscraper"
                  size="200"
                />
              </VAvatar>
            </div>

            <!-- Outlet Information -->
            <div class="flex-grow-1">
              <div class="d-flex align-center gap-3 mb-3">
                <div class="text-h4 font-weight-bold">
                  {{ selectedCompany.name }}
                </div>
              </div>

              <VRow class="mb-4">
                <VCol
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-map-pin"
                        size="16"
                        class="me-1"
                      />
                      Provinsi
                    </div>
                    <div class="text-body-1">
                      {{ selectedCompany.province?.name || '-' }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-map-pin"
                        size="16"
                        class="me-1"
                      />
                      Kota
                    </div>
                    <div class="text-body-1">
                      {{ selectedCompany.city?.name || '-' }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                  lg="4"
                >
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
                      {{ dayjs(selectedCompany.createdAt).format('DD MMMM YYYY, HH:mm') }}
                    </div>
                  </div>
                </VCol>

                <!--
                  <VCol cols="12">
                  <div class="mb-3">
                  <div class="text-body-2 text-medium-emphasis mb-1">
                  <VIcon
                  icon="tabler-info-circle"
                  size="16"
                  class="me-1"
                  />
                  Deskripsi
                  </div>
                  <div class="text-body-1">
                  {{ selectedCompany.description || '-' }}
                  </div>
                  </div>
                  </VCol>
                -->
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
                  Total Outlet
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ companyStats.totalOutlets.toLocaleString() }}
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
                  {{ companyStats.totalOrders.toLocaleString() }}
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
                  {{ companyStats.totalCustomers.toLocaleString() }}
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
                  {{ formatCurrency(companyStats.avgOrderValue) }}
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
