<script setup lang="ts">
import { useCustomerStore } from '@/stores/sales/customerStore'
import CustomerForm from '@/components/sales/customers/CustomerForm.vue'
import type { CreateCustomerRequest } from '@/types/models/sales/customer'

definePage({
  meta: {
    name: 'Tambah Pelanggan',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const customerStore = useCustomerStore()

const handleSubmit = async (data: CreateCustomerRequest) => {
  try {
    await customerStore.createCustomer(data)
    router.push('/sales/customers')
  }
  catch (error) {
    console.error('Failed to create customer:', error)
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
      <h4 class="text-h4 font-weight-bold">
        Tambah Pelanggan Baru
      </h4>
    </div>

    <CustomerForm
      :is-loading="customerStore.isLoadingCreate"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>
