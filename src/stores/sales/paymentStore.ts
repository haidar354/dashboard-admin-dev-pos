import { defineStore } from 'pinia'
import { $salesAPI } from '@/utils/api'
import { $salesAPIx } from '@/utils/api-axios'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type { OrderPayment } from '@/types/models/sales/order-payment'
import { setPaginateData } from '@/utils/common'

export const usePaymentStore = defineStore('paymentStore', {
  state: () => ({
    paginateData: {} as PaginateData<OrderPayment>,
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
      paymentMethod: undefined as string | undefined,
    },
  }),

  getters: {
    hasPayments: state => state.paginateData.data?.length > 0,
    totalPayments: state => state.paginateData.meta?.total || 0,
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
        paymentMethod: undefined,
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
          search: requestQuery.search,
          sortBy: requestQuery.orderField,
          sortOrder: requestQuery.orderDirection,
          include: 'invoice.order.salesOrder,createdByUser',
        }

        if (requestQuery.paymentMethod)
          queryParams.payment_method = requestQuery.paymentMethod
        if (requestQuery.dateFrom)
          queryParams.date_from = requestQuery.dateFrom
        if (requestQuery.dateTo)
          queryParams.date_to = requestQuery.dateTo

        const response = await $salesAPI<ApiPaginatedResponse<OrderPayment>>('payments', {
          params: queryParams,
        })

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching payments:', error)
        this.paginateData = {} as PaginateData<OrderPayment>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchPaymentDetail(paymentId: string, params?: any) {
      try {
        const response = await $salesAPI<ApiResponse<OrderPayment>>(`payments/${paymentId}`, {
          params: params || {},
        })

        return response.data
      }
      catch (error) {
        console.error('Error fetching payment detail:', error)
        throw error
      }
    },

    async voidPayment(paymentId: string, voidReason: string) {
      try {
        return await $salesAPI(`payments/${paymentId}/void`, {
          method: 'POST',
          body: {
            voidReason,
          },
        })
      }
      catch (error) {
        console.error('Error voiding payment:', error)
        throw error
      }
    },

    async refundPayment(paymentId: string, payload: { refundAmount: number; refundReason: string; referenceNumber?: string }) {
      try {
        return await $salesAPI(`payments/${paymentId}/refund`, {
          method: 'POST',
          body: {
            refundAmount: Math.floor(Number(payload.refundAmount)),
            refundReason: payload.refundReason,
            referenceNumber: payload.referenceNumber,
          },
        })
      }
      catch (error) {
        console.error('Error refunding payment:', error)
        throw error
      }
    },

    async downloadPDF(paymentId: string) {
      try {
        const response: any = await $salesAPIx(`payments/${paymentId}/download-pdf`, {
          method: 'GET',
          responseType: 'blob',
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')

        link.href = url
        link.setAttribute('download', `Payment-Receipt-${paymentId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
      catch (error) {
        console.error('Error downloading PDF:', error)
        throw error
      }
    },

    async printDotMatrix(paymentId: string) {
      try {
        const response: any = await $salesAPIx(`payments/${paymentId}/print-dot-matrix`, {
          method: 'GET',
          responseType: 'blob',
        })

        // Create download link for text file
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/plain' }))
        const link = document.createElement('a')

        link.href = url
        link.setAttribute('download', `payment-receipt-${paymentId}.txt`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
      catch (error) {
        console.error('Error printing dot matrix:', error)
        throw error
      }
    },
  },
})
