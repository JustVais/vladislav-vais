import localFont from 'next/font/local'

export const eurostile = localFont({
  src: '../fonts/Eurostile-Heavy.otf',
  variable: '--font-eurostile',
  display: 'swap',
})

export const openSans = localFont({
  src: [
    { path: '../fonts/OpenSans-Regular.ttf', weight: '400' },
    { path: '../fonts/OpenSans-Light.ttf', weight: '300' },
    { path: '../fonts/OpenSans-Medium.ttf', weight: '500' },
    { path: '../fonts/OpenSans-Bold.ttf', weight: '700' },
  ],
  variable: '--font-open-sans',
  display: 'swap',
})
