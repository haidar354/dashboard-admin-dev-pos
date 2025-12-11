<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatCurrency } from '@/utils/common'

interface Props {
  modelValue: boolean
  refund: any
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  newVal => {
    isOpen.value = newVal
  },
)

watch(isOpen, newVal => {
  emit('update:modelValue', newVal)
})

const handleConfirm = () => {
  emit('confirm')
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
          color="success"
          variant="tonal"
          class="mb-4"
        >
          <VIcon
            icon="tabler-check"
            size="48"
          />
        </VAvatar>

        <h2 class="text-h5 mb-2">
          Selesaikan Refund
        </h2>

        <p class="text-body-1 text-medium-emphasis mb-4">
          Anda akan menandai refund ini sebagai selesai
        </p>

        <VCard
          variant="outlined"
          color="success"
          class="mb-4"
        >
          <VCardText>
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2 text-medium-emphasis">Kode Refund</span>
              <span class="font-weight-bold">{{ refund?.refundCode }}</span>
            </div>
            <VDivider class="my-2" />
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-medium-emphasis">Jumlah</span>
              <span class="text-h6 text-error font-weight-bold">
                - {{ formatCurrency(refund?.amount || 0) }}
              </span>
            </div>
          </VCardText>
        </VCard>

        <VAlert
          type="info"
          variant="tonal"
          density="compact"
          class="text-start mb-4"
        >
          <template #prepend>
            <VIcon icon="tabler-info-circle" />
          </template>
          Setelah diselesaikan, refund tidak dapat dibatalkan lagi
        </VAlert>
      </VCardText>

      <VCardActions class="d-flex gap-2 px-6 pb-6">
        <VBtn
          color="secondary"
          variant="outlined"
          :disabled="loading"
          @click="isOpen = false"
        >
          Batal
        </VBtn>
        <VBtn
          color="success"
          variant="elevated"
          prepend-icon="tabler-check"
          :loading="loading"
          @click="handleConfirm"
        >
          Ya, Selesaikan
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
