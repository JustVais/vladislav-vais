'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/finance/dashboard', label: 'Сводка' },
  { href: '/finance/grid', label: 'Грид' },
  { href: '/finance/accounts', label: 'Счета' },
  { href: '/finance/transactions', label: 'Транзакции' },
  { href: '/finance/scheduled', label: 'Плановые' },
  { href: '/finance/loans', label: 'Займы' },
  { href: '/finance/assets', label: 'Имущество' },
]

export function FinanceNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        <nav className="flex items-center gap-6 overflow-x-auto">
          {NAV.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 py-3 text-sm font-open-sans font-light no-underline relative transition-opacity duration-200
                  ${active ? 'text-black opacity-100' : 'text-black opacity-40 hover:opacity-70'}`}
              >
                {label}
                {active && <span className="absolute bottom-0 left-0 right-0 h-px bg-black" />}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
