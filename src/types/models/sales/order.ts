import type { DeliveryOrder } from './delivery-order'
import type { OrderLine } from './order-line'
import type { OrderPayment } from './order-payment'
import type { Outlet } from '@/types/models/outlet'
import type { Customer } from '@/types/models/sales/customer'
import type { SalesOrder } from '@/types/models/sales/sales-order'
import type { SalesChannel } from '@/types/models/sales/salesChannel'

export type { OrderLine }

// --- Base Order (summary) ---
export interface Order {
  orderId: string
  outletId: string
  orderType: string
  orderCode: string
  salesChannelId?: string
  status: string
  isHold: boolean
  customerName: string | null
  customerPhone: string | null
  grandTotal: number
  paidTotal: number
  changeDue: number
  updatedAt: string
  createdAt: string
  paidAt: string | null
  openedAt?: string | null

  // Statuses
  paymentStatus: string
  fulfillmentStatus: string

  // Totals
  subtotal?: number
  discountTotal?: number
  taxTotal?: number
  serviceChargeTotal?: number

  notes?: string | null

  customerId?: string | null
  voidedAt?: string | null
  refundedAt?: string | null

  lines?: OrderLine[]
  payments?: OrderPayment[]

  customer?: Customer

  outlet?: Outlet

  salesChannel?: SalesChannel

  salesOrder?: SalesOrder

  createdByUser?: {
    userId: string
    name: string
  } | null

  paidByUser?: {
    userId: string
    name: string
  } | null

  deliveries?: DeliveryOrder[]
}
