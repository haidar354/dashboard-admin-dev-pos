import type { Invoice } from './invoice'

export interface OrderPayment {
  paymentId: string
  paymentCode?: string
  invoiceId?: string
  amount: number
  paymentMethod: string
  paymentDate?: string
  referenceNo?: string
  referenceNumber?: string
  notes?: string
  createdAt: string
  updatedAt?: string
  isVoided?: boolean
  voidedAt?: string
  voidReason?: string
  refundStatus?: 'NORMAL' | 'PARTIALLY_REFUNDED' | 'FULLY_REFUNDED'
  invoice?: Invoice & {
    order?: {
      orderCode: string
      salesOrder?: {
        salesOrderId: string
      }
    }
  }
  createdByUser?: {
    userId: string
    name: string
  }
  receivedByUser?: {
    userId: string
    name: string
  }
}
