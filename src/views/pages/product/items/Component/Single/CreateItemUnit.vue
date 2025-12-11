<script setup lang="ts">
import { useItemCreate } from '@/composables/product/useItemCreate'

const {
  createForm,
  units,
  isLoadingUnits,
  defaultUnit,
  addUnit,
  removeUnit,
  onChangeUnit,
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
          icon="tabler-scale"
          class="me-2"
          color="primary"
        />
        Satuan
      </VCardTitle>
      <VCardSubtitle>
        Atur satuan yang digunakan untuk produk ini
      </VCardSubtitle>
    </VCardItem>
    <VCardText>
      <div v-if="createForm.units && (createForm.units?.length || 0) > 0">
        <VRow
          v-for="(unitLine, index) in createForm.units"
          :key="index"
          class="mb-4"
        >
          <VCol cols="12">
            <VCard variant="outlined">
              <VCardItem>
                <VCardTitle class="text-h6 font-weight-medium">
                  Satuan {{ index === 0 ? 'Utama' : 'Tambahan' }}
                </VCardTitle>
                <template #append>
                  <VBtn
                    v-if="!unitLine.isBase"
                    variant="outlined"
                    color="error"
                    icon="tabler-trash"
                    size="small"
                    rounded
                    @click="removeUnit(index)"
                  />
                </template>
              </VCardItem>
              <VCardText>
                <VRow>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                      Satuan <span class="text-error">*</span>
                    </label>
                    <VAutocomplete
                      :id="`unit-${index}-unit`"
                      v-model="unitLine.unit"
                      :name="`unit[${index}][name]`"
                      :items="units"
                      item-title="name"
                      item-value="unitId"
                      :rules="[requiredValidator]"
                      :loading="isLoadingUnits"
                      return-object
                      variant="outlined"
                      placeholder="Pilih satuan"
                      @update:model-value="onChangeUnit(index)"
                    />
                  </VCol>

                  <VCol
                    cols="12"
                    md="3"
                  >
                    <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                      Konversi <span
                        v-if="!unitLine.isBase"
                        class="text-error"
                      >*</span>
                    </label>
                    <VTextField
                      :id="`unit-${index}-conversion`"
                      v-model="unitLine.conversion"
                      :name="`unit[${index}][conversion]`"
                      type="number"
                      :rules="[requiredValidator]"
                      :disabled="unitLine.isBase"
                      :min="1"
                      variant="outlined"
                      placeholder="Masukkan nilai konversi"
                    >
                      <template #append-inner>
                        <span
                          v-if="!unitLine.isBase"
                          class="text-caption text-disabled"
                        >
                          {{ defaultUnit?.unit?.code || 'satuan utama' }}
                        </span>
                      </template>
                    </VTextField>
                  </VCol>

                  <VCol
                    cols="12"
                    md="3"
                  >
                    <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                      Min. Penjualan <span class="text-error">*</span>
                    </label>
                    <VTextField
                      :id="`unit-${index}-min-sales-qty`"
                      v-model="unitLine.minSalesQty"
                      :name="`unit[${index}][minSalesQty]`"
                      type="number"
                      :rules="[requiredValidator]"
                      :min="1"
                      variant="outlined"
                      placeholder="Masukkan nilai minimal jumlah penjualan"
                    >
                      <template #append-inner>
                        <span class="text-caption text-disabled">
                          {{ defaultUnit?.unit?.code || 'satuan utama' }}
                        </span>
                      </template>
                    </VTextField>
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="tabler-plus"
          block
          :disabled="(createForm.units.length || 0) >= 5 || !!createForm.units?.find(line => !line.unit)"
          @click="addUnit"
        >
          Tambah Satuan Lain
        </VBtn>

        <!--
          <VCard
          variant="outlined"
          class="pa-4 mt-7"
          >
          <VRow>
          <VCol
          cols="12"
          md="6"
          lg="3"
          >
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
          Standar Satuan Stok <span class="text-error">*</span>
          </label>
          <VSelect
          v-model="createForm.itemUnit.stockUnitId"
          :rules="[requiredValidator]"
          :items="createForm.itemUnit.lines.map((line, idx) => ({ title: line.unit?.name || `Satuan ${idx + 1}`, value: line.unitId }))"
          :min="1"
          variant="outlined"
          placeholder="Pilih satuan stok standar"
          />
          </VCol>
          <VCol
          cols="12"
          md="6"
          lg="3"
          >
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
          Standar Satuan Pembelian <span class="text-error">*</span>
          </label>
          <VSelect
          v-model="createForm.itemUnit.purchaseUnitId"
          :rules="[requiredValidator]"
          :items="createForm.itemUnit.lines.map((line, idx) => ({ title: line.unit?.name || `Satuan ${idx + 1}`, value: line.unitId }))"
          :min="1"
          variant="outlined"
          placeholder="Pilih satuan pembelian standar"
          />
          </VCol>
          <VCol
          cols="12"
          md="6"
          lg="3"
          >
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
          Standar Satuan Penjualan <span class="text-error">*</span>
          </label>
          <VSelect
          v-model="createForm.itemUnit.salesUnitId"
          :rules="[requiredValidator]"
          :items="createForm.itemUnit.lines.map((line, idx) => ({ title: line.unit?.name || `Satuan ${idx + 1}`, value: line.unitId }))"
          :min="1"
          variant="outlined"
          placeholder="Pilih satuan penjualan standar"
          />
          </VCol>
          <VCol
          cols="12"
          md="6"
          lg="3"
          >
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
          Standar Satuan Transfer <span class="text-error">*</span>
          </label>
          <VSelect
          v-model="createForm.itemUnit.transferUnitId"
          :rules="[requiredValidator]"
          :items="createForm.itemUnit.lines.map((line, idx) => ({ title: line.unit?.name || `Satuan ${idx + 1}`, value: line.unitId }))"
          :min="1"
          variant="outlined"
          placeholder="Pilih satuan transfer standar"
          />
          </VCol>
          </VRow>
          </VCard>
        -->
      </div>
    </VCardText>
  </VCard>
</template>
