import type { Metadata } from 'next'
import { eurostile, openSans } from './fonts'
import { I18nProvider } from '@/components/shared/I18nProvider'
import './globals.css'

const OG_IMAGE = 'https://res.cloudinary.com/duoo4ajch/image/upload/w_1200,h_630,c_fill,q_80,f_jpg/DSC02775_1_xil2ys'

export const metadata: Metadata = {
  title: 'Vladislav Vikul',
  description: 'Full Stack Web Developer',
  openGraph: {
    siteName: 'Vladislav Vikul',
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [OG_IMAGE],
  },
}

interface Props {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ru" className={`${eurostile.variable} ${openSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className={openSans.className}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
