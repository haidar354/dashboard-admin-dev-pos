<script setup lang="ts">
import { useItemCreate } from '@/composables/product/useItemCreate'
import ItemKindRadioComponent from '@/views/pages/product/items/Component/ItemKindRadioComponent.vue'

const {
  createForm,
  createFormErrors,

  outletsData,
  isLoadingOutlets,
  itemCategories,
  isLoadingCategories,
} = useItemCreate()
</script>

<template>
  <VCard
    class="mb-6"
    elevation="2"
  >
    <VCardItem>
      <VCardTitle class="text-h6 d-flex align-center">
        <VIcon
          icon="tabler-info-circle"
          class="me-2"
          color="primary"
        />
        Informasi Dasar Produk
      </VCardTitle>
    </VCardItem>

    <VCardText>
      <VRow>
        <VCol cols="12">
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            Jenis Produk <span class="text-error">*</span>
          </label>
          <ItemKindRadioComponent v-model="createForm.kind" />
        </VCol>
        <VCol
          cols="12"
          md="6"
          lg="8"
        >
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            Daftar Outlet <span class="text-error">*</span>
          </label>
          <VAutocomplete
            id="outlet-ids"
            v-model="createForm.outlets"
            name="outletIds"
            :items="outletsData"
            item-title="name"
            item-value="outletId"
            :rules="[requiredValidator]"
            :error-messages="createFormErrors?.outlets"
            :loading="isLoadingOutlets"
            clearable
            multiple
            counter
            maxlength="100"
            prepend-inner-icon="tabler-building-store"
            variant="outlined"
            placeholder="Pilih outlet untuk produk ini"
            return-object
            hint="Pilih outlet dimana produk ini akan tersedia"
            persistent-hint
            chips
          >
            <template #prepend-item>
              <VListItem
                ripple
                :value="123"
                :disabled="createForm.outlets?.length === outletsData?.length"
                @click="createForm.outlets = outletsData"
              >
                <VListItemTitle>Pilih Semua Outlet</VListItemTitle>
              </VListItem>
              <VDivider />
            </template>
          </VAutocomplete>
        </VCol>

        <VCol
          cols="12"
          md="6"
          lg="4"
        >
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            Pengaturan Produk <span class="text-error">*</span>
          </label>
          <VSelect
            id="Pengaturan Produk"
            v-model="createForm.useSameConfig"
            name="Pengaturan Produk"
            :rules="[requiredValidator]"
            :items="[
              { title: 'Sama untuk semua outlet', value: true },
              { title: 'Berbeda untuk setiap outlet (coming soon)', value: false, disabled: true },
            ]"
            item-title="title"
            item-value="value"
            :item-props="(item) => ({ disabled: item.value === false })"
            hint="Pilih apakah produk ini memiliki pengaturan produk yang sama untuk semua outlet atau berbeda untuk setiap outlet"
            persistent-hint
          />
        </VCol>

        <VCol
          cols="12"
          lg="6"
          md="7"
        >
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            Nama Produk <span class="text-error">*</span>
          </label>
          <AppTextField
            id="item-name"
            v-model="createForm.name"
            name="name"
            :rules="[requiredValidator]"
            :error-messages="createFormErrors?.name"
            counter
            maxlength="100"
            prepend-inner-icon="tabler-file-text"
            placeholder="Masukkan nama produk"
          />
        </VCol>

        <VCol
          cols="12"
          lg="6"
          md="5"
        >
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            Kategori <span class="text-error">*</span>
          </label>
          <VAutocomplete
            id="item-category-id"
            v-model="createForm.itemCategoryId"
            name="itemCategoryId"
            :items="itemCategories"
            item-title="name"
            item-value="itemCategoryId"
            :rules="[requiredValidator]"
            :error-messages="createFormErrors?.itemCategoryId"
            prepend-inner-icon="tabler-list-numbers"
            :loading="isLoadingCategories"
            variant="outlined"
            placeholder="Pilih kategori produk"
          />
        </VCol>

        <VCol cols="12">
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            Deskripsi Produk
          </label>
          <AppTextarea
            id="item-description"
            v-model="createForm.description"
            name="description"
            :error-messages="createFormErrors?.description"
            counter
            maxlength="5000"
            prepend-inner-icon="tabler-file-text"
            placeholder="Masukkan deskripsi produk"
          />
        </VCol>

        <VCol cols="12">
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            Foto Produk
          </label>
          <ProductImageUploadCard
            id="item-images"
            v-model="createForm.images"
            name="itemImages"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
