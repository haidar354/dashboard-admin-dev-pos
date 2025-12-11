export interface BomInput {
  bomInputId: string
  itemSkuId: string
  itemSku?: {
    itemSkuId: string
    skuCode: string
    skuName: string
    currentStock?: number
  }
  quantity: number
  unit: string
  unitCost?: number
  totalCost?: number
  wasteFactor?: number
  isOptional: boolean
  sortOrder: number
  notes?: string
}

export interface BomOutput {
  bomOutputId: string
  itemSkuId: string
  itemSku?: {
    itemSkuId: string
    skuCode: string
    skuName: string
  }
  quantity: number
  unit: string
  yieldPercentage?: number
  unitCost?: number
  totalCost?: number
  sortOrder: number
  notes?: string
}

export interface ProductionBom {
  productionBomId: string
  bomCode: string
  bomName: string
  description?: string
  baseQuantity: number
  baseUnit: string
  productionType: ProductionType
  expectedYield?: number
  expectedWaste?: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  totalTimeMinutes?: number
  totalInputCost?: number
  totalOutputCost?: number
  isActive: boolean
  version: number
  effectiveFrom?: string
  effectiveTo?: string
  inputs: BomInput[]
  outputs: BomOutput[]
  createdBy?: {
    userId: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export enum ProductionType {
  COOKING = 'COOKING',
  ASSEMBLY = 'ASSEMBLY',
  PROCESSING = 'PROCESSING',
  PACKAGING = 'PACKAGING',
  DISASSEMBLY = 'DISASSEMBLY',
}

export interface CreateProductionBomRequest {
  bomCode: string
  bomName: string
  description?: string
  baseQuantity: number
  baseUnit: string
  productionType: ProductionType
  expectedYield?: number
  expectedWaste?: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  isActive: boolean
  effectiveFrom?: string
  inputs: Array<{
    itemSkuId: string
    quantity: number
    unit: string
    unitCost?: number
    wasteFactor?: number
    isOptional: boolean
    sortOrder: number
    notes?: string
  }>
  outputs: Array<{
    itemSkuId: string
    quantity: number
    unit: string
    yieldPercentage?: number
    sortOrder: number
    notes?: string
  }>
  notes?: string
}

export interface UpdateProductionBomRequest extends CreateProductionBomRequest {}

export interface CalculateBomCostRequest {
  quantity: number
}

export interface CalculateBomCostResponse {
  quantity: number
  baseQuantity: number
  multiplier: number
  totalInputCost: number
  costPerUnit: number
  inputs: Array<{
    itemSku: {
      skuName: string
    }
    quantityNeeded: number
    unit: string
    totalCost: number
  }>
}
