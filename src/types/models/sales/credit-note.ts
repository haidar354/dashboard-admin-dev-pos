import type { User } from '../user'
import type { Customer } from './customer'
import type { Invoice } from './invoice'

export interface CreditNote {
  creditNoteId: string
  creditNoteNumber: string
  creditNoteDate: string
  invoiceId?: string | null
  returnId?: string | null
  customerId: string
  amount: number
  usedAmount: number
  reason?: string | null
  status: CreditNoteStatus
  outletId?: string | null
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string

  // Relations
  customer?: Customer
  invoice?: Invoice
  createdBy?: User
}

export enum CreditNoteStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  USED = 'USED',
  VOID = 'VOID',
}

export interface CreateCreditNoteRequest {
  creditNoteNumber?: string
  creditNoteDate: string
  invoiceId?: string
  returnId?: string
  customerId: string
  amount: number
  reason?: string
  status?: CreditNoteStatus
}

export interface UpdateCreditNoteRequest extends Partial<CreateCreditNoteRequest> {}
