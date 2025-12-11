<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { useBusinessUnitStore } from '@/stores/businessUnitStore'
import noImage from '@images/illustrations/outlet.png'

definePage({
  meta: {
    name: 'Detail Unit Bisnis',
    navActiveLink: 'setting-business-units',
    rules: [
      {
        action: 'manage',
        subject: 'Lihat Unit Bisnis',
      },
      {
        action: 'manage',
        subject: 'Lihat Semua Unit Bisnis',
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
const businessUnitStore = useBusinessUnitStore()
const { isLoadingFetchDetail, selectedBusinessUnit } = storeToRefs(businessUnitStore)
const businessUnitId = (route.params as { businessUnitId: string }).businessUnitId

const recentActivities: any = ref([
])

onMounted(() => {
  if (businessUnitId)
    businessUnitStore.fetchDetail(businessUnitId, { include: ['province', 'city', 'outletsCount'] })
})
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
                @click="router.push({ name: 'setting-business-units' })"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
              <span>Detail Unit Bisnis</span>
            </div>
            <div class="d-flex gap-2">
              <VBtn
                v-if="$can('manage', 'Edit Unit Bisnis') || $can('manage', 'Edit Semua Unit Bisnis') || $can('manage', 'default')"
                color="primary"
                variant="outlined"
                :to="{
                  name: 'setting-business-units-business-unit-id-edit',
                  params: { businessUnitId: selectedBusinessUnit.businessUnitId },
                }"
              >
                <VIcon
                  start
                  icon="tabler-edit"
                />
                Edit Unit Bisnis
              </VBtn>
            </div>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <div class="d-flex gap-6 flex-column flex-md-row">
            <div class="flex-shrink-0">
              <VImg
                width="200"
                height="200"
                :src="selectedBusinessUnit.logo || noImage"
                class="rounded-lg"
              />
            </div>

            <!-- Outlet Information -->
            <div class="flex-grow-1">
              <div class="d-flex align-center gap-3 mb-3">
                <div class="text-h4 font-weight-bold">
                  {{ selectedBusinessUnit.name }}
                </div>
              </div>

              <VRow class="mb-4">
                <VCol
                  cols="12"
                  md="6"
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
                      {{ selectedBusinessUnit.province?.name || '-' }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
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
                      {{ selectedBusinessUnit.city?.name || '-' }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
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
                      {{ selectedBusinessUnit.description || '-' }}
                    </div>
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
                <VIcon icon="tabler-building-store" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  Total Outlet
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ selectedBusinessUnit.outletsCount || 0 }}
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
                  0
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
                  0
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
                  0
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
                  0
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
