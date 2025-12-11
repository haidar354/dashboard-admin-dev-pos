import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import ItemSkuModel from '@/models/product/ItemSkuModel'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import type { allowedSorts } from '@/constants/inventory/material'
import type { RequestQueryModel } from '@/types/api/request'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type { Item, ItemSkuView } from '@/types/models/product/item'
import type { ItemQueryParams } from '@/types/models/product/item-resource-spec'
import type { ItemTableOptions } from '@/types/models/product/item-table'

const confirmDialog = useConfirmDialogStore()
export const useItemSkuStore = defineStore('itemSkuStore', {
  state: () => ({
    paginateData: {} as PaginateData<ItemSkuView>,
    selectedItem: {} as ItemSkuView,
    selectedItemDetail: {} as ItemSkuView,
    data: [] as ItemSkuView[],
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
    additionalFilter: {
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
    baseQuery(params?: ItemQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      return ItemSkuModel
        .when(requestQuery.fields, (query, value) => query.select(value || []))
        .when(requestQuery.include, (query, value) => query.include(value || []))
        .when(requestQuery.orderBy, (query, value) => query.orderBy(value || []))
        .when(requestQuery.search, (query, value) => query.where('search', value))
        .when(requestQuery.itemCategoryId, (query, value) => query.where('item.itemCategoryId', value))
        .when(requestQuery.outletId, (query, value) => query.where('outletId', value))
        .when(requestQuery.outletIds, (query, value) => query.whereIn('outletId', value))
        .when(requestQuery.kind, (query, value) => query.where('item.kind', value))
        .when(('showInPos' in requestQuery), query => {
          if (requestQuery.showInPos !== undefined)
            query.where('showInPos', requestQuery.showInPos)
        })
        .when(requestQuery.filter?.outletId, (query, value) => query.where('outletId', value))
    },
    async fetchPaginate(params?: ItemQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<ItemSkuView>>(requestQuery?.page || 1, requestQuery?.perPage || 10)

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
        const response = await new ItemSkuModel()
          .custom('/item-skus/all')
          .include(requestQuery.include || [])
          .orderBy(requestQuery.orderBy || [])
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .when(requestQuery.manageStock, (query, value) => query.where('manageStock', value))
          .when(requestQuery.outletId, (query, value) => query.where('outletId', value))
          .get<ApiResponse<ItemSkuView[]>>()

        this.data = response.data || []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchDetail(itemId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const response = await new ItemSkuModel()
          .when(params?.include, (query, value) => {
            if (value && value.length > 0)
              query.include(value)
          })
          .find<ApiResponse<ItemSkuView>>(itemId)

        this.selectedItemDetail = response.data

        return response
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async delete(itemId: string) {
      this.isLoadingDelete = true
      await $productAPI<ApiResponse<Item>>(`item-skus/${itemId}`, {
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

    async onDeleteItem(item: ItemSkuView) {
      confirmDialog.openDialog(`Item "${item.displayName}"`).then(isConfirmed => {
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
        showInPos: undefined,
        itemCategoryId: '',
      }
      this.applyFilter()
    },
  },
})
