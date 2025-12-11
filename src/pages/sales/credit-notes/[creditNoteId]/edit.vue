<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { useCreditNoteStore } from '@/stores/sales/creditNoteStore'
import { useCustomerStore } from '@/stores/sales/customerStore'
import { useInvoiceStore } from '@/stores/sales/invoiceStore'
import { CreditNoteStatus } from '@/types/models/sales/credit-note'
import type { UpdateCreditNoteRequest } from '@/types/models/sales/credit-note'

definePage({
  meta: {
    name: 'Edit Credit Note',
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
const creditNoteStore = useCreditNoteStore()
const customerStore = useCustomerStore()
const invoiceStore = useInvoiceStore()

const { selectedCreditNote, isLoadingFetchDetail } = storeToRefs(creditNoteStore)
const creditNoteId = route.params.creditNoteId as string

const formData = ref<UpdateCreditNoteRequest>({
  creditNoteDate: '',
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

// Check if editable
const canEdit = computed(() => {
  return selectedCreditNote.value.status === CreditNoteStatus.DRAFT
})

// Load initial data
onMounted(async () => {
  if (creditNoteId)
    await creditNoteStore.fetchDetail(creditNoteId)

  // Load initial customers
  await customerStore.fetchPaginatedData({ perPage: 20 })
  customerOptions.value = customerStore.paginateData.data || []

  // Load initial invoices
  await invoiceStore.fetchPaginatedData({ perPage: 20 })
  invoiceOptions.value = invoiceStore.paginateData.data || []
})

// Populate form when credit note is loaded
watch(() => selectedCreditNote.value.creditNoteId, newVal => {
  if (newVal) {
    formData.value = {
      creditNoteDate: dayjs(selectedCreditNote.value.creditNoteDate).format('YYYY-MM-DD'),
      customerId: selectedCreditNote.value.customerId,
      invoiceId: selectedCreditNote.value.invoiceId || undefined,
      amount: selectedCreditNote.value.amount / 100, // Convert from cents
      reason: selectedCreditNote.value.reason || '',
    }

    // Set amount display
    amountDisplay.value = formatRupiah(selectedCreditNote.value.amount / 100)

    selectedCustomer.value = selectedCreditNote.value.customer
    customerSearch.value = selectedCreditNote.value.customer?.name || ''

    selectedInvoice.value = selectedCreditNote.value.invoice
    invoiceSearch.value = selectedCreditNote.value.invoice?.invoiceNumber || ''

    // Redirect if not editable
    if (!canEdit.value)
      router.push(`/sales/credit-notes/${creditNoteId}`)
  }
}, { immediate: true })

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
  }
}

const isFormValid = computed(() => {
  return formData.value.creditNoteDate
    && formData.value.customerId
    && formData.value.amount
    && formData.value.amount > 0
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!isFormValid.value || !canEdit.value)
    return

  isSubmitting.value = true
  try {
    const payload = {
      ...formData.value,
      amount: Math.round(formData.value.amount! * 100), // Convert to cents
    }

    await creditNoteStore.updateCreditNote(creditNoteId, payload)
    router.push(`/sales/credit-notes/${creditNoteId}`)
  }
  catch (error) {
    console.error('Failed to update credit note:', error)
  }
  finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push(`/sales/credit-notes/${creditNoteId}`)
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
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
              Edit Credit Note
            </h4>
            <div class="text-caption">
              {{ selectedCreditNote.creditNoteNumber }}
            </div>
          </div>
        </div>
      </VCol>

      <!-- Loading State -->
      <VCol
        v-if="isLoadingFetchDetail"
        cols="12"
      >
        <VCard>
          <VCardText>
            <VSkeletonLoader type="article, actions" />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Form -->
      <template v-else-if="selectedCreditNote.creditNoteId && canEdit">
        <VCol
          cols="12"
          md="8"
        >
          <VCard>
            <VCardTitle>Edit Informasi Credit Note</VCardTitle>
            <VCardText>
              <VForm @submit.prevent="handleSubmit">
                <VRow>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <AppDateTimePicker
                      v-model="formData.creditNoteDate"
                      label="Tanggal Credit Note"
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
                      density="compact"
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
                      density="compact"
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
                      density="compact"
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
                      density="compact"
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
                color="primary"
                :disabled="!isFormValid"
                :loading="isSubmitting"
                @click="handleSubmit"
              >
                Simpan Perubahan
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
                type="warning"
                variant="tonal"
                class="mb-4"
              >
                Hanya credit note dengan status <strong>DRAFT</strong> yang dapat diedit.
              </VAlert>

              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Status Saat Ini
                </div>
                <VChip
                  size="small"
                  color="secondary"
                  class="mt-1"
                >
                  {{ selectedCreditNote.status }}
                </VChip>
              </div>

              <div class="mb-3">
                <div class="text-caption text-medium-emphasis">
                  Dibuat
                </div>
                <div class="text-body-2">
                  {{ dayjs(selectedCreditNote.createdAt).format('DD MMM YYYY HH:mm') }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </template>

      <!-- Not Editable Message -->
      <VCol
        v-else-if="!canEdit"
        cols="12"
      >
        <VAlert
          type="error"
          variant="tonal"
        >
          Credit Note ini tidak dapat diedit karena statusnya bukan DRAFT.
        </VAlert>
      </VCol>
    </VRow>
  </div>
</template>
