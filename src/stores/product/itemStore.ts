import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import is from '@sindresorhus/is'
import ItemModel from '@/models/product/ItemModel'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import type { allowedSorts } from '@/constants/inventory/material'
import type { RequestQueryModel } from '@/types/api/request'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type { Item } from '@/types/models/product/item'
import type { ConfigPayload, ItemPayload, ItemPayloadErrors, UpdateItemPayload } from '@/types/models/product/item-payload'
import type { ItemQueryParams } from '@/types/models/product/item-resource-spec'
import type { ItemTableOptions } from '@/types/models/product/item-table'

const confirmDialog = useConfirmDialogStore()
export const useItemStore = defineStore('itemStore', {
  state: () => ({
    paginateData: {} as PaginateData<Item>,
    selectedItem: {} as Item,
    selectedItemDetail: {} as Item,
    data: [] as Item[],
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: true as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    isCreateDialogVisible: false as boolean,
    requestQuery: {
      outletId: '',
      search: '',
      page: 1,
      perPage: 10,
      kind: undefined,
      include: [
      ],
      filters: {},
      orderBy: [] as string[],
    } as ItemQueryParams,
    createForm: {} as ItemPayload,
    createFormErrors: {} as ItemPayloadErrors,
    createFormGlobalConfig: {
      saleable: true,
      showInPos: true,
      favorite: false,
      saleFulfillmentMode: 'RECIPE',
      manageStock: true,
      allowNegativeStock: false,
      minStockAlert: 0,
      maxStock: null,
      leadTimeDays: 0,
      manufacturingSource: 'IN_HOUSE',
      sourcingSitePolicy: 'CENTRAL_ONLY',
      centralKitchenOutletId: null,
      batchSize: 1,
    } as ConfigPayload,
    updateForm: {} as UpdateItemPayload,
    updateFormErrors: {} as ItemPayloadErrors,

    variantGroups: [] as {
      tempId: string
      name: string
      options: { tempId: string; name: string; isActive: boolean }[]
    }[],
    isInitializingUpdate: false as boolean,
    isReadyToGenerateUpdate: false as boolean,
    additionalFilter: {
      kind: 'product',
      showInPos: undefined as boolean | undefined,
      itemCategoryId: '',
    },
  }),
  getters: {
    tableOptions(state): ItemTableOptions {
      return {
        page: state.requestQuery.page || 1,
        itemsPerPage: state.requestQuery.perPage || 10,
        sortBy: mapApiSortToVuetify<(typeof allowedSorts)[number][]>(state.requestQuery.orderBy || []),
      }
    },
  },
  actions: {
    generateRandomCodeFor(object: any, key: string, prefix: string = 'BRG') {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()

      object[key] = `${prefix}-${random}`
    },
    resetForm() {
      this.createForm = {} as ItemPayload
      this.createFormErrors = {} as ItemPayloadErrors
    },
    openCreateDialog() {
      this.resetForm()
      this.isCreateDialogVisible = true
    },
    closeCreateDialog() {
      this.isCreateDialogVisible = false
      this.resetForm()
    },
    baseQuery(params?: ItemQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      return ItemModel
        .when(requestQuery.fields, (query, value) => query.select(value || []))
        .when(requestQuery.include, (query, value) => query.include(value || []))
        .when(requestQuery.orderBy, (query, value) => query.orderBy(value || []))
        .when(requestQuery.search, (query, value) => query.where('search', value))
        .when(requestQuery.itemCategoryId, (query, value) => query.where('itemCategoryId', value))
        .when(requestQuery.outletId, (query, value) => query.where('itemOutlets.outletId', value))
        .when(requestQuery.outletIds, (query, value) => query.whereIn('itemOutlets.outletId', value))
        .when(requestQuery.kind, (query, value) => query.where('kind', value))
        .when(('showInPos' in requestQuery), query => {
          if (requestQuery.showInPos !== undefined)
            query.where('showInPos', requestQuery.showInPos)
        })
    },
    async fetchPaginate(params?: ItemQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<Item>>(requestQuery?.page || 1, requestQuery?.perPage || 10)

        this.paginateData = setPaginateData(response)
        console.log('fetchPaginate', response)
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchAllData(params?: ItemQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await new ItemModel()
          .custom('/items/all')
          .include(requestQuery.include || [])
          .orderBy(requestQuery.orderBy || [])
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .when(requestQuery.outletId, (query, value) => query.where('itemOutlets.outletId', value))
          .get<ApiResponse<Item[]>>()

        this.data = response.data || []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchDetail(itemId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const response = await new ItemModel()
          .when(params?.include, (query, value) => {
            if (value && value.length > 0)
              query.include(value)
          })
          .find<ApiResponse<Item>>(itemId)

        this.selectedItemDetail = response.data

        return response
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async create() {
      this.isLoadingCreate = true

      try {
        const f = this.createForm

        const createFormData = {
          // === 🧱 ITEM HEADER ===
          name: f.name?.trim() || '',
          kind: f.kind || 'product',
          materialType: f.materialType || null,
          itemCategoryId: f.itemCategoryId || null,
          description: f.description || null,
          meta: f.meta && Object.keys(f.meta).length ? f.meta : null,

          hasVariant: !!f.hasVariant,
          hasModifier: !!f.hasModifier,
          hasRequiredModifier: !!f.hasRequiredModifier,
          useSameConfig: !!f.useSameConfig,
          recipePolicy: f.recipePolicy || 'NONE',
          isActive: f.isActive ?? true,

          // === ⚙️ ITEM CONFIG (global default for all SKUs)
          config: {
            saleable: !!f.config?.saleable,
            showInPos: !!f.config?.showInPos,
            favorite: !!f.config?.favorite,

            saleFulfillmentMode: f.config?.saleFulfillmentMode || 'NONE',
            manufacturingSource: f.config?.manufacturingSource || 'NONE',
            sourcingSitePolicy: f.config?.sourcingSitePolicy || 'NONE',
            centralKitchenOutletId: f.config?.centralKitchenOutletId || null,
            batchSize: f.config?.batchSize ?? 1,
            leadTimeDays: f.config?.leadTimeDays ?? 0,

            manageStock: !!f.config?.manageStock,
            allowNegativeStock: !!f.config?.allowNegativeStock,
            minStockAlert: f.config?.minStockAlert ?? 0,
            maxStockAlert: f.config?.maxStockAlert ?? null,
          },

          // === 🏪 OUTLETS ===
          outlets: (f.outlets || []).map((o, idx) => ({
            outletId: o.outletId,
            isActive: o.isActive ?? true,
            sortOrder: o.sortOrder ?? idx,
          })),

          // === 🖼️ IMAGES ===
          images: (f.images || []).map((i, idx) => ({
            itemImageId: i.itemImageId,
            isPrimary: i.isPrimary ?? idx === 0,
            displayOrder: idx + 1,
          })),

          // === ⚖️ UNITS ===
          units: (f.units || []).map(u => ({
            tempId: u.tempId || crypto.randomUUID(),
            unitId: u.unitId,
            conversion: Number(u.conversion ?? 1),
            minSalesQty: Number(u.minSalesQty ?? 1),
            isBase: !!u.isBase,
            isStock: !!u.isStock,
            isPurchase: !!u.isPurchase,
            isSales: !!u.isSales,
            isTransfer: !!u.isTransfer,
          })),

          // === 🧬 VARIANTS ===
          variants: f.hasVariant
            ? (f.variants || []).map(v => ({
                tempId: v.tempId || crypto.randomUUID(),
                optionsKey: v.optionsKey,
                options: v.options,
                displayName: v.displayName,
                isActive: !!v.isActive,
                sortOrder: v.sortOrder ?? 0,
              }))
            : [],

          variantUnits: f.hasVariant
            ? (f.variantUnits || []).map(vu => ({
                tempId: vu.tempId || crypto.randomUUID(),
                variantTempId: vu.variantTempId,
                unitTempId: vu.unitTempId,
                displayName: vu.displayName || null,
                isActive: !!vu.isActive,
              }))
            : [],

          // === 🧾 SKUs ===
          skus: (f.skus || []).map(s => ({
            tempId: s.tempId || crypto.randomUUID(),
            variantUnitTempId: s.variantUnitTempId || null,
            unitTempId: s.unitTempId || null,
            displayName: s.displayName,
            code: s.code || null,
            barcode: s.barcode || null,
            isActive: !!s.isActive,

            config: {
              saleable: !!s.config?.saleable,
              showInPos: !!s.config?.showInPos,
              favorite: !!s.config?.favorite,

              saleFulfillmentMode: s.config?.saleFulfillmentMode || 'NONE',
              manufacturingSource: s.config?.manufacturingSource || 'NONE',
              sourcingSitePolicy: s.config?.sourcingSitePolicy || 'NONE',
              centralKitchenOutletId: s.config?.centralKitchenOutletId || null,
              batchSize: s.config?.batchSize ?? 1,
              leadTimeDays: s.config?.leadTimeDays ?? 0,

              manageStock: !!s.config?.manageStock,
              allowNegativeStock: !!s.config?.allowNegativeStock,
              minStockAlert: s.config?.minStockAlert ?? 0,
              maxStockAlert: s.config?.maxStockAlert ?? null,
            },

            cost: s.cost
              ? {
                  cost: Number(s.cost.cost ?? 0),
                  lastCost: Number(s.cost.lastCost ?? 0),
                  method: s.cost.method || 'FIFO',
                }
              : null,

            price: s.price
              ? {
                  price: Number(s.price.price ?? 0),
                  taxInclusive: !!s.price.taxInclusive,
                  qtyThreshold: s.price.qtyThreshold ?? null,
                }
              : null,

            bom: s.bom
              ? {
                  yield: s.bom.yield ?? 1,
                  lines: (s.bom.lines || []).map(line => ({
                    materialItemSkuId: line.materialItemSkuId,
                    quantity: Number(line.quantity ?? 0),
                    wastePct: Number(line.wastePct ?? 0),
                    consumeFromStock: !!line.consumeFromStock,
                  })),
                }
              : null,

            // === 🧩 OVERRIDES (per outlet)
            overrides: (s.overrides || []).map(o => ({
              outletId: o.outletId,
              isActive: !!o.isActive,

              config: {
                saleable: !!o.config?.saleable,
                showInPos: !!o.config?.showInPos,
                favorite: !!o.config?.favorite,

                saleFulfillmentMode: o.config?.saleFulfillmentMode || 'NONE',
                manufacturingSource: o.config?.manufacturingSource || 'NONE',
                sourcingSitePolicy: o.config?.sourcingSitePolicy || 'NONE',
                centralKitchenOutletId: o.config?.centralKitchenOutletId || null,
                batchSize: o.config?.batchSize ?? 1,
                leadTimeDays: o.config?.leadTimeDays ?? 0,

                manageStock: !!o.config?.manageStock,
                allowNegativeStock: !!o.config?.allowNegativeStock,
                minStockAlert: o.config?.minStockAlert ?? 0,
                maxStockAlert: o.config?.maxStockAlert ?? null,
              },

              price: o.price
                ? {
                    price: Number(o.price.price ?? 0),
                    taxInclusive: !!o.price.taxInclusive,
                    qtyThreshold: o.price.qtyThreshold ?? null,
                  }
                : null,

              cost: o.cost
                ? {
                    cost: Number(o.cost.cost ?? 0),
                    lastCost: Number(o.cost.lastCost ?? 0),
                    method: o.cost.method || 'FIFO',
                  }
                : null,

              bom: o.bom
                ? {
                    yield: o.bom.yield ?? 1,
                    lines: (o.bom.lines || []).map(line => ({
                      materialItemSkuId: line.materialItemSkuId,
                      quantity: Number(line.quantity ?? 0),
                      wastePct: Number(line.wastePct ?? 0),
                      consumeFromStock: !!line.consumeFromStock,
                    })),
                  }
                : null,
            })),
          })),

          // === 🍳 ITEM-LEVEL BOM (optional; for saleFulfillmentMode = RECIPE)
          bom:
        ['IN_HOUSE', 'EITHER'].includes(f.config?.manufacturingSource || 'NONE')
        && f.config?.saleFulfillmentMode === 'RECIPE'
        && f.bom
          ? {
              yield: f.bom.yield ?? 1,
              notes: f.bom.notes || null,
              lines: (f.bom.lines || []).map((line, idx) => ({
                materialItemSkuId: line.materialItemSkuId,
                quantity: Number(line.quantity ?? 0),
                wastePct: Number(line.wastePct ?? 0),
                consumeFromStock: !!line.consumeFromStock,
                sortOrder: line.sortOrder ?? idx,
                notes: line.notes || null,
              })),
            }
          : null,

          // === 🎛️ MODIFIERS ===
          modifiers: f.hasModifier
            ? (f.modifiers || []).map((m, i) => ({
                tempId: m.tempId || crypto.randomUUID(),
                modifierGroupId: m.modifierGroupId,
                isRequired: !!m.isRequired,
                isActive: !!m.isActive,
                sortOrder: m.sortOrder ?? i,
              }))
            : [],
        }

        const item = new ItemModel()

        await item.config({ data: createFormData }).save()

        showToast('Produk berhasil ditambahkan', 'success')
        this.resetForm()
      }
      catch (err: any) {
        if (err?.data?.errors) {
          this.createFormErrors = err.data.errors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(err?.data?.message || 'Terjadi kesalahan saat menyimpan produk', 'error')
        }
        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },
    async update() {
      this.isLoadingUpdate = true

      try {
        // 🔹 Bangun payload sesuai struktur backend (UpdateItemPayload)
        const payload = {
          name: this.updateForm.name,
          kind: this.updateForm.kind,
          materialType: this.updateForm.materialType,
          itemCategoryId: this.updateForm.itemCategoryId,
          description: this.updateForm.description,
          meta: is.emptyObject(this.updateForm.meta) ? null : this.updateForm.meta,

          hasVariant: this.updateForm.hasVariant,
          hasModifier: this.updateForm.hasModifier,
          hasRequiredModifier: this.updateForm.hasRequiredModifier,
          useSameConfig: this.updateForm.useSameConfig,
          recipePolicy: this.updateForm.recipePolicy,
          isActive: this.updateForm.isActive,

          // 🔹 Default/global config
          config: this.updateForm.config,

          // 🔹 Relations (pastikan semuanya array)
          outlets: this.updateForm.outlets ?? [],
          units: this.updateForm.units ?? [],
          variants: this.updateForm.variants ?? [],
          variantUnits: this.updateForm.variantUnits ?? [],
          skus: this.updateForm.skus ?? [],
          modifiers: this.updateForm.modifiers ?? [],
          images: this.updateForm.images ?? [],
          bom: this.updateForm.bom ?? null,
        }

        // 🔹 Call API
        const response = await $productAPI<ApiResponse<Item>>(
      `items/${this.selectedItemDetail.itemId}`,
      {
        method: 'PUT',
        body: payload,
      },
        )

        if (response.data) {
          showToast('Produk berhasil diperbarui', 'success')
          this.fetchPaginate()
          this.resetForm()
        }
      }
      catch (err: any) {
        if (Object.keys(err.data?.errors || {}).length) {
          this.updateFormErrors = err.data.errors as ItemPayloadErrors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(err.data?.message || 'Gagal memperbarui produk', 'error')
        }
        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },
    async delete(itemId: string) {
      this.isLoadingDelete = true
      await $productAPI<ApiResponse<Item>>(`items/${itemId}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.data) {
            this.paginateData.data = this.paginateData.data.filter(
              item => item.itemId !== itemId,
            )
            showToast('Produk berhasil dihapus', 'success')
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')
          throw err
        })
        .finally(() => {
          this.isLoadingDelete = false
        })
    },

    async onDeleteItem(item: Item) {
      confirmDialog.openDialog(`Item "${item.name}"`).then(isConfirmed => {
        if (isConfirmed)
          this.delete(item.itemId)
      })
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $inventoryAPI<Blob>('/items/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Produk ${dayjs().format('DD-MM-YYYY')}.xlsx`

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
        kind: '',
        showInPos: undefined,
        itemCategoryId: '',
      }
      this.applyFilter()
    },
  },
})
