<script setup lang="ts">
import { useItemCategoryStore } from '@/stores/product/itemCategoryStore'
import MasterProductList from '@/views/pages/product/items/MasterProductList.vue'
import SkuProductList from '@/views/pages/product/items/SkuProductList.vue'

definePage({
  meta: {
    name: 'Produk',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
})

const router = useRouter()
const route = useRoute()
const tab = ref('product')
const itemCategoryStore = useItemCategoryStore()

onMounted(async () => {
  itemCategoryStore.fetchAllData()
  if (route.query.tab === 'sku-products')
    tab.value = 'sku-products'
  else
    tab.value = 'master-products'
})

watch(
  () => tab.value,
  async () => {
    router.replace({
      name: 'product-items',
      query: {
        ...route.query,
        tab: tab.value,
      },
    })
  },
  { deep: true },
)
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex flex-wrap justify-space-between">
        <span class="text-h5 d-inline my-auto">
          <VIcon
            icon="tabler-package"
            class="me-2"
            color="primary"
          />
          Data Produk
        </span>
        <div class="mt-3 mt-md-0 flex-fill">
          <div class="w-auto d-flex flex-wrap justify-end">
            <!--
              <VBtn
              v-if="($can('manage', 'Lihat Surat Masuk') || $can('manage', 'Lihat Semua Surat Masuk') || $can('manage', 'school'))"
              color="primary"
              variant="outlined"
              :loading="isLoadingExport"
              @click="itemStore.export()"
              >
              <VIcon
              start
              icon="tabler-screen-share"
              />
              Export
              </VBtn>
            -->

            <VBtn
              v-if="$can('manage', 'Tambah Produk') || $can('manage', 'default')"
              class="ms-2"
              color="primary"
              variant="elevated"
              :to="{
                name: 'product-items-create',
              }"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Tambah Data
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>
    <VTabs
      v-model="tab"
      class="v-tabs-pill custom-tabs mt-3"
      align-tabs="center"
      grow
      show-arrows
      center-active
    >
      <VTab
        value="master-products"
        color="primary"
        prepend-icon="tabler-box"
        variant="flat"
      >
        Master Produk
      </VTab>
      <VTab
        value="sku-products"
        color="primary"
        prepend-icon="tabler-barcode"
        variant="flat"
      >
        SKU Produk
      </VTab>
    </VTabs>

    <VWindow
      v-model="tab"
      class="mt-5"
      disabled
    >
      <VWindowItem value="master-products">
        <MasterProductList />
      </VWindowItem>
      <VWindowItem value="sku-products">
        <SkuProductList />
      </VWindowItem>
    </VWindow>
  </div>
</template>
