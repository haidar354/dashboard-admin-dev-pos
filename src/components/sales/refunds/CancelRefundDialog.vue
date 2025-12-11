<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  refund: any
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', reason: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(props.modelValue)
const cancelReason = ref('')

watch(
  () => props.modelValue,
  newVal => {
    isOpen.value = newVal
    if (newVal)
      cancelReason.value = ''
  },
)

watch(isOpen, newVal => {
  emit('update:modelValue', newVal)
})

const handleConfirm = () => {
  if (!cancelReason.value.trim()) {
    showToast('Alasan pembatalan wajib diisi', 'error')

    return
  }
  emit('confirm', cancelReason.value)
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="500"
  >
    <VCard>
      <VCardText class="text-center pa-8">
        <VAvatar
          size="80"
          color="error"
          variant="tonal"
          class="mb-4"
        >
          <VIcon
            icon="tabler-ban"
            size="48"
          />
        </VAvatar>

        <h2 class="text-h5 mb-2">
          Batalkan Refund
        </h2>

        <p class="text-body-1 text-medium-emphasis mb-4">
          Anda yakin ingin membatalkan refund
          <strong>{{ refund?.refundCode }}</strong>?
        </p>

        <VTextarea
          v-model="cancelReason"
          label="Alasan Pembatalan"
          placeholder="Jelaskan alasan pembatalan"
          rows="3"
          required
          variant="outlined"
          class="mb-2"
        />

        <VAlert
          type="warning"
          variant="tonal"
          density="compact"
          class="text-start"
        >
          <template #prepend>
            <VIcon icon="tabler-alert-triangle" />
          </template>
          Refund yang dibatalkan tidak dapat diselesaikan lagi
        </VAlert>
      </VCardText>

      <VCardActions class="d-flex gap-2 px-6 pb-6">
        <VBtn
          color="secondary"
          variant="outlined"
          block
          :disabled="loading"
          @click="isOpen = false"
        >
          Batal
        </VBtn>
        <VBtn
          color="error"
          variant="elevated"
          block
          prepend-icon="tabler-ban"
          :loading="loading"
          @click="handleConfirm"
        >
          Ya, Batalkan
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
