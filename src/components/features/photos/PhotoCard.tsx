'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { PhotoMeta } from '@/data/photos'

interface PhotoCardProps {
  src: string
  alt: string
  meta?: PhotoMeta
  onClick: () => void
  onHover?: () => void
}

export function PhotoCard({ src, alt, meta, onClick, onHover }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false)
  const hasMeta = meta && (meta.description || meta.date || meta.place)

  return (
    <div
      className="relative aspect-square overflow-hidden cursor-pointer group"
      onClick={onClick}
      onMouseEnter={onHover}
    >
      {!loaded && <div className="absolute inset-0 shimmer" />}

      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        className={`object-cover transition-all duration-300 group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
      />

      {hasMeta && (
        <div className="hidden sm:block absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0
                        transition-transform duration-300 ease-out
                        bg-gradient-to-t from-black/80 via-black/50 to-transparent
                        px-4 pt-8 pb-4">
          {meta.description && (
            <p className="text-white text-sm font-open-sans leading-snug mb-1">
              {meta.description}
            </p>
          )}
          <div className="flex gap-3 flex-wrap">
            {meta.date && (
              <span className="text-white/70 text-xs font-open-sans">{meta.date}</span>
            )}
            {meta.place && (
              <span className="text-white/70 text-xs font-open-sans">· {meta.place}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
