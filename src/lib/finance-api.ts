import type {
  FinanceApiResponse,
  AccountResponse,
  TransactionResponse,
  ScheduledOperationResponse,
  UpcomingOperationResponse,
  GridResponse,
  IssuedLoanResponse,
  LoanPayment,
  AssetResponse,
  FinanceSummary,
  AccountType,
  Direction,
  Category,
  Granularity,
  RecurrenceRule,
  Liquidity,
  AssetType,
} from '@/types/finance'

const BASE = '/api/proxy/api/v1/finance'

async function req<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<FinanceApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    ...init,
  })
  if (res.status === 204) return { success: true }
  return res.json()
}

// Summary
export function apiGetSummary(token: string) {
  return req<FinanceSummary>(token, '/summary')
}

// Accounts
export function apiGetAccounts(token: string) {
  return req<AccountResponse[]>(token, '/accounts')
}

export function apiGetAccount(token: string, id: string) {
  return req<AccountResponse>(token, `/accounts/${id}`)
}

export function apiCreateAccount(
  token: string,
  data: {
    name: string
    type: AccountType
    currency: string
    balance: number
    creditLimit?: number | null
    interestRate?: number | null
    minPayment?: number | null
  },
) {
  return req<AccountResponse>(token, '/accounts', { method: 'POST', body: JSON.stringify(data) })
}

export function apiUpdateAccount(token: string, id: string, data: object) {
  return req<AccountResponse>(token, `/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiDeleteAccount(token: string, id: string) {
  return req<void>(token, `/accounts/${id}`, { method: 'DELETE' })
}

// Transactions
export function apiGetTransactions(
  token: string,
  params?: { accountId?: string; category?: Category; from?: string; to?: string },
) {
  const qs = new URLSearchParams()
  if (params?.accountId) qs.set('accountId', params.accountId)
  if (params?.category) qs.set('category', params.category)
  if (params?.from) qs.set('from', params.from)
  if (params?.to) qs.set('to', params.to)
  const q = qs.toString()
  return req<TransactionResponse[]>(token, `/transactions${q ? `?${q}` : ''}`)
}

export function apiCreateTransaction(
  token: string,
  data: {
    accountId: string
    amount: number
    direction: Direction
    category: Category
    description?: string
    date: string
  },
) {
  return req<TransactionResponse>(token, '/transactions', { method: 'POST', body: JSON.stringify(data) })
}

export function apiDeleteTransaction(token: string, id: string) {
  return req<void>(token, `/transactions/${id}`, { method: 'DELETE' })
}

// Scheduled
export function apiGetScheduled(token: string) {
  return req<ScheduledOperationResponse[]>(token, '/scheduled')
}

export function apiGetScheduledUpcoming(token: string, days = 30) {
  return req<UpcomingOperationResponse[]>(token, `/scheduled/upcoming?days=${days}`)
}

export function apiCreateScheduled(
  token: string,
  data: {
    accountId: string
    name: string
    category: Category
    amount: number
    direction: Direction
    startDate: string
    endDate?: string | null
    recurrence: RecurrenceRule
  },
) {
  return req<ScheduledOperationResponse>(token, '/scheduled', { method: 'POST', body: JSON.stringify(data) })
}

export function apiUpdateScheduled(token: string, id: string, data: object) {
  return req<ScheduledOperationResponse>(token, `/scheduled/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiDeleteScheduled(token: string, id: string) {
  return req<void>(token, `/scheduled/${id}`, { method: 'DELETE' })
}

export function apiExecuteScheduled(token: string, id: string) {
  return req<{ transactionId: string }>(token, `/scheduled/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

// Grid
export function apiGetGrid(
  token: string,
  params: {
    from: string
    to: string
    granularity: Granularity
    accounts?: string[]
  },
) {
  const qs = new URLSearchParams({
    from: params.from,
    to: params.to,
    granularity: params.granularity,
  })
  if (params.accounts?.length) qs.set('accounts', params.accounts.join(','))
  return req<GridResponse>(token, `/grid?${qs.toString()}`)
}

export function apiUpdateGridCell(
  token: string,
  data: {
    accountId: string
    category: Category
    direction: Direction
    date: string
    plan?: number | null
    actual?: number | null
  },
) {
  return req<void>(token, '/grid/cell', { method: 'PUT', body: JSON.stringify(data) })
}

// Loans
export function apiGetIssuedLoans(token: string) {
  return req<IssuedLoanResponse[]>(token, '/loans/issued')
}

export function apiCreateIssuedLoan(
  token: string,
  data: {
    debtorName: string
    principal: number
    interestRate: number
    currency: string
    issueDate: string
    dueDate: string
    notes?: string
    paymentRecurrence?: RecurrenceRule
    paymentAmount?: number
  },
) {
  return req<IssuedLoanResponse>(token, '/loans/issued', { method: 'POST', body: JSON.stringify(data) })
}

export function apiUpdateIssuedLoan(token: string, id: string, data: object) {
  return req<IssuedLoanResponse>(token, `/loans/issued/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiPayLoanPayment(
  token: string,
  loanId: string,
  paymentId: string,
  data: { paidDate: string; paidAmount?: number },
) {
  return req<LoanPayment>(token, `/loans/issued/${loanId}/payments/${paymentId}/pay`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Assets
export function apiGetAssets(token: string) {
  return req<AssetResponse[]>(token, '/assets')
}

export function apiCreateAsset(
  token: string,
  data: {
    name: string
    type: AssetType
    currentValue: number
    currency: string
    liquidity: Liquidity
    acquiredAt?: string
    notes?: string
  },
) {
  return req<AssetResponse>(token, '/assets', { method: 'POST', body: JSON.stringify(data) })
}

export function apiUpdateAsset(token: string, id: string, data: object) {
  return req<AssetResponse>(token, `/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiDeleteAsset(token: string, id: string) {
  return req<void>(token, `/assets/${id}`, { method: 'DELETE' })
}
