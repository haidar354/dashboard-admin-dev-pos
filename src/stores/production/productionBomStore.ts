import { defineStore } from 'pinia'
import type { ApiPaginatedResponse, ApiResponse } from '@/types/api/response'
import type {
  CalculateBomCostRequest,
  CalculateBomCostResponse,
  CreateProductionBomRequest,
  ProductionBom,
  ProductionType,
} from '@/types/models/production/production-bom'

interface ProductionBomState {
  productionBoms: ProductionBom[]
  selectedBom: ProductionBom | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  pagination: {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
  }
  filters: {
    isActive?: boolean
    productionType?: ProductionType
    outputSkuId?: string
    search?: string
  }
}

export const useProductionBomStore = defineStore('productionBom', {
  state: (): ProductionBomState => ({
    productionBoms: [],
    selectedBom: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    pagination: {
      currentPage: 1,
      perPage: 20,
      total: 0,
      lastPage: 1,
    },
    filters: {},
  }),

  getters: {
    hasBoms: state => state.productionBoms.length > 0,
    totalBoms: state => state.pagination.total,
    activeBoms: state => state.productionBoms.filter(bom => bom.isActive),
  },

  actions: {
    async fetchProductionBoms(page = 1, perPage = 20) {
      this.isLoading = true
      this.error = null

      try {
        const params: any = {
          page,
          perPage,
          ...this.filters,
        }

        const response = await $productionAPI<ApiPaginatedResponse<ProductionBom>>('/production-boms', {
          method: 'GET',
          query: params,
        })

        this.productionBoms = response.data
        this.pagination = {
          currentPage: response.meta.currentPage || 1,
          perPage: response.meta.perPage || 20,
          total: response.meta.total || 0,
          lastPage: response.meta.lastPage,
        }

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch production BOMs'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchBomDetail(bomId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionBom>>(`/production-boms/${bomId}`, {
          method: 'GET',
        })

        this.selectedBom = response.data

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch BOM detail'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createProductionBom(data: CreateProductionBomRequest) {
      this.isSubmitting = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionBom>>('/production-boms', {
          method: 'POST',
          body: data,
        })

        showToast('Production BOM created successfully', 'success')

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create production BOM'
        if (error.response?.data?.errors)
          displayErrorMessages(error.response.data.errors)
        else if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isSubmitting = false
      }
    },

    async updateProductionBom(bomId: string, data: CreateProductionBomRequest) {
      this.isSubmitting = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionBom>>(`/production-boms/${bomId}`, {
          method: 'PUT',
          body: data,
        })

        showToast('Production BOM updated successfully', 'success')

        // Update local data
        if (this.selectedBom?.productionBomId === bomId)
          this.selectedBom = response.data

        const index = this.productionBoms.findIndex(b => b.productionBomId === bomId)
        if (index !== -1)
          this.productionBoms[index] = response.data

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to update production BOM'
        if (error.response?.data?.errors)
          displayErrorMessages(error.response.data.errors)
        else if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isSubmitting = false
      }
    },

    async activateBom(bomId: string, isActive: boolean, notes?: string) {
      this.isSubmitting = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionBom>>(`/production-boms/${bomId}/status`, {
          method: 'PATCH',
          body: { isActive, notes },
        })

        showToast(`Production BOM ${isActive ? 'activated' : 'deactivated'} successfully`, 'success')

        // Update local data
        if (this.selectedBom?.productionBomId === bomId)
          this.selectedBom = response.data

        const index = this.productionBoms.findIndex(b => b.productionBomId === bomId)
        if (index !== -1)
          this.productionBoms[index] = response.data

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || `Failed to ${isActive ? 'activate' : 'deactivate'} production BOM`
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isSubmitting = false
      }
    },

    async cloneBom(bomId: string, bomName: string, notes?: string) {
      this.isSubmitting = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionBom>>(`/production-boms/${bomId}/clone`, {
          method: 'POST',
          body: { bomName, notes },
        })

        showToast('Production BOM cloned successfully', 'success')

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to clone production BOM'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isSubmitting = false
      }
    },

    async calculateBomCost(bomId: string, data: CalculateBomCostRequest) {
      this.isLoading = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<CalculateBomCostResponse>>(`/production-boms/${bomId}/calculate-cost`, {
          method: 'POST',
          body: data,
        })

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to calculate BOM cost'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchActiveBomForItem(itemSkuId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionBom>>(`/production-boms/active/${itemSkuId}`, {
          method: 'GET',
        })

        this.selectedBom = response.data

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch active BOM for item'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    setFilters(filters: Partial<ProductionBomState['filters']>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {}
    },

    clearError() {
      this.error = null
    },

    clearSelectedBom() {
      this.selectedBom = null
    },
  },
})
