'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

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

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')
  }

  return (
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
        {NAV_LINKS.map(({ href, labelKey }) => {
          const active = pathname === href
          return (
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
        })}
      </ul>

      {/* Правая часть: язык + гамбургер */}
      <div className="ml-auto flex items-center gap-4">
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
          {NAV_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-4 font-open-sans text-black no-underline border-b border-gray-100 last:border-0 ${pathname === href ? 'font-medium' : 'font-light hover:bg-gray-50'}`}
            >
              {t(labelKey)}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
