import type { Order } from './order'

export interface SalesOrderLine {
  orderLineId: string
  itemSkuId: string
  itemSku?: {
    itemSkuId: string
    skuCode: string
    skuName: string
  }
  quantity: number
  unitPrice: number
  discount?: number
  taxRate?: number
  lineTotal: number
  notes?: string
}

export interface SalesOrderCustomer {
  customerId: string
  customerName: string
  email?: string
  phone?: string
}

export interface SalesOrderDelivery {
  deliveryId: string
  deliveryDate: string
  deliveryAddress: string
  driverName?: string
  vehicleNumber?: string
  status: string
  lines: Array<{
    orderLineId: string
    quantityDelivered: number
  }>
}

export interface SalesOrderPayment {
  paymentId: string
  paymentDate: string
  paymentMethod: string
  amount: number
  referenceNumber?: string
  notes?: string
}

export interface SalesOrder {
  salesOrderId: string
  orderId: string // Base order ID (for API endpoints)
  quotationNumber?: string
  quotationDate?: string
  quotationValidUntil?: string
  quotationApprovedAt?: string
  quotationApprovedByUserId?: string
  quotationNotes?: string
  deliveryDate?: string
  deliveryAddress?: string
  deliveryNotes?: string
  deliveryContactName?: string
  deliveryContactPhone?: string
  deliveryInstructions?: string
  productionStatus?: ProductionStatus
  productionScheduledAt?: string
  productionStartedAt?: string
  productionCompletedAt?: string
  productionNotes?: string
  productionAssignedToUserId?: string
  paymentTerms?: string
  salesPersonUserId?: string
  customerPurchaseOrderNumber?: string
  createdByUserId?: string
  updatedByUserId?: string
  createdAt: string
  updatedAt: string

  // Nested order object from backend
  order?: Order

  // Computed/convenience properties for UI
  orderNumber?: string // Will be mapped from order.orderCode
  customerName?: string // Will be mapped from order.customerName
  customerPhone?: string // Will be mapped from order.customerPhone
  status?: string // Will be mapped from order.status
  paymentStatus?: string // Will be mapped from order.paymentStatus
  subtotal?: number // Will be mapped from order.subtotal
  grandTotal?: number // Will be mapped from order.grandTotal
  orderDate?: string // Will be mapped from order.openedAt or createdAt

  lines?: SalesOrderLine[]
  deliveries?: SalesOrderDelivery[]
  payments?: SalesOrderPayment[]
}

export enum SalesOrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY = 'READY',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProductionStatus {
  PENDING = 'PENDING',
  IN_PRODUCTION = 'IN_PRODUCTION',
  COMPLETED = 'COMPLETED',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  DELIVERED = 'DELIVERED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

export interface CreateSalesOrderRequest {
  salesChannelId?: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  orderDate: string
  deliveryDate?: string
  deliveryAddress?: string
  paymentMethod?: string
  paymentTerm?: string
  notes?: string
  lines: Array<{
    itemName: string
    itemSkuId: string
    skuCode?: string
    quantity: number
    unitPrice: number
    discount?: number
    taxRate?: number
    notes?: string
  }>
}
