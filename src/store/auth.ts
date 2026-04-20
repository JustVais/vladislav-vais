import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserResponse } from '@/lib/api'

interface AuthState {
  token: string | null
  user: UserResponse | null
  tokenExpiresAt: number | null
  setAuth: (token: string, user: UserResponse, expiresIn: number) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      tokenExpiresAt: null,
      setAuth: (token, user, expiresIn) =>
        set({ token, user, tokenExpiresAt: Date.now() + expiresIn * 1000 }),
      logout: () => set({ token: null, user: null, tokenExpiresAt: null }),
      isAuthenticated: () => {
        const { token, tokenExpiresAt } = get()
        if (!token) return false
        // Old sessions without tokenExpiresAt — treat as valid
        if (!tokenExpiresAt) return true
        return Date.now() < tokenExpiresAt
      },
    }),
    { name: 'vais-auth' },
  ),
)
