'use client'

import { useEffect, useState } from 'react'
import { Header } from '../Header'
import { useAppearanceStore } from '@/store/appearance'

interface Props {
  children: React.ReactNode
}

const BG_PATTERN: Record<string, React.CSSProperties> = {
  dots: { backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.18) 1px, transparent 1px)', backgroundSize: '20px 20px' },
  grid: { backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' },
  lines: { backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(0,0,0,0.07) 12px)' },
}

export function PageLayout({ children }: Props) {
  const [hydrated, setHydrated] = useState(false)
  const { background, glitchOpacity } = useAppearanceStore()

  useEffect(() => { setHydrated(true) }, [])

  return (
    <div className="relative min-h-screen">
      {hydrated && background === 'glitch' && <div className="ripple-bg" style={{ opacity: glitchOpacity }} />}
      {hydrated && background !== 'glitch' && background !== 'none' && (
        <div className="absolute inset-0 pointer-events-none" style={BG_PATTERN[background]} />
      )}
      {!hydrated && <div className="ripple-bg" />}

      <div className="relative z-10">
        <Header />
        <main className="page-enter grid max-w-[1140px] mx-auto box-border
                         px-4 py-8
                         sm:px-6 sm:py-12
                         md:px-8 md:py-16
                         lg:px-10 lg:py-20
                         min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
