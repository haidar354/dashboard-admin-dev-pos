export interface StockCountLine {
  stockCountLineId: string
  stockCountId: string
  itemSkuId: string
  systemQty: number
  countedQty: number
  difference: number
  notes?: string
  createdAt?: string
  updatedAt?: string

  // Relations
  itemSku?: {
    itemSkuId: string
    code: string
    itemName: string // Assuming from relation or flat
    displayName?: string
    // Add other SKU fields as needed
  }
}

export interface StockCount {
  stockCountId: string
  companyId: string
  businessUnitId: string
  outletId: string
  reference: string
  status: 'OPEN' | 'COMPLETED' | 'CANCELLED' // Adjust enums as needed
  countedAt: string
  createdBy: string
  finalizedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  lines?: StockCountLine[]
  outlet?: {
    outletId: string
    name: string
  }
  createdByUser?: {
    id: string
    name: string
  }
}

export interface CreateStockCountRequest {
  outletId: string
  notes?: string
}

export interface UpdateStockCountRequest {
  lines: Array<{
    stockCountLineId: string
    countedQty: number
    notes?: string
  }>
}
