import type { User } from '../user'
import type { Order } from './order'

export interface OrderReturnLine {
  returnLineId: string
  returnId: string
  orderLineId: string
  quantityReturned: number
  quantityRestockable: number
  quantityDamaged: number
  condition: 'GOOD' | 'DAMAGED' | 'OPENED' | 'EXPIRED'
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  orderReturn?: OrderReturn
  orderLine?: any // From Order.lines
}

export interface OrderReturn {
  returnId: string
  orderId: string
  returnNumber: string
  status: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'INSPECTED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  reason: 'DAMAGED' | 'WRONG_ITEM' | 'EXPIRED' | 'CUSTOMER_REQUEST' | 'OTHER'
  refundAmount: number
  refundStatus: 'PENDING' | 'PROCESSED' | 'COMPLETED' | 'FAILED'
  notes?: string
  createdByUserId?: string
  updatedByUserId?: string
  approvedByUserId?: string
  createdAt: string
  updatedAt: string
  approvedAt?: string
  completedAt?: string

  // Relations
  order?: Order
  lines?: OrderReturnLine[]
  createdByUser?: User
  updatedByUser?: User
  approvedByUser?: User
}

export interface CreateReturnRequest {
  returnNumber?: string // Optional, auto-generate if empty
  reason: 'DAMAGED' | 'WRONG_ITEM' | 'EXPIRED' | 'CUSTOMER_REQUEST' | 'OTHER'
  refundAmount?: number
  notes?: string
  lines: Array<{
    orderLineId: string
    quantityReturned: number
    quantityRestockable: number
    quantityDamaged: number
    condition: 'GOOD' | 'DAMAGED' | 'OPENED' | 'EXPIRED'
    notes?: string
  }>
}

export interface UpdateReturnRequest {
  reason?: 'DAMAGED' | 'WRONG_ITEM' | 'EXPIRED' | 'CUSTOMER_REQUEST' | 'OTHER'
  refundAmount?: number
  notes?: string
  lines?: Array<{
    returnLineId: string
    quantityReturned: number
    quantityRestockable: number
    quantityDamaged: number
    condition: 'GOOD' | 'DAMAGED' | 'OPENED' | 'EXPIRED'
    notes?: string
  }>
}

export interface ApproveReturnRequest {
  notes?: string
}

export interface RejectReturnRequest {
  reason: string
  notes?: string
}

export interface CompleteReturnRequest {
  notes?: string
}
