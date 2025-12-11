import { defineStore } from 'pinia'

import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type { DeliveryOrder } from '@/types/models/sales/delivery-order'
import { setPaginateData } from '@/utils/common'
import { $salesAPI } from '@/utils/api'
import { $salesAPIx } from '@/utils/api-axios'
import { showToast } from '@/utils/toaster'

// Mocking Model if it doesn't exist, or we can just use direct API calls in actions
// For consistency with SalesOrderStore, I'll assume we might want a Model wrapper later,
// but for now I'll implement baseQuery logic directly or use a simple object.
// Actually, let's just use direct API calls for simplicity and refactor to Model pattern if strictly required.
// However, SalesOrderStore uses SalesOrderModel.baseQuery... let's see if I can mimic that without the file.
// I'll stick to direct API calls for now to avoid creating too many files, but keep the structure.

export const useDeliveryOrderStore = defineStore('deliveryOrderStore', {
  state: () => ({
    paginateData: {} as PaginateData<DeliveryOrder>,
    data: [] as DeliveryOrder[],
    selectedDeliveryOrder: {} as DeliveryOrder,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingDownload: false as boolean,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'createdAt',
      orderDirection: 'desc',
    } as RequestQueryModel,
    additionalFilter: {
      dateFrom: '',
      dateTo: '',
      status: undefined as string | undefined,
    },
  }),

  getters: {
    hasDeliveryOrders: state => state.paginateData.data?.length > 0,
    totalDeliveryOrders: state => state.paginateData.meta?.total || 0,
  },

  actions: {
    resetFilter() {
      this.requestQuery = {
        page: 1,
        perPage: 10,
        search: '',
        orderField: 'createdAt',
        orderDirection: 'desc',
      } as RequestQueryModel
      this.additionalFilter = {
        dateFrom: '',
        dateTo: '',
        status: undefined,
      }
    },

    applyFilter() {
      this.requestQuery.page = 1
      this.requestQuery = {
        ...this.requestQuery,
        ...this.additionalFilter,
      }
      this.fetchPaginatedData()
    },

    onSortBy(sortBy: { key: string; order: string }[]) {
      if (sortBy.length > 0) {
        this.requestQuery.orderField = sortBy[0].key
        this.requestQuery.orderDirection = sortBy[0].order as 'asc' | 'desc'
        this.fetchPaginatedData()
      }
    },

    async fetchPaginatedData(params: RequestQueryModel = {}) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        // Construct query params manually since we don't have the Model wrapper yet
        const queryParams: any = {
          page: requestQuery.page,
          perPage: requestQuery.perPage,
          search: requestQuery.search,
          orderBy: requestQuery.orderField,
          sortedBy: requestQuery.orderDirection,
          include: 'order', // Default include
        }

        if (requestQuery.status)
          queryParams.status = requestQuery.status
        if (requestQuery.dateFrom)
          queryParams.dateFrom = requestQuery.dateFrom
        if (requestQuery.dateTo)
          queryParams.dateTo = requestQuery.dateTo

        const response = await $salesAPI<ApiPaginatedResponse<DeliveryOrder>>('delivery-orders', {
          params: queryParams,
        })

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching delivery orders:', error)
        this.paginateData = {} as PaginateData<DeliveryOrder>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(deliveryId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        // Convert include array to comma-separated string if needed
        let includeParam = 'order,order.salesOrder,lines,lines.orderLine'
        if (params?.include) {
          includeParam = Array.isArray(params.include)
            ? params.include.join(',')
            : params.include
        }

        const response = await $salesAPI<ApiResponse<DeliveryOrder>>(`delivery-orders/${deliveryId}`, {
          params: {
            include: includeParam,
          },
        })

        if (response.data)
          this.selectedDeliveryOrder = response.data
      }
      catch (error) {
        console.error('Error fetching delivery order detail:', error)
        this.selectedDeliveryOrder = {} as DeliveryOrder
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async create(payload: any) {
      this.isLoadingCreate = true
      try {
        const response = await $salesAPI<ApiResponse<DeliveryOrder>>('/delivery-orders', {
          method: 'POST',
          body: payload,
        })

        showToast('Surat jalan berhasil dibuat', 'success')

        // Update selected delivery order with the newly created one
        if (response.data)
          this.selectedDeliveryOrder = response.data

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal membuat surat jalan', 'error')
        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async updateStatus(deliveryId: string, status: string) {
      this.isLoadingUpdate = true
      try {
        const response = await $salesAPI<ApiResponse<DeliveryOrder>>(`delivery-orders/${deliveryId}/status`, {
          method: 'PATCH',
          body: { status },
        })

        showToast('Status pengiriman berhasil diupdate', 'success')

        // Update local data
        if (this.selectedDeliveryOrder?.deliveryId === deliveryId)
          this.selectedDeliveryOrder = response.data

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal update status', 'error')
        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async downloadPdf(item: DeliveryOrder) {
      this.isLoadingDownload = true
      try {
        // Assuming endpoint exists or will exist
        const response: any = await $salesAPIx(`delivery-orders/${item.deliveryId}/pdf`, {
          method: 'GET',
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const link = document.createElement('a')

        link.href = url

        // Try to get filename from content-disposition header
        let filename = item.deliveryNumber
          ? `${item.deliveryNumber}.pdf`
          : `DO-${item.deliveryId}.pdf`

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
        this.isLoadingDownload = false
      }
    },
  },
})
