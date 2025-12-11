import { defineStore } from 'pinia'
import type { ItemQueryParams } from '../../types/models/inventory/material'
import type { allowedSorts } from '@/constants/inventory/material'
import ItemOutletModel from '@/models/product/ItemOutletModel'
import type { PaginateData } from '@/types/api/response'
import type { ItemOutlet, ItemOutletQueryParams, ItemOutletTableOptions } from '@/types/models/inventory/item-outlet'

export const useItemOutletStore = defineStore('itemOutlet', {
  state: () => ({
    data: [] as ItemOutlet[],
    paginateData: {
      data: [],
      currentPage: 1,
      from: 1,
      lastPage: 1,
      perPage: 100,
      to: 1,
      total: 0,
    } as PaginateData<ItemOutlet>,
    selectedItemOutlet: null as ItemOutlet | null,
    isLoadingFetchData: false,
    isLoadingFetchDetail: false,
    isLoadingCreate: false,
    isLoadingUpdate: false,
    isLoadingDelete: false,
    form: {
      itemId: '',
      outletId: '',
      isActive: true,
      avgPurchasePrice: 0,
      salePrice: 0,
      stock: 0,
      minStockAlert: 0,
    },
    formErrors: {} as Record<string, string[]>,
    requestQuery: {
      outletId: '',
      search: '',
      page: 1,
      perPage: 10,
      fields: [],
      include: [
        'item.itemCategory',
      ],
      orderBy: [] as string[],
    } as ItemOutletQueryParams,
  }),
  getters: {
    tableOptions(state): ItemOutletTableOptions {
      return {
        page: state.requestQuery.page || 1,
        itemsPerPage: state.requestQuery.perPage || 10,
        sortBy: mapApiSortToVuetify<(typeof allowedSorts)[number][]>(state.requestQuery.orderBy),
      }
    },
  },
  actions: {
    async fetchPaginate(params?: ItemQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await new ItemOutletModel()
          .include(requestQuery.include)
          .orderBy(requestQuery.orderBy)
          .when(requestQuery.search, (query, value) => query.where('search', value || ''))
          .when(requestQuery.outletId, (query, value) => query.where('outletId', value))
          .paginate<ItemOutlet>(requestQuery.page || 1, requestQuery.perPage)

        this.paginateData = setPaginateData(response)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    onSortBy(sortBy: { key: string; order: 'asc' | 'desc' }[]) {
      this.requestQuery.orderBy = mapVuetifySortToApi(sortBy)
      console.log(sortBy, this.tableOptions.sortBy)
    },
  },
})
