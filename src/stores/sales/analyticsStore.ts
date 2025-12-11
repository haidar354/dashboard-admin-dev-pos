import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAnalyticsStore = defineStore('salesAnalytics', () => {
  const isLoading = ref(false)
  const analyticsData = ref<any>(null)

  const dateRange = ref({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().substr(0, 10),
    to: new Date().toISOString().substr(0, 10),
  })

  const fetchAnalytics = async () => {
    isLoading.value = true
    try {
      const response = await $salesAPI('/analytics', {
        params: {
          date_from: dateRange.value.from,
          date_to: dateRange.value.to,
          compare_with_previous: true,
        },
      })

      analyticsData.value = response
    }
    catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    analyticsData,
    dateRange,
    fetchAnalytics,
  }
})
