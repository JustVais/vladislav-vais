'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'
import { useAppearanceStore } from '@/store/appearance'
import { Header } from '@/components/shared/Header'
import { FinanceNav } from '@/components/features/finance/FinanceNav'
import { ToastProvider } from '@/components/features/finance/ToastContext'

interface Props {
  children: React.ReactNode
}

export default function FinanceLayout({ children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, isAuthenticated } = useAuthStore()
  const loadAccounts = useFinanceStore((s) => s.loadAccounts)
  const { background, glitchOpacity } = useAppearanceStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated()) {
      router.replace('/')
      return
    }
    if (token) loadAccounts(token)
  }, [hydrated, token, isAuthenticated, loadAccounts, router])

  if (!hydrated) return null
  if (!isAuthenticated()) return null

  const BG_PATTERN: Record<string, React.CSSProperties> = {
    dots: { backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.18) 1px, transparent 1px)', backgroundSize: '20px 20px' },
    grid: { backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' },
    lines: { backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(0,0,0,0.07) 12px)' },
  }

  return (
    <ToastProvider>
      <div className="relative min-h-screen">
        {background === 'glitch' && <div className="ripple-bg" style={{ opacity: glitchOpacity }} />}
        {background !== 'glitch' && background !== 'none' && (
          <div className="absolute inset-0 pointer-events-none" style={BG_PATTERN[background]} />
        )}
        <div className="relative z-10">
          <Header />
          <FinanceNav />
          <main className={`page-enter box-border ${
            pathname === '/finance/grid'
              ? 'w-full p-0'
              : 'max-w-[1140px] mx-auto px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-10 lg:py-14'
          }`}>
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
