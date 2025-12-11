import { defineStore } from 'pinia'
import { useConfirmDialogStore } from '../confirmDialogStore'
import SalesChannelModel from '@/models/sales/SalesChannelModel'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type { SalesChannel } from '@/types/models/sales/salesChannel'
import { $salesAPI } from '@/utils/api'
import { setPaginateData } from '@/utils/common'

export const useSalesChannelStore = defineStore('salesChannel', {
  state: () => ({
    paginateData: {} as PaginateData<SalesChannel>,
    data: [] as SalesChannel[],
    selectedSalesChannel: {} as SalesChannel,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
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
      type: '' as string,
      vendor: '' as string,
    },
  }),

  getters: {
    hasChannels: state => state.paginateData.data?.length > 0,
    totalChannels: state => state.paginateData.meta?.total || 0,
  },

  actions: {
    baseQuery(params?: RequestQueryModel) {
      const requestQuery = params || this.requestQuery

      return SalesChannelModel
        .when(requestQuery.fields, (query: any, value: any) => {
          if (value)
            query.select(value || [])
        })
        .when(requestQuery.include, (query: any, value: any) => query.include(value || []))
        .when(requestQuery.orderBy, (query: any, value: any) => query.orderBy(value || []))
        .when(requestQuery.search, (query: any, value: any) => query.where('search', value || ''))
        .when((requestQuery as any).type, (query: any, value: any) => query.where('type', value))
        .when((requestQuery as any).vendor, (query: any, value: any) => query.where('vendor', value))
    },

    resetFilter() {
      this.requestQuery = {
        page: 1,
        perPage: 10,
        search: '',
        orderField: 'createdAt',
        orderDirection: 'desc',
      } as RequestQueryModel

      this.additionalFilter = {
        type: '',
        vendor: '',
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
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<SalesChannel>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching sales channels:', error)
        this.paginateData = {} as PaginateData<SalesChannel>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchAllData(params: RequestQueryModel = {}) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await $salesAPI<ApiResponse<SalesChannel[]>>('sales-channels', { params: requestQuery })

        this.data = response.data || []
      }
      catch (error) {
        console.error('Error fetching all sales channels:', error)
        this.data = []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(id: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const response = await this.baseQuery(params).find(id)

        if (response.data)
          this.selectedSalesChannel = response.data
      }
      catch (error) {
        console.error('Error fetching sales channel detail:', error)
        this.selectedSalesChannel = {} as SalesChannel
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async createChannel(payload: Omit<SalesChannel, 'salesChannelId'>) {
      this.isLoadingCreate = true
      try {
        const response = await $salesAPI<ApiResponse<SalesChannel>>('sales-channels', {
          method: 'POST',
          body: payload,
        })

        showToast('Sales channel berhasil dibuat', 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal membuat sales channel', 'error')

        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async updateChannel(id: string, payload: Partial<SalesChannel>) {
      this.isLoadingUpdate = true
      try {
        const response = await $salesAPI<ApiResponse<SalesChannel>>(`sales-channels/${id}`, {
          method: 'PUT',
          body: payload,
        })

        showToast('Sales channel berhasil diupdate', 'success')

        if (this.selectedSalesChannel?.salesChannelId === id)
          this.selectedSalesChannel = response.data

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal mengupdate sales channel', 'error')

        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async deleteChannel(id: string) {
      this.isLoadingDelete = true
      try {
        const response = await $salesAPI<ApiResponse<SalesChannel>>(`sales-channels/${id}`, {
          method: 'DELETE',
        })

        showToast('Sales channel berhasil dihapus', 'success')

        return response.data
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

    async onDeleteItem(item: SalesChannel) {
      const isConfirmed = await useConfirmDialogStore().openDialog(
        `Sales Channel \"${item.name}\"`,
      )

      if (isConfirmed)
        return await this.deleteChannel(item.salesChannelId || '').then(() => true).catch(() => false)

      return false
    },
  },
})
