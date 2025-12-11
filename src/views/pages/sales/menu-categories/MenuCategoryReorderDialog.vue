<script setup lang="ts">
import { useMenuCategoryStore } from '@/stores/menuCategoryStore'
import type { MenuCategory } from '@/types/models/menu-category'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const menuCategoryStore = useMenuCategoryStore()
const { data, isLoadingFetchData } = storeToRefs(menuCategoryStore)

const isVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localCategories = ref<MenuCategory[]>([])
const isDragging = ref(false)

// Watch data changes
watch(data, newData => {
  localCategories.value = [...newData].sort((a, b) => a.sortOrder - b.sortOrder)
}, { immediate: true })

// Watch dialog visibility
watch(isVisible, visible => {
  if (visible)
    localCategories.value = [...data.value].sort((a, b) => a.sortOrder - b.sortOrder)
})

const onClose = () => {
  isVisible.value = false
}

const onSave = async () => {
  try {
    await menuCategoryStore.reorderCategories(localCategories.value)
    onClose()
  }
  catch (error) {
    console.error('Error reordering categories:', error)
  }
}

const onDragStart = () => {
  isDragging.value = true
}

const onDragEnd = () => {
  isDragging.value = false
}
</script>

<template>
  <VDialog
    v-model="isVisible"
    max-width="600"
    persistent
  >
    <VCard>
      <VCardItem>
        <VCardTitle class="d-flex align-center gap-2">
          <VIcon
            icon="tabler-arrows-sort"
            color="primary"
          />
          Atur Urutan Kategori
        </VCardTitle>
        <VCardSubtitle>
          Seret dan lepas kategori untuk mengubah urutan tampilan
        </VCardSubtitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <div v-if="isLoadingFetchData">
          <VSkeletonLoader
            v-for="n in 3"
            :key="n"
            type="list-item-two-line"
            class="mb-2"
          />
        </div>

        <div v-else-if="localCategories.length === 0">
          <VAlert
            type="info"
            variant="tonal"
          >
            Belum ada kategori untuk diurutkan
          </VAlert>
        </div>

        <Draggable
          v-else
          v-model="localCategories"
          item-key="menuCategoryId"
          animation="300"
          ghost-class="ghost"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element: category, index }">
            <VCard
              class="mb-2 category-drag-item"
              :class="{ dragging: isDragging }"
              variant="outlined"
            >
              <VCardText class="py-3">
                <div class="d-flex align-center">
                  <VIcon
                    icon="tabler-grip-vertical"
                    class="me-3 drag-handle"
                    color="disabled"
                  />

                  <VAvatar
                    color="primary"
                    variant="tonal"
                    size="32"
                    class="me-3"
                  >
                    <span class="text-sm font-weight-bold">
                      {{ index + 1 }}
                    </span>
                  </VAvatar>

                  <div class="flex-grow-1">
                    <div class="font-weight-medium">
                      {{ category.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ category.showInPOS ? 'Tampil di POS' : 'Tidak tampil di POS' }}
                    </div>
                  </div>

                  <VChip
                    :color="category.showInPOS ? 'success' : 'secondary'"
                    size="small"
                    variant="tonal"
                  >
                    <VIcon
                      :icon="category.showInPOS ? 'tabler-eye' : 'tabler-eye-off'"
                      size="14"
                      class="me-1"
                    />
                  </VChip>
                </div>
              </VCardText>
            </VCard>
          </template>
        </Draggable>

        <VAlert
          type="info"
          variant="tonal"
          class="mt-4"
        >
          <VIcon icon="tabler-info-circle" />
          <div class="ms-2">
            <strong>Tips:</strong> Kategori dengan urutan lebih atas akan ditampilkan terlebih dahulu di menu dan POS
          </div>
        </VAlert>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="outlined"
          @click="onClose"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          @click="onSave"
        >
          Simpan Urutan
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.category-drag-item {
  cursor: grab;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgb(var(--v-theme-primary));
  }

  &.dragging {
    cursor: grabbing;
  }
}

.drag-handle {
  cursor: grab;
}

.ghost {
  opacity: 0.5;
  transform: rotate(5deg);
}
</style>
