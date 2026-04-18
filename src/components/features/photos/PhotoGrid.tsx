'use client'

import { useState, useEffect, useCallback } from 'react'
import { PhotoCard } from './PhotoCard'
import type { PhotoMeta } from '@/data/photos'

interface Photo {
  filename: string
  meta?: PhotoMeta
}

interface SelectedPhoto {
  src: string
  meta?: PhotoMeta
}

interface PhotoGridProps {
  photos: Photo[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [selected, setSelected] = useState<SelectedPhoto | null>(null)

  const close = useCallback(() => setSelected(null), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected])

  const hasMeta = (meta?: PhotoMeta) =>
    meta && (meta.description || meta.date || meta.place)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
        {photos.map(({ filename, meta }) => (
          <PhotoCard
            key={filename}
            src={`/photos/${encodeURIComponent(filename)}`}
            alt={filename}
            meta={meta}
            onClick={() => setSelected({ src: `/photos/${encodeURIComponent(filename)}`, meta })}
          />
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-5 px-4"
          onClick={close}
        >
          <button
            className="absolute top-4 right-6 text-white text-4xl leading-none bg-transparent border-none cursor-pointer"
            onClick={close}
          >
            ×
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.src}
            alt=""
            className="max-h-[80vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {hasMeta(selected.meta) && (
            <div
              className="text-center max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {selected.meta!.description && (
                <p className="text-white font-open-sans text-sm md:text-base leading-relaxed mb-1">
                  {selected.meta!.description}
                </p>
              )}
              <div className="flex justify-center gap-4 flex-wrap">
                {selected.meta!.date && (
                  <span className="text-white/50 text-xs font-open-sans">
                    {selected.meta!.date}
                  </span>
                )}
                {selected.meta!.place && (
                  <span className="text-white/50 text-xs font-open-sans">
                    · {selected.meta!.place}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
