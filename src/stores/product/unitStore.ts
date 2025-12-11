import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import UnitModel from '@/models/product/UnitModel'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type {
  Unit,
  UnitForm,
} from '@/types/models/product/unit/unit'
import type { UnitQueryParams } from '@/types/models/product/unit/unit-resource-spec'

const confirmDialog = useConfirmDialogStore()
type Mode = 'create' | 'show' | 'edit'
export const useUnitStore = defineStore('unitStore', {
  state: () => ({
    paginateData: {} as PaginateData<Unit>,
    data: [] as Unit[],
    selectedUnit: {} as Unit,
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
    } as UnitQueryParams,
    dialog: {
      form: {} as UnitForm,
      isVisible: false,
      mode: 'show' as Mode,
      title: 'Tambah Satuan Produk',
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
        name: '',
        code: '',
        metric: '',
      } as UnitForm
      this.dialog.mode = 'create'
      this.dialog.title = 'Tambah Satuan Produk'
      this.dialog.isVisible = true
    },
    async openEditDialog(data: Unit) {
      this.dialog.isLoadingFetchDetail = true
      this.selectedUnit = data
      this.dialog.mode = 'edit'
      this.dialog.title = 'Edit Satuan Produk'
      this.dialog.isVisible = true
      this.dialog.form = {} as UnitForm
      this.fetchDetail()
      this.dialog.isLoadingFetchDetail = false
    },
    openDetailDialog(data: Unit) {
      this.dialog.isLoadingFetchDetail = true
      this.selectedUnit = data
      this.dialog.mode = 'show'
      this.dialog.title = 'Detail Satuan Produk'
      this.dialog.isVisible = true
      this.dialog.form = {} as UnitForm
      this.fetchDetail()
      this.dialog.isLoadingFetchDetail = false
    },
    resetDialog() {
      this.dialog.isLoadingFetchDetail = true
      this.dialog.form = {} as UnitForm
      this.dialog.mode = 'create'
      this.dialog.title = 'Tambah Satuan Produk'
      this.dialog.isVisible = false
      this.dialog.isLoadingSubmit = false
      this.dialog.isLoadingFetchDetail = false
      this.selectedUnit = {} as Unit
    },
    baseQuery(params?: UnitQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      return UnitModel
        .when(requestQuery.fields, (query, value) => {
          if (value)
            query.select(value)
        })
        .when(requestQuery.include, (query, value) => {
          if (value)
            query.include(value)
        })
        .when(requestQuery.orderBy, (query, value) => {
          if (value)
            query.orderBy(value)
        })
        .when(this.requestQuery.search, (query, value) => query.where('search', value))
    },
    async fetchPaginate(params?: UnitQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .paginate<ApiPaginatedResponse<Unit>>(requestQuery?.page || 1, requestQuery?.perPage || 10)

        this.paginateData = setPaginateData(response)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchAllData(params?: UnitQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await this.baseQuery(requestQuery)
          .custom('/units/all')
          .get<ApiResponse<Unit[]>>()

        this.data = response.data
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchDetail(params?: UnitQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      try {
        const response = await this.baseQuery(requestQuery)
          .find<ApiResponse<Unit>>(this.selectedUnit.unitId)

        this.selectedUnit = response.data

        this.dialog.form = {
          name: response.data?.name,
          code: response.data?.code,
          metric: response.data?.metric,
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
      await $productAPI<ApiResponse<Unit>>('units', {
        method: 'POST',
        body: this.dialog.form,
      })
        .then(response => {
          if (response.data) {
            if (this.paginateData?.data?.length)
              this.paginateData.data.unshift(response.data)

            showToast('Satuan produk berhasil ditambahkan', 'success')
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
      await $productAPI<ApiResponse<Unit>>(
        `units/${this.selectedUnit.unitId}`,
        {
          method: 'PUT',
          body: this.dialog.form,
        },
      )
        .then(response => {
          if (response.data) {
            const index = this.paginateData?.data?.findIndex(
              item =>
                item.unitId === this.selectedUnit.unitId,
            )

            if (index !== -1) {
              this.paginateData.data.splice(index, 1, {
                ...this.paginateData.data[index],
                ...this.dialog.form,
              })
            }

            showToast('Satuan produk berhasil diperbarui', 'success')
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
      await $productAPI<ApiResponse<Unit>>(`units/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          if (this.paginateData?.data) {
            this.paginateData.data
              = this.paginateData.data?.filter(
                item => item.unitId !== id,
              ) || []
          }
          showToast('Satuan produk berhasil dihapus', 'success')
        })
        .catch(err => {
          if (Object.keys(err.data?.errors || {}).length)
            displayErrorMessages(err.data.errors)
          else showToast(err.data?.message, 'error')
        })
        .finally(() => {
          this.isLoadingDelete = false
        })
    },

    async onDeleteItem(item: Unit) {
      confirmDialog
        .openDialog(`Satuan Produk "${item.name}"`)
        .then(isConfirmed => {
          if (isConfirmed)
            this.delete(item.unitId)
        })
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $productAPI<Blob>('/units/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Satuan Produk ${dayjs().format(
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
