import type { User } from '../user'
import type { Order } from './order'
import type { SalesOrder } from './sales-order'

export interface InvoiceLine {
  invoiceLineId: string
  invoiceId: string
  orderLineId?: string // Optional, null jika standalone invoice
  itemSkuId?: string
  itemName: string
  itemSku?: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  lineTotal: number
  notes?: string
  createdAt: string
  updatedAt: string

  invoice?: Invoice
}

export interface Invoice {
  invoiceId: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string

  // References (optional for flexibility)
  orderId?: string // Reference to Order if from SO
  salesOrderId?: string // Reference to SalesOrder if from SO

  // Customer info (required for standalone)
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string

  // Amounts
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  paidAmount: number
  dueAmount: number

  // Status & Type
  status: 'DRAFT' | 'SENT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'VOID'
  type: 'FULL' | 'DOWN_PAYMENT' | 'TERMIN' | 'FINAL' | 'STANDALONE'

  // Payment terms
  paymentTerms?: string
  paymentMethod?: string

  // Notes
  notes?: string
  internalNotes?: string

  // Metadata
  createdByUserId?: string
  updatedByUserId?: string
  sentAt?: string
  paidAt?: string
  voidedAt?: string
  createdAt: string
  updatedAt: string

  // Relations
  order?: Order
  salesOrder?: SalesOrder
  lines?: InvoiceLine[]
  payments?: InvoicePayment[]
  refunds?: InvoiceRefund[]
}

export interface CreateInvoiceRequest {
  invoiceNumber?: string // Optional, auto-generate if empty
  invoiceDate: string
  dueDate: string

  // Source reference (one of these, or none for standalone)
  salesOrderId?: string // From Sales Order

  // Customer (required if standalone, auto-filled if from SO)
  customerId?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string

  // Type
  type: 'FULL' | 'DOWN_PAYMENT' | 'TERMIN' | 'FINAL' | 'STANDALONE'

  // Items (required)
  lines: Array<{
    orderLineId?: string // If from SO, reference to order line
    itemSkuId?: string // If standalone
    itemName: string
    itemSku?: string
    quantity: number
    unitPrice: number
    discount?: number
    taxRate?: number
    notes?: string
  }>

  // Payment
  paymentTerms?: string
  paymentMethod?: string

  // Notes
  notes?: string
  internalNotes?: string
}

export interface UpdateInvoiceRequest {
  invoiceDate?: string
  dueDate?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  paymentTerms?: string
  notes?: string
  internalNotes?: string

  lines?: Array<{
    invoiceLineId?: string // If updating existing line
    orderLineId?: string
    itemSkuId?: string
    itemName: string
    itemSku?: string
    quantity: number
    unitPrice: number
    discount?: number
    taxRate?: number
    notes?: string
  }>
}

// Payment Recording
export interface InvoicePayment {
  paymentId: string
  paymentCode: string
  invoiceId: string
  paymentDate: string
  amount: number
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'QRIS' | 'E_WALLET' | 'CHECK' | 'OTHER'
  referenceNumber?: string
  bankName?: string
  accountNumber?: string
  notes?: string
  createdByUserId?: string
  isVoided?: boolean
  voidedAt?: string
  voidReason?: string
  voidedByUserId?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceRefund {
  refundId: string
  refundCode: string
  invoiceId: string
  paymentId: string
  amount: number
  status: 'DRAFT' | 'OPEN' | 'COMPLETED' | 'CANCELLED'
  refundDate: string
  refundMethod: string
  referenceNumber?: string
  reason: string
  createdByUserId?: string
  createdAt: string
  updatedAt: string

  invoice?: Invoice
  createdByUser?: User
}

export interface RecordPaymentRequest {
  invoiceId: string
  paymentDate: string
  amount: number
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'QRIS' | 'E_WALLET' | 'CHECK' | 'OTHER'
  referenceNumber?: string
  bankName?: string
  accountNumber?: string
  notes?: string
}

// Email Sending
export interface SendInvoiceEmailRequest {
  invoiceId: string
  to: string[] // Email addresses
  cc?: string[]
  bcc?: string[]
  subject?: string // Optional, use default if not provided
  message?: string // Optional custom message
  attachPdf?: boolean // Default true
}

// Void Invoice
export interface VoidInvoiceRequest {
  invoiceId: string
  reason: string
  voidDate?: string // Default to current date
}

// Print Options
export interface PrintInvoiceOptions {
  format: 'A4' | 'DOT_MATRIX' | 'THERMAL'
  copies?: number
  includeHeader?: boolean
  includeFooter?: boolean
  showPaymentInfo?: boolean
}
