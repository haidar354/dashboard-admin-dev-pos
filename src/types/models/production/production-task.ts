export interface ProductionTaskInput {
  inputId: string
  itemSkuId: string
  itemSku?: {
    itemSkuId: string
    skuCode: string
    skuName: string
  }
  quantityPlanned: number
  quantityUsed?: number
  unit: string
}

export interface ProductionTaskOutput {
  outputId: string
  itemSkuId: string
  itemSku?: {
    itemSkuId: string
    skuCode: string
    skuName: string
  }
  quantityPlanned: number
  quantityProduced?: number
  quantityRejected?: number
  unit: string
  yieldPercentage?: number
}

export interface ProductionBom {
  productionBomId: string
  bomName: string
}

export interface AssignedUser {
  userId: string
  name: string
}

export interface SourceOrder {
  orderNumber: string
  tableNumber?: string
}

export interface ProductionTask {
  productionTaskId: string
  taskNumber: string
  sourceType: SourceType
  sourceId?: string
  orderLineId?: string
  taskType: TaskType
  station?: Station
  status: ProductionStatus
  priority: number
  productionBom?: ProductionBom
  productionBomId?: string
  inputs: ProductionTaskInput[]
  outputs: ProductionTaskOutput[]
  scheduledAt?: string
  queuedAt?: string
  startedAt?: string
  completedAt?: string
  assignedToUserId?: string
  assignedTo?: AssignedUser
  completedBy?: AssignedUser
  sourceOrder?: SourceOrder
  notes?: string
  createdAt: string
  updatedAt: string
}

export enum SourceType {
  STOCK = 'STOCK',
  POS_ORDER = 'POS_ORDER',
  SALES_ORDER = 'SALES_ORDER',
  MANUAL = 'MANUAL',
}

export enum TaskType {
  KITCHEN = 'KITCHEN',
  BAR = 'BAR',
  COFFEE = 'COFFEE',
  ASSEMBLY = 'ASSEMBLY',
  PREP = 'PREP',
  BULK = 'BULK',
  CUSTOM = 'CUSTOM',
}

export enum Station {
  KITCHEN = 'KITCHEN',
  BAR = 'BAR',
  COFFEE = 'COFFEE',
}

export enum ProductionStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateProductionTaskRequest {
  sourceType: SourceType
  sourceId?: string
  orderLineId?: string
  taskType: TaskType
  station?: Station
  productionBomId?: string
  useBomTemplate?: boolean
  quantityPlanned?: number
  inputs?: Array<{
    itemSkuId: string
    quantityPlanned: number
    unit: string
  }>
  outputs?: Array<{
    itemSkuId: string
    quantityPlanned: number
    unit: string
  }>
  priority?: number
  scheduledAt?: string
  assignedToUserId?: string
  notes?: string
}

export interface UpdateProgressRequest {
  quantityCompleted: number
  quantityRejected?: number
  notes?: string
}
