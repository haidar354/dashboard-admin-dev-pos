import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import type { RequestQuery } from '@/types/api/request'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type { Supplier, SupplierForm } from '@/types/models/purchase/supplier'

const confirmDialog = useConfirmDialogStore()
type Mode = 'create' | 'show' | 'edit'
export const useSupplierStore = defineStore('supplierStore', {
  state: () => ({
    paginateData: {} as PaginateData<Supplier>,
    data: [] as Supplier[],
    selectedSupplier: {} as Supplier,
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
      form: {} as SupplierForm,
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
      this.dialog.form = {} as SupplierForm
      this.dialog.mode = 'create'
      this.dialog.title = 'Tambah Supplier'
      this.dialog.isVisible = true
    },
    openEditDialog(data: Supplier) {
      const clone = JSON.parse(JSON.stringify(data))

      this.selectedSupplier = data
      this.dialog.form = clone as SupplierForm
      this.dialog.mode = 'edit'
      this.dialog.title = 'Edit Supplier'
      this.dialog.isVisible = true
    },
    openDetailDialog(data: Supplier) {
      this.selectedSupplier = data
      this.dialog.form = data as SupplierForm
      this.dialog.mode = 'show'
      this.dialog.title = 'Detail Supplier'
      this.dialog.isVisible = true
      this.fetchDetail()
    },
    resetDialog() {
      this.dialog.form = {} as SupplierForm
      this.dialog.mode = 'create'
      this.dialog.title = 'Tambah Supplier'
      this.dialog.isVisible = false
      this.dialog.isLoadingSubmit = false
      this.dialog.isLoadingFetchDetail = false
      this.selectedSupplier = {} as Supplier
    },
    async fetchData() {
      this.isLoadingFetchData = true
      await $purchaseAPI<ApiPaginatedResponse<Supplier>>(
        'suppliers',
        {
          method: 'GET',
          params: this.requestQuery,
        },
      )
        .then(response => {
          this.paginateData = setPaginateData(response)
          this.isLoadingFetchData = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.isLoadingFetchData = false
        })
    },
    async fetchAllData() {
      this.isLoadingFetchData = true
      await $purchaseAPI<ApiResponse<Supplier[]>>(
        'suppliers/all',
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
      this.dialog.isLoadingFetchDetail = true
      await $purchaseAPI<ApiResponse<Supplier>>(
        `suppliers/${this.selectedSupplier.supplierId}`,
      )
        .then(response => {
          if (response.data) {
            this.selectedSupplier = response.data
            this.dialog.form = Object.keys(this.dialog.form).reduce(
              (obj, key) => {
                if (key in response.data)
                  (obj as any)[key] = response.data[key as keyof SupplierForm]

                return obj
              },
              {} as SupplierForm,
            )
          }

          this.dialog.isLoadingFetchDetail = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')

          this.dialog.isLoadingFetchDetail = false
        })
    },
    async create() {
      await $purchaseAPI<ApiResponse<Supplier>>('suppliers', {
        method: 'POST',
        body: convertToFormBody(this.dialog.form),
      })
        .then(response => {
          if (response.data) {
            if (this.paginateData?.data?.length >= 0)
              this.paginateData.data.unshift(response.data)

            showToast('Supplier berhasil ditambahkan', 'success')
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
      await $purchaseAPI<ApiResponse<Supplier>>(
        `suppliers/${this.selectedSupplier.supplierId}`,
        {
          method: 'PUT',
          body: this.dialog.form,
        },
      )
        .then(response => {
          if (response.data) {
            const index = this.paginateData?.data?.findIndex(
              item => item.supplierId === this.selectedSupplier.supplierId,
            )

            if (index !== -1) {
              this.paginateData.data.splice(index, 1, {
                ...this.paginateData.data[index],
                ...this.dialog.form,
              })
            }

            showToast('Supplier berhasil diperbarui', 'success')
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
      await $purchaseAPI<ApiResponse<Supplier>>(`suppliers/${id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.data) {
            this.paginateData.data
              = this.paginateData.data?.filter(
                item => item.supplierId !== id,
              ) || []
            showToast('Supplier berhasil dihapus', 'success')
          }
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

    async onDeleteItem(item: Supplier) {
      confirmDialog
        .openDialog(`Supplier "${item.name}"`)
        .then(isConfirmed => {
          if (isConfirmed)
            this.delete(item.supplierId)
        })
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $purchaseAPI<Blob>('/suppliers/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Supplier ${dayjs().format('DD-MM-YYYY')}.xlsx`

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
        this.requestQuery.orderField = 'createdAt'
        this.requestQuery.orderDirection = 'desc'
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
