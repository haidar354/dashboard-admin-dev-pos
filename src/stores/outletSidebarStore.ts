import { defineStore } from 'pinia'

import type { RequestQuery } from '@/types/api/request'
import type {
  ApiResponse,
} from '@/types/api/response'
import type {
  Outlet,
  OutletForm,
  OutletFormErrors,
} from '@/types/models/outlet'

export const useOutletSidebarStore = defineStore('outletSidebarStore', {
  state: () => ({
    selectedSidebarOutlet: {
      name: 'Semua Outlet',
      outletId: '',
      businessUnitId: '',
      address: '',
      isCentral: false,
      createdAt: '',
      updatedAt: '',
    } as Outlet | undefined,
    data: [] as Outlet[],
    isLoadingFetchData: true as boolean,
    requestQuery: {
      page: 1,
      perPage: 10,
      search: '',
      orderField: 'name',
      orderDirection: 'asc',
    } as RequestQuery,
    form: {
      name: '',
      address: '',
      phone: '',
      villageCode: '',
      latitude: '',
      longitude: '',
      openingTime: '',
      closingTime: '',
      isCentral: false,
      description: '',
    } as OutletForm,
    formErrors: {} as OutletFormErrors,
    additionalFilter: {
      type: '',
      itemCategoryId: '',
    },
  }),
  getters: {
    getSelectedOutletId: state => {
      return state.selectedSidebarOutlet?.outletId || undefined
    },
  },
  actions: {
    async fetchAllData() {
      this.isLoadingFetchData = true
      await $orgAPI<ApiResponse<Outlet[]>>('outlets/all', {
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
  },
  persist: true,
})
