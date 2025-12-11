<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePaymentStore } from '@/stores/sales/paymentStore'
import { showToast } from '@/utils/toaster'

interface Props {
  modelValue: boolean
  paymentId: string
  maxAmount: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const paymentStore = usePaymentStore()

const refundAmount = ref(0)
const refundReason = ref('')
const refundReference = ref('')
const isRefunding = ref(false)

const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  newVal => {
    isOpen.value = newVal
    if (newVal) {
      refundAmount.value = props.maxAmount || 0
      refundReason.value = ''
      refundReference.value = ''
    }
  },
)

watch(isOpen, newVal => {
  emit('update:modelValue', newVal)
})

const handleRefund = async () => {
  if (refundAmount.value <= 0) {
    showToast('Jumlah refund harus lebih dari 0', 'error')

    return
  }
  if (!refundReason.value) {
    showToast('Alasan refund wajib diisi', 'error')

    return
  }

  isRefunding.value = true
  try {
    await paymentStore.refundPayment(props.paymentId, {
      refundAmount: refundAmount.value,
      refundReason: refundReason.value,
      referenceNumber: refundReference.value,
    })
    showToast('Refund berhasil diproses', 'success')
    isOpen.value = false
    emit('success')
  }
  catch (error: any) {
    const errorMessage = error?.data?.message || 'Gagal memproses refund'

    showToast(errorMessage, 'error')
  }
  finally {
    isRefunding.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="500"
  >
    <VCard title="Refund Pembayaran">
      <VCardText>
        <p class="mb-4">
          Proses pengembalian dana untuk pembayaran ini.
        </p>
        <VTextField
          v-model.number="refundAmount"
          label="Jumlah Refund"
          type="number"
          prefix="Rp"
          class="mb-4"
          :max="maxAmount"
        />
        <VTextField
          v-model="refundReference"
          label="Nomor Referensi Refund (Opsional)"
          placeholder="Contoh: REF-12345"
          class="mb-4"
        />
        <VTextarea
          v-model="refundReason"
          label="Alasan Refund"
          placeholder="Contoh: Barang dikembalikan customer"
          rows="3"
          required
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          color="secondary"
          variant="text"
          @click="isOpen = false"
        >
          Batal
        </VBtn>
        <VBtn
          color="warning"
          variant="elevated"
          :loading="isRefunding"
          @click="handleRefund"
        >
          Proses Refund
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
