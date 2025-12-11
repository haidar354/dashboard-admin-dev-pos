import { defineStore } from 'pinia'

import type { RequestQuery } from '@/types/api/request'
import type {
  ApiResponse,
} from '@/types/api/response'
import type { ProductDashboardData } from '@/types/models/product/dashboard/dashboard'

export const useDashboardStore = defineStore('dashboardStore', {
  state: () => ({
    data: {} as ProductDashboardData,
    isLoadingFetchData: false as boolean,
    requestQuery: {
      outletId: '',
    } as RequestQuery,
  }),
  actions: {
    async fetchData(params?: any) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await $productAPI<ApiResponse<ProductDashboardData>>(
          '/dashboard',
          {
            method: 'GET',
            query: {
              outletId: requestQuery.outletId ?? undefined,
            },
          },
        )

        this.data = response.data
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
  },
})
