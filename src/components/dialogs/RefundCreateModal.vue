<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePaymentStore } from '@/stores/sales/paymentStore'
import { useRefundStore } from '@/stores/sales/refundStore'
import type { OrderPayment } from '@/types/models/sales/order-payment'
import { formatCurrency } from '@/utils/common'

interface Props {
  modelValue: boolean
  paymentId?: string // Optional: jika ada, autocomplete disabled
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const paymentStore = usePaymentStore()
const refundStore = useRefundStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// Form data
const formData = ref({
  paymentId: '',
  refundDate: new Date().toISOString().split('T')[0],
  amount: 0,
  refundMethod: 'CASH' as
    | 'CASH'
    | 'BANK_TRANSFER'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'QRIS'
    | 'E_WALLET'
    | 'CHECK'
    | 'OTHER',
  referenceNumber: '',
  reason: '',
})

const refundMethods = [
  { title: 'Cash', value: 'CASH' },
  { title: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { title: 'Credit Card', value: 'CREDIT_CARD' },
  { title: 'Debit Card', value: 'DEBIT_CARD' },
  { title: 'QRIS', value: 'QRIS' },
  { title: 'E-Wallet', value: 'E_WALLET' },
  { title: 'Check', value: 'CHECK' },
  { title: 'Other', value: 'OTHER' },
]

// Payment autocomplete
const paymentSearch = ref('')
const paymentLoading = ref(false)
const paymentOptions = ref<OrderPayment[]>([])
const selectedPayment = ref<OrderPayment | null>(null)

// Fetch payments yang bisa di-refund (tidak voided)
const fetchRefundablePayments = async () => {
  if (props.paymentId)
    return // Skip jika sudah ada paymentId dari props

  paymentLoading.value = true
  try {
    const response = await $salesAPI<any>('payments', {
      params: {
        search: paymentSearch.value,
        perPage: 20,
        include: 'invoice.order.salesOrder',
      },
    })

    // Filter hanya payment yang tidak voided dan belum fully refunded
    paymentOptions.value = (response.data || []).filter(
      (p: OrderPayment & { refundStatus?: string }) =>
        !p.isVoided && p.refundStatus !== 'FULLY_REFUNDED',
    )
  }
  catch (error) {
    console.error('Error fetching payments:', error)
    paymentOptions.value = []
  }
  finally {
    paymentLoading.value = false
  }
}

// Watch payment search dengan debounce
watch(
  paymentSearch,
  customDebounce(() => {
    if (!props.paymentId)
      fetchRefundablePayments()
  }, 400),
)

// Watch selected payment
watch(
  () => formData.value.paymentId,
  async newPaymentId => {
    if (newPaymentId) {
      const payment = paymentOptions.value.find(
        p => p.paymentId === newPaymentId,
      )

      if (payment) {
        selectedPayment.value = payment

        // Set max amount to remaining refundable amount
        formData.value.amount
          = (payment as any).remainingRefundableAmount ?? payment.amount

        // Default refund method sama dengan payment method
        formData.value.refundMethod = payment.paymentMethod as any
      }
    }
    else {
      selectedPayment.value = null
      formData.value.amount = 0
    }
  },
)

// Load payment jika ada paymentId dari props
watch(
  () => props.paymentId,
  async newPaymentId => {
    if (newPaymentId && isOpen.value) {
      try {
        const payment = await paymentStore.fetchPaymentDetail(newPaymentId, {
          include: 'invoice.order.salesOrder',
        })

        if (payment) {
          selectedPayment.value = payment
          paymentOptions.value = [payment]
          formData.value.paymentId = payment.paymentId
          formData.value.amount
            = (payment as any).remainingRefundableAmount ?? payment.amount
          formData.value.refundMethod = payment.paymentMethod as any
        }
      }
      catch (error) {
        console.error('Error fetching payment:', error)
      }
    }
  },
  { immediate: true },
)

// Validation
const isFormValid = computed(() => {
  return (
    formData.value.paymentId
    && formData.value.refundDate
    && formData.value.amount > 0
    && formData.value.refundMethod
    && formData.value.reason.trim() !== ''
  )
})

const maxRefundAmount = computed(() => {
  return (
    (selectedPayment.value as any)?.remainingRefundableAmount
    ?? selectedPayment.value?.amount
    ?? 0
  )
})

const handleClose = () => {
  formData.value = {
    paymentId: '',
    refundDate: new Date().toISOString().split('T')[0],
    amount: 0,
    refundMethod: 'CASH',
    referenceNumber: '',
    reason: '',
  }
  selectedPayment.value = null
  paymentSearch.value = ''
  paymentOptions.value = []
  isOpen.value = false
}

// Submit
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!isFormValid.value)
    return

  isSubmitting.value = true
  try {
    await refundStore.createRefund({
      paymentId: formData.value.paymentId,
      refundDate: formData.value.refundDate,
      amount: formData.value.amount,
      refundMethod: formData.value.refundMethod,
      referenceNumber: formData.value.referenceNumber || undefined,
      reason: formData.value.reason,
    })

    showToast('Refund berhasil dibuat', 'success')
    emit('success')
    handleClose()
  }
  catch (error: any) {
    console.error('Error creating refund:', error)

    // Extract specific error message from backend response
    const errorMessage
      = error?.response?._data?.message
      || error?.response?.data?.message
      || error?.message
      || 'Gagal membuat refund'

    showToast(errorMessage, 'error')
  }
  finally {
    isSubmitting.value = false
  }
}

// Load payments saat modal dibuka
watch(isOpen, newValue => {
  if (newValue && !props.paymentId)
    fetchRefundablePayments()
})
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="700"
    scrollable
  >
    <DialogCloseBtn
      :disabled="isSubmitting"
      @click="handleClose"
    />

    <VCard title="Buat Refund">
      <VDivider class="mt-4" />

      <VCardText>
        <VForm @submit.prevent="handleSubmit">
          <VRow>
            <!-- Payment Selection -->
            <VCol cols="12">
              <label class="v-label text-body-2 mb-1">
                Payment <span class="text-error">*</span>
              </label>
              <VAutocomplete
                v-model="formData.paymentId"
                v-model:search="paymentSearch"
                :items="paymentOptions"
                :loading="paymentLoading"
                :disabled="!!paymentId"
                item-title="paymentCode"
                item-value="paymentId"
                placeholder="Pilih payment yang akan di-refund"
                prepend-inner-icon="tabler-cash"
                variant="outlined"
                clearable
                :hint="
                  paymentId
                    ? 'Payment sudah ditentukan dari referensi'
                    : 'Cari berdasarkan kode payment'
                "
                persistent-hint
              >
                <template #item="{ props: itemProps, item }">
                  <VListItem
                    v-bind="itemProps"
                    :subtitle="`Invoice: ${
                      item.raw.invoice?.invoiceNumber || '-'
                    } • ${formatDate(
                      item.raw.paymentDate || item.raw.createdAt,
                    )} • ${formatCurrency(item.raw.amount)}`"
                  >
                    <template #prepend>
                      <VAvatar
                        color="success"
                        variant="tonal"
                        size="40"
                      >
                        <VIcon icon="tabler-cash" />
                      </VAvatar>
                    </template>
                  </VListItem>
                </template>

                <template #no-data>
                  <VListItem>
                    <VListItemTitle class="text-center text-disabled">
                      {{
                        paymentSearch
                          ? "Tidak ada payment ditemukan"
                          : "Ketik untuk mencari payment"
                      }}
                    </VListItemTitle>
                  </VListItem>
                </template>
              </VAutocomplete>
            </VCol>

            <!-- Selected Payment Info -->
            <VCol
              v-if="selectedPayment"
              cols="12"
            >
              <VCard
                variant="outlined"
                color="success"
              >
                <VCardText>
                  <VRow dense>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <div class="text-caption text-disabled mb-1">
                        Kode Payment
                      </div>
                      <div class="font-weight-medium">
                        {{ selectedPayment.paymentCode }}
                      </div>
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <div class="text-caption text-disabled mb-1">
                        Jumlah Payment
                      </div>
                      <div class="font-weight-medium text-success">
                        {{ formatCurrency(selectedPayment.amount) }}
                      </div>
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <div class="text-caption text-disabled mb-1">
                        Invoice
                      </div>
                      <div class="font-weight-medium">
                        {{ selectedPayment.invoice?.invoiceNumber || "-" }}
                      </div>
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <div class="text-caption text-disabled mb-1">
                        Metode Payment
                      </div>
                      <div class="font-weight-medium">
                        {{ selectedPayment.paymentMethod?.replace(/_/g, " ") }}
                      </div>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Refund Date -->
            <VCol
              cols="12"
              md="6"
            >
              <label class="v-label text-body-2 mb-1">
                Tanggal Refund <span class="text-error">*</span>
              </label>
              <AppDateTimePicker
                v-model="formData.refundDate"
                placeholder="Pilih tanggal refund"
              />
            </VCol>

            <!-- Refund Method -->
            <VCol
              cols="12"
              md="6"
            >
              <label class="v-label text-body-2 mb-1">
                Metode Refund <span class="text-error">*</span>
              </label>
              <VSelect
                v-model="formData.refundMethod"
                :items="refundMethods"
                placeholder="Pilih metode refund"
                variant="outlined"
              />
            </VCol>

            <!-- Amount -->
            <VCol cols="12">
              <label class="v-label text-body-2 mb-1">
                Jumlah Refund <span class="text-error">*</span>
              </label>
              <VTextField
                v-model.number="formData.amount"
                type="number"
                :min="0"
                :max="maxRefundAmount"
                placeholder="0"
                variant="outlined"
                prepend-inner-icon="tabler-currency-dollar"
                :rules="[
                  (v) => !!v || 'Jumlah wajib diisi',
                  (v) => v > 0 || 'Jumlah harus lebih dari 0',
                  (v) =>
                    v <= maxRefundAmount
                    || `Maksimal Rp ${formatCurrency(maxRefundAmount)}`,
                ]"
              >
                <template #details>
                  <div class="text-caption text-medium-emphasis mt-1">
                    Maksimal yang dapat direfund:
                    <strong>{{ formatCurrency(maxRefundAmount) }}</strong>
                  </div>
                </template>
              </VTextField>
            </VCol>

            <!-- Reference Number -->
            <VCol cols="12">
              <label class="v-label text-body-2 mb-1"> Nomor Referensi </label>
              <VTextField
                v-model="formData.referenceNumber"
                placeholder="Nomor referensi (opsional)"
                variant="outlined"
                prepend-inner-icon="tabler-hash"
              />
            </VCol>

            <!-- Reason -->
            <VCol cols="12">
              <label class="v-label text-body-2 mb-1">
                Alasan Refund <span class="text-error">*</span>
              </label>
              <VTextarea
                v-model="formData.reason"
                placeholder="Jelaskan alasan refund"
                variant="outlined"
                rows="3"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          variant="outlined"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :loading="isSubmitting"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          Buat Refund
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
