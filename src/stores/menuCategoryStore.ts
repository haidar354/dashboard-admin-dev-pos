import { defineStore } from 'pinia'

import { useConfirmDialogStore } from './confirmDialogStore'
import { useOutletStore } from './outletStore'
import type { RequestQuery } from '@/types/api/request'
import type { ApiResponse, PaginatedResponse } from '@/types/api/response'
import type {
  MenuCategory,
  MenuCategoryForm,
  MenuCategoryFormErrors,
} from '@/types/models/menu-category'

export const useMenuCategoryStore = defineStore('menuCategoryStore', {
  state: () => ({
    paginateData: {} as PaginatedResponse<MenuCategory>,
    data: [] as MenuCategory[],
    selectedMenuCategory: {} as MenuCategory,
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    isDialogVisible: false as boolean,
    dialogMode: 'create' as 'create' | 'edit',
    form: {
      name: '',
      sortOrder: 0,
      showInPOS: true,
      outletId: useOutletStore().selectedOutlet.outletId,
    } as MenuCategoryForm,
    formErrors: {} as MenuCategoryFormErrors,
    requestQuery: {
      page: 1,
      perPage: 12,
      search: '',
      orderField: 'sortOrder',
      orderDirection: 'asc',
    } as RequestQuery,
    additionalFilter: {
      showInPOS: '',
    },
  }),
  getters: {
    dialogTitle: state => {
      return state.dialogMode === 'create'
        ? 'Tambah Kategori Menu'
        : 'Edit Kategori Menu'
    },
    submitButtonText: state => {
      return state.dialogMode === 'create'
        ? 'Tambah Kategori'
        : 'Perbarui Kategori'
    },
  },
  actions: {
    resetForm() {
      this.form = {
        name: '',
        sortOrder: 0,
        showInPOS: true,
      } as MenuCategoryForm
      this.formErrors = {} as MenuCategoryFormErrors
    },

    openCreateDialog() {
      if (!useOutletStore().selectedSidebarOutlet?.outletId) {
        showToast('Silakan pilih outlet terlebih dahulu', 'error')

        return
      }

      this.resetForm()
      this.dialogMode = 'create'
      this.isDialogVisible = true
      this.form.outletId
        = useOutletStore().selectedSidebarOutlet?.outletId || ''

      // Set default sort order to next available number
      this.form.sortOrder = this.data.length + 1
    },

    openEditDialog(menuCategory: MenuCategory) {
      this.selectedMenuCategory = menuCategory
      this.form = {
        name: menuCategory.name,
        sortOrder: menuCategory.sortOrder,
        showInPOS: menuCategory.showInPOS,
        outletId: menuCategory.outletId,
      }
      this.dialogMode = 'edit'
      this.isDialogVisible = true
      this.formErrors = {}
    },

    closeDialog() {
      this.isDialogVisible = false
      this.resetForm()
      this.selectedMenuCategory = {} as MenuCategory
    },

    async fetchData() {
      this.isLoadingFetchData = true
      try {
        const response = await $salesAPI<
          ApiResponse<PaginatedResponse<MenuCategory>>
        >('menu-categories', {
          method: 'GET',
          params: {
            ...this.requestQuery,
            ...this.additionalFilter,
          },
        })

        this.paginateData
          = response.data || ({} as PaginatedResponse<MenuCategory>)
        this.data = response.data?.data || []
        this.isLoadingFetchData = false
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) { displayErrorMessages(err.data.errors) }
        else {
          showToast(
            err.data?.message || 'Gagal memuat data kategori menu',
            'error',
          )
        }

        this.isLoadingFetchData = false
      }
    },

    async fetchAllData() {
      this.isLoadingFetchData = true
      try {
        const response = await $salesAPI<
          ApiResponse<PaginatedResponse<MenuCategory>>
        >('menu-categories', {
          method: 'GET',
          params: {
            per_page: 99999999,
            order_field: 'sortOrder',
            order_direction: 'asc',
          },
        })

        this.data = response.data?.data || []
        this.isLoadingFetchData = false
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) { displayErrorMessages(err.data.errors) }
        else {
          showToast(
            err.data?.message || 'Gagal memuat data kategori menu',
            'error',
          )
        }

        this.isLoadingFetchData = false
      }
    },

    async fetchDetail(menuCategoryId: string) {
      this.isLoadingFetchDetail = true
      try {
        const response = await $salesAPI<ApiResponse<MenuCategory>>(
          `menu-categories/${menuCategoryId}`,
        )

        if (response.data)
          this.selectedMenuCategory = response.data

        this.isLoadingFetchDetail = false
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) { displayErrorMessages(err.data.errors) }
        else {
          showToast(
            err.data?.message || 'Gagal memuat detail kategori menu',
            'error',
          )
        }

        this.isLoadingFetchDetail = false
        throw err
      }
    },

    async create() {
      this.isLoadingCreate = true
      this.formErrors = {}
      try {
        await $salesAPI<ApiResponse<MenuCategory>>('menu-categories', {
          method: 'POST',
          body: this.form,
        })
        this.isLoadingCreate = false
        this.closeDialog()
        showToast('Kategori menu berhasil ditambahkan', 'success')
        await this.fetchData()
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(
            err.data?.message || 'Gagal menambahkan kategori menu',
            'error',
          )
        }
        this.isLoadingCreate = false
      }
    },

    async update() {
      this.isLoadingUpdate = true
      this.formErrors = {}
      try {
        await $salesAPI<ApiResponse<MenuCategory>>(
          `menu-categories/${this.selectedMenuCategory.menuCategoryId}`,
          {
            method: 'PUT',
            body: this.form,
          },
        )
        this.isLoadingUpdate = false
        this.closeDialog()
        showToast('Kategori menu berhasil diperbarui', 'success')
        await this.fetchData()
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) {
          this.formErrors = err.data.errors
          displayErrorMessages(err.data.errors)
        }
        else {
          showToast(
            err.data?.message || 'Gagal memperbarui kategori menu',
            'error',
          )
        }
        this.isLoadingUpdate = false
      }
    },

    async delete(menuCategoryId: string) {
      this.isLoadingDelete = true
      try {
        await $salesAPI<ApiResponse<MenuCategory>>(
          `menu-categories/${menuCategoryId}`,
          {
            method: 'DELETE',
          },
        )
        this.isLoadingDelete = false
        showToast('Kategori menu berhasil dihapus', 'success')
        await this.fetchData()
      }
      catch (err: any) {
        if (err.data?.errors && Object.keys(err.data.errors).length) { displayErrorMessages(err.data.errors) }
        else {
          showToast(
            err.data?.message || 'Gagal menghapus kategori menu',
            'error',
          )
        }

        this.isLoadingDelete = false
      }
    },

    async onDeleteMenuCategory(menuCategory: MenuCategory) {
      useConfirmDialogStore()
        .openDialog(`Kategori Menu "${menuCategory.name}"`)
        .then(async isConfirmed => {
          if (isConfirmed)
            await this.delete(menuCategory.menuCategoryId)
        })
    },

    onSortBy(sortBy: { key: string; order: 'asc' | 'desc' }[]) {
      if (sortBy.length > 0) {
        this.requestQuery.orderField = sortBy[0]?.key
        this.requestQuery.orderDirection = sortBy[0]?.order
      }
      else {
        this.requestQuery.orderField = 'sortOrder'
        this.requestQuery.orderDirection = 'asc'
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
        showInPOS: '',
      }
      this.applyFilter()
    },

    async reorderCategories(categories: MenuCategory[]) {
      try {
        const reorderData = categories.map((category, index) => ({
          menuCategoryId: category.menuCategoryId,
          sortOrder: index + 1,
        }))

        await $salesAPI('menu-categories/reorder', {
          method: 'PUT',
          body: { categories: reorderData },
        })

        showToast('Urutan kategori berhasil diperbarui', 'success')
        await this.fetchData()
      }
      catch (err: any) {
        showToast(
          err.data?.message || 'Gagal memperbarui urutan kategori',
          'error',
        )
      }
    },
  },
})
