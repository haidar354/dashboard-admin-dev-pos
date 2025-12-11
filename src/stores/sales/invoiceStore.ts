import { defineStore } from 'pinia'
import InvoiceModel from '@/models/sales/InvoiceModel'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, PaginateData } from '@/types/api/response'
import type { Invoice } from '@/types/models/sales/invoice'
import { setPaginateData } from '@/utils/common'

export const useInvoiceStore = defineStore('invoiceStore', {
  state: () => ({
    paginateData: {} as PaginateData<Invoice>,
    data: [] as Invoice[],
    selectedInvoice: {} as Invoice,
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
    hasInvoices: state => state.paginateData.data?.length > 0,
    totalInvoices: state => state.paginateData.meta?.total || 0,
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

    baseQuery(params?: RequestQueryModel) {
      const requestQuery = { ...this.requestQuery, ...params }

      return InvoiceModel
        .when(requestQuery.fields, (query, value) => {
          if (value && Array.isArray(value))
            query.select(value)
        })
        .when(requestQuery.include, (query, value) => query.include(value || []))
        .when(requestQuery.orderBy, (query, value) => query.orderBy(value || []))
        .when(requestQuery.search, (query, value) => query.where('search', value || ''))
        .when(requestQuery.status, (query, value) => query.where('status', value))
        .when(requestQuery.dateFrom, (query, value) => query.where('invoiceDateFrom', value))
        .when(requestQuery.dateTo, (query, value) => query.where('invoiceDateTo', value))
    },

    async fetchPaginatedData(params: RequestQueryModel = {}) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<Invoice>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching invoices:', error)
        this.paginateData = {} as PaginateData<Invoice>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(invoiceId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const response = await this.baseQuery(params)
          .find(invoiceId)

        if (response.data)
          this.selectedInvoice = response.data
      }
      catch (error) {
        console.error('Error fetching invoice detail:', error)
        this.selectedInvoice = {} as Invoice
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async downloadPdf(item: Invoice) {
      this.isLoadingDownload = true
      try {
        const response: any = await $salesAPI(`invoices/${item.invoiceId}/pdf`, {
          method: 'GET',
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')

        link.href = url

        const filename = item.invoiceNumber
          ? `${item.invoiceNumber}.pdf`
          : `INV-${item.invoiceId}.pdf`

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

    async recordPayment(invoiceId: string, payload: any) {
      this.isLoadingUpdate = true
      try {
        await $salesAPI(`invoices/${invoiceId}/payments`, {
          method: 'POST',
          body: payload,
        })
        showToast('Pembayaran berhasil dicatat', 'success')
        await this.fetchDetail(invoiceId, { include: ['lines', 'order', 'order.customer', 'payments'] })

        return true
      }
      catch (error) {
        console.error('Error recording payment:', error)
        showToast('Gagal mencatat pembayaran', 'error')

        return false
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async voidInvoice(invoiceId: string, reason: string) {
      this.isLoadingUpdate = true
      try {
        await $salesAPI(`invoices/${invoiceId}/void`, {
          method: 'POST',
          body: { reason },
        })
        showToast('Invoice berhasil dibatalkan', 'success')
        await this.fetchDetail(invoiceId, { include: ['lines', 'order', 'order.customer', 'payments'] })

        return true
      }
      catch (error) {
        console.error('Error voiding invoice:', error)
        showToast('Gagal membatalkan invoice', 'error')

        return false
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async sendEmail(invoiceId: string, recipientEmail?: string, subject?: string, message?: string) {
      this.isLoadingUpdate = true
      try {
        await $salesAPI(`invoices/${invoiceId}/send-email`, {
          method: 'POST',
          body: {
            recipient_email: recipientEmail,
            subject,
            message,
          },
        })
        showToast('Invoice berhasil dikirim via email', 'success')
        await this.fetchDetail(invoiceId, { include: ['lines', 'order', 'order.customer', 'payments'] })

        return true
      }
      catch (error) {
        console.error('Error sending email:', error)
        showToast('Gagal mengirim email', 'error')

        return false
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async confirmInvoice(invoiceId: string) {
      this.isLoadingUpdate = true
      try {
        await $salesAPI(`invoices/${invoiceId}/confirm`, {
          method: 'POST',
        })
        showToast('Invoice berhasil dikonfirmasi', 'success')
        await this.fetchDetail(invoiceId, { include: ['lines', 'order', 'order.customer', 'payments'] })

        return true
      }
      catch (error) {
        console.error('Error confirming invoice:', error)
        showToast('Gagal mengkonfirmasi invoice', 'error')

        return false
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async deleteInvoice(invoiceId: string) {
      this.isLoadingDelete = true
      try {
        await $salesAPI(`invoices/${invoiceId}`, {
          method: 'DELETE',
        })
        showToast('Invoice berhasil dihapus', 'success')

        return true
      }
      catch (error) {
        console.error('Error deleting invoice:', error)
        showToast('Gagal menghapus invoice', 'error')

        return false
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    async updateInvoice(invoiceId: string, payload: any) {
      this.isLoadingUpdate = true
      try {
        await $salesAPI(`invoices/${invoiceId}`, {
          method: 'PUT',
          body: payload,
        })
        showToast('Invoice berhasil diperbarui', 'success')
        await this.fetchDetail(invoiceId, { include: ['lines', 'order', 'order.customer', 'payments'] })

        return true
      }
      catch (error) {
        console.error('Error updating invoice:', error)
        showToast('Gagal memperbarui invoice', 'error')

        return false
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async downloadDotMatrix(item: Invoice) {
      this.isLoadingDownload = true
      try {
        const response: any = await $salesAPI(`invoices/${item.invoiceId}/dot-matrix`, {
          method: 'GET',
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')

        link.href = url

        const filename = item.invoiceNumber
          ? `${item.invoiceNumber.replace(/\//g, '-')}.txt`
          : `INV-${item.invoiceId}.txt`

        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      catch (err) {
        console.error('Download failed', err)
        showToast('Gagal mengunduh format dot matrix', 'error')
      }
      finally {
        this.isLoadingDownload = false
      }
    },
  },
})
