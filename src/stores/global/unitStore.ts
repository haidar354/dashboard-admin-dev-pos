import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import type { RequestQuery } from '@/types/api/request'
import type { ApiResponse, PaginateData, PaginatedResponse } from '@/types/api/response'
import type { Unit, UnitForm } from '@/types/models/product/unit/unit'

const confirmDialog = useConfirmDialogStore()
type Mode = 'create' | 'show' | 'edit'
export const useUnitStore = defineStore('globalUnitStore', {
  state: () => ({
    paginateData: {} as PaginateData<Unit>,
    data: [] as Unit[],
    selectedUnit: {} as Unit,
    isLoadingFetchData: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    requestQuery: {
      page: 1,
      perPage: 9999999999,
      search: '',
      orderField: 'name',
      orderDirection: 'asc',
    } as RequestQuery,
    dialog: {
      form: {} as UnitForm,
      isVisible: false,
      mode: 'show' as Mode,
      title: 'Tambah Kategori',
      isLoadingFetchDetail: false as boolean,
      isLoadingSubmit: false as boolean,
    },
    additionalFilter: {
      is_default: undefined as boolean | undefined,
    },
  }),
  actions: {
    openCreateDialog() {
      this.dialog.form = {} as UnitForm
      this.dialog.mode = 'create'
      this.dialog.title = 'Tambah Satuan'
      this.dialog.isVisible = true
    },
    openEditDialog(data: Unit) {
      const clone = JSON.parse(JSON.stringify(data))

      this.selectedUnit = data
      this.dialog.form = clone as UnitForm
      this.dialog.mode = 'edit'
      this.dialog.title = 'Edit Satuan'
      this.dialog.isVisible = true
    },
    openDetailDialog(data: Unit) {
      this.selectedUnit = data
      this.dialog.form = data as UnitForm
      this.dialog.mode = 'show'
      this.dialog.title = 'Detail Satuan'
      this.dialog.isVisible = true
      this.fetchDetail()
    },
    resetDialog() {
      this.dialog.form = {} as UnitForm
      this.dialog.mode = 'create'
      this.dialog.title = 'Tambah Satuan'
      this.dialog.isVisible = false
      this.dialog.isLoadingSubmit = false
      this.dialog.isLoadingFetchDetail = false
      this.selectedUnit = {} as Unit
    },
    async fetchData() {
      this.isLoadingFetchData = true
      await $globalAPI<ApiResponse<PaginatedResponse<Unit>>>('units', {
        method: 'GET',
        params: this.requestQuery,
      })
        .then(response => {
          this.paginateData = setPaginateData(response.data)
          this.isLoadingFetchData = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')

          this.isLoadingFetchData = false
        })
    },
    async fetchAllData() {
      this.isLoadingFetchData = true
      await $globalAPI<ApiResponse<PaginatedResponse<Unit>>>('units', {
        method: 'GET',
      })
        .then(response => {
          this.data = response.data || []
          this.isLoadingFetchData = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')

          this.isLoadingFetchData = false
        })
    },
    async fetchDetail() {
      this.dialog.isLoadingFetchDetail = true
      await $globalAPI<ApiResponse<Unit>>(`units/${this.selectedUnit.unitId}`)
        .then(response => {
          if (response.data) {
            this.selectedUnit = response.data
            this.dialog.form = Object.keys(this.dialog.form).reduce((obj, key) => {
              if (key in response.data)
                (obj as any)[key] = response.data[key as keyof UnitForm]

              return obj
            }, {} as UnitForm)
          }

          this.dialog.isLoadingFetchDetail = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')

          this.dialog.isLoadingFetchDetail = false
        })
    },
    async create() {
      await $globalAPI<ApiResponse<Unit>>('units', {
        method: 'POST',
        body: convertToFormBody(this.dialog.form),
      })
        .then(response => {
          if (response.data) {
            this.paginateData.data.unshift(response.data)
            showToast('Satuan berhasil ditambahkan', 'success')
            this.resetDialog()
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')
        })
    },
    async update() {
      await $globalAPI<ApiResponse<Unit>>(`units/${this.selectedUnit.unitId}`, {
        method: 'PUT',
        body: this.dialog.form,
      })
        .then(response => {
          if (response.data) {
            const index = this.paginateData.data.findIndex(item => item.unitId === this.selectedUnit.unitId)
            if (index !== -1) {
              this.paginateData.data.splice(index, 1, {
                ...this.paginateData.data[index],
                ...this.dialog.form,
              })
            }

            showToast('Satuan berhasil diperbarui', 'success')
            this.resetDialog()
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')
        })
    },
    async save() {
      this.dialog.isLoadingSubmit = true
      if (this.dialog.mode === 'create')
        await this.create()

      else if (this.dialog.mode === 'edit')
        await this.update()

      else
        showToast('Mode dialog tidak dikenali', 'error')
      this.dialog.isLoadingSubmit = false
    },
    async delete(id: string) {
      this.isLoadingDelete = true
      await $globalAPI<ApiResponse<Unit>>(`units/${id}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.data) {
            this.paginateData.data = this.paginateData.data.filter(item => item.unitId !== id)
            showToast('Satuan berhasil dihapus', 'success')
          }
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')
        }).finally(() => {
          this.isLoadingDelete = false
        },
        )
    },

    async onDeleteItem(item: Unit) {
      confirmDialog.openDialog(
        `Satuan "${item.name}"`,
      ).then(isConfirmed => {
        if (isConfirmed)
          this.delete(item.unitId)
      })
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $globalAPI('/units/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Satuan ${dayjs().format('DD-MM-YYYY')}.xlsx`

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
        is_default: undefined,
      }
      this.applyFilter()
    },
  },
})
