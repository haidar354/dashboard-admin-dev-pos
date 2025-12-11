```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useCreditNoteStore } from '@/stores/sales/creditNoteStore'
import { useCustomerStore } from '@/stores/sales/customerStore'
import { useInvoiceStore } from '@/stores/sales/invoiceStore'
import type { CreateCreditNoteRequest } from '@/types/models/sales/credit-note'

definePage({
  meta: {
    name: 'Buat Credit Note',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const creditNoteStore = useCreditNoteStore()
const customerStore = useCustomerStore()
const invoiceStore = useInvoiceStore()

const formData = ref<CreateCreditNoteRequest>({
  creditNoteDate: dayjs().format('YYYY-MM-DD'),
  customerId: '',
  invoiceId: undefined,
  amount: 0,
  reason: '',
})

const customerSearch = ref('')
const customerOptions = ref<any[]>([])
const isLoadingCustomers = ref(false)

const invoiceSearch = ref('')
const invoiceOptions = ref<any[]>([])
const isLoadingInvoices = ref(false)

const selectedCustomer = ref<any>(null)
const selectedInvoice = ref<any>(null)

// Amount formatting
const amountDisplay = ref('')

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const onAmountInput = (event: any) => {
  const value = event.target.value
  const numericValue = Number.parseFloat(value.replace(/\./g, '').replace(/,/g, '.') || '0')

  formData.value.amount = numericValue
  amountDisplay.value = formatRupiah(numericValue)
}

// Initial data load
onMounted(async () => {
  // Load initial customers
  await customerStore.fetchPaginatedData({ perPage: 20 })
  customerOptions.value = customerStore.paginateData.data || []

  // Load initial invoices
  await invoiceStore.fetchPaginatedData({ perPage: 20 })
  invoiceOptions.value = invoiceStore.paginateData.data || []
})

// Search customers
const searchCustomers = async (query: string) => {
  if (!query || query.length < 2)
    return

  isLoadingCustomers.value = true
  try {
    await customerStore.fetchPaginatedData({
      search: query,
      perPage: 10,
    })
    customerOptions.value = customerStore.paginateData.data || []
  }
  catch (error) {
    console.error('Error searching customers:', error)
  }
  finally {
    isLoadingCustomers.value = false
  }
}

// Search invoices
const searchInvoices = async (query: string) => {
  if (!query || query.length < 2)
    return

  isLoadingInvoices.value = true
  try {
    await invoiceStore.fetchPaginatedData({
      search: query,
      perPage: 10,
    })
    invoiceOptions.value = invoiceStore.paginateData.data || []
  }
  catch (error) {
    console.error('Error searching invoices:', error)
  }
  finally {
    isLoadingInvoices.value = false
  }
}

const onCustomerSelect = (customer: any) => {
  if (customer) {
    selectedCustomer.value = customer
    formData.value.customerId = customer.customerId
  }
}

const onInvoiceSelect = (invoice: any) => {
  if (invoice) {
    selectedInvoice.value = invoice
    formData.value.invoiceId = invoice.invoiceId

    // Optionally pre-fill customer from invoice
    if (invoice.customer && !formData.value.customerId) {
      selectedCustomer.value = invoice.customer
      formData.value.customerId = invoice.customer.customerId
      customerSearch.value = invoice.customer.name
    }
  }
}

const isFormValid = computed(() => {
  return formData.value.creditNoteDate
    && formData.value.customerId
    && formData.value.amount > 0
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!isFormValid.value)
    return

  isSubmitting.value = true
  try {
    const payload = {
      ...formData.value,
      amount: Math.round(formData.value.amount * 100), // Convert to cents
    }

    const creditNote = await creditNoteStore.createCreditNote(payload)

    router.push(`/sales/credit-notes/${creditNote.creditNoteId}`)
  }
  catch (error) {
    console.error('Failed to create credit note:', error)
  }
  finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/sales/credit-notes')
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardText>
            <div class="d-flex align-center">
              <VBtn
                icon
                variant="text"
                class="me-2"
                @click="handleCancel"
              >
                <VIcon icon="tabler-arrow-left" />
              </VBtn>
              <div>
                <div class="text-h4 ">
                  Buat Catatan Kredit Baru
                </div>
                <div class="text-caption">
                  Buat catatan kredit untuk pelanggan
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <VCard>
          <VCardItem>
            <VCardTitle>Informasi Catatan Kredit</VCardTitle>
          </VCardItem>
          <VCardText>
            <VForm @submit.prevent="handleSubmit">
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="formData.creditNoteNumber"
                    label="Nomor Catatan Kredit (Opsional)"
                    placeholder="Kosongkan untuk auto-generate"
                    hint="Jika dikosongkan, sistem akan generate otomatis"
                    persistent-hint
                    persistent-placeholder
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <AppDateTimePicker
                    v-model="formData.creditNoteDate"
                    label="Tanggal Catatan Kredit"
                    :inline-label="true"
                    :config="{ mode: 'single', dateFormat: 'Y-m-d' }"
                  />
                </VCol>

                <VCol cols="12">
                  <VAutocomplete
                    v-model="selectedCustomer"
                    v-model:search="customerSearch"
                    :items="customerOptions"
                    :loading="isLoadingCustomers"
                    item-title="name"
                    item-value="customerId"
                    label="Pelanggan *"
                    placeholder="Cari pelanggan..."
                    clearable
                    return-object
                    :rules="[v => !!v || 'Pelanggan harus dipilih']"
                    @update:search="searchCustomers"
                    @update:model-value="onCustomerSelect"
                  >
                    <template #item="{ props, item }">
                      <VListItem v-bind="props">
                        <template #title>
                          {{ item.raw.name }}
                        </template>
                        <template #subtitle>
                          {{ item.raw.email || item.raw.phone }}
                        </template>
                      </VListItem>
                    </template>
                  </VAutocomplete>
                </VCol>

                <VCol cols="12">
                  <VAutocomplete
                    v-model="selectedInvoice"
                    v-model:search="invoiceSearch"
                    :items="invoiceOptions"
                    :loading="isLoadingInvoices"
                    item-title="invoiceNumber"
                    item-value="invoiceId"
                    label="Invoice Reference (Optional)"
                    placeholder="Cari invoice..."
                    clearable
                    return-object
                    @update:search="searchInvoices"
                    @update:model-value="onInvoiceSelect"
                  >
                    <template #item="{ props, item }">
                      <VListItem v-bind="props">
                        <template #title>
                          {{ item.raw.invoiceNumber }}
                        </template>
                        <template #subtitle>
                          {{ item.raw.customer?.name }} - {{ dayjs(item.raw.invoiceDate).format('DD MMM YYYY') }}
                        </template>
                      </VListItem>
                    </template>
                  </VAutocomplete>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="amountDisplay"
                    label="Jumlah *"
                    prefix="Rp"
                    placeholder="0"
                    :rules="[
                      v => !!v || 'Jumlah harus diisi',
                      v => parseFloat(v?.replace(/\./g, '').replace(/,/g, '.') || '0') > 0 || 'Jumlah harus lebih dari 0',
                    ]"
                    @input="onAmountInput"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextarea
                    v-model="formData.reason"
                    label="Alasan"
                    rows="3"
                    placeholder="Masukkan alasan pemberian credit note..."
                  />
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
          <VCardActions class="justify-end">
            <VBtn
              variant="outlined"
              @click="handleCancel"
            >
              Batal
            </VBtn>
            <VBtn
              variant="elevated"
              color="primary"
              :disabled="!isFormValid"
              :loading="isSubmitting"
              @click="handleSubmit"
            >
              Simpan
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardTitle>Informasi</VCardTitle>
          <VCardText>
            <VAlert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              Credit Note akan dibuat dengan status <strong>DRAFT</strong>. Anda perlu approve untuk mengaktifkannya.
            </VAlert>

            <div class="text-caption mb-2">
              <strong>Catatan:</strong>
            </div>
            <ul class="text-caption text-medium-emphasis">
              <li>Credit Note dapat digunakan untuk pembayaran invoice di masa depan</li>
              <li>Jumlah yang terpakai akan dikurangi dari total credit note</li>
              <li>Status DRAFT dapat diedit dan dihapus</li>
            </ul>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
