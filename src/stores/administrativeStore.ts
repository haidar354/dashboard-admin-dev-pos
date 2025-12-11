import { defineStore } from 'pinia'

import type { RequestQuery } from '@/types/api/request'
import type { ApiResponse } from '@/types/api/response'
import type { City, District, Province, Village } from '@/types/models/administrative'

export const useAdministrativeStore = defineStore('administrativeStore', {
  state: () => ({
    provinces: [] as Province[],
    cities: [] as City[],
    districts: [] as District[],
    villages: [] as Village[],
    selectedProvince: {} as Province,
    isLoadingFetchProvinces: false as boolean,
    isLoadingFetchCities: false as boolean,
    isLoadingFetchDistricts: false as boolean,
    isLoadingFetchVillages: false as boolean,
  }),
  actions: {
    async fetchProvince(params: RequestQuery = {}) {
      this.isLoadingFetchProvinces = true
      await $publicAPI<ApiResponse<Province[]>>('public/administrative/provinces', {
        method: 'GET',
        params,
      })
        .then(response => {
          this.provinces = response.data || []
          this.isLoadingFetchProvinces = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')

          this.isLoadingFetchProvinces = false
        })
    },
    async fetchCity(provinceCode: string, params: RequestQuery = {}) {
      this.isLoadingFetchCities = true
      await $publicAPI<ApiResponse<City[]>>(`public/administrative/provinces/${provinceCode}/cities`, {
        method: 'GET',
        params,
      })
        .then(response => {
          this.cities = response.data || []
          this.isLoadingFetchCities = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')

          this.isLoadingFetchCities = false
        })
    },
    async fetchDistrict(cityCode: string, params: RequestQuery = {}) {
      this.isLoadingFetchDistricts = true
      await $publicAPI<ApiResponse<District[]>>(`public/administrative/cities/${cityCode}/districts`, {
        method: 'GET',
        params,
      })
        .then(response => {
          this.districts = response.data || []
          this.isLoadingFetchDistricts = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')

          this.isLoadingFetchDistricts = false
        })
    },
    async fetchVillage(districtCode: string, params: RequestQuery) {
      this.isLoadingFetchVillages = true
      await $publicAPI<ApiResponse<Village[]>>(`public/administrative/districts/${districtCode}/villages`, {
        method: 'GET',
        params,
      })
        .then(response => {
          this.villages = response.data || []
          this.isLoadingFetchVillages = false
        })
        .catch(err => {
          if (Object.keys(err.data.errors).length)
            displayErrorMessages(err.data.errors)
          else
            showToast(err.data?.message, 'error')

          this.isLoadingFetchVillages = false
        })
    },
  },
})
