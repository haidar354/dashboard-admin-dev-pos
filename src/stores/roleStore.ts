import { defineStore } from 'pinia'

import type { RequestQuery } from '@/types/api/request'
import type { ApiResponse, PaginatedResponse } from '@/types/api/response'
import type { Role, RoleForm } from '@/types/models/role'

type Mode = 'create' | 'show' | 'edit'
export const useRoleStore = defineStore('roleStore', {
  state: () => ({
    paginateData: {} as PaginatedResponse<Role>,
    data: [] as Role[],
    selectedRole: {} as Role,
    isLoadingFetchData: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'name',
      orderDirection: 'asc',
    } as RequestQuery,
    dialog: {
      form: {} as RoleForm,
      isVisible: false,
      mode: 'show' as Mode,
      title: 'Tambah Role',
      isLoadingFetchDetail: false as boolean,
      isLoadingSubmit: false as boolean,
    },
    additionalFilter: {
      is_default: undefined as boolean | undefined,
    },
  }),
  actions: {
    async fetchAllData() {
      this.isLoadingFetchData = true
      await $settingAPI<ApiResponse<Role[]>>('privilege/roles', {
        method: 'GET',
      })
        .then(response => {
          this.data = response.data || []
          this.isLoadingFetchData = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')

          this.isLoadingFetchData = false
        })
    },
  },
})
