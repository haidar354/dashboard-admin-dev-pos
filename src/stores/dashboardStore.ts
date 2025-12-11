import { defineStore } from 'pinia'

import type { ApiResponse } from '@/types/api/response'
import type { DashboardData } from '@/types/models/dashboard'

export const useDashboardStore = defineStore('dashboardStore', {
  state: () => ({
    data: {} as DashboardData,
    isLoadingFetchData: false as boolean,
    requestQuery: {
      year: '',
    } as any,
  }),
  actions: {
    async fetchData(params?: any) {
      this.isLoadingFetchData = true
      await $rootAPI<ApiResponse<DashboardData>>('dashboards', {
        method: 'GET',
        params: { ...this.requestQuery, ...params },
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
})
