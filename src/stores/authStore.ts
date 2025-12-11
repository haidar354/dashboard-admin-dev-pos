import { defineStore } from 'pinia'

import type { ApiResponse } from '@/types/api/response'
import type { Role, User } from '@/types/models/user'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    isLogin: false as boolean,
    credentials: {
      token_type: '' as string,
      expires_in: '' as string,
      access_token: '' as string,
      refresh_token: '' as string,
    },
    abilities: [] as any[],
    adminAbilities: [] as any[],
    schoolModeAbilities: [] as any[],
    userData: {} as User, // Initialize userData as an empty object
    permissions: [] as string[],
    roles: [] as Role[],

    resetPasswordData: {
      email: '',
      createdAt: undefined as Date | undefined,
      countdown: 60,
      canResend: false,
    },
  }),

  getters: {
    getIsLogin: state => {
      return state.isLogin
    },
    getUser: state => {
      return state.userData
    },
    getPermissions: state => {
      return state.permissions
    },
  },

  actions: {
    async login(payload: any) {
      try {
        await $publicAPI<ApiResponse<any>>('auth/login', {
          method: 'POST',
          body: {
            email: payload.email,
            password: payload.password,
          },
        }).then(async (res: any) => {
          const { tokenType, expiresIn, accessToken, refreshToken } = res.data
          const { permissions, roles, ...userProfile } = res.data.user

          await this.setCredentials({
            token_type: tokenType,
            expires_in: expiresIn,
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          await this.setUser(userProfile)
          await this.setIsLogin(true)
          this.roles = roles
          this.setAbilities(permissions)

          return res
        })
      }
      catch (error: any) {
        showToast(
          error?.response?._data?.message || 'Terjadi Kesalahan',
          'error',
        )
        throw error
      }
    },
    async refreshToken() {
      try {
        await $rootAPI<ApiResponse<any>>('auth/refresh-token', {
          method: 'POST',
        }).then(async (res: any) => {
          const { tokenType, expiresIn, accessToken, refreshToken } = res.data

          await this.setCredentials({
            token_type: tokenType,
            expires_in: expiresIn,
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          await this.setUser(res.data.user)
          this.setAbilities(res.data.permissions)

          return res
        })
      }
      catch (error: any) {
        showToast(
          error?.response?._data?.message || 'Terjadi Kesalahan',
          'error',
        )
        throw error
      }
    },
    async register(payload: any) {
      try {
        await $publicAPI<ApiResponse<any>>('auth/register', {
          method: 'POST',
          body: {
            name: payload.name,
            email: payload.email,
            password: payload.password,
            password_confirmation: payload.passwordConfirmation,
          },
        }).then(async (res: any) => {
          const { tokenType, expiresIn, accessToken, refreshToken } = res.data

          await this.setCredentials({
            token_type: tokenType,
            expires_in: expiresIn,
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          await this.setUser(res.data.user)
          this.setAbilities(res.data.permissions)

          return res
        })
      }
      catch (error: any) {
        showToast(
          error?.response?._data?.message || 'Terjadi Kesalahan',
          'error',
        )
        throw error
      }
    },

    async resendCode(email: string) {
      return await $publicAPI<ApiResponse<any>>(
        'auth/request-new-verify-email',
        {
          method: 'POST',
          body: { email },
        },
      )
        .then((res: any) => {
          showToast(
            res.data.message || 'Berhasil mengirimkan kode verifikasi',
            'success',
          )

          return res
        })
        .catch((error: any) => {
          showToast(
            error?.response?._data?.message || 'Terjadi Kesalahan',
            'error',
          )
          throw error
        })
    },

    async verifyEmail(email: string, token: string) {
      return await $publicAPI<ApiResponse<any>>('auth/verify-email', {
        method: 'POST',
        body: { email, token },
      })
        .then((res: any) => {
          return res
        })
        .catch((error: any) => {
          showToast(
            error?.response?._data?.message || 'Terjadi Kesalahan',
            'error',
          )
          throw error
        })
    },

    async getMe() {
      return await $publicAPI<ApiResponse<User>>(
        `auth/me?module_id=${import.meta.env.VITE_APPS_MODULE_ID}`,
        {
          method: 'GET',
        },
      )
    },

    async setIsLogin(isLogin: boolean) {
      await Promise.all([(this.isLogin = isLogin)])
    },

    async setCredentials(credentials: any) {
      await Promise.all([(this.credentials = credentials)])
    },

    async setUser(user: User) {
      await Promise.all([(this.userData = user)])
    },

    async setAbilities(permissions: any[]) {
      const abilities: any
        = permissions?.map((permission: any) => ({
          action: 'manage',
          subject: permission,
        })) || []

      abilities.push({
        action: 'manage',
        subject: 'default',
      })

      await Promise.all([(this.abilities = abilities)])
    },

    unsetCredentials() {
      this.credentials = {
        token_type: '',
        expires_in: '',
        access_token: '',
        refresh_token: '',
      }
    },

    async unsetAbilities() {
      await Promise.all([
        (this.abilities = []),
        (this.adminAbilities = []),
        (this.schoolModeAbilities = []),
      ])
    },

    async setBusinessUnitId(businessUnitId: string) {
      this.userData.businessUnitId = businessUnitId
    },

    async requestResetPassword(email: string) {
      return new Promise((resolve, reject) => {
        $publicAPI<ApiResponse<any>>('auth/request-reset-password', {
          method: 'POST',
          body: {
            email,
          },
        })
          .then(response => {
            this.resetPasswordData.canResend = false
            this.resetPasswordData.createdAt = new Date()
            this.resetPasswordData.countdown = 60
            this.startCountdown()
            resolve(response)
          })
          .catch(reject)
      })
    },

    startCountdown() {
      this.resetPasswordData.canResend = false

      const interval = setInterval(() => {
        if (this.resetPasswordData.countdown > 0) {
          this.resetPasswordData.countdown-- // Decrement the countdown value by 1 second
        }
        else {
          this.resetPasswordData.countdown = 0
          this.resetPasswordData.canResend = true
          clearInterval(interval) // Stop the countdown when it reaches 0
        }
      }, 1000)
    },

    async resetPassword(payload: any) {
      return new Promise((resolve, reject) => {
        $publicAPI<ApiResponse<any>>('auth/reset-password', {
          method: 'POST',
          body: payload,
        })
          .then(resolve)
          .catch(reject)
      })
    },

    async logout() {
      await $rootAPI('auth/logout', {
        method: 'POST',
        ignoreResponseError: true,
      })
      await Promise.all([
        (this.isLogin = false),
        (this.userData = {} as User),
        (this.roles = []),
        (this.permissions = []),
        this.unsetCredentials(),
        this.unsetAbilities(),
      ])
    },
  },
  persist: true,
})
