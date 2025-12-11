import { defineStore } from 'pinia'
import { $salesAPI } from '@/utils/api'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, PaginateData } from '@/types/api/response'
import type { InvoiceRefund } from '@/types/models/sales/invoice'
import { setPaginateData } from '@/utils/common'

export const useRefundStore = defineStore('refundStore', {
  state: () => ({
    paginateData: {} as PaginateData<InvoiceRefund>,
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
      refundMethod: undefined as string | undefined,
    },
  }),

  getters: {
    hasRefunds: state => state.paginateData.data?.length > 0,
    totalRefunds: state => state.paginateData.meta?.total || 0,
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
        refundMethod: undefined,
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
          include: 'invoice,createdByUser',
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

        if (requestQuery.refundMethod)
          queryParams['filter[refundMethod]'] = requestQuery.refundMethod

        if (requestQuery.dateFrom)
          queryParams['filter[date_from]'] = requestQuery.dateFrom

        if (requestQuery.dateTo)
          queryParams['filter[date_to]'] = requestQuery.dateTo

        const response = await $salesAPI<ApiPaginatedResponse<InvoiceRefund>>('refunds', {
          params: queryParams,
        })

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching refunds:', error)
        this.paginateData = {} as PaginateData<InvoiceRefund>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async createRefund(payload: {
      paymentId: string
      refundDate: string
      amount: number
      refundMethod: string
      referenceNumber?: string
      reason: string
    }) {
      try {
        const response = await $salesAPI<any>('refunds', {
          method: 'POST',
          body: {
            paymentId: payload.paymentId,
            refundDate: payload.refundDate,
            amount: Math.floor(Number(payload.amount)),
            refundMethod: payload.refundMethod,
            referenceNumber: payload.referenceNumber,
            reason: payload.reason,
          },
        })

        return response.data
      }
      catch (error) {
        console.error('Error creating refund:', error)
        throw error
      }
    },
  },
})
