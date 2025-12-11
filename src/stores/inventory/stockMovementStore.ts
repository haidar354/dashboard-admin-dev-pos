import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import type { modifierAllowedSorts } from '@/constants/inventory/modifier'
import StockMovementModel from '@/models/inventory/StockMovementModel'
import type {
  ApiPaginatedResponse,
  PaginateData,
} from '@/types/api/response'
import type { StockMovement } from '@/types/models/inventory/item-sku-stock/stock-movement'
import type { ModifierQueryParams } from '@/types/models/product/item-modifier/modifier-resource-spec'
import type { ModifierGroupTableOptions } from '@/types/models/product/item-modifier/modifier-table'
import { $inventoryAPI } from '@/utils/api'

export const useStockMovementStore = defineStore('useStockMovementStore', {
  state: () => ({
    paginateData: {} as PaginateData<StockMovement>,
    selectedStockMovement: {} as StockMovement,
    selectedStockMovementDetail: {} as StockMovement,
    data: [] as StockMovement[],
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    isCreateDialogVisible: false as boolean,
    isUpdateDialogVisible: false as boolean,
    isDetailDialogVisible: false as boolean,
    requestQuery: {
      outletId: '',
      search: '',
      page: 1,
      perPage: 10,
      dateRange: dayjs().format('YYYY-MM-DD') as string,
      fields: [],
      include: [
      ],
      orderBy: [] as string[],
    } as ModifierQueryParams,
    additionalFilter: {
      kind: '',
      type: '',
      itemCategoryId: '',
    },
  }),
  getters: {
    tableOptions(state): ModifierGroupTableOptions {
      return {
        page: state.requestQuery.page || 1,
        itemsPerPage: state.requestQuery.perPage || 10,
        sortBy: mapApiSortToVuetify<(typeof modifierAllowedSorts)[number][]>(state.requestQuery?.orderBy || []),
      }
    },
  },
  actions: {
    openDetailDialog(item?: StockMovement) {
      this.selectedStockMovement = item || {} as StockMovement
    },
    closeDialog() {
      this.isDetailDialogVisible = false
    },
    baseQuery(params?: ModifierQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      return StockMovementModel
        .include(requestQuery.include || [])
        .orderBy(requestQuery.orderBy || [])
        .when(requestQuery.search, (query, value) => query.where('search', value))
        .when(requestQuery.outletId, (query, value) => query.where('outletId', value))
        .when(requestQuery.itemSkuId, (query, value) => query.where('itemSkuId', value))
        .when(requestQuery.movementType, (query, value) => query.where('movementType', value))
        .when(requestQuery.dateRange, (query, value) => {
          if (typeof value === 'string' && value.includes(' - ')) {
            const [start, end] = value.split(' - ').map(s => s.trim())

            query.where('fromDate', start).where('toDate', end)
          }
          else if (typeof value === 'string') {
            query.where('fromDate', value)
          }
        })
    },
    async fetchPaginate(params?: ModifierQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<StockMovement>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchDetail(itemId: string, params?: ModifierQueryParams) {
      this.isLoadingFetchDetail = true
      try {
        const response = await new StockMovementModel()
          .when(params?.include, (query, value) => {
            if (value && value.length > 0)
              query.include(value)
          })
          .when(params?.fields, (query, value) => {
            query.select(value)
          })
          .find(itemId)

        this.selectedStockMovementDetail = response.data

        return this.selectedStockMovementDetail
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $inventoryAPI<Blob>('/item-stocks/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Produk Ekstra ${dayjs().format('DD-MM-YYYY')}.xlsx`

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
        type: '',
        itemCategoryId: '',
      }
      this.applyFilter()
    },
  },
})
