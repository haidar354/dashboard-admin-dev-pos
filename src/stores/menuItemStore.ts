import { defineStore } from 'pinia'

import { useConfirmDialogStore } from './confirmDialogStore'
import type { RequestQuery } from '@/types/api/request'
import type { ApiResponse, PaginatedResponse } from '@/types/api/response'
import type {
  MenuItem,
  MenuItemForm,
  MenuItemFormErrors,
} from '@/types/models/menu-item'

export const useMenuItemStore = defineStore('menuItemStore', {
  state: () => ({
    paginateData: {} as PaginatedResponse<MenuItem>,
    data: [] as MenuItem[],
    selectedMenuItem: {} as MenuItem,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    form: {
      itemId: '',
      isKitchenItem: false,
      kitchenStationId: '',
      isToppingOnly: false,
      isActive: true,
      sortOrder: 0,
    } as MenuItemForm,
    formErrors: {} as MenuItemFormErrors,
    requestQuery: {
      page: 1,
      perPage: 12,
      search: '',
      orderField: 'sortOrder',
      orderDirection: 'asc',
    } as RequestQuery,
    additionalFilter: {
      menuId: '',
      isActive: '',
    },
  }),
  getters: {
    // No dialog-related getters needed
  },
  actions: {
    resetForm() {
      this.form = {
        itemId: '',
        isKitchenItem: false,
        kitchenStationId: '',
        isToppingOnly: false,
        isActive: true,
        sortOrder: 0,
      } as MenuItemForm
      this.formErrors = {} as MenuItemFormErrors
    },

    resetFilter() {
      this.requestQuery = {
        page: 1,
        perPage: 12,
        search: '',
        orderField: 'sortOrder',
        orderDirection: 'asc',
      } as RequestQuery
      this.additionalFilter = {
        menuId: '',
        isActive: '',
      }
    },

    applyFilter() {
      this.requestQuery.page = 1
      this.fetchData()
    },

    onSortBy(sortBy: { key: string; order: string }[]) {
      if (sortBy.length > 0) {
        this.requestQuery.orderField = sortBy[0].key
        this.requestQuery.orderDirection = sortBy[0].order as 'asc' | 'desc'
        this.fetchData()
      }
    },

    setFormData(menuItem: MenuItem) {
      this.selectedMenuItem = menuItem

      // Set form data based on actual MenuItem structure
      this.form = {
        itemId: menuItem.itemId,
        isKitchenItem: false, // Default value since not in MenuItem interface
        kitchenStationId: '',
        isToppingOnly: false,
        isActive: true,
        sortOrder: 0,
      }
    },

    setMenuId(menuId: string) {
      this.additionalFilter.menuId = menuId
    },

    async fetchData() {
      this.isLoadingFetchData = true
      try {
        const response = await $salesAPI<
          ApiResponse<PaginatedResponse<MenuItem>>
        >('menu-items', {
          method: 'GET',
          query: {
            ...this.requestQuery,
            ...this.additionalFilter,
          },
        })

        this.paginateData
          = response.data || ({} as PaginatedResponse<MenuItem>)
        this.data = this.paginateData.data || []
      }
      catch (error) {
        console.error('Error fetching menu items:', error)
        this.paginateData = {} as PaginatedResponse<MenuItem>
        this.data = []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchAllData() {
      this.isLoadingFetchData = true
      try {
        const response = await $salesAPI<
          ApiResponse<PaginatedResponse<MenuItem>>
        >('menu-items', {
          method: 'GET',
          query: {
            page: 1,
            perPage: 1000,
            search: this.requestQuery.search,
            orderField: this.requestQuery.orderField,
            orderDirection: this.requestQuery.orderDirection,
            ...this.additionalFilter,
          },
        })

        this.paginateData
          = response.data || ({} as PaginatedResponse<MenuItem>)
        this.data = this.paginateData.data || []
      }
      catch (error) {
        console.error('Error fetching all menu items:', error)
        this.paginateData = {} as PaginatedResponse<MenuItem>
        this.data = []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(menuItemId: string) {
      this.isLoadingFetchDetail = true
      try {
        const response = await $salesAPI<ApiResponse<MenuItem>>(
          `menu-items/${menuItemId}`,
        )

        if (response.data)
          this.selectedMenuItem = response.data
      }
      catch (error) {
        console.error('Error fetching menu item detail:', error)
        this.selectedMenuItem = {} as MenuItem
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async create(menuId: string) {
      this.isLoadingCreate = true
      try {
        this.formErrors = {} as MenuItemFormErrors

        const response = await $salesAPI<ApiResponse<MenuItem>>(
          `menus/${menuId}/items`,
          {
            method: 'POST',
            body: this.form,
          },
        )

        return response.data
      }
      catch (error: any) {
        console.error('Error creating menu item:', error)
        if (error?.data?.errors)
          this.formErrors = error.data.errors
        throw error
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async update(menuItemId: string) {
      this.isLoadingUpdate = true
      try {
        this.formErrors = {} as MenuItemFormErrors

        const response = await $salesAPI<ApiResponse<MenuItem>>(
          `menu-items/${menuItemId}`,
          {
            method: 'PUT',
            body: this.form,
          },
        )

        return response.data
      }
      catch (error: any) {
        console.error('Error updating menu item:', error)
        if (error?.data?.errors)
          this.formErrors = error.data.errors
        throw error
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async delete(menuItemId: string) {
      this.isLoadingDelete = true
      try {
        await $salesAPI<ApiResponse<MenuItem>>(`menu-items/${menuItemId}`, {
          method: 'DELETE',
        })

        await this.fetchData()
      }
      catch (error) {
        console.error('Error deleting menu item:', error)
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    async onDeleteMenuItem(menuItem: MenuItem) {
      const { openDialog } = useConfirmDialogStore()

      const isConfirmed = await openDialog(`Menu Item "${menuItem.itemId}"`)
      if (isConfirmed)
        await this.delete(menuItem.menuItemId)
    },

    async exportData() {
      this.isLoadingExport = true
      try {
        const response = await $salesAPI<Blob>('menu-items/export', {
          method: 'GET',
          query: {
            search: this.requestQuery.search,
            orderField: this.requestQuery.orderField,
            orderDirection: this.requestQuery.orderDirection,
            ...this.additionalFilter,
          },
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')

        link.href = url
        link.setAttribute(
          'download',
          `menu-items-${new Date().getTime()}.xlsx`,
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
      catch (error) {
        console.error('Error exporting menu items:', error)
      }
      finally {
        this.isLoadingExport = false
      }
    },

    async reorderMenuItems(menuItems: MenuItem[]) {
      try {
        const reorderData = menuItems.map((item, index) => ({
          menuItemId: item.menuItemId,
          sortOrder: index + 1,
        }))

        await $salesAPI('menu-items/reorder', {
          method: 'POST',
          body: { menuItems: reorderData },
        })

        await this.fetchData()
      }
      catch (error) {
        console.error('Error reordering menu items:', error)
      }
    },
  },
})
