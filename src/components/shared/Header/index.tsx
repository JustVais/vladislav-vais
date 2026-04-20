'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { useAuthStore } from '@/store/auth'
import { AuthModal } from '../AuthModal'
import { AppearancePanel } from '../AppearancePanel'

const NAV_LINKS = [
  { href: '/about',   labelKey: 'header.about'   },
  { href: '/work',    labelKey: 'header.work'     },
  { href: '/photos',    labelKey: 'header.photos'    },
  { href: '/countries', labelKey: 'header.countries' },
  { href: '/mountains', labelKey: 'header.mountains' },
  { href: '/contact',   labelKey: 'header.contact'   },
]

export function Header() {
  const { t, i18n } = useTranslation('common')
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const { user, logout } = useAuthStore()

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')
  }

  const displayName = user
    ? (user.firstName ? user.firstName : user.email.split('@')[0])
    : null

  return (
    <>
      <nav className="relative flex items-center h-16 md:h-20 px-4 md:px-10">

        {/* Brand */}
        {pathname !== '/' && (
          <Link
            href="/"
            className="text-xl md:text-2xl font-eurostile no-underline text-black
                       [&::after]:content-['vikul'] [&::after]:inline-block [&::after]:opacity-0
                       [&::after]:-translate-x-[50px] [&::after]:transition-all
                       hover:[&::after]:opacity-100 hover:[&::after]:translate-x-0"
          >
            vladislav.
          </Link>
        )}

        {/* Desktop nav — центр */}
        <ul className="hidden md:grid grid-flow-col gap-x-10 list-none m-0 p-0 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.flatMap(({ href, labelKey }, i) => {
            const active = pathname === href
            const item = (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-open-sans font-light text-black no-underline relative transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                >
                  {t(labelKey)}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-black" />
                  )}
                </Link>
              </li>
            )
            // Insert finance link after /about (index 0)
            if (i === 0 && user) {
              const finActive = pathname.startsWith('/finance')
              return [item, (
                <li key="/finance">
                  <Link
                    href="/finance/dashboard"
                    className={`font-open-sans font-light text-black no-underline relative transition-opacity duration-200 ${finActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                  >
                    {i18n.language === 'ru' ? 'Финансы' : 'Finance'}
                    {finActive && <span className="absolute -bottom-1 left-0 right-0 h-px bg-black" />}
                  </Link>
                </li>
              )]
            }
            return [item]
          })}
        </ul>

        {/* Правая часть */}
        <div className="ml-auto flex items-center gap-4">

          {/* Auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <AppearancePanel />
              <span className="font-eurostile text-xl md:text-2xl leading-none px-3 py-1 border border-black rounded-full">
                {displayName}
              </span>
              <button
                onClick={logout}
                className="font-eurostile text-xl md:text-2xl text-black bg-transparent border-none cursor-pointer p-0
                           hover:opacity-70 transition-opacity leading-none"
              >
                {i18n.language === 'ru' ? 'выйти' : 'logout'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden md:flex items-center font-eurostile text-xl md:text-2xl text-black bg-transparent border-none cursor-pointer p-0
                         hover:opacity-70 transition-opacity leading-none"
            >
              {i18n.language === 'ru' ? 'войти' : 'login'}
            </button>
          )}

          <button
            onClick={toggleLang}
            className="text-xl md:text-2xl font-eurostile cursor-pointer bg-transparent border-none text-black p-0"
          >
            {i18n.language}
          </button>

          {/* Гамбургер — только мобайл */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center gap-1.5 w-6 h-6 bg-transparent border-none cursor-pointer p-0"
            aria-label="Menu"
          >
            <span className={`block h-0.5 bg-black transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-black transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-black transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Мобильное меню */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white z-50 flex flex-col border-t border-gray-100 md:hidden shadow-sm">
            {NAV_LINKS.flatMap(({ href, labelKey }, i) => {
              const item = (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-4 font-open-sans text-black no-underline border-b border-gray-100 ${pathname === href ? 'font-medium' : 'font-light hover:bg-gray-50'}`}
                >
                  {t(labelKey)}
                </Link>
              )
              if (i === 0 && user) {
                return [item, (
                  <Link
                    key="/finance"
                    href="/finance/dashboard"
                    className={`px-4 py-4 font-open-sans text-black no-underline border-b border-gray-100 ${pathname.startsWith('/finance') ? 'font-medium' : 'font-light hover:bg-gray-50'}`}
                  >
                    {i18n.language === 'ru' ? 'Финансы' : 'Finance'}
                  </Link>
                )]
              }
              return [item]
            })}

            {/* Auth в мобильном меню */}
            <div className="px-4 py-4 border-t border-gray-200">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="font-open-sans font-light text-sm text-gray-500">{displayName}</span>
                  <button
                    onClick={() => { logout(); setMenuOpen(false) }}
                    className="font-open-sans font-light text-sm text-black bg-transparent border-none cursor-pointer p-0"
                  >
                    {i18n.language === 'ru' ? 'Выйти' : 'Logout'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); setAuthOpen(true) }}
                  className="font-open-sans font-light text-sm text-black bg-transparent border-none cursor-pointer p-0
                             uppercase tracking-[0.15em]"
                >
                  {i18n.language === 'ru' ? 'Войти' : 'Login'}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
