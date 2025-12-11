import type { SalesChannel } from '@/types/models/sales/salesChannel'

export interface SalesQuotation {
  quotationId: string
  companyId: string
  businessUnitId: string
  quotationNumber: string
  quotationDate: string
  validUntil: string
  salesChannelId?: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  deliveryAddress?: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted' | 'expired' | 'void'
  outletId?: string
  notes?: string
  termsAndConditions?: string
  createdByUserId?: string
  updatedByUserId?: string
  createdAt: string
  updatedAt?: string

  // Relations
  items?: SalesQuotationItem[]
  customer?: any
  createdBy?: any
  outlet?: any
  salesChannel?: SalesChannel
}

export interface SalesQuotationItem {
  quotationItemId: string
  quotationId: string
  itemSkuId?: string
  productName: string
  productSku?: string
  quantity: number
  unit?: string
  price: number
  discount: number
  subtotal: number
  notes?: string

  // Relations
  itemSku?: any
}

export interface SalesQuotationForm {
  quotationNumber: string
  quotationDate: string
  validUntil: string
  outletId?: string
  salesChannelId?: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  taxAmount: number
  discountAmount: number
  notes?: string
  termsAndConditions?: string
  items: SalesQuotationItemForm[]
}

export interface SalesQuotationItemForm {
  itemSkuId?: string
  productName: string
  productSku?: string
  quantity: number
  unit?: string
  price: number
  discount: number
  notes?: string
}

export interface SalesQuotationFormErrors {
  quotationNumber?: string[]
  quotationDate?: string[]
  validUntil?: string[]
  outletId?: string[]
  customerName?: string[]
  items?: string[]
  [key: string]: string[] | undefined
}

export interface SalesQuotationQueryParams {
  page?: number
  perPage?: number
  search?: string
  orderField?: string
  orderDirection?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
  status?: string
}
