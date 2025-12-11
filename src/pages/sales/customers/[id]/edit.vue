<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCustomerStore } from '@/stores/sales/customerStore'
import CustomerForm from '@/components/sales/customers/CustomerForm.vue'
import type { CreateCustomerRequest } from '@/types/models/sales/customer'

definePage({
  meta: {
    name: 'Edit Pelanggan',
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
const { selectedCustomer, isLoadingFetchDetail, isLoadingUpdate } = storeToRefs(customerStore)

const customerId = route.params.id as string

onMounted(async () => {
  if (customerId)
    await customerStore.fetchDetail(customerId)
})

const handleSubmit = async (data: CreateCustomerRequest) => {
  try {
    await customerStore.updateCustomer(customerId, data)
    router.push('/sales/customers')
  }
  catch (error) {
    console.error('Failed to update customer:', error)
  }
}

const handleCancel = () => {
  router.push('/sales/customers')
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <VBtn
        icon
        variant="text"
        class="me-2"
        @click="handleCancel"
      >
        <VIcon icon="tabler-arrow-left" />
      </VBtn>
      <div>
        <h4 class="text-h4 font-weight-bold">
          Edit Pelanggan
        </h4>
        <div
          v-if="selectedCustomer?.name"
          class="text-body-1 text-medium-emphasis"
        >
          {{ selectedCustomer.name }}
        </div>
      </div>
    </div>

    <VCard
      v-if="isLoadingFetchDetail"
      class="d-flex justify-center align-center pa-12"
      min-height="300"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="64"
      />
    </VCard>

    <CustomerForm
      v-else
      :initial-data="selectedCustomer"
      :is-loading="isLoadingUpdate"
      is-edit
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>
