import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import BusinessUnitModel from '@/models/org/BusinessUnitModel'
import { useAuthStore } from '@/stores/authStore'
import type { RequestQuery } from '@/types/api/request'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type {
  BusinessUnit,
  BusinessUnitForm,
  BusinessUnitFormErrors,
  BusinessUnitQueryParams,
} from '@/types/models/business-unit'

export const useBusinessUnitStore = defineStore('businessUnitStore', {
  state: () => ({
    paginateData: {} as PaginateData<BusinessUnit>,
    selectedSidebarBusinessUnit: {
      businessUnitId: '',
      name: '',
    } as BusinessUnit | undefined,
    selectedBusinessUnit: {
    } as BusinessUnit,
    data: [] as BusinessUnit[],
    isLoadingFetchData: true as boolean,
    isLoadingFetchDetail: true as boolean,
    isLoadingSubmit: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'name',
      orderDirection: 'asc',
      include: ['outletsCount', 'province', 'city'],
    } as RequestQuery,
    form: {
      name: '',
      description: '',
      provinceCode: '',
      cityCode: '',
      isActive: false,
    } as BusinessUnitForm,
    formErrors: {} as BusinessUnitFormErrors,
    additionalFilter: {
      type: '',
      itemCategoryId: '',
    },
  }),
  getters: {
    getSelectedBusinessUnitId: state => {
      return state.selectedSidebarBusinessUnit?.businessUnitId || undefined
    },
  },
  actions: {
    resetForm() {
      this.form = {
        name: '',
        description: '',
        provinceCode: '',
        cityCode: '',
        isActive: false,
      } as BusinessUnitForm
      this.formErrors = {} as BusinessUnitFormErrors
    },
    async fetchPaginate(params?: BusinessUnitQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await BusinessUnitModel
          .when(requestQuery.fields, (query, value) => query.select(value))
          .when(requestQuery.include, (query, value) => query.include(value || []))
          .when(requestQuery.orderBy, (query, value) => query.orderBy(value || []))
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .paginate<ApiPaginatedResponse<BusinessUnit>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchAllData() {
      this.isLoadingFetchData = true
      await $orgAPI<ApiResponse<BusinessUnit[]>>('business-units/all', {
        method: 'GET',
        params: {
          per_page: 99999999,
          order_field: 'name',
          order_direction: 'asc',
        },
      })
        .then(response => {
          this.data = response.data || []
          this.isLoadingFetchData = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.isLoadingFetchData = false
        })
    },
    async fetchDetail(itemId: string, params?: BusinessUnitQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchDetail = true
      try {
        const response = await BusinessUnitModel
          .when(requestQuery.fields, (query, value) => query.select(value))
          .when(requestQuery.include, (query, value) => query.include(value || []))
          .when(requestQuery.orderBy, (query, value) => query.orderBy(value || []))
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .find<ApiResponse<BusinessUnit>>(itemId)

        this.selectedBusinessUnit = response.data
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async fetchDetailAndSetForm(itemId: string) {
      this.fetchDetail(itemId)
        .then(() => {
          this.form = {
            name: this.selectedBusinessUnit.name,
            description: this.selectedBusinessUnit.description || '',
            provinceCode: this.selectedBusinessUnit.provinceCode || '',
            cityCode: this.selectedBusinessUnit.cityCode || '',
            isActive: this.selectedBusinessUnit.isActive || false,
            logo: this.selectedBusinessUnit.logo || '',
          }
        })
        .catch(err => {
          throw err
        })
    },
    async create() {
      this.isLoadingSubmit = true
      await $orgAPI<ApiResponse<BusinessUnit>>('business-units', {
        method: 'POST',
        body: convertToFormBody(this.form),
      })
        .then(response => {
          if (response.data) {
            this.resetForm()
            this.selectedBusinessUnit = response.data
            useAuthStore().setBusinessUnitId(response.data.businessUnitId)
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length) {
            this.formErrors = err.data.errors as BusinessUnitFormErrors
            displayErrorMessages(err.data.errors)
          }
          else {
            showToast(err.data?.message, 'error')
          }
          throw err
        })
        .finally(() => {
          this.isLoadingSubmit = false
        })
    },
    async update() {
      this.isLoadingSubmit = true

      const { logo, ...rest } = this.form
      const formData = convertToFormBody(rest)

      formData.append('_method', 'PUT')
      if (logo instanceof File)
        formData.append('logo', logo)
      await $orgAPI<ApiResponse<BusinessUnit>>(
        `business-units/${this.selectedBusinessUnit.businessUnitId}`,
        {
          method: 'POST',
          body: formData,
        },
      )
        .then(response => {
          if (response.data)
            this.resetForm()
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length) {
            this.formErrors = err.data.errors as BusinessUnitFormErrors
            displayErrorMessages(err.data.errors)
          }
          else {
            showToast(err.data?.message, 'error')
          }
          throw err
        })
        .finally(() => {
          this.isLoadingSubmit = false
        })
    },
    async delete(itemId: string) {
      this.isLoadingDelete = true
      await $orgAPI<ApiResponse<BusinessUnit>>(`business-units/${itemId}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.data) {
            this.paginateData.data = this.paginateData.data.filter(
              item => item.businessUnitId !== itemId,
            )
            showToast('BusinessUnit berhasil dihapus', 'success')
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')
          throw err
        })
        .finally(() => {
          this.isLoadingDelete = false
        })
    },

    async export() {
      try {
        this.isLoadingExport = true

        const response = await $rootAPI<Blob>('/business-unit/business-units/export', {
          method: 'POST',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          body: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data BusinessUnit ${dayjs().format('DD-MM-YYYY')}.xlsx`

        downloadBlob(blob, filename)
      }
      catch (error) {
        this.isLoadingExport = false
        console.error('Error exporting data:', error)
        showToast('Error exporting data', 'error')
        throw error
      }
    },

    onSortBy(sortBy: { key: string; order: 'asc' | 'desc' }[]) {
      if (sortBy.length > 0) {
        this.requestQuery.orderField = sortBy[0]?.key
        this.requestQuery.orderDirection = sortBy[0]?.order
      }
      else {
        this.requestQuery.orderField = 'createdAt'
        this.requestQuery.orderDirection = 'desc'
      }
    },
    applyFilter() {
      this.requestQuery = {
        ...this.requestQuery,
        page: 1,
        ...this.additionalFilter,
      }
    },
    resetFilter() {
      this.additionalFilter = {
        type: '',
        itemCategoryId: '',
      }
      this.applyFilter()
    },
  },
  persist: true,

})
