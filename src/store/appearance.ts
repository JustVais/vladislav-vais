import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Background = 'glitch' | 'dots' | 'grid' | 'lines' | 'none'
export type FontSize = 'sm' | 'md' | 'lg'

interface AppearanceState {
  background: Background
  glitchOpacity: number      // 0.03 – 0.25
  pageAnimations: boolean
  compactHeader: boolean
  fontSize: FontSize
  setBackground: (v: Background) => void
  setGlitchOpacity: (v: number) => void
  setPageAnimations: (v: boolean) => void
  setCompactHeader: (v: boolean) => void
  setFontSize: (v: FontSize) => void
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      background: 'glitch',
      glitchOpacity: 0.1,
      pageAnimations: true,
      compactHeader: false,
      fontSize: 'md',
      setBackground: (background) => set({ background }),
      setGlitchOpacity: (glitchOpacity) => set({ glitchOpacity }),
      setPageAnimations: (pageAnimations) => set({ pageAnimations }),
      setCompactHeader: (compactHeader) => set({ compactHeader }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: 'vais-appearance' },
  ),
)
