import { defineStore } from 'pinia'

import dayjs from 'dayjs'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import type { ApiResponse, PaginatedResponse } from '@/types/api/response'
import type { PurchaseRequestDetail, PurchaseRequestForm, PurchaseRequestFormErrors, PurchaseRequestList, PurchaseRequestQueryParams } from '@/types/models/purchase/purchase-request'

export const usePurchaseRequestStore = defineStore('purchaseRequestStore', {
  state: () => ({
    paginateData: {} as PaginatedResponse<PurchaseRequestList>,
    data: [] as PurchaseRequestList[],
    selectedPurchaseRequestList: {} as PurchaseRequestDetail,
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
      requestedAt: '',
      note: '',
      items: [],
    } as PurchaseRequestForm,
    formErrors: {} as PurchaseRequestFormErrors,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'requestedAt',
      orderDirection: 'desc',
    } as PurchaseRequestQueryParams,
    additionalFilter: {
      outletId: '',
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
        requestedAt: '',
        note: '',
        items: [],
      } as PurchaseRequestForm
      this.formErrors = {} as PurchaseRequestFormErrors
    },

    resetFilter() {
      this.requestQuery = {
        page: 1,
        perPage: 10,
        search: '',
        orderField: 'requestedAt',
        orderDirection: 'desc',
      } as PurchaseRequestQueryParams
      this.additionalFilter = {
        outletId: '',
        supplierId: '',
        status: undefined,
      }
    },

    applyFilter() {
      this.requestQuery.page = 1
      this.fetchData()
    },

    onSortBy(sortBy: { key: string; order: string }[]) {
      if (sortBy.length > 0) {
        this.requestQuery.orderField = sortBy[0].key
        this.requestQuery.orderDirection = sortBy[0].order as 'asc' | 'desc'
        this.fetchData()
      }
    },

    setFormData(purchaseRequest: PurchaseRequestDetail) {
      this.selectedPurchaseRequestList = purchaseRequest
      this.form = {
        outletId: purchaseRequest.outletId,
        supplierId: purchaseRequest.supplierId,
        requestedAt: purchaseRequest.requestedAt,
        note: purchaseRequest.note || '',
        items: purchaseRequest.purchase_request_items?.map(item => ({
          itemId: item.itemId,
          qty: item.qty,
          unitId: item.unitId,
          estimatedPrice: item.estimatedPrice,
        })) || [],
      }
    },

    async fetchData() {
      this.isLoadingFetchData = true
      try {
        const response = await $inventoryAPI<ApiResponse<PaginatedResponse<PurchaseRequestList>>>('purchase-requests', {
          method: 'GET',
          query: {
            ...this.requestQuery,
            ...this.additionalFilter,
          },
        })

        this.paginateData = response.data || {} as PaginatedResponse<PurchaseRequestList>
        this.data = this.paginateData.data || []
      }
      catch (error) {
        console.error('Error fetching purchase requests:', error)
        this.paginateData = {} as PaginatedResponse<PurchaseRequestList>
        this.data = []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchAllData() {
      this.isLoadingFetchData = true
      try {
        const response = await $inventoryAPI<ApiResponse<PaginatedResponse<PurchaseRequestList>>>('purchase-requests', {
          method: 'GET',
          query: {
            page: 1,
            perPage: 1000,
            search: this.requestQuery.search,
            orderField: this.requestQuery.orderField,
            orderDirection: this.requestQuery.orderDirection,
            ...this.additionalFilter,
          },
        })

        this.paginateData = response.data || {} as PaginatedResponse<PurchaseRequestList>
        this.data = this.paginateData.data || []
      }
      catch (error) {
        console.error('Error fetching all purchase requests:', error)
        this.paginateData = {} as PaginatedResponse<PurchaseRequestList>
        this.data = []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(purchaseRequestId: string) {
      this.isLoadingFetchDetail = true
      try {
        const response = await $inventoryAPI<ApiResponse<PurchaseRequestDetail>>(`purchase-requests/${purchaseRequestId}`)
        if (response.data)
          this.selectedPurchaseRequestList = response.data
      }
      catch (error) {
        console.error('Error fetching purchase request detail:', error)
        this.selectedPurchaseRequestList = {} as PurchaseRequestDetail
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async create() {
      this.isLoadingCreate = true
      try {
        this.formErrors = {} as PurchaseRequestFormErrors

        const response = await $inventoryAPI<ApiResponse<PurchaseRequestDetail>>('purchase-requests', {
          method: 'POST',
          body: this.form,
        })

        showToast('Purchase Request berhasil ditambahkan')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as PurchaseRequestFormErrors
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

    async update(purchaseRequestId: string) {
      this.isLoadingUpdate = true
      try {
        this.formErrors = {} as PurchaseRequestFormErrors

        const response = await $inventoryAPI<ApiResponse<PurchaseRequestDetail>>(`purchase-requests/${purchaseRequestId}`, {
          method: 'PUT',
          body: this.form,
        })

        showToast('Purchase Request berhasil diperbarui')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as PurchaseRequestFormErrors
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

    async delete(purchaseRequestId: string) {
      this.isLoadingDelete = true
      try {
        await $inventoryAPI<ApiResponse<PurchaseRequestDetail>>(`purchase-requests/${purchaseRequestId}`, {
          method: 'DELETE',
        })

        await this.fetchData()
        showToast('Purchase Request berhasil dihapus')
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

    async onDeleteItem(item: PurchaseRequestList) {
      useConfirmDialogStore().openDialog(
        `Purchase Request "${item.supplierName} - ${dayjs(item.requestedAt).format('DD/MM/YYYY')}"`,
      ).then(isConfirmed => {
        if (isConfirmed)
          this.delete(item.purchaseRequestId)
      })
    },

    async export() {
      try {
        this.isLoadingExport = true

        const response = await $inventoryAPI('/purchase-requests/export', {
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

        const filename = `Data Purchase Request ${dayjs().format('DD-MM-YYYY')}.xlsx`

        downloadBlob(blob, filename)
      }
      catch (error) {
        this.isLoadingExport = false
        console.error('Error exporting data:', error)
        showToast('Error exporting data', 'error')
        throw error
      }
    },

    async updateStatus(purchaseRequestId: string, status: 'draft' | 'approved' | 'rejected' | 'completed' | 'canceled') {
      try {
        await $inventoryAPI(`purchase-requests/${purchaseRequestId}/status`, {
          method: 'PATCH',
          body: { status },
        })

        await this.fetchData()
        showToast(`Status Purchase Request berhasil diubah menjadi ${status}`)
      }
      catch (error: any) {
        showToast(error.data?.message || 'Gagal mengubah status Purchase Request', 'error')
        throw error
      }
    },

    addItem() {
      this.form.items.push({
        itemId: '',
        qty: 0,
        unitId: '',
        estimatedPrice: 0,
      })
    },

    removeItem(index: number) {
      this.form.items.splice(index, 1)
    },

    updateItem(index: number, updatedItem: any) {
      if (this.form.items[index])
        this.form.items[index] = { ...this.form.items[index], ...updatedItem }
    },

    calculateTotalAmount(): number {
      return this.form.items.reduce((total, item) => {
        return total + (item.qty * (item.estimatedPrice || 0))
      }, 0)
    },
  },
})
