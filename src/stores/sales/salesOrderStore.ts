import { defineStore } from 'pinia'
import { useConfirmDialogStore } from '../confirmDialogStore'
import SalesOrderModel from '@/models/sales/SalesOrder'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type {
  SalesOrder,
  SalesOrderStatus,
} from '@/types/models/sales/sales-order'

export const useSalesOrderStore = defineStore('salesOrderStore', {
  state: () => ({
    paginateData: {} as PaginateData<SalesOrder>,
    data: [] as SalesOrder[],
    selectedSalesOrder: {} as SalesOrder,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingConfirm: false as boolean,
    isLoadingDownload: false as boolean,
    isFilterVisible: false as boolean,
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
      status: undefined as SalesOrderStatus | undefined,
    },
  }),

  getters: {
    hasSalesOrders: state => state.paginateData.data?.length > 0,
    totalSalesOrders: state => state.paginateData.meta?.total || 0,
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

      return SalesOrderModel
        .when(requestQuery.fields, (query: any, value: any) => {
          if (value)
            query.select(value || [])
        })
        .when(requestQuery.include, (query: any, value: any) => query.include(value || []))
        .when(requestQuery.orderBy, (query: any, value: any) => query.orderBy(value || []))
        .when(requestQuery.search, (query: any, value: any) => query.where('search', value || ''))
        .when(requestQuery.status, (query: any, value: any) => query.where('status', value))
        .when(requestQuery.dateFrom, (query: any, value: any) => query.where('date_from', value))
        .when(requestQuery.dateTo, (query: any, value: any) => query.where('date_to', value))
    },

    async fetchPaginatedData(params: RequestQueryModel = {}) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<SalesOrder>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)

        // Transform data to map nested order fields to top-level for easier UI access
        if (this.paginateData.data) {
          this.paginateData.data = this.paginateData.data.map((item: SalesOrder) => ({
            ...item,
            orderNumber: item.order?.orderCode || '',
            customerName: item.order?.customerName || '',
            customerPhone: item.order?.customerPhone || '',
            status: item.order?.status || '',
            paymentStatus: item.order?.paymentStatus || '',
            subtotal: item.order?.subtotal || 0,
            grandTotal: item.order?.grandTotal || 0,
            orderDate: item.order?.openedAt || item.createdAt,
          }))
        }
      }
      catch (error) {
        console.error('Error fetching sales orders:', error)
        this.paginateData = {} as PaginateData<SalesOrder>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(salesOrderId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const response = await this.baseQuery(params)
          .find(salesOrderId)

        if (response.data)
          this.selectedSalesOrder = response.data
      }
      catch (error) {
        console.error('Error fetching sales order detail:', error)
        this.selectedSalesOrder = {} as SalesOrder
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async createSalesOrder(payload: any) {
      this.isLoadingCreate = true
      try {
        const response = await $salesAPI<ApiResponse<SalesOrder>>('sales-orders', {
          method: 'POST',
          body: payload,
        })

        showToast('Sales Order berhasil dibuat', 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal membuat Sales Order', 'error')

        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async updateSalesOrder(salesOrderId: string, payload: any) {
      this.isLoadingUpdate = true
      try {
        const response = await $salesAPI<ApiResponse<SalesOrder>>(`sales-orders/${salesOrderId}`, {
          method: 'PUT',
          body: payload,
        })

        showToast('Sales Order berhasil diupdate', 'success')

        // Update local data
        if (this.selectedSalesOrder?.salesOrderId === salesOrderId)
          this.selectedSalesOrder = response.data

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal mengupdate Sales Order', 'error')

        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async confirmSalesOrder(salesOrderId: string, notes?: string) {
      this.isLoadingConfirm = true
      try {
        const response = await $salesAPI<ApiResponse<SalesOrder>>(`sales-orders/${salesOrderId}/confirm`, {
          method: 'POST',
          body: { notes },
        })

        showToast('Pesanan Penjualan (SO) berhasil dikonfirmasi', 'success')

        // Update local data
        if (this.selectedSalesOrder?.salesOrderId === salesOrderId)
          this.selectedSalesOrder = response.data

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal mengkonfirmasi pesanan penjualan (SO)', 'error')
        throw err
      }
      finally {
        this.isLoadingConfirm = false
      }
    },

    async voidSalesOrder(salesOrderId: string) {
      this.isLoadingDelete = true
      try {
        const response = await $salesAPI<ApiResponse<SalesOrder>>(`sales-orders/${salesOrderId}/void`, {
          method: 'POST',
        })

        showToast('Pesanan Penjualan (SO) berhasil dibatalkan (void)', 'success')

        // Update local data
        if (this.selectedSalesOrder?.salesOrderId === salesOrderId)
          this.selectedSalesOrder = response.data

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal membatalkan pesanan penjualan (SO)', 'error')
        throw err
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    async delete(salesOrderId: string) {
      this.isLoadingDelete = true
      try {
        return await $salesAPI<ApiResponse<SalesOrder>>(`sales-orders/${salesOrderId}`, {
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

    async onDeleteItem(item: SalesOrder) {
      const isConfirmed = await useConfirmDialogStore().openDialog(
        `Pesanan Penjualan (SO) "${item.orderNumber}"`,
      )

      if (isConfirmed) {
        return await this.delete(item.salesOrderId).then(() => {
          return true
        }).catch(() => {
          return false
        })
      }
      else { return false }
    },

    async downloadPdf(item: SalesOrder) {
      this.isLoadingDownload = true
      try {
        const response: any = await $salesAPI(`orders/${item.orderId}/pdf`, {
          method: 'GET',
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')

        link.href = url

        const filename = item.orderNumber
          ? `${item.orderNumber}.pdf`
          : `SO-${item.salesOrderId}.pdf`

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

    // Alias for fetchDetail for better clarity
    async fetchSalesOrderDetail(salesOrderId: string, params?: RequestQueryModel) {
      return this.fetchDetail(salesOrderId, params)
    },

    clearSelectedOrder() {
      this.selectedSalesOrder = {} as SalesOrder
    },
  },
})
