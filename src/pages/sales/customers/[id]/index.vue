<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCustomerStore } from '@/stores/sales/customerStore'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

definePage({
  meta: {
    name: 'Detail Pelanggan',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const route = useRoute()
const router = useRouter()
const customerStore = useCustomerStore()
const confirmDialogStore = useConfirmDialogStore()

const { selectedCustomer, isLoadingFetchDetail, isLoadingDelete } = storeToRefs(customerStore)
const customerId = route.params.id as string

const activeTab = ref(0)

onMounted(async () => {
  if (customerId)
    await customerStore.fetchDetail(customerId)
})

const onDelete = async () => {
  const confirmed = await confirmDialogStore.openDialog(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus customer "${selectedCustomer.value.name}"?`,
  )

  if (confirmed) {
    const success = await customerStore.delete(customerId)
    if (success)
      router.push('/sales/customers')
  }
}

const formattedAddress = computed(() => {
  if (!selectedCustomer.value)
    return '-'

  const parts = []
  if (selectedCustomer.value.village?.name)
    parts.push(selectedCustomer.value.village.name)
  if (selectedCustomer.value.district?.name)
    parts.push(selectedCustomer.value.district.name)
  if (selectedCustomer.value.city?.name)
    parts.push(selectedCustomer.value.city.name)
  if (selectedCustomer.value.province?.name)
    parts.push(selectedCustomer.value.province.name)

  let addressLine = parts.join(', ')
  if (selectedCustomer.value.postalCode)
    addressLine += ` ${selectedCustomer.value.postalCode}`

  return addressLine
})

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount / 100)
}
</script>

<template>
  <div>
    <VRow>
      <!-- Header -->
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <VBtn
              icon
              variant="text"
              class="me-2"
              @click="$router.push('/sales/customers')"
            >
              <VIcon icon="tabler-arrow-left" />
            </VBtn>
            <div>
              <h4 class="text-h4 font-weight-bold">
                Detail Pelanggan
              </h4>
              <div class="text-caption">
                {{ selectedCustomer.customerId }}
              </div>
            </div>
          </div>
          <div class="d-flex gap-2">
            <VBtn
              color="error"
              variant="tonal"
              prepend-icon="tabler-trash"
              :loading="isLoadingDelete"
              @click="onDelete"
            >
              Hapus
            </VBtn>
            <VBtn
              color="primary"
              prepend-icon="tabler-edit"
              @click="$router.push(`/sales/customers/${customerId}/edit`)"
            >
              Edit
            </VBtn>
          </div>
        </div>
      </VCol>

      <VCol cols="12">
        <!-- Loading Skeleton -->
        <VCard v-if="isLoadingFetchDetail">
          <VCardText>
            <VRow>
              <VCol cols="12" md="4" class="d-flex flex-column align-center text-center border-e">
                <VSkeletonLoader
                  type="avatar"
                  class="mb-4"
                  width="120"
                  height="120"
                />
                <VSkeletonLoader
                  type="heading"
                  class="mb-2"
                  width="150"
                />
                <VSkeletonLoader
                  type="chip"
                  class="mb-4"
                  width="100"
                />
                <VSkeletonLoader
                  type="text"
                  width="120"
                />
              </VCol>

              <VCol cols="12" md="8">
                <VSkeletonLoader
                  type="heading"
                  class="mb-4"
                />
                <VSkeletonLoader
                  type="list-item-two-line"
                  class="mb-2"
                />
                <VSkeletonLoader
                  type="list-item-two-line"
                  class="mb-2"
                />
                <VSkeletonLoader
                  type="list-item-two-line"
                  class="mb-2"
                />
                <VSkeletonLoader
                  type="list-item-two-line"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Actual Content -->
        <VCard v-else-if="selectedCustomer.customerId">
          <VCardText>
            <VRow>
              <!-- Profile Info -->
              <VCol cols="12" md="4" class="d-flex flex-column align-center text-center border-e">
                <VAvatar
                  size="120"
                  color="primary"
                  variant="tonal"
                  class="mb-4"
                >
                  <VImg
                    v-if="selectedCustomer.photoUrl"
                    :src="selectedCustomer.photoUrl"
                    cover
                  />
                  <span v-else class="text-h2">{{ selectedCustomer.name?.charAt(0).toUpperCase() }}</span>
                </VAvatar>
                <h5 class="text-h5 font-weight-bold mb-1">
                  {{ selectedCustomer.name }}
                </h5>
                <VChip
                  color="primary"
                  size="small"
                  class="mb-4"
                >
                  {{ selectedCustomer.customerType }}
                </VChip>
                
                <div class="d-flex gap-4 mb-4">
                  <div class="text-center">
                    <div class="text-h6 font-weight-bold">
                      {{ formatRupiah(selectedCustomer.totalSpending || 0) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Total Belanja
                    </div>
                  </div>
                </div>
              </VCol>

              <!-- Details -->
              <VCol cols="12" md="8">
                <VTabs v-model="activeTab">
                  <VTab>Overview</VTab>
                  <VTab>Riwayat Pesanan</VTab>
                  <VTab>Tagihan</VTab>
                </VTabs>
                
                <VWindow v-model="activeTab" class="mt-4">
                  <VWindowItem>
                    <VList lines="two">
                      <VListItem class="px-0">
                        <template #prepend>
                          <VIcon icon="tabler-mail" class="me-2" />
                        </template>
                        <VListItemTitle>Email</VListItemTitle>
                        <VListItemSubtitle>{{ selectedCustomer.email || '-' }}</VListItemSubtitle>
                      </VListItem>
                      
                      <VListItem class="px-0">
                        <template #prepend>
                          <VIcon icon="tabler-phone" class="me-2" />
                        </template>
                        <VListItemTitle>Telepon</VListItemTitle>
                        <VListItemSubtitle>{{ selectedCustomer.phone || '-' }}</VListItemSubtitle>
                      </VListItem>

                      <VListItem class="px-0">
                        <template #prepend>
                          <VIcon icon="tabler-map-pin" class="me-2" />
                        </template>
                        <VListItemTitle>Alamat</VListItemTitle>
                        <VListItemSubtitle>
                          <div class="font-weight-medium mb-1">{{ selectedCustomer.address || '-' }}</div>
                          <div v-if="formattedAddress !== '-'" class="text-body-2 text-medium-emphasis">
                            {{ formattedAddress }}
                          </div>
                        </VListItemSubtitle>
                      </VListItem>

                      <VListItem class="px-0">
                        <template #prepend>
                          <VIcon icon="tabler-calendar" class="me-2" />
                        </template>
                        <VListItemTitle>Bergabung Sejak</VListItemTitle>
                        <VListItemSubtitle>{{ dayjs(selectedCustomer.createdAt).format('DD MMMM YYYY') }}</VListItemSubtitle>
                      </VListItem>
                    </VList>

                    <VDivider class="my-4" />

                    <h6 class="text-h6 font-weight-medium mb-4">
                      Informasi Bisnis & Keuangan
                    </h6>
                    <VRow>
                      <VCol cols="12" md="6">
                        <div class="text-caption text-medium-emphasis">NPWP (Tax ID)</div>
                        <div class="text-body-1">{{ selectedCustomer.taxId || '-' }}</div>
                      </VCol>
                      <VCol cols="12" md="6">
                        <div class="text-caption text-medium-emphasis">Termin Pembayaran</div>
                        <div class="text-body-1">{{ selectedCustomer.paymentTerms }}</div>
                      </VCol>
                      <VCol cols="12" md="6">
                        <div class="text-caption text-medium-emphasis">Limit Kredit</div>
                        <div class="text-body-1">{{ formatRupiah((selectedCustomer.creditLimit || 0)) }}</div>
                      </VCol>
                    </VRow>

                    <VDivider class="my-4" />

                    <h6 class="text-h6 font-weight-medium mb-4">
                      Informasi Personal
                    </h6>
                    <VRow>
                      <VCol cols="12" md="6">
                        <div class="text-caption text-medium-emphasis">Jenis Kelamin</div>
                        <div class="text-body-1 text-capitalize">{{ selectedCustomer.gender || '-' }}</div>
                      </VCol>
                      <VCol cols="12" md="6">
                        <div class="text-caption text-medium-emphasis">Tanggal Lahir</div>
                        <div class="text-body-1">{{ selectedCustomer.birthday ? dayjs(selectedCustomer.birthday).format('DD MMMM YYYY') : '-' }}</div>
                      </VCol>
                    </VRow>
                  </VWindowItem>
                  
                  <VWindowItem>
                    <VAlert type="info" variant="tonal" class="mt-2">
                      Riwayat pesanan akan segera hadir
                    </VAlert>
                  </VWindowItem>

                  <VWindowItem>
                    <VAlert type="info" variant="tonal" class="mt-2">
                      Daftar tagihan akan segera hadir
                    </VAlert>
                  </VWindowItem>
                </VWindow>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
