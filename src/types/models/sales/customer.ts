// Customer Types & Enums
export interface Customer {
  customerId: string
  businessUnitId: string
  outletId?: string | null
  name: string
  phone?: string | null
  email?: string | null
  photo?: string | null
  photoUrl?: string | null
  address?: string | null
  provinceCode?: string | null
  cityCode?: string | null
  districtCode?: string | null
  villageCode?: string | null
  postalCode?: string | null
  taxId?: string | null
  gender?: 'male' | 'female' | null
  birthday?: string | null
  isMember: boolean
  customerType: CustomerType
  paymentTerms: PaymentTerms
  creditLimit: number
  totalSpending: number
  createdAt: string
  updatedAt: string

  // Relations
  province?: { code: string; name: string } | null
  city?: { code: string; name: string } | null
  district?: { code: string; name: string } | null
  village?: { code: string; name: string } | null
}

export enum CustomerType {
  RETAIL = 'RETAIL',
  RESELLER = 'RESELLER',
  WHOLESALE = 'WHOLESALE',
  VIP = 'VIP',
  CORPORATE = 'CORPORATE',
}

export enum PaymentTerms {
  COD = 'COD',
  NET_7 = 'NET_7',
  NET_14 = 'NET_14',
  NET_30 = 'NET_30',
  NET_60 = 'NET_60',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface CreateCustomerRequest {
  name: string
  phone?: string
  email?: string
  photo?: File | null
  address?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  villageCode?: string
  postalCode?: string
  taxId?: string
  gender?: 'male' | 'female'
  birthday?: string
  isMember?: boolean
  customerType?: CustomerType
  paymentTerms?: PaymentTerms
  creditLimit?: number
  outletId?: string
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}
