import { defineStore } from 'pinia'
import type { ApiPaginatedResponse, ApiResponse } from '@/types/api/response'
import type {
  CreateProductionTaskRequest,
  ProductionTask,
  Station,
  TaskType,
  UpdateProgressRequest,
} from '@/types/models/production/production-task'
import { ProductionStatus } from '@/types/models/production/production-task'

interface ProductionTaskState {
  productionTasks: ProductionTask[]
  selectedTask: ProductionTask | null
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
    status?: ProductionStatus
    station?: Station
    taskType?: TaskType
    assignedToUserId?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }
}

export const useProductionTaskStore = defineStore('productionTask', {
  state: (): ProductionTaskState => ({
    productionTasks: [],
    selectedTask: null,
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
    hasTasks: state => state.productionTasks.length > 0,
    totalTasks: state => state.pagination.total,
    pendingTasks: state => state.productionTasks.filter(t => t.status === ProductionStatus.PENDING),
    inProgressTasks: state => state.productionTasks.filter(t => t.status === ProductionStatus.IN_PROGRESS),
  },

  actions: {
    async fetchProductionTasks(page = 1, perPage = 20) {
      this.isLoading = true
      this.error = null

      try {
        const params: any = {
          page,
          perPage,
          ...this.filters,
        }

        const response = await $productionAPI<ApiPaginatedResponse<ProductionTask>>('/production-tasks', {
          method: 'GET',
          query: params,
        })

        this.productionTasks = response.data
        this.pagination = {
          currentPage: response.meta.currentPage || 1,
          perPage: response.meta.perPage || 20,
          total: response.meta.total || 0,
          lastPage: response.meta.lastPage,
        }

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch production tasks'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchTaskDetail(taskId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionTask>>(`/production-tasks/${taskId}`, {
          method: 'GET',
        })

        this.selectedTask = response.data

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch task detail'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createProductionTask(data: CreateProductionTaskRequest) {
      this.isSubmitting = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionTask>>('/production-tasks', {
          method: 'POST',
          body: data,
        })

        showToast('Production task created successfully', 'success')

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to create production task'
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

    async startTask(taskId: string) {
      this.isSubmitting = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionTask>>(`/production-tasks/${taskId}/start`, {
          method: 'POST',
        })

        showToast('Task started successfully', 'success')

        // Update local data
        if (this.selectedTask?.productionTaskId === taskId)
          this.selectedTask = response.data

        const index = this.productionTasks.findIndex(t => t.productionTaskId === taskId)
        if (index !== -1)
          this.productionTasks[index] = response.data

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to start task'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isSubmitting = false
      }
    },

    async completeTask(taskId: string, progressData: UpdateProgressRequest) {
      this.isSubmitting = true
      this.error = null

      try {
        const response = await $productionAPI<ApiResponse<ProductionTask>>(`/production-tasks/${taskId}/complete`, {
          method: 'POST',
          body: progressData,
        })

        showToast('Task completed successfully', 'success')

        // Update local data
        if (this.selectedTask?.productionTaskId === taskId)
          this.selectedTask = response.data

        const index = this.productionTasks.findIndex(t => t.productionTaskId === taskId)
        if (index !== -1)
          this.productionTasks[index] = response.data

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to complete task'
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

    async fetchKitchenDisplay(station?: Station) {
      this.isLoading = true
      this.error = null

      try {
        const params: any = {}
        if (station)
          params.station = station

        const response = await $productionAPI<ApiResponse<ProductionTask[]>>('/production-tasks/kitchen/display', {
          method: 'GET',
          query: params,
        })

        this.productionTasks = response.data

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch kitchen display'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchActiveTasks(page = 1) {
      this.isLoading = true
      this.error = null

      try {
        const response = await $productionAPI<ApiPaginatedResponse<ProductionTask>>('/production-tasks/active', {
          method: 'GET',
          query: { page, perPage: this.pagination.perPage },
        })

        this.productionTasks = response.data
        this.pagination = {
          currentPage: response.meta.currentPage || 1,
          perPage: response.meta.perPage || 20,
          total: response.meta.total || 0,
          lastPage: response.meta.lastPage,
        }

        return response.data
      }
      catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch active tasks'
        if (this.error)
          showToast(this.error, 'error')

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    setFilters(filters: Partial<ProductionTaskState['filters']>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {}
    },

    clearError() {
      this.error = null
    },

    clearSelectedTask() {
      this.selectedTask = null
    },
  },
})
