<script setup lang="ts">
import UpdateItemInformation from '@/views/pages/product/items/Component/Single/UpdateItemInformation.vue'
import UpdateItemModifier from '@/views/pages/product/items/Component/Single/UpdateItemModifier.vue'
import UpdateItemRecipe from '@/views/pages/product/items/Component/Single/UpdateItemRecipe.vue'
import UpdateItemSetting from '@/views/pages/product/items/Component/Single/UpdateItemSetting.vue'
import UpdateItemSku from '@/views/pages/product/items/Component/Single/UpdateItemSku.vue'
import UpdateItemUnit from '@/views/pages/product/items/Component/Single/UpdateItemUnit.vue'
import UpdateItemVariant from '@/views/pages/product/items/Component/Single/UpdateItemVariant.vue'
</script>

<template>
  <div class="item-createForm">
    <!-- Form Content with Fade Transition -->
    <VFadeTransition>
      <div class="createForm-content">
        <!-- Basic Informasi Section -->
        <UpdateItemInformation />

        <!-- Product Settings Section -->
        <UpdateItemSetting />

        <!-- Units Section -->
        <UpdateItemUnit />

        <!-- Variant Section -->
        <UpdateItemVariant />

        <!-- SKU Section -->
        <UpdateItemSku />

        <!-- Modifikasi Section -->
        <UpdateItemModifier />

        <!-- Recipe Section -->
        <UpdateItemRecipe />
      </div>
    </VFadeTransition>
  </div>
</template>

<style lang="scss" scoped>
.item-createForm {
  .v-card {
    border-radius: 12px;

    &.elevation-2 {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .v-card-title {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .v-card-subtitle {
    opacity: 0.7;
    font-size: 0.875rem;
  }

  label {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 500;
  }

  .v-text-field,
  .v-autocomplete {
    .v-field {
      border-radius: 8px;
    }
  }

  .v-switch {
    .v-selection-control__wrapper {
      margin-inline-start: 0;
    }
  }

  .v-btn {
    border-radius: 8px;
    font-weight: 500;

    &.v-btn--size-large {
      min-height: 48px;
    }
  }

  .v-alert {
    border-radius: 8px;
  }

  .v-chip {
    font-weight: 500;
  }
}

.no-wrap-text {
  flex-shrink: 0;
  white-space: nowrap;
}

// Loading animations
.createForm-loading {
  animation: fadeIn 0.3s ease-in-out;
}

.createForm-content {
  animation: slideUp 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transcreateForm: translateY(20px);
  }
  to {
    opacity: 1;
    transcreateForm: translateY(0);
  }
}

// Skeleton loader customization
:deep(.v-skeleton-loader) {
  background: transparent;

  .v-skeleton-loader__bone {
    background: linear-gradient(90deg,
      rgba(var(--v-theme-surface-variant), 0.1) 25%,
      rgba(var(--v-theme-surface-variant), 0.2) 50%,
      rgba(var(--v-theme-surface-variant), 0.1) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
