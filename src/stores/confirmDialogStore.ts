import { defineStore } from 'pinia'

export const useConfirmDialogStore = defineStore('confirmDialogStore', {
  state: () => ({
    isDialogVisible: false,
    isLoading: false,
    title: 'Apakah Anda Yakin?' as string | undefined,
    subtitle: 'Setelah Anda menghapus, Data ini tidak dapat diakses kembali' as
      | string
      | undefined,
    content: '' as string | undefined,
    icon: 'tabler-question-circle' as string | undefined,
    resolveFn: null as ((value: boolean) => void) | null, // Define the type of resolveFn

    // Generic Dialog State
    isGenericDialogVisible: false,
    genericTitle: 'Konfirmasi',
    genericContent: '',
    genericConfirmText: 'Ya',
    genericCancelText: 'Batal',
    genericColor: 'primary',
    genericIcon: 'tabler-info-circle',
    genericResolveFn: null as ((value: boolean) => void) | null,
  }),
  actions: {
    openDialog(content?: string, icon?: string) {
      this.content = content
      if (icon)
        this.icon = icon

      this.isDialogVisible = true

      return new Promise(resolve => {
        this.resolveFn = resolve // Assign resolve function to resolveFn
      })
    },
    close(isConfirmed: boolean) {
      this.isDialogVisible = false
      if (this.resolveFn) {
        this.resolveFn(isConfirmed) // Call the resolve function
        this.resolveFn = null
      }
    },

    openGenericDialog(
      content: string,
      options: {
        title?: string
        confirmText?: string
        cancelText?: string
        color?: string
        icon?: string
      } = {},
    ) {
      this.genericContent = content
      this.genericTitle = options.title || 'Konfirmasi'
      this.genericConfirmText = options.confirmText || 'Ya'
      this.genericCancelText = options.cancelText || 'Batal'
      this.genericColor = options.color || 'primary'
      this.genericIcon = options.icon || 'tabler-info-circle'

      this.isGenericDialogVisible = true

      return new Promise(resolve => {
        this.genericResolveFn = resolve
      })
    },

    closeGeneric(isConfirmed: boolean) {
      this.isGenericDialogVisible = false
      if (this.genericResolveFn) {
        this.genericResolveFn(isConfirmed)
        this.genericResolveFn = null
      }
    },
  },
})
