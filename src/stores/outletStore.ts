import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import OutletModel from '@/models/org/OutletModel'
import type { RequestQueryModel } from '@/types/api/request'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type {
  Outlet,
  OutletForm,
  OutletFormErrors,
} from '@/types/models/outlet'

export const useOutletStore = defineStore('outletStore', {
  state: () => ({
    paginateData: {} as PaginateData<Outlet>,
    selectedOutlet: {
    } as Outlet,
    data: [] as Outlet[],
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
      orderBy: [],
      include: [],
      fields: [],
    } as RequestQueryModel,
    form: {
      name: '',
      address: '',
      phone: '',
      provinceCode: '',
      cityCode: '',
      districtCode: '',
      villageCode: '',
      postalCode: '',
      latitude: '',
      longitude: '',
      isCentral: false,
    } as OutletForm,
    formErrors: {} as OutletFormErrors,
    additionalFilter: {
      type: '',
      itemCategoryId: '',
    },
  }),
  actions: {
    resetForm() {
      this.form = {
        name: '',
        address: '',
        phone: '',
        provinceCode: '',
        cityCode: '',
        districtCode: '',
        villageCode: '',
        postalCode: '',
        latitude: '',
        longitude: '',
        isCentral: false,
      } as OutletForm
      this.formErrors = {} as OutletFormErrors
    },
    baseQuery(params?: RequestQueryModel) {
      return OutletModel
        .when(params?.fields || this.requestQuery.fields, (query, value) => query.select(value || []))
        .when(params?.include || this.requestQuery.include, (query, value) => query.include(value || []))
        .when(params?.orderBy || this.requestQuery.orderBy, (query, value) => query.orderBy(value || []))
        .when(params?.search || this.requestQuery.search, (query, value) => query.where('search', value || ''))
    },
    async fetchPaginate(params?: RequestQueryModel) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<Outlet>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchAllData(params?: RequestQueryModel) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .custom('/outlets/all')
          .get<ApiResponse<Outlet[]>>()

        this.data = response.data
      }
      catch (error) {
        console.error('Error fetching all data:', error)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchDetail(itemId: string, params?: RequestQueryModel) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchDetail = true
      try {
        const response = await this.baseQuery(requestQuery)
          .custom('/outlets/all')
          .find<ApiResponse<Outlet>>(itemId)

        this.selectedOutlet = response.data
      }
      catch (error) {
        console.error('Error fetching all data:', error)
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async fetchDetailAndSetForm(itemId: string) {
      this.fetchDetail(itemId)
        .then(() => {
          this.form = {
            logo: this.selectedOutlet.logo || '',
            name: this.selectedOutlet.name,
            address: this.selectedOutlet.address,
            phone: this.selectedOutlet.phone || '',
            provinceCode: this.selectedOutlet.provinceCode || '',
            cityCode: this.selectedOutlet.cityCode || '',
            districtCode: this.selectedOutlet.districtCode || '',
            villageCode: this.selectedOutlet.villageCode || '',
            postalCode: this.selectedOutlet.postalCode || '',
            latitude: (this.selectedOutlet.latitude as any instanceof Number)
              ? this.selectedOutlet.latitude
              : this.selectedOutlet.latitude?.toString() || '',
            longitude: (this.selectedOutlet.longitude as any instanceof Number)
              ? this.selectedOutlet.longitude
              : this.selectedOutlet.longitude?.toString() || '',
            isCentral: this.selectedOutlet.isCentral,
          }
        })
        .catch(err => {
          throw err
        })
    },
    async create() {
      this.isLoadingSubmit = true

      const { logo, ...restForm } = this.form
      const formData = convertToFormBody(restForm)

      if (logo)
        formData.append('logo', logo)

      await $orgAPI<ApiResponse<Outlet>>('outlets', {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (response.data) {
            showToast('Outlet berhasil ditambahkan', 'success')
            this.resetForm()
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length) {
            this.formErrors = err.data.errors as OutletFormErrors
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
      await $orgAPI<ApiResponse<Outlet>>(
        `outlets/${this.selectedOutlet.outletId}`,
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
            this.formErrors = err.data.errors as OutletFormErrors
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
      await $orgAPI<ApiResponse<Outlet>>(`outlets/${itemId}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.data) {
            this.paginateData.data = this.paginateData.data.filter(
              item => item.outletId !== itemId,
            )
            showToast('Outlet berhasil dihapus', 'success')
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

        const response = await $orgAPI<Blob>('/outlets/export', {
          method: 'POST',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          body: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Outlet ${dayjs().format('DD-MM-YYYY')}.xlsx`

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
})
