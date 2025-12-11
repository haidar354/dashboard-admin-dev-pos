import type { Order } from './order'
import type { OrderLine } from './order-line'

export interface DeliveryOrderLine {
  deliveryLineId: string
  deliveryId: string
  orderLineId: string
  quantityDelivered: number
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  orderLine?: OrderLine
}

export interface DeliveryOrder {
  deliveryId: string
  orderId: string
  deliveryNumber: string
  status: 'PENDING' | 'PACKING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'FAILED' | 'RETURNED' | 'CANCELLED'
  recipientName?: string
  recipientPhone?: string
  recipientAddress?: string
  courierName?: string
  courierService?: string
  trackingNumber?: string
  shippingCost: number
  shippingWeightKg: number
  shippedAt?: string
  deliveredAt?: string
  failedAt?: string
  notes?: string
  createdByUserId?: string
  updatedByUserId?: string
  createdAt: string
  updatedAt: string

  // Relations
  order?: Order
  lines?: DeliveryOrderLine[]
}
