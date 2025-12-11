import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import type { modifierAllowedSorts } from '@/constants/inventory/modifier'
import ItemStockModel from '@/models/inventory/ItemSkuStockModel'
import type {
  ApiPaginatedResponse,
  PaginateData,
} from '@/types/api/response'
import type { ItemSkuStock } from '@/types/models/inventory/item-sku-stock/item-sku-stock'
import type { ModifierQueryParams } from '@/types/models/product/item-modifier/modifier-resource-spec'
import type { ModifierGroupTableOptions } from '@/types/models/product/item-modifier/modifier-table'
import { $inventoryAPI } from '@/utils/api'

export const useItemSkuStockStore = defineStore('useItemSkuStockStore', {
  state: () => ({
    paginateData: {} as PaginateData<ItemSkuStock>,
    selectedItemSkuStock: {} as ItemSkuStock,
    selectedItemSkuStockDetail: {} as ItemSkuStock,
    data: [] as ItemSkuStock[],
    stockByOutletData: {} as PaginateData<any>, // Should define a type but any for now to speed up
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
      dateRange: [] as string[],
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
    openDetailDialog(item?: ItemSkuStock) {
      this.selectedItemSkuStock = item || {} as ItemSkuStock
    },
    closeDialog() {
      this.isDetailDialogVisible = false
    },
    baseQuery(params?: ModifierQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      return ItemStockModel
        .include(requestQuery.include || [])
        .orderBy(requestQuery.orderBy || [])
        .when(requestQuery.search, (query, value) => query.where('search', value))
        .when(requestQuery.outletId, (query, value) => query.where('item.itemOutlets.outletId', value))
        .when(requestQuery.dateRange, (query, value) => {
          if (typeof value === 'string' && value.includes(' - ')) {
            const [start, end] = value.split(' - ').map(s => s.trim())

            query.params({ startDate: start, endDate: end })
          }
        })
    },
    async fetchPaginate(params?: ModifierQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<ItemSkuStock>>(requestQuery.page || 1, requestQuery.perPage || 10)

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
        const response = await new ItemStockModel()
          .when(params?.include, (query, value) => {
            if (value && value.length > 0)
              query.include(value)
          })
          .when(params?.fields, (query, value) => {
            query.select(value)
          })
          .find(itemId)

        this.selectedItemSkuStockDetail = response.data

        return this.selectedItemSkuStockDetail
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async fetchStockByOutlet(params?: ModifierQueryParams) {
      // START FIX: Clean up query params construction
      const queryParams: any = { ...this.requestQuery, ...params }

      // Handle dateRange
      const dateRangeVal = queryParams.dateRange
      if (typeof dateRangeVal === 'string') {
        let start, end
        if (dateRangeVal.includes(' to '))
          [start, end] = dateRangeVal.split(' to ')
        else if (dateRangeVal.includes(' - '))
          [start, end] = dateRangeVal.split(' - ')

        if (start && end) {
          queryParams.startDate = start.trim()
          queryParams.endDate = end.trim()
        }
      }

      // Handle filter flattening for Spatie
      if (queryParams.filter) {
        Object.entries(queryParams.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '')
            queryParams[`filter[${key}]`] = value
        })
        delete queryParams.filter
      }

      // Delete specific keys we don't want in top level
      delete queryParams.outletId
      delete queryParams.search

      // Remove undefined/null/empty keys from top-level to avoid "key=" or "key" in URL
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '')
          delete queryParams[key]
      })

      // END FIX

      this.isLoadingFetchData = true
      try {
        const response = await $inventoryAPI<ApiPaginatedResponse<any>>('/sku-stocks/by-outlet', {
          method: 'GET',
          query: queryParams,
        })

        this.stockByOutletData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching stock by outlet:', error)
      }
      finally {
        this.isLoadingFetchData = false
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
