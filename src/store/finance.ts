import { create } from 'zustand'
import type { AccountResponse } from '@/types/finance'
import { apiGetAccounts } from '@/lib/finance-api'

interface FinanceStore {
  accounts: AccountResponse[]
  isAccountsLoaded: boolean
  setAccounts: (accounts: AccountResponse[]) => void
  loadAccounts: (token: string) => Promise<void>
  invalidateAccounts: () => void
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  accounts: [],
  isAccountsLoaded: false,

  setAccounts: (accounts) => set({ accounts, isAccountsLoaded: true }),

  loadAccounts: async (token) => {
    if (get().isAccountsLoaded) return
    const res = await apiGetAccounts(token)
    if (res.success && res.data) {
      set({ accounts: res.data, isAccountsLoaded: true })
    }
  },

  invalidateAccounts: () => set({ accounts: [], isAccountsLoaded: false }),
}))
