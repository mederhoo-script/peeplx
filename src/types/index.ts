// Enum string literal unions — previously imported from @prisma/client
export type UserRole = 'USER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED'
export type IdVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type EscrowStatus = 'PENDING' | 'FUNDED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'REFUNDED'
export type TransactionType = 'GOODS' | 'SERVICES' | 'DIGITAL' | 'OTHER'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentChannel = 'BANK_TRANSFER' | 'CARD' | 'USSD' | 'WALLET'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username?: string
  phone?: string
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  idVerificationStatus: IdVerificationStatus
  trustScore: number
  createdAt: Date
  updatedAt: Date
}

export interface Wallet {
  id: string
  userId: string
  availableBalance: number
  escrowLockedBalance: number
  pendingBalance: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface EscrowTransaction {
  id: string
  title: string
  description: string
  buyerId: string
  sellerId: string
  amount: number
  currency: string
  status: EscrowStatus
  transactionType: TransactionType
  deliveryDays?: number
  deliveryDeadline?: Date
  terms?: string
  fundedAt?: Date
  completedAt?: Date
  disputedAt?: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
  buyer?: User
  seller?: User
}

export interface Payment {
  id: string
  escrowId: string
  userId: string
  amount: number
  reference: string
  monnifyReference?: string
  status: PaymentStatus
  channel?: PaymentChannel
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface TrustScore {
  id: string
  userId: string
  score: number
  totalTransactions: number
  completedTransactions: number
  disputeCount: number
  cancelledCount: number
  emailVerified: boolean
  phoneVerified: boolean
  idVerified: boolean
  lastCalculatedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  readAt?: Date
  createdAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DashboardStats {
  activeEscrows: number
  completedEscrows: number
  walletBalance: number
  trustScore: number
  pendingPayments: number
  totalTransactions: number
}

export interface CreateEscrowInput {
  title: string
  description: string
  sellerId: string
  amount: number
  transactionType: TransactionType
  deliveryDays?: number
  terms?: string
}

export interface UpdateEscrowInput {
  status?: EscrowStatus
  deliveryDeadline?: Date
  terms?: string
}

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  username?: string
  phone?: string
}
