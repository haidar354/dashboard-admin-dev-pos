import { defineStore } from 'pinia'
import { useConfirmDialogStore } from '../confirmDialogStore'
import OrderModel from '@/models/sales/PosOrder'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type { Order } from '@/types/models/sales/order'
import type { SalesOrderStatus } from '@/types/models/sales/sales-order'

export const usePosOrderStore = defineStore('posOrderStore', {
  state: () => ({
    paginateData: {} as PaginateData<Order>,
    data: [] as Order[],
    selectedOrder: {} as Order,
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
    hasOrders: state => state.paginateData.data?.length > 0,
    totalOrders: state => state.paginateData.meta?.total || 0,
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

      return OrderModel
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
          .paginate<ApiPaginatedResponse<Order>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching sales orders:', error)
        this.paginateData = {} as PaginateData<Order>
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
          this.selectedOrder = response.data
      }
      catch (error) {
        console.error('Error fetching sales order detail:', error)
        this.selectedOrder = {} as Order
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async createOrder(payload: any) {
      this.isLoadingCreate = true
      try {
        const response = await $salesAPI<ApiResponse<Order>>('pos-orders', {
          method: 'POST',
          body: payload,
        })

        showToast('Pesanan berhasil dibuat', 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal membuat Pesanan', 'error')

        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async updateOrder(orderId: string, payload: any) {
      this.isLoadingUpdate = true
      try {
        const response = await $salesAPI<ApiResponse<Order>>(`pos-orders/${orderId}`, {
          method: 'PUT',
          body: payload,
        })

        showToast('Pesanan berhasil diupdate', 'success')

        // Update local data
        if (this.selectedOrder?.orderId === orderId)
          this.selectedOrder = response.data

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal mengupdate Pesanan', 'error')

        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async confirmOrder(orderId: string, notes?: string) {
      this.isLoadingConfirm = true
      try {
        const response = await $salesAPI<ApiResponse<Order>>(`pos-orders/${orderId}/confirm`, {
          method: 'POST',
          body: { notes },
        })

        showToast('Pesanan Penjualan (SO) berhasil dikonfirmasi', 'success')

        // Update local data
        if (this.selectedOrder?.orderId === orderId)
          this.selectedOrder = response.data

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

    async voidOrder(orderId: string) {
      this.isLoadingDelete = true
      try {
        const response = await $salesAPI<ApiResponse<Order>>(`pos-orders/${orderId}/void`, {
          method: 'POST',
        })

        showToast('Pesanan Penjualan (SO) berhasil dibatalkan (void)', 'success')

        // Update local data
        if (this.selectedOrder?.orderId === orderId)
          this.selectedOrder = response.data

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

    async closeOrder(orderId: string) {
      this.isLoadingUpdate = true
      try {
        const response = await $salesAPI<ApiResponse<Order>>(`pos-orders/${orderId}/close`, {
          method: 'POST',
        })

        showToast('Pesanan POS berhasil ditutup', 'success')

        if (this.selectedOrder?.orderId === orderId)
          this.selectedOrder = response.data

        return response.data
      }
      catch (err: any) {
        showToast(err.data?.message || 'Gagal menutup pesanan POS', 'error')
        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async delete(orderId: string) {
      this.isLoadingDelete = true
      try {
        return await $salesAPI<ApiResponse<Order>>(`pos-orders/${orderId}`, {
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

    async onDeleteItem(item: Order) {
      const isConfirmed = await useConfirmDialogStore().openDialog(
        `Pesanan Penjualan (SO) "${item.orderCode}"`,
      )

      if (isConfirmed) {
        return await this.delete(item.orderId).then(() => {
          return true
        }).catch(() => {
          return false
        })
      }
      else { return false }
    },

    async downloadPdf(item: Order) {
      this.isLoadingDownload = true
      try {
        const response: any = await $salesAPI(`pos-orders/${item.orderId}/pdf`, {
          method: 'GET',
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')

        link.href = url

        const filename = item.orderCode
          ? `${item.orderCode}.pdf`
          : `ORD-${item.orderId}.pdf`

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
    async fetchOrderDetail(salesOrderId: string, params?: RequestQueryModel) {
      return this.fetchDetail(salesOrderId, params)
    },

    clearSelectedOrder() {
      this.selectedOrder = {} as Order
    },
  },
})
