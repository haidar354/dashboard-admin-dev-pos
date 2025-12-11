export interface SalesChannel {
  salesChannelId: string
  code: string
  name: string
  type: 'POS' | 'MARKETPLACE' | 'WHOLESALE' | 'ONLINE' | 'QR' | 'KIOSK' | string
  fulfillment: string
  vendor?: string | null
  isActive: boolean
  description?: string
}
