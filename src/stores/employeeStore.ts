import { defineStore } from 'pinia'

import { useConfirmDialogStore } from './confirmDialogStore'
import type { RequestQuery } from '@/types/api/request'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
  PaginatedResponse,
} from '@/types/api/response'
import type {
  Employee,
  EmployeeForm,
  EmployeeFormErrors,
} from '@/types/models/employee'

export const useEmployeeStore = defineStore('employeeStore', {
  state: () => ({
    paginateData: {} as PaginateData<Employee>,
    data: [] as Employee[],
    selectedEmployee: {} as Employee,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    form: {
      employeeId: '',
      outletId: '',
      userId: '',
      address: '',
      position: '',
      name: '',
      pin: '',
      phone: '',
      role: '',
    } as EmployeeForm,
    formErrors: {} as EmployeeFormErrors,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'name',
      orderDirection: 'asc',
    } as RequestQuery,
    additionalFilter: {
      field: '',
    },
  }),
  actions: {
    resetForm() {
      this.form = {} as EmployeeForm
      this.formErrors = {} as EmployeeFormErrors
    },
    async fetchData() {
      this.isLoadingFetchData = true
      await $hrAPI<ApiPaginatedResponse<Employee>>('employees', {
        method: 'GET',
        params: this.requestQuery,
      })
        .then(response => {
          this.paginateData = setPaginateData(response)
          this.isLoadingFetchData = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.isLoadingFetchData = false
        })
    },
    async fetchAllData() {
      this.isLoadingFetchData = true
      await $hrAPI<ApiResponse<PaginatedResponse<Employee>>>('employees', {
        method: 'GET',
        params: {
          per_page: 99999999,
          order_field: 'name',
          order_direction: 'asc',
        },
      })
        .then(response => {
          this.data = response.data?.data || []
          this.isLoadingFetchData = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.isLoadingFetchData = false
        })
    },
    async fetchDetail(employeeId: string) {
      this.isLoadingFetchDetail = true
      await $hrAPI<ApiResponse<Employee>>(`employees/${employeeId}`)
        .then(response => {
          if (response.data)
            this.selectedEmployee = response.data

          this.isLoadingFetchDetail = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.isLoadingFetchDetail = false
          throw err
        })
    },
    async fetchDetailAndSetForm(employeeId: string) {
      this.fetchDetail(employeeId)
        .then(() => {
          this.form = {
            name: this.selectedEmployee.user?.name || '',
            phone: this.selectedEmployee.user?.phone || '',
            position: this.selectedEmployee.position || '',
            address: this.selectedEmployee.address || '',
            outletId: this.selectedEmployee.employeeAssignments?.[0]?.orgId || '',
            userId: this.selectedEmployee.userId || '',
            role: this.selectedEmployee.user?.roles?.[0]?.name || '',
          }
          console.log(this.form)
        })
        .catch(err => {
          throw err
        })
    },

    async create() {
      this.isLoadingCreate = true
      await $hrAPI<ApiResponse<Employee>>('employees', {
        method: 'POST',
        body: { ...this.form, roles: [this.form.role] },
      })
        .then(() => {
          this.isLoadingCreate = false
          this.resetForm()
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.isLoadingCreate = false
          throw err
        })
    },

    async update() {
      this.isLoadingUpdate = true
      await $hrAPI<ApiResponse<Employee>>(
        `employees/${this.selectedEmployee.employeeId}`,
        {
          method: 'PUT',
          body: this.form,
        },
      )
        .then(() => {
          this.isLoadingUpdate = false
          this.resetForm()
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.isLoadingUpdate = false
          throw err
        })
    },

    async delete(employeeId: string) {
      this.isLoadingDelete = true
      await $hrAPI<ApiResponse<Employee>>(`employees/${employeeId}`, {
        method: 'DELETE',
      })
        .then(() => {
          this.isLoadingDelete = false
          this.resetForm()
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.isLoadingDelete = false
        })
    },

    async onDeleteEmployee(employee: Employee) {
      useConfirmDialogStore()
        .openDialog(`Karyawan "${employee.user?.name}"`)
        .then(isConfirmed => {
          if (isConfirmed)
            this.delete(employee.employeeId)
        })
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
        field: '',
      }
      this.applyFilter()
    },
  },
})
