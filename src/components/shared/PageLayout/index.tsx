'use client'

import { Header } from '../Header'

interface Props {
  children: React.ReactNode
}

export function PageLayout({ children }: Props) {
  return (
    <div className="relative min-h-screen">
      <div className="ripple-bg" />
      <div className="relative z-10">
        <Header />
        <main className="grid max-w-[1140px] mx-auto box-border
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
