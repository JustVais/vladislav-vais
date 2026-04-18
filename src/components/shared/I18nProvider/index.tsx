'use client'

import '@/lib/i18n'

interface Props {
  children: React.ReactNode
}

export function I18nProvider({ children }: Props) {
  return <>{children}</>
}
