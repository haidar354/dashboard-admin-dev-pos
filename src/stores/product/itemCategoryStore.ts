import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import ItemCategoryModel from '@/models/product/ItemCategoryModel'
import { useOutletSidebarStore } from '@/stores/outletSidebarStore'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type {
  ItemCategory,
  ItemCategoryForm,
  ItemCategoryQueryParams,
} from '@/types/models/product/item-category'

const confirmDialog = useConfirmDialogStore()
const outletSidebarStore = useOutletSidebarStore()
type Mode = 'create' | 'show' | 'edit'
export const useItemCategoryStore = defineStore('itemCategoryStore', {
  state: () => ({
    paginateData: {} as PaginateData<ItemCategory>,
    data: [] as ItemCategory[],
    selectedItemCategory: {} as ItemCategory,
    isLoadingFetchData: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    requestQuery: {
      outletId: '',
      search: '',
      page: 1,
      perPage: 10,
      fields: undefined,
      include: [
        'itemsCount',
      ],
      orderBy: [] as string[],
    } as ItemCategoryQueryParams,
    dialog: {
      form: {} as ItemCategoryForm,
      isVisible: false,
      mode: 'show' as Mode,
      title: 'Tambah Kategori Produk',
      isLoadingFetchDetail: false as boolean,
      isLoadingSubmit: false as boolean,
    },
    additionalFilter: {
      field: '',
    },
  }),
  actions: {
    openCreateDialog() {
      this.dialog.form = {
        outletIds: outletSidebarStore.selectedSidebarOutlet?.outletId
          ? [outletSidebarStore.selectedSidebarOutlet.outletId]
          : [],
        name: '',
        description: '',
        isActive: true,
      } as ItemCategoryForm
      this.dialog.mode = 'create'
      this.dialog.title = 'Tambah Kategori Produk'
      this.dialog.isVisible = true
    },
    async openEditDialog(data: ItemCategory) {
      this.dialog.isLoadingFetchDetail = true
      this.selectedItemCategory = data
      this.dialog.mode = 'edit'
      this.dialog.title = 'Edit Kategori Produk'
      this.dialog.isVisible = true
      this.dialog.form = {} as ItemCategoryForm
      this.fetchDetail()
      this.dialog.isLoadingFetchDetail = false
    },
    openDetailDialog(data: ItemCategory) {
      this.dialog.isLoadingFetchDetail = true
      this.selectedItemCategory = data
      this.dialog.mode = 'show'
      this.dialog.title = 'Detail Kategori Produk'
      this.dialog.isVisible = true
      this.dialog.form = {} as ItemCategoryForm
      this.fetchDetail()
      this.dialog.isLoadingFetchDetail = false
    },
    resetDialog() {
      this.dialog.isLoadingFetchDetail = true
      this.dialog.form = {} as ItemCategoryForm
      this.dialog.mode = 'create'
      this.dialog.title = 'Tambah Kategori Produk'
      this.dialog.isVisible = false
      this.dialog.isLoadingSubmit = false
      this.dialog.isLoadingFetchDetail = false
      this.selectedItemCategory = {} as ItemCategory
    },
    async fetchPaginate() {
      this.isLoadingFetchData = true
      try {
        const response = await ItemCategoryModel
          .select(this.requestQuery.fields)
          .include(this.requestQuery.include)
          .orderBy(this.requestQuery.orderBy)
          .when(this.requestQuery.search, (query, value) => query.where('search', value))
          .when(this.requestQuery.outletId, (query, value) => query.where('outletId', value))
          .paginate<ApiPaginatedResponse<ItemCategory>>(this.requestQuery?.page || 1, this.requestQuery?.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchAllData() {
      this.isLoadingFetchData = true
      await $productAPI<ApiResponse<ItemCategory[]>>(
        'item-categories/all',
        {
          method: 'GET',
        },
      )
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
    async fetchDetail() {
      try {
        const response = await ItemCategoryModel
          .select(this.requestQuery.fields)
          .include('outlets')
          .orderBy(this.requestQuery.orderBy)
          .when(this.requestQuery.search, (query, value) => query.where('search', value))
          .when(this.requestQuery.outletId, (query, value) => query.where('outletId', value))
          .find<ApiResponse<ItemCategory>>(this.selectedItemCategory.itemCategoryId)

        this.selectedItemCategory = response.data

        this.dialog.form = {
          name: response.data?.name,
          description: response.data?.description,
          showInPos: response.data?.showInPos,
          isActive: response.data?.isActive,
          outletIds: response.data?.outlets?.map(outlet => outlet.outletId) || [],
        }
      }
      catch (error) {
        if (Object.keys((error as any).data.errors).length)
          displayErrorMessages((error as any).data.errors)
        else showToast((error as any).data?.message, 'error')

        throw error
      }
    },
    async create() {
      await $productAPI<ApiResponse<ItemCategory>>('item-categories', {
        method: 'POST',
        body: this.dialog.form,
      })
        .then(response => {
          if (response.data) {
            if (this.paginateData?.data?.length)
              this.paginateData.data.unshift(response.data)

            showToast('Kategori produk berhasil ditambahkan', 'success')
            this.resetDialog()
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')
        })
    },
    async update() {
      await $productAPI<ApiResponse<ItemCategory>>(
        `item-categories/${this.selectedItemCategory.itemCategoryId}`,
        {
          method: 'PUT',
          body: this.dialog.form,
        },
      )
        .then(response => {
          if (response.data) {
            const index = this.paginateData?.data?.findIndex(
              item =>
                item.itemCategoryId === this.selectedItemCategory.itemCategoryId,
            )

            if (index !== -1) {
              this.paginateData.data.splice(index, 1, {
                ...this.paginateData.data[index],
                ...this.dialog.form,
              })
            }

            showToast('Kategori produk berhasil diperbarui', 'success')
            this.resetDialog()
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')
        })
    },
    async save() {
      this.dialog.isLoadingSubmit = true
      if (this.dialog.mode === 'create')
        await this.create()
      else if (this.dialog.mode === 'edit')
        await this.update()
      else showToast('Mode dialog tidak dikenali', 'error')
      this.dialog.isLoadingSubmit = false
    },
    async delete(id: string) {
      this.isLoadingDelete = true
      await $productAPI<ApiResponse<ItemCategory>>(`item-categories/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          if (this.paginateData?.data) {
            this.paginateData.data
              = this.paginateData.data?.filter(
                item => item.itemCategoryId !== id,
              ) || []
          }
          showToast('Kategori produk berhasil dihapus', 'success')
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')
        })
        .finally(() => {
          this.isLoadingDelete = false
        })
    },

    async onDeleteItem(item: ItemCategory) {
      confirmDialog
        .openDialog(`Kategori Produk "${item.name}"`)
        .then(isConfirmed => {
          if (isConfirmed)
            this.delete(item.itemCategoryId)
        })
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $productAPI<Blob>('/item-categories/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Kategori Produk ${dayjs().format(
          'DD-MM-YYYY',
        )}.xlsx`

        downloadBlob(blob, filename)
      }
      catch (error) {
        this.isLoadingExport = false
        console.error('Error exporting data:', error)
        showToast('Error exporting data', 'error')
      }
    },

    onSortBy(sortBy: { key: string; order: 'asc' | 'desc' }[]) {
      if (sortBy.length > 0) {
        this.requestQuery.orderField = sortBy[0]?.key
        this.requestQuery.orderDirection = sortBy[0]?.order
      }
      else {
        this.requestQuery.orderField = ''
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
        field: '',
      }
      this.applyFilter()
    },
  },
})
