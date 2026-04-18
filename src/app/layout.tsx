import type { Metadata } from 'next'
import { eurostile, openSans } from './fonts'
import { I18nProvider } from '@/components/shared/I18nProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vladislav Vikul',
}

interface Props {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ru" className={`${eurostile.variable} ${openSans.variable}`}>
      <body className={openSans.className}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
