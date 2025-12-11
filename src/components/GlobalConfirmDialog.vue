<script lang="ts" setup>
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

const deleteDialog = useConfirmDialogStore()

const {
  isDialogVisible,
  isLoading,
  content,
  icon,
  title,
  subtitle,

  // Generic state
  isGenericDialogVisible,
  genericTitle,
  genericContent,
  genericConfirmText,
  genericCancelText,
  genericColor,
  genericIcon,
} = storeToRefs(deleteDialog)
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    persistent
    class="v-dialog-sm"
  >
    <DialogCloseBtn @click="deleteDialog.close(false)" />
    <VCard>
      <VCardItem class="d-flex justify-center">
        <VIcon
          :size="140"
          :icon="icon"
          color="warning"
        />
      </VCardItem>
      <VCardTitle class="text-h4 d-flex justify-center">
        <b>{{ title }}</b>
      </VCardTitle>
      <VCardText class="d-flex justify-center">
        <span
          v-if="content"
          class="text-center font-weight-small"
        >
          Setelah Anda menghapus, Data <b>{{ content }}</b> ini tidak dapat
          diakses kembali
        </span>
        <span
          v-else
          class="text-center font-weight-small"
        >
          {{ subtitle }}
        </span>
      </VCardText>
      <VCardText class="d-flex justify-center gap-3 flex-wrap">
        <VBtn
          color="secondary"
          variant="outlined"
          @click="deleteDialog.close(false)"
        >
          Batal
        </VBtn>
        <VBtn
          :loading="isLoading"
          color="error"
          @click="deleteDialog.close(true)"
        >
          Hapus
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Generic Dialog -->
  <VDialog
    v-model="isGenericDialogVisible"
    persistent
    class="v-dialog-sm"
  >
    <DialogCloseBtn @click="deleteDialog.closeGeneric(false)" />
    <VCard>
      <VCardItem class="d-flex justify-center">
        <VIcon
          :size="140"
          :icon="genericIcon"
          :color="genericColor"
        />
      </VCardItem>
      <VCardTitle class="text-h4 d-flex justify-center">
        <b>{{ genericTitle }}</b>
      </VCardTitle>
      <VCardText class="d-flex justify-center">
        <span class="text-center font-weight-small">
          {{ genericContent }}
        </span>
      </VCardText>
      <VCardText class="d-flex justify-center gap-3 flex-wrap">
        <VBtn
          color="secondary"
          variant="outlined"
          @click="deleteDialog.closeGeneric(false)"
        >
          {{ genericCancelText }}
        </VBtn>
        <VBtn
          :loading="isLoading"
          :color="genericColor"
          @click="deleteDialog.closeGeneric(true)"
        >
          {{ genericConfirmText }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
