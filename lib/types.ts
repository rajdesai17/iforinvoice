export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
export type DiscountType = 'percentage' | 'fixed'
export type ItemUnit = 'hour' | 'day' | 'item' | 'project'

export interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BusinessProfile {
  id: string
  userId: string
  businessName: string | null
  email: string | null
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  logoUrl: string | null
  taxId: string | null
  defaultCurrency: string
  defaultPaymentTerms: number
  invoicePrefix: string
  nextInvoiceNumber: number
  invoiceNotes: string | null
  invoiceFooter: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  userId: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  notes: string | null
  isArchived: boolean | null
  createdAt: Date
  updatedAt: Date
}

export interface Item {
  id: string
  userId: string
  name: string
  description: string | null
  rate: number | string
  unit: ItemUnit | null
  isTaxable: boolean | null
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  userId: string
  clientId: string
  invoiceNumber: string
  status: InvoiceStatus | null
  issueDate: Date
  dueDate: Date
  currency: string | null
  subtotal: number | string | null
  taxRate: number | string | null
  taxAmount: number | string | null
  discountType: DiscountType | null
  discountValue: number | string | null
  discountAmount: number | string | null
  total: number | string | null
  notes: string | null
  terms: string | null
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceLineItem {
  id: string
  invoiceId: string
  description: string
  quantity: number | string
  unitPrice: number | string | null
  amount: number | string | null
  sortOrder: number | null
  createdAt: Date
}

export interface InvoiceWithRelations extends Invoice {
  client: Client
  lineItems: InvoiceLineItem[]
}

export interface DashboardStats {
  totalRevenue: number
  outstanding: number
  invoicesSent: number
  overdueCount: number
}
