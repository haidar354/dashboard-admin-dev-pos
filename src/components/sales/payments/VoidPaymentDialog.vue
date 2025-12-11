<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePaymentStore } from '@/stores/sales/paymentStore'
import { showToast } from '@/utils/toaster'

interface Props {
  modelValue: boolean
  paymentId: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const paymentStore = usePaymentStore()

const voidReason = ref('')
const isVoiding = ref(false)

const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  newVal => {
    isOpen.value = newVal
    if (newVal)
      voidReason.value = ''
  },
)

watch(isOpen, newVal => {
  emit('update:modelValue', newVal)
})

const handleVoid = async () => {
  if (!voidReason.value) {
    showToast('Alasan pembatalan wajib diisi', 'error')

    return
  }

  isVoiding.value = true
  try {
    await paymentStore.voidPayment(props.paymentId, voidReason.value)
    showToast('Pembayaran berhasil dibatalkan', 'success')
    isOpen.value = false
    emit('success')
  }
  catch (error: any) {
    const errorMessage = error?.data?.message || 'Gagal membatalkan pembayaran'

    showToast(errorMessage, 'error')
  }
  finally {
    isVoiding.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="500"
  >
    <VCard title="Batalkan Pembayaran">
      <VCardText>
        <p>
          Apakah Anda yakin ingin membatalkan pembayaran ini? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <VTextarea
          v-model="voidReason"
          label="Alasan Pembatalan"
          placeholder="Contoh: Kesalahan input nominal"
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
          color="error"
          variant="elevated"
          :loading="isVoiding"
          @click="handleVoid"
        >
          Batalkan Pembayaran
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
