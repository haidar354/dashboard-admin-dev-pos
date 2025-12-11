import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  SalesDashboardByOutlet,
  SalesDashboardFilters,
  SalesDashboardHeatmap,
  SalesDashboardResponse,
  SalesDashboardSummary,
  SalesDashboardTopProduct,
  SalesDashboardTrend,
} from '@/types/models/sales/dashboard/dashboard'
import type { ApiResponse } from '@/types/api/response'

export const useDashboardStore = defineStore('sales-dashboard', () => {
  // =====================================================
  // 🧭 State
  // =====================================================
  const data = ref<SalesDashboardResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<SalesDashboardFilters>({
    from: dayjs().format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
    outletId: null,
    salesChannelId: null,
    groupBy: 'today',
  })

  // =====================================================
  // 📊 Computed / Getters
  // =====================================================
  const summary = computed<SalesDashboardSummary>(() => ({
    grossSales: data.value?.summary.grossSales ?? 0,
    netSales: data.value?.summary.netSales ?? 0,
    cogsTotal: data.value?.summary.cogsTotal ?? 0,
    grossProfit: data.value?.summary.grossProfit ?? 0,
    marginPct: data.value?.summary.marginPct ?? 0,
    orderCount: data.value?.summary.orderCount ?? 0,
    avgTicket: data.value?.summary.avgTicket ?? 0,
    itemsPerOrder: data.value?.summary.itemsPerOrder ?? 0,
    refundRate: data.value?.summary.refundRate ?? 0,
  }))

  const trend = computed<SalesDashboardTrend[]>(() => data.value?.trend ?? [])
  const topProducts = computed<SalesDashboardTopProduct[]>(() => data.value?.topProducts ?? [])
  const byOutlet = computed<SalesDashboardByOutlet[]>(() => data.value?.byOutlet ?? [])
  const heatmap = computed<SalesDashboardHeatmap[]>(() => data.value?.heatmap ?? [])
  const hasData = computed(() => !!data.value)

  // =====================================================
  // ⚙️ Actions
  // =====================================================
  async function fetchDashboard() {
    isLoading.value = true
    error.value = null

    try {
      const { data: resp } = await $salesAPI<ApiResponse<SalesDashboardResponse>>('/dashboard', {
        params: filters.value,
      })

      // Hati-hati: beberapa backend wrapper kirim data di `resp.data`
      data.value = resp
    }
    catch (err: any) {
      console.error('❌ Dashboard fetch failed', err)
      error.value = err?.response?.data?.message ?? 'Gagal memuat data dashboard'
    }
    finally {
      isLoading.value = false
    }
  }

  function resetFilters() {
    filters.value = {
      from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD'),
      outletId: null,
      salesChannelId: null,
      groupBy: 'day',
    }
  }

  // =====================================================
  // 🧩 Expose
  // =====================================================
  return {
    // State
    data,
    isLoading,
    error,
    filters,

    // Computed
    summary,
    trend,
    topProducts,
    byOutlet,
    heatmap,
    hasData,

    // Actions
    fetchDashboard,
    resetFilters,
  }
})
