'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'

const NAV = [
  { href: '/finance/dashboard', label: 'Сводка' },
  { href: '/finance/grid', label: 'Грид' },
  null,
  { href: '/finance/accounts', label: 'Счета' },
  { href: '/finance/transactions', label: 'Транзакции' },
  { href: '/finance/scheduled', label: 'Плановые' },
  null,
  { href: '/finance/loans', label: 'Займы выданные' },
  { href: '/finance/assets', label: 'Имущество' },
]

export function FinanceSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const invalidateAccounts = useFinanceStore((s) => s.invalidateAccounts)
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    invalidateAccounts()
    logout()
  }

  const displayName = user ? (user.firstName || user.email.split('@')[0]) : ''

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-100 min-h-screen">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link href="/finance/dashboard" className="font-eurostile text-xl leading-none text-black no-underline">
            финансы.
          </Link>
          <Link href="/" className="text-xs font-open-sans font-light text-gray-400 hover:text-black transition-colors no-underline">
            ← сайт
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3">
          {NAV.map((item, i) => {
            if (!item) return <hr key={i} className="my-2 border-gray-100" />
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-open-sans font-light no-underline transition-colors rounded
                  ${active ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-black'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs font-open-sans font-light text-gray-400 mb-1 truncate">{displayName}</p>
          <button
            onClick={handleLogout}
            className="text-xs font-open-sans font-light text-gray-500 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-40">
        <Link href="/finance/dashboard" className="font-eurostile text-lg leading-none text-black no-underline">
          финансы.
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 w-6 h-6 bg-transparent border-none cursor-pointer p-0"
        >
          <span className={`block h-0.5 bg-black transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 bg-black transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 bg-black transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-white flex flex-col pt-16">
          <nav className="flex-1 py-4 px-4 overflow-y-auto">
            {NAV.map((item, i) => {
              if (!item) return <hr key={i} className="my-2 border-gray-100" />
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-3 text-sm font-open-sans font-light no-underline border-b border-gray-50
                    ${active ? 'text-black font-medium' : 'text-gray-600'}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="px-7 py-4 border-t border-gray-100">
            <p className="text-xs font-open-sans font-light text-gray-400 mb-2">{displayName}</p>
            <button
              onClick={() => { handleLogout(); setOpen(false) }}
              className="text-sm font-open-sans font-light text-black bg-transparent border-none cursor-pointer p-0"
            >
              Выйти
            </button>
          </div>
        </div>
      )}
    </>
  )
}
