'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PhotoCard } from './PhotoCard'
import { cloudinaryGrid, cloudinaryFull } from '@/lib/cloudinary'
import type { PhotoEntry, PhotoMeta } from '@/data/photos'

interface PhotoGridProps {
  photos: PhotoEntry[]
}

function preloadImg(src: string) {
  const img = new window.Image()
  img.src = src
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgZoom, setImgZoom] = useState(1)
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 })

  const preloaded = useRef(new Set<string>())
  const lightboxRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  const selected = selectedIndex !== null ? photos[selectedIndex] : null

  const close = useCallback(() => setSelectedIndex(null), [])
  const resetZoom = useCallback(() => { setImgZoom(1); setImgOffset({ x: 0, y: 0 }) }, [])
  const prev = useCallback(() => { setSelectedIndex((i) => i !== null ? (i - 1 + photos.length) % photos.length : null); resetZoom() }, [photos.length, resetZoom])
  const next = useCallback(() => { setSelectedIndex((i) => i !== null ? (i + 1) % photos.length : null); resetZoom() }, [photos.length, resetZoom])

  const handleHover = useCallback((publicId: string) => {
    const src = cloudinaryFull(publicId)
    if (!preloaded.current.has(src)) {
      preloaded.current.add(src)
      preloadImg(src)
    }
  }, [])

  // Preload adjacent full-size images
  useEffect(() => {
    if (selectedIndex === null) return
    const neighbours = [
      (selectedIndex + 1) % photos.length,
      (selectedIndex - 1 + photos.length) % photos.length,
    ]
    neighbours.forEach((i) => {
      const src = cloudinaryFull(photos[i].publicId)
      if (!preloaded.current.has(src)) {
        preloaded.current.add(src)
        preloadImg(src)
      }
    })
  }, [selectedIndex, photos])

  // Reset on photo change
  useEffect(() => {
    setImgLoaded(false)
    resetZoom()
  }, [selectedIndex, resetZoom])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, prev, next])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected])

  // Non-passive wheel → zoom only the photo
  useEffect(() => {
    if (!selected) return
    const el = lightboxRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      setImgZoom((z) => {
        const factor = e.deltaY < 0 ? 1.04 : 1 / 1.04
        const next = z * factor
        if (next <= 1) { setImgOffset({ x: 0, y: 0 }); return 1 }
        return Math.min(next, 8)
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [selected])

  // Drag to pan
  const onMouseDown = (e: React.MouseEvent) => {
    if (imgZoom <= 1) return
    isDragging.current = true
    hasDragged.current = false
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: imgOffset.x, oy: imgOffset.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    hasDragged.current = true
    setImgOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (e.clientY - dragStart.current.my),
    })
  }
  const onMouseUp = () => { isDragging.current = false }

  const hasMeta = (meta: PhotoMeta) => meta.description || meta.date || meta.place

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
        {photos.map(({ publicId, meta }, index) => (
          <PhotoCard
            key={publicId}
            src={cloudinaryGrid(publicId)}
            alt={publicId}
            meta={meta}
            onClick={() => setSelectedIndex(index)}
            onHover={() => handleHover(publicId)}
          />
        ))}
      </div>

      {selected && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
          style={{ cursor: imgZoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default' }}
          onClick={() => { if (!hasDragged.current) close() }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <button
            className="absolute top-4 right-6 text-white text-4xl leading-none bg-transparent border-none cursor-pointer z-10"
            onClick={(e) => { e.stopPropagation(); close() }}
          >
            ×
          </button>

          <button
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl bg-transparent border-none cursor-pointer leading-none px-2 py-4 z-10"
            onClick={(e) => { e.stopPropagation(); prev() }}
          >
            ‹
          </button>

          <button
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl bg-transparent border-none cursor-pointer leading-none px-2 py-4 z-10"
            onClick={(e) => { e.stopPropagation(); next() }}
          >
            ›
          </button>

          <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={selected.publicId}
              src={cloudinaryFull(selected.publicId)}
              alt=""
              className={`max-h-[80vh] max-w-[90vw] object-contain transition-opacity duration-500 select-none ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transform: `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${imgZoom})`,
                transformOrigin: 'center',
                transition: isDragging.current ? 'opacity 0.5s' : 'opacity 0.5s, transform 0.18s ease-out',
              }}
              draggable={false}
              onLoad={() => setImgLoaded(true)}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              </div>
            )}
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-5 gap-1 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {hasMeta(selected.meta) && (
              <div className="text-center max-w-lg px-4">
                {selected.meta.description && (
                  <p className="text-white font-open-sans text-sm md:text-base leading-relaxed mb-1">
                    {selected.meta.description}
                  </p>
                )}
                <div className="flex justify-center gap-4 flex-wrap">
                  {selected.meta.date && (
                    <span className="text-white/50 text-xs font-open-sans">{selected.meta.date}</span>
                  )}
                  {selected.meta.place && (
                    <span className="text-white/50 text-xs font-open-sans">· {selected.meta.place}</span>
                  )}
                </div>
              </div>
            )}
            <span className="text-white/30 text-xs font-open-sans tabular-nums">
              {selectedIndex! + 1} / {photos.length}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
