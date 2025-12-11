import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import CompanyModel from '@/models/org/CompanyModel'
import type { RequestQuery } from '@/types/api/request'
import type {
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type {
  Company,
  CompanyForm,
  CompanyFormErrors,
  CompanyQueryParams,
} from '@/types/models/company'

export const useCompanyStore = defineStore('companyStore', {
  state: () => ({
    paginateData: {} as PaginateData<Company>,
    selectedCompany: {
    } as Company,
    data: [] as Company[],
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
      include: ['businessUnitsCount', 'outletsCount', 'province', 'city'],
    } as RequestQuery,
    form: {
      name: '',
      description: '',
      provinceCode: '',
      cityCode: '',
      isActive: false,
    } as CompanyForm,
    formErrors: {} as CompanyFormErrors,
    additionalFilter: {
      type: '',
      itemCategoryId: '',
    },
  }),
  actions: {
    resetForm() {
      this.form = {
        name: '',
        description: '',
        provinceCode: '',
        cityCode: '',
        isActive: false,
      } as CompanyForm
      this.formErrors = {} as CompanyFormErrors
    },
    async fetchDetail(params?: CompanyQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchDetail = true
      try {
        const response = await CompanyModel
          .custom('my-company')
          .when(requestQuery.fields, (query, value) => query.select(value))
          .when(requestQuery.include, (query, value) => query.include(value || []))
          .when(requestQuery.orderBy, (query, value) => query.orderBy(value || []))
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .first<Company>()

        this.selectedCompany = response
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async fetchDetailAndSetForm() {
      await this.fetchDetail()
        .then(() => {
          this.form = {
            name: this.selectedCompany.name,
            description: this.selectedCompany.description || '',
            provinceCode: this.selectedCompany.provinceCode || '',
            cityCode: this.selectedCompany.cityCode || '',
            isActive: this.selectedCompany.isActive || false,
            logo: this.selectedCompany.logo || '',
          }
        })
        .catch(err => {
          throw err
        })
    },
    async create() {
      this.isLoadingSubmit = true
      await $orgAPI<ApiResponse<Company>>('companies', {
        method: 'POST',
        body: convertToFormBody(this.form),
      })
        .then(response => {
          if (response.data) {
            showToast('Company berhasil ditambahkan', 'success')
            this.resetForm()
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length) {
            this.formErrors = err.data.errors as CompanyFormErrors
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
      await $orgAPI<ApiResponse<Company>>(
        'update-my-company',
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
            this.formErrors = err.data.errors as CompanyFormErrors
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
})
