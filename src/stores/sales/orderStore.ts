import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import OrderModel from '@/models/sales/OrderModel'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type { Order } from '@/types/models/sales/order'
import type { OrderQueryParams } from '@/types/models/sales/order-resource-spec'

const confirmDialog = useConfirmDialogStore()
type Mode = 'create' | 'show' | 'edit'

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    paginateData: {} as PaginateData<Order>,
    data: [] as Order[],
    selectedOrder: {} as Order,
    selectedOrderDetail: {} as Order,
    isLoadingFetchData: false,
    isLoadingDelete: false,
    isLoadingExport: false,
    isFilterVisible: false,

    requestQuery: {
      outletId: '',
      search: '',
      status: '',
      page: 1,
      perPage: 10,
      include: [],
      orderBy: ['-createdAt'],
    } as OrderQueryParams,

    dialog: {
      form: {} as Partial<Order>,
      isVisible: false,
      mode: 'show' as Mode,
      title: 'Detail Transaksi',
      isLoadingFetchDetail: false,
      isLoadingSubmit: false,
    },

    detailDialog: {
      isVisible: false,
      title: 'Rincian Transaksi',
    },
  }),

  actions: {
    baseQuery(params?: OrderQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      return OrderModel
        .when(requestQuery.fields, (query, value) => value && query.select(value))
        .when(requestQuery.include, (query, value) => value && query.include(value))
        .when(requestQuery.orderBy, (query, value) => value && query.orderBy(value))
        .when(requestQuery.search, (query, value) => value && query.where('search', value))
        .when(requestQuery.status, (query, value) => value && query.where('status', value))
        .when(requestQuery.orderType, (query, value) => value && query.where('orderType', value))
        .when(requestQuery.paymentStatus, (query, value) => value && query.where('paymentStatus', value))
        .when(requestQuery.fulfillmentStatus, (query, value) => value && query.where('fulfillmentStatus', value))
    },

    /** 🔹 Fetch Paginated Orders */
    async fetchPaginate(params?: OrderQueryParams) {
      this.isLoadingFetchData = true
      try {
        const query = { ...this.requestQuery, ...params }

        const response = await this.baseQuery(query)
          .paginate<ApiPaginatedResponse<Order>>(query.page || 1, query.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    /** 🔹 Fetch All Orders (no pagination, e.g. export) */
    async fetchAllData(params?: OrderQueryParams) {
      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(params)
          .custom('/orders/all')
          .get<ApiResponse<Order[]>>()

        this.data = response.data
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    /** 🔹 Fetch Single Order Detail */
    async fetchDetail(orderId: string, params: OrderQueryParams = {}) {
      this.dialog.isLoadingFetchDetail = true
      try {
        const response = await this.baseQuery(params)
          .find<ApiResponse<Order>>(orderId)

        this.selectedOrderDetail = response.data
        this.dialog.form = response.data
      }
      catch (error: any) {
        if (Object.keys(error?.data?.errors || {}).length)
          displayErrorMessages(error.data.errors)
        else showToast(error.data?.message || 'Gagal memuat detail order', 'error')
      }
      finally {
        this.dialog.isLoadingFetchDetail = false
      }
    },

    /** 🔹 Delete an order */
    async delete(orderId: string) {
      this.isLoadingDelete = true
      try {
        await $salesAPI<ApiResponse<null>>(`orders/${orderId}`, {
          method: 'DELETE',
        })

        if (this.paginateData?.data)
          this.paginateData.data = this.paginateData.data.filter(o => o.orderId !== orderId)

        showToast('Order berhasil dihapus', 'success')
      }
      catch (err: any) {
        if (Object.keys(err.data?.errors || {}).length)
          displayErrorMessages(err.data.errors)
        else showToast(err.data?.message || 'Gagal menghapus order', 'error')
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    /** 🔹 Confirm + Delete */
    async onDeleteItem(order: Order) {
      confirmDialog
        .openDialog(`Hapus transaksi "${order.orderCode}"?`)
        .then(isConfirmed => {
          if (isConfirmed)
            this.delete(order.orderId)
        })
    },

    /** 🔹 Export Orders (Excel) */
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $salesAPI<Blob>('orders/export', {
          method: 'GET',
          responseType: 'blob',
          headers: { Accept: 'application/octet-stream' },
          query: this.requestQuery,
        })

        const blob = response instanceof Blob ? response : new Blob([response])
        const filename = `Data Transaksi ${dayjs().format('DD-MM-YYYY')}.xlsx`

        downloadBlob(blob, filename)
      }
      catch (error) {
        console.error('Error exporting orders:', error)
        showToast('Gagal export data transaksi', 'error')
      }
      finally {
        this.isLoadingExport = false
      }
    },

    /** 🔹 Sort / Filter */
    onSortBy(sortBy: { key: string; order: 'asc' | 'desc' }[]) {
      if (sortBy.length > 0) {
        this.requestQuery.orderBy = [
          `${sortBy[0].order === 'desc' ? '-' : ''}${sortBy[0].key}`,
        ]
      }
      else {
        this.requestQuery.orderBy = ['-createdAt']
      }
    },

    async showDetailDialog(orderId: string) {
      await this.fetchDetail(orderId, {
        include: [
          'outlet', 'salesChannel', 'lines.sku', 'lines.childModifiers.modifierOption.group', 'payments.receivedByUser', 'paidByUser',
        ],
      })
      this.detailDialog.isVisible = true
    },
  },
})
