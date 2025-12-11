import { defineStore } from 'pinia'

import dayjs from 'dayjs'
import PurchaseDirectModel from '@/models/purchase/PurchaseDirect'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type { PurchaseDirect, PurchaseDirectForm, PurchaseDirectFormErrors, PurchaseDirectItemForm, PurchaseDirectQueryParams } from '@/types/models/purchase/purchase-direct'

export const usePurchaseDirectStore = defineStore('purchaseDirectStore', {
  state: () => ({
    paginateData: {} as PaginateData<PurchaseDirect>,
    data: [] as PurchaseDirect[],
    selectedPurchaseDirectList: {} as PurchaseDirect,
    selectedPurchaseDirectDetail: {} as PurchaseDirect,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    form: {
      outletId: '',
      supplierId: '',
      purchaseRequestId: undefined,
      purchasedAt: '',
      note: '',
      document: null,
      status: 'DRAFT',
      items: [] as PurchaseDirectItemForm[],
    } as PurchaseDirectForm,
    formErrors: {} as PurchaseDirectFormErrors,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'purchasedAt',
      orderDirection: 'desc',
    } as RequestQueryModel,
    additionalFilter: {
      outletId: '',
      purchaseRequestId: '',
      supplierId: '',
      status: undefined,
    },
  }),
  getters: {
    // Add any computed properties if needed
  },
  actions: {
    resetForm() {
      this.form = {
        outletId: '',
        supplierId: '',
        status: 'DRAFT',
        purchaseRequestId: undefined,
        purchasedAt: '',
        note: '',
        document: null,

        items: [] as PurchaseDirectItemForm[],
      } as PurchaseDirectForm
      this.formErrors = {} as PurchaseDirectFormErrors
    },

    resetFilter() {
      this.requestQuery = {
        page: 1,
        perPage: 10,
        search: '',
        orderField: 'purchasedAt',
        orderDirection: 'desc',
      } as PurchaseDirectQueryParams
      this.additionalFilter = {
        outletId: '',
        purchaseRequestId: '',
        supplierId: '',
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

    setFormData(purchaseDirect: PurchaseDirect) {
      this.selectedPurchaseDirectList = purchaseDirect
      this.form = {
        status: purchaseDirect.status,
        outletId: purchaseDirect.outletId,
        supplierId: purchaseDirect.supplierId || '',
        purchaseRequisitionId: purchaseDirect.purchaseRequisitionId || undefined,
        purchasedAt: purchaseDirect.purchasedAt,
        note: purchaseDirect.note || '',
        documentCode: purchaseDirect.documentCode || null,
        invoiceNumber: purchaseDirect.invoiceNumber || null,
        documentAttachment: null,
        items: purchaseDirect.items?.map(item => ({
          itemSkuId: item.itemSkuId,
          itemUnitId: item.itemUnitId,
          itemName: item.itemName || '',
          itemCode: item.sku?.code || '',
          qty: item.qty,
          unitPrice: item.unitPrice,
          discount: item.discount || undefined,
          tax: item.tax || undefined,
          lineTotal: item.lineTotal || undefined,
          note: item.note || undefined,
        })) || [],
      }
    },

    baseQuery(params?: RequestQueryModel) {
      const requestQuery = { ...this.requestQuery, ...params }

      return PurchaseDirectModel
        .when(requestQuery.fields, (query, value) => {
          if (value)
            query.select(value || [])
        })
        .when(requestQuery.include, (query, value) => query.include(value || []))
        .when(requestQuery.orderBy, (query, value) => query.orderBy(value || []))
        .when(requestQuery.search, (query, value) => query.where('search', value || ''))
        .when(requestQuery.outletId, (query, value) => query.where('outletId', value))
        .when(requestQuery.outletIds, (query, value) => query.whereIn('outletId', value))
        .when(requestQuery.status, (query, value) => query.where('status', value))
        .when(requestQuery.supplierId, (query, value) => query.where('supplierId', value))
    },

    async fetchPaginatedData(params: RequestQueryModel = {}) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<PurchaseDirect>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching purchase directs:', error)
        this.paginateData = {} as PaginateData<PurchaseDirect>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchAllData() {
      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery()
          .paginate<ApiPaginatedResponse<PurchaseDirect>>(this.requestQuery.page || 1, 99999999)

        this.data = response.data || []
      }
      catch (error) {
        console.error('Error fetching all purchase directs:', error)
        this.data = []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(purchaseDirectId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const response = await this.baseQuery(params)
          .find(purchaseDirectId)

        if (response.data)
          this.selectedPurchaseDirectList = response.data
      }
      catch (error) {
        console.error('Error fetching purchase direct detail:', error)
        this.selectedPurchaseDirectList = {} as PurchaseDirect
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async create(status: 'DRAFT' | 'COMPLETED') {
      this.isLoadingCreate = true
      try {
        this.formErrors = {} as PurchaseDirectFormErrors

        // Create FormData for file upload if document exists
        const { documentAttachment, items, ...otherField } = this.form

        const body = convertToFormBody(otherField)

        body.append('status', status.toString())
        if (documentAttachment instanceof File)
          body.append('documentAttachment', documentAttachment)

        if (items?.length) {
          items.forEach((item, index) => {
            body.append(`items[${index}][itemSkuId]`, item.itemSkuId || '')
            body.append(`items[${index}][itemUnitId]`, item.itemUnitId || '')
            body.append(`items[${index}][itemName]`, item.itemName || '')
            body.append(`items[${index}][itemCode]`, item.itemCode || '')
            body.append(`items[${index}][qty]`, item.qty?.toString() || '')
            body.append(`items[${index}][unitPrice]`, item.unitPrice?.toString() || '')
            body.append(`items[${index}][discount]`, item.discount?.toString() || '')
            body.append(`items[${index}][tax]`, item.tax?.toString() || '')
          })
        }

        const response = await $purchaseAPI<ApiResponse<PurchaseDirect>>('purchase-directs', {
          method: 'POST',
          body,
        })

        this.resetForm()

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as PurchaseDirectFormErrors
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

    async update(purchaseDirectId: string) {
      this.isLoadingUpdate = true
      try {
        this.formErrors = {} as PurchaseDirectFormErrors

        // Create FormData for file upload if document exists
        let body: any = this.form
        if (this.form.documentAttachment) {
          const formData = new FormData()

          formData.append('outletId', this.form.outletId || '')
          formData.append('supplierId', this.form.supplierId || '')
          if (this.form.purchaseRequisitionId)
            formData.append('purchaseRequisitionId', this.form.purchaseRequisitionId)

          formData.append('purchasedAt', this.form.purchasedAt || '')
          if (this.form.note)
            formData.append('note', this.form.note)

          formData.append('documentAttachment', this.form.documentAttachment)
          formData.append('items', JSON.stringify(this.form.items))
          body = formData
        }

        const response = await $purchaseAPI<ApiResponse<PurchaseDirect>>(`purchase-directs/${purchaseDirectId}`, {
          method: 'PUT',
          body,
        })

        showToast('Pembelian Langsung berhasil diperbarui', 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as PurchaseDirectFormErrors
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

    async updateStatus(purchaseDirectId: string, status: 'CANCELLED' | 'COMPLETED') {
      this.isLoadingUpdate = true
      try {
        const response = await $purchaseAPI<ApiResponse<PurchaseDirect>>(`purchase-directs/${purchaseDirectId}/status`, {
          method: 'PATCH',
          body: {
            status,
          },
        })

        showToast(`Status Pembelian Langsung berhasil diubah menjadi ${status}`, 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as PurchaseDirectFormErrors
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

    async setCompleted(purchaseDirectId: string) {
      return await this.updateStatus(purchaseDirectId, 'COMPLETED')
    },

    async setCanceled(purchaseDirectId: string) {
      return await this.updateStatus(purchaseDirectId, 'CANCELLED')
    },

    async delete(purchaseDirectId: string) {
      this.isLoadingDelete = true
      try {
        return await $purchaseAPI<ApiResponse<PurchaseDirect>>(`purchase-directs/${purchaseDirectId}`, {
          method: 'DELETE',
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

    async onDeleteItem(item: PurchaseDirect) {
      const isConfirmed = await useConfirmDialogStore().openDialog(
        `Pembelian Langsung "${item.documentCode} - ${dayjs(item.purchasedAt).format('DD/MM/YYYY')}"`,
      )

      if (isConfirmed) {
        return await this.delete(item.purchaseDirectId).then(() => {
          return true
        }).catch(() => {
          return false
        })
      }
      else { return false }
    },

    async export() {
      try {
        this.isLoadingExport = true

        const response = await $purchaseAPI<Blob>('/purchase-directs/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: {
            ...this.requestQuery,
            ...this.additionalFilter,
          },
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Pembelian Langsung ${dayjs().format('DD-MM-YYYY')}.xlsx`

        downloadBlob(blob, filename)
      }
      catch (error) {
        this.isLoadingExport = false
        console.error('Error exporting data:', error)
        showToast('Error exporting data', 'error')
        throw error
      }
    },

    addItem() {
      this.form.items?.push({
        itemSkuId: '',
        itemUnitId: '',
        itemName: '',
        itemCode: '',
        qty: 0,
        unitPrice: 0,
        discount: 0,
        tax: 0,
        lineTotal: 0,
        note: '',
      })
    },

    removeItem(index: number) {
      this.form.items?.splice(index, 1)
    },

    updateItem(index: number, updatedItem: any) {
      if (this.form.items?.[index])
        this.form.items[index] = { ...this.form.items[index], ...updatedItem }
    },

    calculateTotalAmount(): number {
      return this.form.items?.reduce((total, item) => {
        return total + ((item.qty || 0) * (item.unitPrice || 0))
      }, 0) || 0
    },
  },
})
