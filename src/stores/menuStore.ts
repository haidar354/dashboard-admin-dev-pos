import { defineStore } from 'pinia'

import dayjs from 'dayjs'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'
import type { RequestQuery } from '@/types/api/request'
import type { ApiResponse, PaginatedResponse } from '@/types/api/response'
import type { Menu, MenuForm, MenuFormErrors } from '@/types/models/menu'

export const useMenuStore = defineStore('menuStore', {
  state: () => ({
    paginateData: {} as PaginatedResponse<Menu>,
    data: [] as Menu[],
    selectedMenu: {} as Menu,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    form: {
      name: '',
      sortOrder: 0,
      outlets: [],
      items: [],
    } as MenuForm,
    formErrors: {} as MenuFormErrors,
    requestQuery: {
      page: 1,
      perPage: 12,
      search: '',
      orderField: 'sortOrder',
      orderDirection: 'asc',
    } as RequestQuery,
    additionalFilter: {
      menuCategoryId: '',
    },
  }),
  getters: {
    // Removed dialog-related getters
  },
  actions: {
    resetForm() {
      this.form = {
        name: '',
        sortOrder: 0,
        outlets: [],
        items: [],
      } as MenuForm
      this.formErrors = {} as MenuFormErrors
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
        menuCategoryId: '',
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

    setFormData(menu: Menu) {
      this.selectedMenu = menu
      this.form = {
        name: menu.name,
        sortOrder: menu.sortOrder,
        outlets: [],
        items: [],
      }
    },

    async fetchData() {
      this.isLoadingFetchData = true
      try {
        const response = await $salesAPI<ApiResponse<PaginatedResponse<Menu>>>(
          'menus',
          {
            method: 'GET',
            query: {
              ...this.requestQuery,
              ...this.additionalFilter,
            },
          },
        )

        this.paginateData = response.data || ({} as PaginatedResponse<Menu>)
        this.data = this.paginateData.data || []
      }
      catch (error) {
        console.error('Error fetching menus:', error)
        this.paginateData = {} as PaginatedResponse<Menu>
        this.data = []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchAllData() {
      this.isLoadingFetchData = true
      try {
        const response = await $salesAPI<ApiResponse<PaginatedResponse<Menu>>>(
          'menus',
          {
            method: 'GET',
            query: {
              page: 1,
              perPage: 1000,
              search: this.requestQuery.search,
              orderField: this.requestQuery.orderField,
              orderDirection: this.requestQuery.orderDirection,
              ...this.additionalFilter,
            },
          },
        )

        this.paginateData = response.data || ({} as PaginatedResponse<Menu>)
        this.data = this.paginateData.data || []
      }
      catch (error) {
        console.error('Error fetching all menus:', error)
        this.paginateData = {} as PaginatedResponse<Menu>
        this.data = []
      }
      finally {
        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(menuId: string) {
      this.isLoadingFetchDetail = true
      try {
        const response = await $salesAPI<ApiResponse<Menu>>(`menus/${menuId}`)
        if (response.data)
          this.selectedMenu = response.data
      }
      catch (error) {
        console.error('Error fetching menu detail:', error)
        this.selectedMenu = {} as Menu
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },

    async create() {
      this.isLoadingCreate = true
      try {
        this.formErrors = {} as MenuFormErrors

        const form = {
          ...this.form,
          outlets: this.form.outlets.map(outlet => ({
            ...outlet,
            priceDineIn: outlet.priceDineIn || 0,
          })),
          items: this.form.items.map((item, index) => ({
            ...item,
            sortOrder: index + 1,
          })),
        }

        const response = await $salesAPI<ApiResponse<Menu>>('menus', {
          method: 'POST',
          body: form,
        })

        showToast('Menu berhasil ditambahkan')

        return response.data
      }
      catch (err: any) {
        if (Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as MenuFormErrors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(err.data?.message, 'error')
        }
        throw err
      }
      finally {
        this.isLoadingCreate = false
      }
    },

    async update(menuId: string) {
      this.isLoadingUpdate = true
      try {
        this.formErrors = {} as MenuFormErrors

        const response = await $salesAPI<ApiResponse<Menu>>(`menus/${menuId}`, {
          method: 'PUT',
          body: this.form,
        })

        return response.data
      }
      catch (err: any) {
        if (Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors as MenuFormErrors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(err.data?.message, 'error')
        }
        throw err
      }
      finally {
        this.isLoadingUpdate = false
      }
    },

    async delete(menuId: string) {
      this.isLoadingDelete = true
      try {
        await $salesAPI<ApiResponse<Menu>>(`menus/${menuId}`, {
          method: 'DELETE',
        })

        await this.fetchData()
        showToast('Menu berhasil dihapus')
      }
      catch (err: any) {
        if (Object.keys(err.data.errors).length)
          displayErrorMessages(err.data.errors)
        else showToast(err.data?.message, 'error')

        throw err
      }
      finally {
        this.isLoadingDelete = false
      }
    },

    async onDeleteItem(item: Menu) {
      useConfirmDialogStore()
        .openDialog(`Item "${item.name}"`)
        .then(isConfirmed => {
          if (isConfirmed)
            this.delete(item.menuId)
        })
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $inventoryAPI('/items/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Menu ${dayjs().format('DD-MM-YYYY')}.xlsx`

        downloadBlob(blob, filename)
      }
      catch (error) {
        this.isLoadingExport = false
        console.error('Error exporting data:', error)
        showToast('Error exporting data', 'error')
        throw error
      }
    },

    async reorderMenus(menus: Menu[]) {
      try {
        const reorderData = menus.map((menu, index) => ({
          menuId: menu.menuId,
          sortOrder: index + 1,
        }))

        await $salesAPI('menus/reorder', {
          method: 'POST',
          body: { menus: reorderData },
        })

        await this.fetchData()
        showToast('Urutan menu berhasil diperbarui')
      }
      catch (error) {
        showToast('Gagal memperbarui urutan menu', 'error')
        throw error
      }
    },
  },
})
