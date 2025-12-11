import { defineStore } from 'pinia'
import { $salesAPI } from '@/utils/api'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, PaginateData } from '@/types/api/response'
import type {
  ApproveReturnRequest,
  CompleteReturnRequest,
  CreateReturnRequest,
  OrderReturn,
  RejectReturnRequest,
  UpdateReturnRequest,
} from '@/types/models/sales/order-return'
import { setPaginateData } from '@/utils/common'

export const useReturnStore = defineStore('returnStore', {
  state: () => ({
    paginateData: {} as PaginateData<OrderReturn>,
    isLoadingFetchData: false as boolean,
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
      reason: undefined as string | undefined,
      orderId: undefined as string | undefined,
    },
  }),

  getters: {
    hasReturns: state => state.paginateData.data?.length > 0,
    totalReturns: state => state.paginateData.meta?.total || 0,
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
        reason: undefined,
        orderId: undefined,
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
        const queryParams: any = {
          page: requestQuery.page,
          perPage: requestQuery.perPage,
          include: 'order,lines,lines.orderLine,createdByUser',
        }

        // Sorting
        if (requestQuery.orderField) {
          const prefix = requestQuery.orderDirection === 'desc' ? '-' : ''

          queryParams.sort = `${prefix}${requestQuery.orderField}`
        }

        // Filters
        if (requestQuery.search)
          queryParams['filter[search]'] = requestQuery.search

        if (requestQuery.status)
          queryParams['filter[status]'] = requestQuery.status

        if (requestQuery.reason)
          queryParams['filter[reason]'] = requestQuery.reason

        if (requestQuery.orderId)
          queryParams['filter[orderId]'] = requestQuery.orderId

        if (requestQuery.dateFrom)
          queryParams['filter[date_from]'] = requestQuery.dateFrom

        if (requestQuery.dateTo)
          queryParams['filter[date_to]'] = requestQuery.dateTo

        const response = await $salesAPI<ApiPaginatedResponse<OrderReturn>>('sales-returns', {
          params: queryParams,
        })

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching returns:', error)
        this.paginateData = {} as PaginateData<OrderReturn>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchReturnById(returnId: string) {
      try {
        const response = await $salesAPI<{ data: OrderReturn }>(`sales-returns/${returnId}`, {
          params: {
            include: 'order,order.lines,lines,lines.orderLine,lines.orderLine.itemSku,createdByUser,updatedByUser,approvedByUser',
          },
        })

        return response.data
      }
      catch (error) {
        console.error('Error fetching return:', error)
        throw error
      }
    },

    async createReturn(orderId: string, payload: CreateReturnRequest) {
      try {
        const response = await $salesAPI<{ data: OrderReturn }>(`orders/${orderId}/returns`, {
          method: 'POST',
          body: payload,
        })

        return response.data
      }
      catch (error) {
        console.error('Error creating return:', error)
        throw error
      }
    },

    async updateReturn(returnId: string, payload: UpdateReturnRequest) {
      try {
        const response = await $salesAPI<{ data: OrderReturn }>(`sales-returns/${returnId}`, {
          method: 'PUT',
          body: payload,
        })

        return response.data
      }
      catch (error) {
        console.error('Error updating return:', error)
        throw error
      }
    },

    async approveReturn(returnId: string, payload: ApproveReturnRequest = {}) {
      try {
        const response = await $salesAPI<{ data: OrderReturn }>(`sales-returns/${returnId}/approve`, {
          method: 'POST',
          body: payload,
        })

        return response.data
      }
      catch (error) {
        console.error('Error approving return:', error)
        throw error
      }
    },

    async rejectReturn(returnId: string, payload: RejectReturnRequest) {
      try {
        const response = await $salesAPI<{ data: OrderReturn }>(`sales-returns/${returnId}/reject`, {
          method: 'POST',
          body: payload,
        })

        return response.data
      }
      catch (error) {
        console.error('Error rejecting return:', error)
        throw error
      }
    },

    async cancelReturn(returnId: string, notes?: string) {
      try {
        const response = await $salesAPI<{ data: OrderReturn }>(`sales-returns/${returnId}/cancel`, {
          method: 'POST',
          body: { notes },
        })

        return response.data
      }
      catch (error) {
        console.error('Error cancelling return:', error)
        throw error
      }
    },

    async completeReturn(returnId: string, payload: CompleteReturnRequest = {}) {
      try {
        const response = await $salesAPI<{ data: OrderReturn }>(`sales-returns/${returnId}/complete`, {
          method: 'POST',
          body: payload,
        })

        return response.data
      }
      catch (error) {
        console.error('Error completing return:', error)
        throw error
      }
    },

    async deleteReturn(returnId: string) {
      try {
        await $salesAPI(`sales-returns/${returnId}`, {
          method: 'DELETE',
        })
      }
      catch (error) {
        console.error('Error deleting return:', error)
        throw error
      }
    },
  },
})
