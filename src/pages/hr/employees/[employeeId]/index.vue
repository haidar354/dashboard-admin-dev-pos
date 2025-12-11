<!-- eslint-disable indent -->
<script setup lang="ts">
import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { useEmployeeStore } from '@/stores/employeeStore'
import noImage from '@images/avatars/avatar-1.png'

definePage({
  meta: {
    name: 'Detail Karyawan',
    navActiveLink: 'hr-employees',
    rules: [
      {
        action: 'manage',
        subject: 'Lihat Karyawan',
      },
      {
        action: 'manage',
        subject: 'Lihat Semua Karyawan',
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
const employeeStore = useEmployeeStore()
const { isLoadingFetchDetail, selectedEmployee } = storeToRefs(employeeStore)
const employeeId = (route.params as { employeeId: string }).employeeId

// Mock data for demonstration - replace with actual API calls
const employeeStats = ref({
  totalSales: 0,
  totalTransactions: 0,
  avgTransactionValue: 0,
  workingDays: 0,
})

const recentActivities = ref<any[]>([

])

onMounted(() => {
  if (employeeId) {
    employeeStore.fetchDetailAndSetForm(employeeId).catch(() => {
      router.push({ name: 'hr-employees' })
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'error'
    case 'suspended':
      return 'warning'
    default:
      return 'secondary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Aktif'
    case 'inactive':
      return 'Tidak Aktif'
    case 'suspended':
      return 'Ditangguhkan'
    default:
      return 'Unknown'
  }
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
                @click="router.push({ name: 'hr-employees' })"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
              <span>Detail Karyawan</span>
            </div>
            <div class="d-flex gap-2">
              <VBtn
                v-if="$can('manage', 'Edit Karyawan') || $can('manage', 'Edit Semua Karyawan') || $can('manage', 'default')"
                color="primary"
                variant="outlined"
                :to="{
                  name: 'hr-employees-employee-id-edit',
                  params: { employeeId: selectedEmployee.employeeId },
                }"
              >
                <VIcon
                  start
                  icon="tabler-edit"
                />
                Edit Karyawan
              </VBtn>
            </div>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <div class="d-flex gap-6 flex-column flex-md-row">
            <!-- Employee Avatar -->
            <div class="flex-shrink-0 text-center">
              <VAvatar
                size="200"
                class="mb-4"
              >
                <VImg
                  :src="selectedEmployee.user?.avatar || noImage"
                  alt="Employee Avatar"
                />
              </VAvatar>
              <VChip
                :color="getStatusColor('active')"
                size="small"
                class="mb-2"
              >
                {{ getStatusText('active') }}
              </VChip>
            </div>

            <!-- Employee Information -->
            <div class="flex-grow-1">
              <div class="d-flex align-center gap-3 mb-3">
                <div class="text-h4 font-weight-bold">
                  {{ selectedEmployee.user?.name || selectedEmployee.name || 'Nama tidak tersedia' }}
                </div>
                <VChip
                  color="primary"
                  size="small"
                >
                  {{ selectedEmployee.user?.roles?.[0]?.name || 'Role tidak tersedia' }}
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
                        icon="tabler-id"
                        size="16"
                        class="me-1"
                      />
                      Jabatan
                    </div>
                    <div class="text-body-1 font-weight-medium">
                      {{ selectedEmployee.position || '-' }}
                    </div>
                  </div>

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
                      {{ selectedEmployee.user?.phone || '-' }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-map-pin"
                        size="16"
                        class="me-1"
                      />
                      Alamat
                    </div>
                    <div class="text-body-1">
                      {{ selectedEmployee.address || '-' }}
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
                        icon="tabler-building-store"
                        size="16"
                        class="me-1"
                      />
                      Outlet
                    </div>
                    <div class="text-body-1">
                      {{ selectedEmployee.employeeAssignments?.[0]?.org?.name || 'Outlet tidak tersedia' }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-calendar-plus"
                        size="16"
                        class="me-1"
                      />
                      Tanggal Bergabung
                    </div>
                    <div class="text-body-1">
                      {{ dayjs(selectedEmployee.createdAt).format('DD MMMM YYYY') }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="text-body-2 text-medium-emphasis mb-1">
                      <VIcon
                        icon="tabler-clock"
                        size="16"
                        class="me-1"
                      />
                      Terakhir Diperbarui
                    </div>
                    <div class="text-body-1">
                      {{ dayjs(selectedEmployee.updatedAt).format('DD MMMM YYYY, HH:mm') }}
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
                <VIcon icon="tabler-currency-dollar" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  Total Penjualan
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ formatCurrency(employeeStats.totalSales) }}
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
                  Total Transaksi
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ employeeStats.totalTransactions.toLocaleString() }}
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
                <VIcon icon="tabler-chart-line" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  Rata-rata Transaksi
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ formatCurrency(employeeStats.avgTransactionValue) }}
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
                <VIcon icon="tabler-calendar-check" />
              </VAvatar>
              <div>
                <div class="text-body-2 text-medium-emphasis">
                  Hari Kerja Bulan Ini
                </div>
                <div class="text-h6 font-weight-medium">
                  {{ employeeStats.workingDays }} hari
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
