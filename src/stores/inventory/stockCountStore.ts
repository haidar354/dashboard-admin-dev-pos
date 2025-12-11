/* eslint-disable sonarjs/no-useless-catch */
/* eslint-disable no-useless-catch */
import { defineStore } from 'pinia'
import { $inventoryAPI } from '@/utils/api'
import type { RequestQueryModel } from '@/types/api/request'
import type { CreateStockCountRequest, StockCount, UpdateStockCountRequest } from '@/types/models/inventory/stock-count'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'

interface State {
  paginateData: PaginateData<StockCount>
  isLoadingFetchData: boolean
  requestQuery: RequestQueryModel
  isDownloading: boolean
  additionalFilter: {
    status?: string
    outletId?: string
    dateFrom?: string
    dateTo?: string
  }
}

export const useStockCountStore = defineStore('stockCountStore', {
  state: (): State => ({
    paginateData: {} as PaginateData<StockCount>,
    isLoadingFetchData: false,
    isDownloading: false,
    requestQuery: {
      page: 1,
      perPage: 15,
      search: '',
      orderField: 'createdAt',
      orderDirection: 'desc',
    },
    additionalFilter: {},
  }),

  actions: {
    async fetchPaginatedData() {
      this.isLoadingFetchData = true
      try {
        const queryParams: Record<string, any> = {
          page: this.requestQuery.page,
          perPage: this.requestQuery.perPage,

          // Add filters
          ...(this.additionalFilter.status && { 'filter[status]': this.additionalFilter.status }),
          ...(this.additionalFilter.outletId && { 'filter[outletId]': this.additionalFilter.outletId }),
          ...(this.requestQuery.search && { 'filter[reference]': this.requestQuery.search }), // Assuming search by reference
          include: 'outlet,createdByUser',
        }

        const response = await $inventoryAPI<ApiPaginatedResponse<StockCount>>('stock-counts', {
          params: queryParams,
        })

        this.paginateData = response
      }
      catch (error) {
        console.error(error)
        throw error
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchById(id: string) {
      try {
        return await $inventoryAPI<ApiResponse<StockCount>>(`stock-counts/${id}`, {
          params: {
            include: 'lines,lines.itemSku,outlet,createdByUser',
          },
        })
      }
      catch (error) {
        throw error
      }
    },

    async create(payload: CreateStockCountRequest) {
      try {
        return await $inventoryAPI<ApiResponse<StockCount>>('stock-counts', {
          method: 'POST',
          body: payload,
        })
      }
      catch (error) {
        throw error
      }
    },

    async update(id: string, payload: UpdateStockCountRequest) {
      try {
        return await $inventoryAPI<ApiResponse<StockCount>>(`stock-counts/${id}`, {
          method: 'PUT',
          body: payload,
        })
      }
      catch (error) {
        throw error
      }
    },

    async finalize(id: string) {
      try {
        return await $inventoryAPI<ApiResponse<StockCount>>(`stock-counts/${id}/finalize`, {
          method: 'POST',
        })
      }
      catch (error) {
        throw error
      }
    },

    applyFilter() {
      this.requestQuery.page = 1
      this.fetchPaginatedData()
    },

    resetFilter() {
      this.requestQuery.page = 1
      this.additionalFilter = {}
      this.fetchPaginatedData()
    },

    async downloadPdf(item: StockCount) {
      this.isDownloading = true
      try {
        // Assuming endpoint exists or will exist
        const response: any = await $inventoryAPIx(`stock-counts/${item.stockCountId}/pdf`, {
          method: 'GET',
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const link = document.createElement('a')

        link.href = url

        // Try to get filename from content-disposition header
        let filename = item.reference
          ? `${item.reference}.pdf`
          : `SC-${item.stockCountId}.pdf`

        // Try to get filename from content-disposition header
        const contentDisposition = response.headers['content-disposition']
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
          if (filenameMatch && filenameMatch[1])
            filename = filenameMatch[1]
        }

        // Sanitize filename (remove illegal chars like / \ : * ? " < > |)
        filename = filename.replace(/[/\\?%*:|"<>]/g, '-')

        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      catch (err) {
        console.error('Download failed', err)
        showToast('Gagal mengunduh PDF', 'error')
      }
      finally {
        this.isDownloading = false
      }
    },

    async cancel(id: string) {
      try {
        return await $inventoryAPI<ApiResponse<StockCount>>(`stock-counts/${id}/cancel`, {
          method: 'POST',
        })
      }
      catch (error) {
        throw error
      }
    },
  },
})
