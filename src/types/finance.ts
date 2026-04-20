export type AccountType = 'CASH' | 'DEBIT' | 'CREDIT_CARD' | 'CREDIT_LOAN'
export type Direction = 'IN' | 'OUT'
export type Category =
  | 'SALARY'
  | 'DIVIDEND'
  | 'INTEREST'
  | 'LOAN_PAYMENT'
  | 'CARD_PAYMENT'
  | 'LOAN_ISSUED'
  | 'LOAN_RECEIVED'
  | 'TRANSFER'
  | 'OTHER'
export type LoanStatus = 'ACTIVE' | 'PAID' | 'OVERDUE'
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE'
export type AssetType = 'SECURITIES' | 'PRECIOUS_METALS' | 'REAL_ESTATE' | 'VEHICLE' | 'OTHER'
export type Liquidity = 'HIGH' | 'MEDIUM' | 'LOW'
export type Granularity = 'MONTH' | 'DAY'
export type Frequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface RecurrenceRule {
  frequency: Frequency
  interval?: number
  dayOfMonth?: number
  daysOfWeek?: DayOfWeek[]
  weekOfMonth?: number
  dayOfWeek?: DayOfWeek
  monthOfYear?: number
  maxOccurrences?: number
}

export interface AccountResponse {
  id: string
  name: string
  type: AccountType
  currency: string
  balance: number
  creditLimit: number | null
  interestRate: number | null
  minPayment: number | null
  isActive: boolean
  createdAt: string
}

export interface TransactionResponse {
  id: string
  accountId: string
  amount: number
  direction: Direction
  category: Category
  scheduledOperationId: string | null
  description: string | null
  date: string
  createdAt: string
}

export interface ScheduledOperationResponse {
  id: string
  accountId: string
  name: string
  category: Category
  amount: number
  direction: Direction
  recurrence: RecurrenceRule
  startDate: string
  endDate: string | null
  nextOccurrence: string
  occurrencesCount: number
  isActive: boolean
}

export interface UpcomingOperationResponse {
  operationId: string
  name: string
  accountId: string
  category: Category
  amount: number
  direction: Direction
  date: string
}

export interface GridColumn {
  key: string
  type: Granularity
  year: number
  month: number | null
  day: number | null
  label: string
}

export interface GridCell {
  plan: number
  actual: number
}

export interface GridCategoryRow {
  type: 'CATEGORY'
  category: Category
  direction: Direction
  cells: Record<string, GridCell>
}

export interface GridAccountRow {
  type: 'ACCOUNT'
  accountId: string
  name: string
  currency: string
  cells: Record<string, GridCell>
  children: GridCategoryRow[]
}

export interface GridResponse {
  columns: GridColumn[]
  rows: GridAccountRow[]
}

export interface LoanPayment {
  id: string
  amount: number
  dueDate: string
  paidDate: string | null
  paidAmount: number | null
  status: PaymentStatus
}

export interface IssuedLoanResponse {
  id: string
  debtorName: string
  principal: number
  interestRate: number
  currency: string
  issueDate: string
  dueDate: string
  status: LoanStatus
  notes: string | null
  createdAt: string
  payments: LoanPayment[]
}

export interface AssetResponse {
  id: string
  name: string
  type: AssetType
  currentValue: number
  currency: string
  liquidity: Liquidity
  acquiredAt: string | null
  notes: string | null
  createdAt: string
}

export interface FinanceSummary {
  netWorth: number
  cash: { total: number }
  debt: { total: number; creditCards: number; loans: number }
  issuedLoans: { total: number; overdue: number }
  liquidAssets: {
    total: number
    byLiquidity: { high: number; medium: number; low: number }
  }
  upcoming30Days: { income: number; expenses: number; net: number }
}

export interface FinanceApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}
