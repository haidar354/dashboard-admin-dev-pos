import { defineStore } from 'pinia'
import CreditNoteModel from '@/models/sales/CreditNoteModel'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type { CreditNote, CreditNoteStatus } from '@/types/models/sales/credit-note'
import { $salesAPI } from '@/utils/api'
import { setPaginateData } from '@/utils/common'

export const useCreditNoteStore = defineStore('creditNoteStore', {
  state: () => ({
    paginateData: {} as PaginateData<CreditNote>,
    selectedCreditNote: {} as CreditNote,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingDownload: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'createdAt',
      orderDirection: 'desc',
    } as RequestQueryModel,
    additionalFilter: {
      status: undefined as CreditNoteStatus | undefined,
    },
  }),

  getters: {
    hasCreditNotes: state => state.paginateData.data?.length > 0,
    totalCreditNotes: state => state.paginateData.meta?.total || 0,
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

      return CreditNoteModel
        .when(requestQuery.fields, (query: any, value: any) => {
          if (value)
            query.select(value || [])
        })
        .when(requestQuery.include, (query: any, value: any) => query.include(value || []))
        .when(requestQuery.orderBy, (query: any, value: any) => query.orderBy(value || []))
        .when(requestQuery.search, (query: any, value: any) => query.where('search', value || ''))
        .when(requestQuery.status, (query: any, value: any) => query.where('status', value))
    },

    async fetchPaginatedData(params: RequestQueryModel = {}) {
      const requestQuery = {
        ...this.requestQuery,
        ...params,
        include: ['customer'],
      }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<CreditNote>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching credit notes:', error)
        this.paginateData = {} as PaginateData<CreditNote>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(creditNoteId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const requestParams = {
          ...params,
          include: ['customer', 'invoice', 'createdBy'],
        }

        const response = await this.baseQuery(requestParams)
          .find(creditNoteId)

        if (response.data)
          this.selectedCreditNote = response.data
      }
      catch (error) {
        console.error('Error fetching credit note detail:', error)
        this.selectedCreditNote = {} as CreditNote
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async createCreditNote(payload: any) {
      this.isLoadingCreate = true
      try {
        const response = await $salesAPI<ApiResponse<CreditNote>>('credit-notes', {
          method: 'POST',
          body: payload,
        })

        showToast('Credit Note berhasil dibuat', 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal membuat credit note', 'error')

        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async updateCreditNote(creditNoteId: string, payload: any) {
      this.isLoadingUpdate = true
      try {
        const response = await $salesAPI<ApiResponse<CreditNote>>(`credit-notes/${creditNoteId}`, {
          method: 'PUT',
          body: payload,
        })

        showToast('Credit Note berhasil diupdate', 'success')

        if (this.selectedCreditNote?.creditNoteId === creditNoteId)
          this.selectedCreditNote = response.data

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal mengupdate credit note', 'error')

        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async deleteCreditNote(creditNoteId: string) {
      this.isLoadingDelete = true
      try {
        await $salesAPI<ApiResponse<CreditNote>>(`credit-notes/${creditNoteId}`, {
          method: 'DELETE',
        })

        showToast('Credit Note berhasil dihapus', 'success')

        return true
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal menghapus credit note', 'error')

        return false
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    async approveCreditNote(creditNoteId: string) {
      this.isLoadingUpdate = true
      try {
        const response = await $salesAPI<ApiResponse<CreditNote>>(`credit-notes/${creditNoteId}/approve`, {
          method: 'POST',
        })

        showToast('Credit Note berhasil diapprove', 'success')
        await this.fetchDetail(creditNoteId)

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal approve credit note', 'error')
        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async voidCreditNote(creditNoteId: string, reason: string) {
      this.isLoadingUpdate = true
      try {
        const response = await $salesAPI<ApiResponse<CreditNote>>(`credit-notes/${creditNoteId}/void`, {
          method: 'POST',
          body: { reason },
        })

        showToast('Credit Note berhasil dibatalkan', 'success')
        await this.fetchDetail(creditNoteId)

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal membatalkan credit note', 'error')
        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async downloadPdf(item: CreditNote) {
      this.isLoadingDownload = true
      try {
        const response: any = await $salesAPI(`credit-notes/${item.creditNoteId}/pdf`, {
          method: 'GET',
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')

        link.href = url

        const filename = item.creditNoteNumber
          ? `${item.creditNoteNumber}.pdf`
          : `CreditNote-${item.creditNoteId}.pdf`

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

    clearSelectedCreditNote() {
      this.selectedCreditNote = {} as CreditNote
    },
  },
})
