import { defineStore } from 'pinia'
import { useConfirmDialogStore } from '../confirmDialogStore'
import CustomerModel from '@/models/sales/Customer'
import type { RequestQueryModel } from '@/types/api/request'
import type { ApiPaginatedResponse, ApiResponse, PaginateData } from '@/types/api/response'
import type { Customer, CustomerType } from '@/types/models/sales/customer'

export const useCustomerStore = defineStore('customerStore', {
  state: () => ({
    paginateData: {} as PaginateData<Customer>,
    data: [] as Customer[],
    selectedCustomer: {} as Customer,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isFilterVisible: false as boolean,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'createdAt',
      orderDirection: 'desc',
    } as RequestQueryModel,
    additionalFilter: {
      customerType: undefined as CustomerType | undefined,
      isMember: undefined as boolean | undefined,
      gender: undefined as string | undefined,
    },
  }),

  getters: {
    hasCustomers: state => state.paginateData.data?.length > 0,
    totalCustomers: state => state.paginateData.meta?.total || 0,
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
        customerType: undefined,
        isMember: undefined,
        gender: undefined,
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

      return CustomerModel
        .when(requestQuery.fields, (query: any, value: any) => {
          if (value)
            query.select(value || [])
        })
        .when(requestQuery.include, (query: any, value: any) => query.include(value || []))
        .when(requestQuery.orderBy, (query: any, value: any) => query.orderBy(value || []))
        .when(requestQuery.search, (query: any, value: any) => query.where('search', value || ''))
        .when(requestQuery.customerType, (query: any, value: any) => query.where('customerType', value))
        .when(requestQuery.isMember !== undefined, (query: any) => query.where('isMember', requestQuery.isMember))
        .when(requestQuery.gender, (query: any, value: any) => query.where('gender', value))
    },

    async fetchPaginatedData(params: RequestQueryModel = {}) {
      const requestQuery = {
        ...this.requestQuery,
        ...params,
        include: ['city', 'province'],
      }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<Customer>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching customers:', error)
        this.paginateData = {} as PaginateData<Customer>
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(customerId: string, params?: RequestQueryModel) {
      this.isLoadingFetchDetail = true
      try {
        const requestParams = {
          ...params,
          include: ['province', 'city', 'district', 'village'],
        }

        const response = await this.baseQuery(requestParams)
          .find(customerId)

        if (response.data)
          this.selectedCustomer = response.data
      }
      catch (error) {
        console.error('Error fetching customer detail:', error)
        this.selectedCustomer = {} as Customer
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async createCustomer(payload: any) {
      this.isLoadingCreate = true
      try {
        let body = payload

        // Always use FormData for consistency and file support
        const formData = new FormData()

        Object.keys(payload).forEach(key => {
          const value = payload[key]
          if (value !== undefined && value !== null) {
            if (typeof value === 'boolean')
              formData.append(key, value ? '1' : '0')
            else
              formData.append(key, value)
          }
        })
        body = formData

        const response = await $salesAPI<ApiResponse<Customer>>('customers', {
          method: 'POST',
          body,
        })

        showToast('Customer berhasil dibuat', 'success')

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal membuat customer', 'error')

        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async updateCustomer(customerId: string, payload: any) {
      this.isLoadingUpdate = true
      try {
        const formData = new FormData()

        Object.keys(payload).forEach(key => {
          const value = payload[key]
          if (value !== undefined && value !== null) {
            if (typeof value === 'boolean')
              formData.append(key, value ? '1' : '0')
            else
              formData.append(key, value)
          }
        })
        formData.append('_method', 'PUT')

        const response = await $salesAPI<ApiResponse<Customer>>(`customers/${customerId}`, {
          method: 'POST',
          body: formData,
        })

        showToast('Customer berhasil diupdate', 'success')

        // Update local data
        if (this.selectedCustomer?.customerId === customerId)
          this.selectedCustomer = response.data

        return response.data
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else
          showToast(err.data?.message || 'Gagal mengupdate customer', 'error')

        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async delete(customerId: string) {
      this.isLoadingDelete = true
      try {
        return await $salesAPI<ApiResponse<Customer>>(`customers/${customerId}`, {
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

    async onDeleteItem(item: Customer) {
      const isConfirmed = await useConfirmDialogStore().openDialog(
        `Customer "${item.name}"`,
      )

      if (isConfirmed) {
        return await this.delete(item.customerId).then(() => {
          return true
        }).catch(() => {
          return false
        })
      }
      else { return false }
    },

    async fetchCustomerDetail(customerId: string, params?: RequestQueryModel) {
      return this.fetchDetail(customerId, params)
    },

    clearSelectedCustomer() {
      this.selectedCustomer = {} as Customer
    },
  },
})
