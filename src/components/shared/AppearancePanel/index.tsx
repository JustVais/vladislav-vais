'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppearanceStore, type Background } from '@/store/appearance'

// ── icons ─────────────────────────────────────────────────────────────────────

function GearIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

// ── background preview tiles ──────────────────────────────────────────────────

const BG_OPTIONS: { value: Background; label: string; preview: React.CSSProperties }[] = [
  {
    value: 'glitch',
    label: 'Глич',
    preview: {
      backgroundImage: `url('https://vunetrix.com/wp-content/uploads/2019/02/Missing-Video-Evidence-Cyber-Security-Risk.jpg')`,
      backgroundSize: 'cover',
      opacity: 0.6,
    },
  },
  {
    value: 'dots',
    label: 'Точки',
    preview: {
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.25) 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    },
  },
  {
    value: 'grid',
    label: 'Сетка',
    preview: {
      backgroundImage:
        'linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px)',
      backgroundSize: '10px 10px',
    },
  },
  {
    value: 'lines',
    label: 'Линии',
    preview: {
      backgroundImage:
        'repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,0,0,0.1) 6px)',
    },
  },
  {
    value: 'none',
    label: 'Чисто',
    preview: {},
  },
]

// ── section label ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-open-sans font-light uppercase tracking-[0.15em] text-gray-400 mb-2">
      {children}
    </p>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export function AppearancePanel() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { background, glitchOpacity, setBackground, setGlitchOpacity } = useAppearanceStore()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer transition-opacity p-0 text-black
          ${open ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
        aria-label="Настройки внешнего вида"
      >
        <GearIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-2xl z-[100] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-eurostile text-base leading-none">Внешний вид</h3>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0 text-lg leading-none">✕</button>
          </div>

          {/* Background */}
          <div>
            <Label>Фон</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {BG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBackground(opt.value)}
                  className={`relative h-10 border-2 transition-colors cursor-pointer bg-white overflow-hidden
                    ${background === opt.value ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}
                  title={opt.label}
                >
                  <div className="absolute inset-0" style={opt.preview} />
                  {background === opt.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1.5 mt-1">
              {BG_OPTIONS.map((opt) => (
                <p key={opt.value} className="text-center text-[9px] font-open-sans font-light text-gray-400">{opt.label}</p>
              ))}
            </div>
          </div>

          {/* Glitch opacity */}
          {background === 'glitch' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Интенсивность</Label>
                <span className="text-[10px] font-open-sans font-light text-gray-400">{Math.round(glitchOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={3}
                max={25}
                step={1}
                value={Math.round(glitchOpacity * 100)}
                onChange={(e) => setGlitchOpacity(Number(e.target.value) / 100)}
                className="w-full h-0.5 appearance-none bg-gray-200 cursor-pointer accent-black"
              />
            </div>
          )}

        </div>
      )}
    </div>
  )
}
