import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { useConfirmDialogStore } from '../confirmDialogStore'
import SalesQuotationModel from '@/models/sales/SalesQuotation'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type {
  SalesQuotation,
  SalesQuotationForm,
  SalesQuotationFormErrors,
  SalesQuotationItemForm,
  SalesQuotationQueryParams,
} from '@/types/models/sales/quotation'

export const useSalesQuotationStore = defineStore('salesQuotationStore', {
  state: () => ({
    paginateData: {} as PaginateData<SalesQuotation>,
    data: [] as SalesQuotation[],
    selectedQuotation: {} as SalesQuotation,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingConvert: false as boolean,
    isLoadingDownload: false as boolean,
    isFilterVisible: false as boolean,
    form: {
      quotationNumber: '',
      quotationDate: dayjs().format('YYYY-MM-DD'),
      validUntil: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      outletId: undefined,
      customerId: undefined,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      taxAmount: 0,
      discountAmount: 0,
      notes: '',
      termsAndConditions: '',
      items: [] as SalesQuotationItemForm[],
    } as SalesQuotationForm,
    formErrors: {} as SalesQuotationFormErrors,
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
      status: undefined,
    },
  }),
  getters: {
    subtotal(): number {
      return this.form.items.reduce((sum, item) => {
        return sum + ((item.price * item.quantity) - item.discount)
      }, 0)
    },
    grandTotal(): number {
      return this.subtotal + this.form.taxAmount - this.form.discountAmount
    },
  },
  actions: {
    resetForm() {
      this.form = {
        quotationNumber: '',
        quotationDate: dayjs().format('YYYY-MM-DD'),
        validUntil: dayjs().add(30, 'day').format('YYYY-MM-DD'),
        outletId: undefined,
        customerId: undefined,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        taxAmount: 0,
        discountAmount: 0,
        notes: '',
        termsAndConditions: '',
        items: [] as SalesQuotationItemForm[],
      } as SalesQuotationForm
      this.formErrors = {} as SalesQuotationFormErrors
    },

    resetFilter() {
      this.requestQuery = {
        page: 1,
        perPage: 10,
        search: '',
        orderField: 'createdAt',
        orderDirection: 'desc',
      } as SalesQuotationQueryParams
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

      return SalesQuotationModel
        .when(requestQuery.fields, (query, value) => {
          if (value)
            query.select(value || [])
        })
        .when(requestQuery.include, (query, value) => query.include(value || []))
        .when(requestQuery.orderBy, (query, value) => query.orderBy(value || []))
        .when(requestQuery.search, (query, value) => query.where('search', value || ''))
        .when(requestQuery.status, (query, value) => query.where('status', value))
        .when(requestQuery.dateFrom, (query, value) => query.where('dateFrom', value))
        .when(requestQuery.dateTo, (query, value) => query.where('dateTo', value))
    },

    async fetchPaginatedData(params: RequestQueryModel = {}) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<SalesQuotation>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching quotations:', error)
        this.paginateData = {} as PaginateData<SalesQuotation>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(quotationId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const response = await this.baseQuery(params)
          .find(quotationId)

        if (response.data)
          this.selectedQuotation = response.data
      }
      catch (error) {
        console.error('Error fetching quotation detail:', error)
        this.selectedQuotation = {} as SalesQuotation
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async create(status: 'draft' | 'sent' = 'draft') {
      this.isLoadingCreate = true
      try {
        this.formErrors = {} as SalesQuotationFormErrors

        const payload = {
          ...this.form,
          status,
        }

        const response = await $salesAPI<ApiResponse<SalesQuotation>>('quotations', {
          method: 'POST',
          body: payload,
        })

        this.resetForm()
        showToast(status === 'sent' ? 'Penawaran (SQ) berhasil dikirim' : 'Penawaran (SQ) berhasil disimpan sebagai draft', 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as SalesQuotationFormErrors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(err.data?.message || 'Terjadi kesalahan', 'error')
        }
        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async update(quotationId: string) {
      this.isLoadingUpdate = true
      try {
        this.formErrors = {} as SalesQuotationFormErrors

        const response = await $salesAPI<ApiResponse<SalesQuotation>>(`quotations/${quotationId}`, {
          method: 'PUT',
          body: this.form,
        })

        showToast('Penawaran (SQ) berhasil diperbarui', 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as SalesQuotationFormErrors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(err.data?.message || 'Terjadi kesalahan', 'error')
        }
        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async updateStatus(quotationId: string, status: string) {
      this.isLoadingUpdate = true
      try {
        const quotation = this.selectedQuotation
        if (!quotation || quotation.quotationId !== quotationId)
          throw new Error('Data penawaran tidak valid')

        // Map items to match payload structure
        const items = quotation.items?.map((item: any) => ({
          itemSkuId: item.itemSkuId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          discount: item.discount || 0,
          notes: item.notes,
        })) || []

        const payload = {
          quotationNumber: quotation.quotationNumber,
          quotationDate: quotation.quotationDate,
          validUntil: quotation.validUntil,
          outletId: quotation.outlet?.outletId || quotation.outletId,
          customerId: quotation.customerId,
          customerName: quotation.customerName,
          customerEmail: quotation.customerEmail,
          customerPhone: quotation.customerPhone,
          customerAddress: quotation.customerAddress,
          taxAmount: quotation.taxAmount,
          discountAmount: quotation.discountAmount,
          notes: quotation.notes,
          termsAndConditions: quotation.termsAndConditions,
          status,
          items,
        }

        const response = await $salesAPI<ApiResponse<SalesQuotation>>(`quotations/${quotationId}`, {
          method: 'PUT',
          body: payload,
        })

        showToast('Status penawaran berhasil diperbarui', 'success')

        // Update local state
        this.selectedQuotation = response.data

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal memperbarui status', 'error')
        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async convertToSalesOrder(quotationId: string) {
      this.isLoadingConvert = true
      try {
        const response = await $salesAPI<ApiResponse<any>>(`quotations/${quotationId}/convert`, {
          method: 'POST',
        })

        showToast('Penawaran (SQ) berhasil dikonversi menjadi Pesanan Penjualan (SO)', 'success')

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal mengkonversi penawaran (SQ)', 'error')
        throw err
      }
      finally {
        this.isLoadingConvert = false
      }
    },

    async delete(quotationId: string) {
      this.isLoadingDelete = true
      try {
        return await $salesAPI<ApiResponse<SalesQuotation>>(`quotations/${quotationId}`, {
          method: 'DELETE',
        }).then(() => {
          showToast('Penawaran (SQ) berhasil dihapus', 'success')
        })
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Terjadi kesalahan', 'error')

        throw err
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    async onDeleteItem(item: SalesQuotation) {
      const isConfirmed = await useConfirmDialogStore().openDialog(
        `Penawaran (SQ) "${item.quotationNumber}"`,
      )

      if (isConfirmed) {
        return await this.delete(item.quotationId).then(() => {
          return true
        }).catch(() => {
          return false
        })
      }
      else { return false }
    },

    addItem() {
      this.form.items.push({
        itemSkuId: undefined,
        productName: '',
        productSku: '',
        quantity: 1,
        unit: '',
        price: 0,
        discount: 0,
        notes: '',
      })
    },

    removeItem(index: number) {
      this.form.items.splice(index, 1)
    },

    updateItem(index: number, updatedItem: any) {
      if (this.form.items[index])
        this.form.items[index] = { ...this.form.items[index], ...updatedItem }
    },

    async downloadPdf(item: SalesQuotation) {
      this.isLoadingDownload = true
      try {
        const response: any = await $salesAPI(`quotations/${item.quotationId}/pdf`, {
          method: 'GET',
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')

        link.href = url

        const filename = item.quotationNumber
          ? `${item.quotationNumber}.pdf`
          : `SQ-${item.quotationId}.pdf`

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
