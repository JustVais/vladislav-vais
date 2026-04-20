'use client'

import Link from 'next/link'
import { PageLayout } from '@/components/shared/PageLayout'
import { useEffect, useState } from 'react'

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#₂₃⁴⁵⁶⁷⁸⁹'

function useGlitch(text: string, active: boolean) {
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (!active) {
      setDisplay(text)
      return
    }
    let frame = 0
    let raf: number
    const total = 12

    const step = () => {
      frame++
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (frame / total > i / text.length) return char
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          })
          .join(''),
      )
      if (frame < total) raf = requestAnimationFrame(step)
      else setDisplay(text)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active, text])

  return display
}

export default function NotFound() {
  const [hovered, setHovered] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const glitched = useGlitch('404', triggered)

  useEffect(() => {
    const id = setTimeout(() => setTriggered(true), 400)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!hovered) return
    setTriggered(false)
    const id = setTimeout(() => setTriggered(true), 10)
    return () => clearTimeout(id)
  }, [hovered])

  return (
    <PageLayout>
      <div className="h-full grid content-center">
        <div className="grid justify-items-center gap-y-6">

          <div
            className="relative select-none cursor-default"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <span
              className="block text-[120px] sm:text-[180px] md:text-[220px] font-eurostile leading-none tracking-tighter text-black"
              style={{ lineHeight: 1 }}
            >
              {glitched}
            </span>

            {/* decorative lines */}
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center text-[120px] sm:text-[180px] md:text-[220px] font-eurostile leading-none tracking-tighter text-black opacity-[0.04] blur-[2px] translate-x-[3px] -translate-y-[2px]"
            >
              404
            </span>
          </div>

          <div className="grid justify-items-center gap-y-2 text-center">
            <p className="text-sm sm:text-base m-0 font-open-sans font-light text-gray-400 uppercase tracking-[0.2em]">
              Страница не найдена
            </p>
            <p className="text-xs sm:text-sm m-0 font-open-sans font-light text-gray-300 max-w-xs">
              Возможно, она была перемещена или никогда не существовала
            </p>
          </div>

          <Link
            href="/"
            className="mt-2 group inline-flex items-center gap-2 font-open-sans font-light text-sm text-black no-underline relative"
          >
            <span className="w-6 h-px bg-black transition-all duration-300 group-hover:w-10" />
            <span className="relative after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 group-hover:after:w-full">
              На главную
            </span>
          </Link>

        </div>
      </div>
    </PageLayout>
  )
}
