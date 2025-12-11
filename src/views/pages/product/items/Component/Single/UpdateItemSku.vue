<script setup lang="ts">
import { ref } from 'vue'
import SelectSkuCombinationModal from './SelectSkuCombinationModal.vue'
import { useItemUpdate } from '@/composables/product/useItemUpdate'

const {
  updateForm,
  removeSku,
  missingCombinations,
  addSelectedCombinations,
  serverSkus,
  localSkus,
  regenerateSkus,
} = useItemUpdate()

const showAddModal = ref(false)

const openAdd = () => {
  // Ensure generated combinations are recalculated before showing the dialog.
  // regenerateSkus is debounced, call it then show the modal after a short delay.
  regenerateSkus()
  setTimeout(() => {
    showAddModal.value = true
  }, 300)
}

const onAdd = (selected: any[]) => {
  console.log('[UpdateItemSku] onAdd received selected:', selected)
  addSelectedCombinations(selected)
}
</script>

<template>
  <VCard
    class="mb-6"
    elevation="2"
  >
    <VCardItem>
      <VCardTitle class="text-h6 d-flex align-center">
        <VIcon
          icon="tabler-scale"
          class="me-2"
          color="primary"
        />
        Data SKU
      </VCardTitle>
      <VCardSubtitle>
        Atur sku yang tersedia untuk produk ini
      </VCardSubtitle>
    </VCardItem>
    <VCardText>
      <div class="d-flex justify-space-between align-center mb-4">
        <div />
        <div>
          <VBtn
            small
            color="primary"
            variant="outlined"
            @click="openAdd"
          >
            <VIcon left>
              tabler-plus
            </VIcon> Tambah
          </VBtn>
        </div>
      </div>
      <VTable class="mt-5 w-100">
        <thead>
          <tr>
            <th
              class="text-start"
              style="min-width: 200px;"
            >
              Nama SKU
            </th>
            <th
              class="text-start"
              style="min-width: 200px;"
            >
              Kode SKU
            </th>
            <th
              class="text-start"
              style="min-width: 200px;"
            >
              Barcode
            </th>
            <th
              v-if="['PURCHASED', 'EITHER'].includes(updateForm.config?.manufacturingSource || '')"
              class="text-start"
              style="min-width: 180px;"
            >
              Harga Pembelian
            </th>
            <th
              v-if="updateForm.config?.saleable"
              class="text-start"
              style="min-width: 180px;"
            >
              Harga Jual
            </th>
            <th
              class="text-start"
              style="min-width: 80px;"
            >
              Status
            </th>
            <th
              class="text-start"
              width="5%"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(sku, index) in (serverSkus.concat(localSkus))"
            :key="sku.tempId || index"
            :class="{ 'bg-light-success': !sku.itemSkuId }"
          >
            <td class="py-2">
              <div class="text-wrap">
                <div>{{ sku.displayName }}</div>
                <small
                  v-if="!sku.itemSkuId"
                  class="text-warning"
                >(SKU Baru)</small>
              </div>
            </td>
            <td>
              <div class="text-wrap">
                <VTextField
                  v-model="sku.code"
                  :name="`skus[${index}][code]`"
                  placeholder="Masukkan Kode SKU"
                  dense
                  hide-details="auto"
                  variant="outlined"
                />
              </div>
            </td>
            <td>
              <div class="text-wrap">
                <VTextField
                  v-model="sku.barcode"
                  :name="`skus[${index}][barcode]`"
                  placeholder="Masukkan Barcode"
                  dense
                  hide-details="auto"
                  variant="outlined"
                />
              </div>
            </td>
            <td v-if="['PURCHASED', 'EITHER'].includes(updateForm.config?.manufacturingSource || '')">
              <AppTextFieldRupiah
                v-if="sku.cost?.cost !== undefined"
                v-model="sku.cost.cost"
                :name="`skus[${index}][cost][cost]`"
                dense
                hide-details="auto"
                variant="outlined"
              />
            </td>
            <td v-if="updateForm.config?.saleable">
              <AppTextFieldRupiah
                v-if="sku.price?.price !== undefined"
                v-model="sku.price.price"
                :name="`skus[${index}][price][price]`"
                dense
                hide-details="auto"
                variant="outlined"
              />
            </td>
            <td>
              <VSwitch
                :id="`sku-${index}-is-active`"
                v-model="sku.isActive"
                :name="`skus[${index}][isActive]`"
                :true-value="true"
                :false-value="false"
                color="success"
                inset
              />
            </td>
            <td>
              <VBtn
                variant="text"
                color="error"
                icon="tabler-trash"
                @click="removeSku(sku.tempId)"
              />
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCardText>
    <SelectSkuCombinationModal
      v-model:model-value="showAddModal"
      :items="missingCombinations"
      @add="onAdd"
    />
  </VCard>
</template>
