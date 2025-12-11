import dayjs from 'dayjs'
import { defineStore } from 'pinia'

import ModifierModel from '@/models/product/ModifierModel'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

import type { modifierAllowedSorts } from '@/constants/inventory/modifier'
import type {
  ApiPaginatedResponse,
  ApiResponse,
  PaginateData,
} from '@/types/api/response'
import type { ModifierGroupCreatePayload, ModifierGroupCreatePayloadErrors } from '@/types/models/product/item-modifier/modifier-create'
import type { ModifierGroup } from '@/types/models/product/item-modifier/modifier-group'
import type { ModifierQueryParams } from '@/types/models/product/item-modifier/modifier-resource-spec'
import type { ModifierGroupTableOptions } from '@/types/models/product/item-modifier/modifier-table'
import type { ModifierGroupUpdatePayload, ModifierGroupUpdatePayloadErrors } from '@/types/models/product/item-modifier/modifier-update'

const confirmDialog = useConfirmDialogStore()
export const useModifierStore = defineStore('modifierStore', {
  state: () => ({
    paginateData: {} as PaginateData<ModifierGroup>,
    selectedModifierGroup: {} as ModifierGroup,
    modifierGroup: {} as ModifierModel,
    selectedModifierGroupDetail: {} as ModifierGroup,
    data: [] as ModifierGroup[],
    isLoadingFetchData: false as boolean,
    isLoadingFetchDetail: false as boolean,
    isLoadingCreate: false as boolean,
    isLoadingUpdate: false as boolean,
    isLoadingDelete: false as boolean,
    isLoadingExport: false as boolean,
    isFilterVisible: false as boolean,
    isCreateDialogVisible: false as boolean,
    isUpdateDialogVisible: false as boolean,
    isDetailDialogVisible: false as boolean,
    requestQuery: {
      outletId: '',
      search: '',
      page: 1,
      perPage: 10,
      fields: [],
      include: [
      ],
      orderBy: [] as string[],
    } as ModifierQueryParams,
    createForm: {} as ModifierGroupCreatePayload,
    updateForm: {} as ModifierGroupUpdatePayload,
    createFormErrors: {} as ModifierGroupCreatePayloadErrors,
    updateFormErrors: {} as ModifierGroupUpdatePayloadErrors,
    additionalFilter: {
      type: '',
      itemCategoryId: '',
    },
  }),
  getters: {
    tableOptions(state): ModifierGroupTableOptions {
      return {
        page: state.requestQuery.page || 1,
        itemsPerPage: state.requestQuery.perPage || 10,
        sortBy: mapApiSortToVuetify<(typeof modifierAllowedSorts)[number][]>(state.requestQuery?.orderBy || []),
      }
    },
  },
  actions: {
    resetForm() {
      this.createForm = {} as ModifierGroupCreatePayload
      this.createFormErrors = {} as ModifierGroupCreatePayloadErrors
      this.updateForm = {} as ModifierGroupUpdatePayload
      this.updateFormErrors = {} as ModifierGroupUpdatePayloadErrors
    },
    openDialog(type: 'create' | 'update' | 'detail', item?: ModifierGroup) {
      this.resetForm()
      this.selectedModifierGroup = item || {} as ModifierGroup
      if (type === 'create')
        this.isCreateDialogVisible = true
      else if (type === 'update')
        this.isUpdateDialogVisible = true
      else if (type === 'detail')
        this.isDetailDialogVisible = true
    },
    closeDialog() {
      this.isCreateDialogVisible = false
      this.isUpdateDialogVisible = false
      this.isDetailDialogVisible = false
      this.resetForm()
    },
    async fetchPaginate(params?: ModifierQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await ModifierModel
          .include(requestQuery.include || [])
          .orderBy(requestQuery.orderBy || [])
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .when(requestQuery.outletId, (query, value) => query.where('itemOutlets.outletId', value))
          .paginate<ApiPaginatedResponse<ModifierGroup>>(requestQuery.page || 1, requestQuery.perPage || 10)

        this.paginateData = setPaginateData(response)
        console.log('fetchPaginate', response)
      }
      catch (error) {
        console.error('Error fetching paginated data:', error)
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchAllData(params?: ModifierQueryParams) {
      const requestQuery = { ...this.requestQuery, ...params }

      this.isLoadingFetchData = true
      try {
        const response = await new ModifierModel()
          .custom('/modifier-groups/all')
          .include(requestQuery.include || [])
          .orderBy(requestQuery.orderBy || [])
          .when(requestQuery.search, (query, value) => query.where('search', value))
          .when(requestQuery.outletId, (query, value) => query.where('itemOutlets.outletId', value))
          .get<ApiResponse<ModifierGroup[]>>()

        this.data = response.data
      }
      finally {
        this.isLoadingFetchData = false
      }
    },
    async fetchDetail(itemId: string, params?: ModifierQueryParams) {
      this.isLoadingFetchDetail = true
      try {
        this.modifierGroup = await new ModifierModel()
          .when(params?.include, (query, value) => {
            if (value && value.length > 0)
              query.include(value)
          })
          .when(params?.fields, (query, value) => {
            query.select(value)
          })
          .find(itemId)

        this.selectedModifierGroupDetail = this.modifierGroup.data

        return this.modifierGroup
      }
      finally {
        this.isLoadingFetchDetail = false
      }
    },
    async create() {
      this.isLoadingCreate = true

      try {
        const item = new ModifierModel()

        await item.config({ data: this.createForm }).save()
        showToast('Produk Ekstra berhasil ditambahkan', 'success')
        this.resetForm()
      }
      catch (err: any) {
        if (Object.keys(err.data.errors).length) {
          this.createFormErrors = err.data.errors as ModifierGroupCreatePayloadErrors
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
    async update() {
      this.isLoadingUpdate = true

      try {
        await ModifierModel.putById<ModifierGroup>(this.selectedModifierGroupDetail.modifierGroupId, this.updateForm)
        this.resetForm()
      }
      catch (err: any) {
        console.error('Error updating product modifier:', err)
        if (Object.keys(err.data.errors).length) {
          this.updateFormErrors = err.data.errors as ModifierGroupUpdatePayloadErrors
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
    async delete(itemId: string) {
      this.isLoadingUpdate = true

      try {
        await ModifierModel.deleteById<ModifierGroup>(itemId)
        if (this.paginateData.data?.length) {
          this.paginateData.data = this.paginateData.data.filter(
            item => item.modifierGroupId !== itemId,
          )
        }
        showToast('Produk Ekstra berhasil dihapus', 'success')
      }
      catch (err: any) {
        if (Object.keys(err.data.errors).length) {
          this.createFormErrors = err.data.errors as ModifierGroupCreatePayloadErrors
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

    async onDeleteItem(item: ModifierGroup): Promise<boolean> {
      const isConfirmed = await confirmDialog.openDialog(`Produk Ekstra "${item.name}"`)
      if (!isConfirmed)
        return false
      await this.delete(item.modifierGroupId)

      return true
    },
    async export() {
      try {
        this.isLoadingExport = true

        const response = await $productAPI<Blob>('/modifiers/export', {
          method: 'GET',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream',
          },
          query: this.requestQuery,
        })

        this.isLoadingExport = false

        const blob = response instanceof Blob ? response : new Blob([response])

        const filename = `Data Produk Ekstra ${dayjs().format('DD-MM-YYYY')}.xlsx`

        downloadBlob(blob, filename)
      }
      catch (error) {
        this.isLoadingExport = false
        console.error('Error exporting data:', error)
        showToast('Error exporting data', 'error')
        throw error
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
        type: '',
        itemCategoryId: '',
      }
      this.applyFilter()
    },
  },
})
