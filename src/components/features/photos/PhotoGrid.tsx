'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PhotoCard } from './PhotoCard'
import { cloudinaryGrid, cloudinaryPreview, cloudinaryFull } from '@/lib/cloudinary'
import type { PhotoEntry, PhotoMeta } from '@/data/photos'

interface PhotoGridProps {
  photos: PhotoEntry[]
}

function preloadImg(src: string) {
  const img = new window.Image()
  img.src = src
}

function getTouchDist(touches: React.TouchList) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.hypot(dx, dy)
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgZoom, setImgZoom] = useState(1)
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 })

  const preloaded = useRef(new Set<string>())
  const lightboxRef = useRef<HTMLDivElement>(null)

  // Mouse drag
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  // Touch pinch/pan
  const pinchStartDist = useRef<number | null>(null)
  const pinchStartZoom = useRef(1)
  const touchPanStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const isPinching = useRef(false)

  // Swipe-to-close
  const [swipeOffset, setSwipeOffset] = useState(0)
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const isSwipingToClose = useRef(false)

  const imgZoomRef = useRef(imgZoom)
  const imgOffsetRef = useRef(imgOffset)
  imgZoomRef.current = imgZoom
  imgOffsetRef.current = imgOffset

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

  // Preload adjacent
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
    resetZoom()
    setSwipeOffset(0)
    isSwipingToClose.current = false
    if (selectedIndex === null) { setImgLoaded(false); return }
    const src = cloudinaryFull(photos[selectedIndex].publicId)
    const probe = new window.Image()
    probe.src = src
    setImgLoaded(probe.complete && probe.naturalWidth > 0)
  }, [selectedIndex, resetZoom, photos])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, prev, next])

  // Lock body scroll (iOS-safe: overflow:hidden alone doesn't stop momentum scroll)
  useEffect(() => {
    if (!selected) return
    const y = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${y}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, y)
    }
  }, [selected])

  // Блокируем нативный zoom iOS и scroll когда лайтбокс открыт
  useEffect(() => {
    if (!selected) return
    const el = lightboxRef.current
    if (!el) return

    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length >= 2 || imgZoomRef.current > 1) e.preventDefault()
    }

    // Non-passive wheel для десктопа
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setImgZoom((z) => {
        const factor = e.deltaY < 0 ? 1.04 : 1 / 1.04
        const next = z * factor
        if (next <= 1) { setImgOffset({ x: 0, y: 0 }); return 1 }
        return Math.min(next, 8)
      })
    }

    el.addEventListener('touchmove', preventDefault, { passive: false })
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('touchmove', preventDefault)
      el.removeEventListener('wheel', onWheel)
    }
  }, [selected])

  // Блокируем viewport zoom через мета-тег когда лайтбокс открыт
  useEffect(() => {
    const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
    if (!viewport) return
    const original = viewport.getAttribute('content') ?? ''
    if (selected) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    } else {
      viewport.setAttribute('content', original)
    }
    return () => viewport.setAttribute('content', original)
  }, [selected])

  // --- Mouse drag ---
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

  // --- Touch pinch + pan + swipe-to-close ---
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true
      isSwipingToClose.current = false
      pinchStartDist.current = getTouchDist(e.touches)
      pinchStartZoom.current = imgZoomRef.current
      touchPanStart.current = null
    } else if (e.touches.length === 1) {
      swipeStartX.current = e.touches[0].clientX
      swipeStartY.current = e.touches[0].clientY
      isSwipingToClose.current = false
      if (imgZoomRef.current > 1) {
        touchPanStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          ox: imgOffsetRef.current.x,
          oy: imgOffsetRef.current.y,
        }
      } else {
        touchPanStart.current = null
      }
      hasDragged.current = false
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const dist = getTouchDist(e.touches)
      const scale = dist / pinchStartDist.current
      const newZoom = Math.min(Math.max(pinchStartZoom.current * scale, 1), 8)
      setImgZoom(newZoom)
      if (newZoom <= 1) setImgOffset({ x: 0, y: 0 })
    } else if (e.touches.length === 1) {
      if (touchPanStart.current) {
        const dx = e.touches[0].clientX - touchPanStart.current.x
        const dy = e.touches[0].clientY - touchPanStart.current.y
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true
        setImgOffset({ x: touchPanStart.current.ox + dx, y: touchPanStart.current.oy + dy })
      } else if (imgZoomRef.current <= 1) {
        const dx = e.touches[0].clientX - swipeStartX.current
        const dy = e.touches[0].clientY - swipeStartY.current
        if (!isSwipingToClose.current && Math.abs(dy) > 8) {
          isSwipingToClose.current = dy > 0 && Math.abs(dy) > Math.abs(dx)
        }
        if (isSwipingToClose.current) {
          hasDragged.current = true
          setSwipeOffset(Math.max(0, dy))
        }
      }
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) { pinchStartDist.current = null; isPinching.current = false }
    if (e.touches.length === 0) {
      touchPanStart.current = null
      if (isSwipingToClose.current) {
        if (swipeOffset > 120) {
          close()
        } else {
          setSwipeOffset(0)
        }
        isSwipingToClose.current = false
      }
    }
  }

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
            onLoad={() => preloadImg(cloudinaryPreview(publicId))}
          />
        ))}
      </div>

      {selected && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            backgroundColor: `rgba(0,0,0,${Math.max(0.15, 1 - swipeOffset / 350)})`,
            cursor: imgZoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default',
            touchAction: 'none',
          }}
          onClick={() => { if (!hasDragged.current) close() }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
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
            <div
              style={{
                transform: `translateY(${swipeOffset}px)`,
                transition: isSwipingToClose.current ? 'none' : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            >
            <div
              style={{
                position: 'relative',
                transform: `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${imgZoom})`,
                transformOrigin: 'center',
                transition: (isDragging.current || isPinching.current) ? 'none' : 'transform 0.18s ease-out',
                willChange: 'transform',
              }}
            >
              {/* Preview placeholder — нативное соотношение, из кэша */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`preview-${selected.publicId}`}
                src={cloudinaryPreview(selected.publicId)}
                alt=""
                className="absolute inset-0 w-full h-full object-contain select-none"
                draggable={false}
              />
              {/* High quality — fades in on top when ready */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={selected.publicId}
                src={cloudinaryFull(selected.publicId)}
                alt=""
                className={`relative max-h-[80vh] max-w-[90vw] object-contain select-none block transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                draggable={false}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
            </div>
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
