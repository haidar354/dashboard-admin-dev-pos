import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import MaterialModel from '@/models/inventory/MaterialModel'
import type { RequestQuery } from '@/types/api/request'
import type { ApiResponse, PaginateData } from '@/types/api/response'
import type { Material, MaterialCreateForm, MaterialCreateFormErrors, MaterialEditForm, MaterialEditFormErrors } from '@/types/models/inventory/material'
import { $inventoryAPI } from '@/utils/api'

const confirmDialog = useConfirmDialogStore()
export const useMaterialStore = defineStore('materialStore', {
  state: () => ({
    paginateData: {} as PaginateData<Material>,
    selectedMaterial: {} as Material,
    data: [] as Material[],
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    isCreateDialogVisible: false as boolean,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: '',
      orderDirection: 'asc',
    } as RequestQuery,
    createForm: {
      materialType: 'raw',
      name: '',
      code: '',
      description: '',
      itemCategoryId: '',
      manageStock: true,
      minStockAlert: 0,
      isActive: true,
      useSameConfig: true,

      outletIds: [],
      itemConfigs: [{
        outletId: '',
        isActive: true,
        showInPos: true,
        isFavorite: false,
        manageStock: true,
        minStockAlert: 0,
        allowNegativeStock: false,
        cashierMaxPriceChangePct: 0,
      }],
      itemUnits: [],
    } as MaterialCreateForm,
    editForm: {
      materialType: 'raw',
      name: '',
      code: '',
      description: '',
      itemCategoryId: '',
      manageStock: true,
      minStockAlert: 0,
      isActive: true,
      useSameConfig: true,

      outletIds: [],
      itemConfigs: [{
        outletId: '',
        isActive: true,
        showInPos: true,
        isFavorite: false,
        manageStock: true,
        minStockAlert: 0,
        allowNegativeStock: false,
        cashierMaxPriceChangePct: 0,
      }],
      itemUnits: [],
    } as MaterialEditForm,
    createFormErrors: {} as MaterialCreateFormErrors,
    editFormErrors: {} as MaterialEditFormErrors,
    additionalFilter: {
      type: '',
      itemCategoryId: '',
    },
  }),
  actions: {
    resetCreateForm() {
      this.createForm = {
        materialType: 'raw',
        name: '',
        code: '',
        description: '',
        itemCategoryId: '',
        manageStock: true,
        minStockAlert: 0,
        isActive: true,
        useSameConfig: true,

        outletIds: [],
        itemConfigs: [{
          outletId: '',
          isActive: true,
          showInPos: true,
          isFavorite: false,
          manageStock: true,
          minStockAlert: 0,
          allowNegativeStock: false,
          cashierMaxPriceChangePct: 0,
        }],
        itemUnits: [],
      } as MaterialCreateForm
      this.createFormErrors = {} as MaterialCreateFormErrors
    },
    async fetchPaginate(params?: RequestQuery) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await MaterialModel
          .include(requestQuery.include)
          .orderBy(requestQuery.orderBy)
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .when(requestQuery.outletId, (query, value) => query.where('itemOutlets.outletId', value))
          .get()

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchAllData(params?: RequestQuery) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await MaterialModel
          .custom('materials/all')
          .include(requestQuery.include)
          .orderBy(requestQuery.orderBy)
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .when(requestQuery.outletId, (query, value) => query.where('itemOutlets.outletId', value))
          .get()

        this.data = response.data
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchDetail(itemId: string, params?: RequestQuery) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchDetail = true
      try {
        const response = await MaterialModel
          .include(requestQuery.include)
          .orderBy(requestQuery.orderBy)
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .when(requestQuery.outletId, (query, value) => query.where('itemOutlets.outletId', value))
          .find(itemId)

        this.selectedMaterial = response.data

        return response
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async fetchDetailAndSetForm(itemId: string) {
      this.fetchDetail(itemId).then(() => {
        this.createForm = {
          ...this.createForm,
        }
      }).catch(err => {
        throw err
      })
    },
    async create() {
      this.isLoadingCreate = true

      const createFormData = ref<MaterialCreateForm>({
        materialType: this.createForm.materialType,
        name: this.createForm.name,
        description: this.createForm.description,
        itemCategoryId: this.createForm.itemCategoryId,
        isActive: this.createForm.isActive,
        outletIds: this.createForm.outletIds || [],
        useSameConfig: this.createForm.useSameConfig || true,

        itemConfigs: this.createForm.itemConfigs.map(itemConfig => {
          return {
            outletId: itemConfig.outletId,
            isActive: itemConfig.isActive,
            showInPos: itemConfig.showInPos,
            isFavorite: itemConfig.isFavorite,
            manageStock: itemConfig.manageStock,
            minStockAlert: itemConfig.minStockAlert,
            allowNegativeStock: itemConfig.allowNegativeStock,
            cashierMaxPriceChangePct: itemConfig.cashierMaxPriceChangePct,
          }
        }),
        itemUnits: this.createForm.itemUnits.map(itemUnit => {
          return {
            unitId: itemUnit.unitId,
            sku: itemUnit.sku,
            barcode: itemUnit.barcode,
            isBase: itemUnit.isBase,
            isStock: itemUnit.isStock,
            isPurchase: itemUnit.isPurchase,
            isSales: itemUnit.isSales,
            isTransfer: itemUnit.isTransfer,
            conversion: itemUnit.conversion,

            itemCosts: itemUnit.itemCosts?.map(cost => {
              return {
                outletId: cost.outletId,
                cost: cost.cost,
              }
            }),
            itemPrices: itemUnit.itemPrices?.map(price => {
              return {
                outletId: price.outletId,
                price: price.price,
              }
            }),
          }
        }),
      })

      this.isLoadingCreate = true
      try {
        return $inventoryAPI('materials', {
          method: 'POST',
          body: createFormData.value,
        })
      }
      catch (err: any) {
        if (Object.keys(err.data.errors).length) {
          this.createFormErrors = err.data.errors as MaterialCreateFormErrors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(err.data?.message, 'error')
        }
        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },
    async update(materialId: string) {
      // pakai flag sendiri biar jelas, atau pakai isLoadingCreate kalau memang satu
      this.isLoadingCreate = true
      try {
        const payload: MaterialCreateForm = {
          materialType: this.editForm.materialType ?? null,
          name: this.editForm.name ?? '',
          description: this.editForm.description ?? '',
          itemCategoryId: this.editForm.itemCategoryId ?? null,
          isActive: this.editForm.isActive ?? true,
          outletIds: this.editForm.outletIds ?? [],
          useSameConfig: Boolean(this.editForm.useSameConfig),

          // SAMA seperti create, tapi boleh sertakan id untuk upsert sisi server
          itemConfigs: (this.editForm.itemConfigs ?? []).map(cfg => ({
            itemConfigId: cfg.itemConfigId ?? undefined, // biarkan undefined kalau create baru
            outletId: cfg.outletId ?? undefined,
            isActive: cfg.isActive ?? null,
            showInPos: cfg.showInPos ?? null,
            isFavorite: cfg.isFavorite ?? null,
            manageStock: cfg.manageStock ?? null,
            minStockAlert: cfg.minStockAlert ?? null,
            allowNegativeStock: cfg.allowNegativeStock ?? null,
            cashierMaxPriceChangePct: cfg.cashierMaxPriceChangePct ?? null,
          })),

          itemUnits: (this.editForm.itemUnits ?? []).map(u => ({
            itemUnitId: u.itemUnitId ?? undefined, // biarkan undefined untuk unit baru
            unitId: u.unitId!,
            sku: u.sku ?? '',
            barcode: u.barcode ?? null,
            isBase: Boolean(u.isBase),
            isStock: Boolean(u.isStock),
            isPurchase: Boolean(u.isPurchase),
            isSales: Boolean(u.isSales),
            isTransfer: Boolean(u.isTransfer),
            conversion: Number(u.conversion),

            itemCosts: (u.itemCosts ?? []).map(c => ({
              outletId: c.outletId ?? undefined,
              cost: Number(c.cost),
            })),

            itemPrices: (u.itemPrices ?? []).map(p => ({
              outletId: p.outletId ?? undefined,
              price: Number(p.price),
            })),
          })),
        }

        const res = await $inventoryAPI<ApiResponse<Material>>(`materials/${materialId}`, {
          method: 'PUT',
          body: payload,
        })

        if (res.data) {
          showToast('Bahan baku berhasil diperbarui', 'success')
          this.resetCreateForm()
        }

        return res
      }
      catch (err: any) {
        if (err?.data?.errors && Object.keys(err.data.errors).length) {
          this.createFormErrors = err.data.errors as MaterialCreateFormErrors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(err.data?.message ?? 'Terjadi kesalahan', 'error')
        }
        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },
    async deleteMaterial(itemId: string): Promise<void> {
      this.isLoadingDelete = true
      try {
        await $inventoryAPI(`materials/${itemId}`, { method: 'DELETE' })

        // anggap 2xx = sukses; kalau API-mu expose status, boleh cek res.status
        this.paginateData.data = this.paginateData?.data?.filter(i => i.itemId !== itemId)
        showToast('Bahan baku berhasil dihapus', 'success')
      }
      catch (err: any) {
        if (err?.data?.errors)
          displayErrorMessages(err.data.errors)
        else
          showToast(err?.data?.message ?? 'Gagal menghapus bahan baku', 'error')

        throw err
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    async onDeleteItem(item: Material): Promise<boolean> {
      const isConfirmed = await confirmDialog.openDialog(`Bahan "${item.name}"`)
      if (!isConfirmed)
        return false // ← bukan sukses, tapi batal
      await this.deleteMaterial(item.itemId) // ← bisa throw kalau gagal

      return true
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $inventoryAPI<Blob>('/materials/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Bahan Baku ${dayjs().format('DD-MM-YYYY')}.xlsx`

        downloadBlob(blob, filename)
      }
      catch (error) {
        this.isLoadingExport = false
        console.error('Error exporting data:', error)
        showToast('Error exporting data', 'error')
        throw error
      }
    },

    onSortBy(sortBy: { key: string; order: 'asc' | 'desc' }[]) {
      if (sortBy.length > 0) {
        this.requestQuery.orderField = sortBy[0]?.key
        this.requestQuery.orderDirection = sortBy[0]?.order
      }
      else {
        this.requestQuery.orderField = 'createdAt'
        this.requestQuery.orderDirection = 'desc'
      }
    },
    applyFilter() {
      this.requestQuery = {
        ...this.requestQuery,
        page: 1,
        ...this.additionalFilter,
      }
    },
    resetFilter() {
      this.additionalFilter = {
        type: '',
        itemCategoryId: '',
      }
      this.applyFilter()
    },
  },
})
