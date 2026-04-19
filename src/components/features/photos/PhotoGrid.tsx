'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
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
  const urlInitialized = useRef(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imgZoom, setImgZoom] = useState(1)
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 })

  const router = useRouter()
  const preloaded = useRef(new Set<string>())
  const lightboxRef = useRef<HTMLDivElement>(null)

  // Mouse drag
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  // Touch pinch/pan
  const pinchStartDist = useRef<number | null>(null)
  const pinchStartZoom = useRef(1)
  const pinchMidStart = useRef({ x: 0, y: 0 })
  const pinchOffsetStart = useRef({ x: 0, y: 0 })
  const touchPanStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const isPinching = useRef(false)
  const isTouchPanning = useRef(false)

  // Swipe-to-close
  const [swipeOffset, setSwipeOffset] = useState(0)
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const isSwipingToClose = useRef(false)

  // Swipe to navigate
  const isSwipingNav = useRef(false)
  const navSwipeDx = useRef(0)

  // Double tap
  const lastTapTime = useRef(0)

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

  // Init from URL (runs once after hydration)
  useEffect(() => {
    const match = window.location.pathname.match(/^\/photos\/(.+)$/)
    if (match) {
      const idx = photos.findIndex(p => p.publicId === match[1])
      if (idx !== -1) setSelectedIndex(idx)
    }
    urlInitialized.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync URL — router.replace безопасен т.к. PhotoGrid живёт в layout и не размонтируется
  useEffect(() => {
    if (!urlInitialized.current) return
    const path = selectedIndex !== null ? `/photos/${photos[selectedIndex].publicId}` : '/photos'
    router.replace(path, { scroll: false })
  }, [selectedIndex, photos, router])

  // Preload adjacent (preview + full)
  useEffect(() => {
    if (selectedIndex === null) return
    const neighbours = [
      (selectedIndex + 1) % photos.length,
      (selectedIndex - 1 + photos.length) % photos.length,
    ]
    neighbours.forEach((i) => {
      for (const src of [cloudinaryPreview(photos[i].publicId), cloudinaryFull(photos[i].publicId)]) {
        if (!preloaded.current.has(src)) {
          preloaded.current.add(src)
          preloadImg(src)
        }
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

  // Block pull-to-refresh on photos page
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none'
    return () => { document.body.style.overscrollBehavior = '' }
  }, [])

  // Lock body scroll (iOS-safe: overflow:hidden alone doesn't stop momentum scroll)
  useEffect(() => {
    if (!selected) return
    const y = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${y}px`
    document.body.style.width = '100%'
    document.documentElement.style.backgroundColor = 'black'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, y)
      requestAnimationFrame(() => {
        document.documentElement.style.backgroundColor = ''
      })
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

  // --- Touch pinch + pan + swipe-to-close + swipe-to-navigate ---
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true
      isSwipingToClose.current = false
      isSwipingNav.current = false
      pinchStartDist.current = getTouchDist(e.touches)
      pinchStartZoom.current = imgZoomRef.current
      pinchMidStart.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
      pinchOffsetStart.current = { x: imgOffsetRef.current.x, y: imgOffsetRef.current.y }
      touchPanStart.current = null
    } else if (e.touches.length === 1) {
      swipeStartX.current = e.touches[0].clientX
      swipeStartY.current = e.touches[0].clientY
      isSwipingToClose.current = false
      isSwipingNav.current = false
      navSwipeDx.current = 0
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
      if (newZoom <= 1) {
        setImgZoom(1)
        setImgOffset({ x: 0, y: 0 })
      } else {
        const rect = lightboxRef.current?.getBoundingClientRect()
        const cx = rect ? rect.left + rect.width / 2 : 0
        const cy = rect ? rect.top + rect.height / 2 : 0
        const mx = pinchMidStart.current.x - cx
        const my = pinchMidStart.current.y - cy
        const z1 = pinchStartZoom.current || 1
        const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        const panDx = currentMidX - pinchMidStart.current.x
        const panDy = currentMidY - pinchMidStart.current.y
        setImgZoom(newZoom)
        setImgOffset({
          x: mx * (1 - newZoom / z1) + pinchOffsetStart.current.x * newZoom / z1 + panDx,
          y: my * (1 - newZoom / z1) + pinchOffsetStart.current.y * newZoom / z1 + panDy,
        })
      }
    } else if (e.touches.length === 1) {
      if (touchPanStart.current) {
        isTouchPanning.current = true
        const dx = e.touches[0].clientX - touchPanStart.current.x
        const dy = e.touches[0].clientY - touchPanStart.current.y
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true
        setImgOffset({ x: touchPanStart.current.ox + dx, y: touchPanStart.current.oy + dy })
      } else if (imgZoomRef.current <= 1) {
        const dx = e.touches[0].clientX - swipeStartX.current
        const dy = e.touches[0].clientY - swipeStartY.current
        if (!isSwipingToClose.current && !isSwipingNav.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          isSwipingNav.current = true
        }
        if (!isSwipingToClose.current && !isSwipingNav.current && Math.abs(dy) > 8) {
          isSwipingToClose.current = dy > 0 && Math.abs(dy) > Math.abs(dx)
        }
        if (isSwipingNav.current) {
          hasDragged.current = true
          navSwipeDx.current = dx
        } else if (isSwipingToClose.current) {
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
      isTouchPanning.current = false
      if (isSwipingNav.current) {
        isSwipingNav.current = false
        if (Math.abs(navSwipeDx.current) > 60) {
          if (navSwipeDx.current < 0) next(); else prev()
        }
      } else if (isSwipingToClose.current) {
        isSwipingToClose.current = false
        if (swipeOffset > 120) {
          setSwipeOffset(window.innerHeight)
          setTimeout(() => close(), 420)
        } else {
          setSwipeOffset(0)
        }
      } else if (!hasDragged.current) {
        const now = Date.now()
        if (now - lastTapTime.current < 300) {
          lastTapTime.current = 0
          if (imgZoomRef.current > 1) resetZoom(); else setImgZoom(2.5)
        } else {
          lastTapTime.current = now
        }
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

      {selected && createPortal(
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            backgroundColor: `rgba(0,0,0,${Math.max(0, 1 - swipeOffset / 400)})`,
            transition: isSwipingToClose.current ? 'none' : 'background-color 0.45s cubic-bezier(0.22,1,0.36,1)',
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
            className="absolute right-6 text-white text-4xl leading-none bg-transparent border-none cursor-pointer z-10"
            style={{ top: 'calc(1rem + env(safe-area-inset-top))', opacity: Math.max(0, 1 - swipeOffset / 150), transition: isSwipingToClose.current ? 'none' : 'opacity 0.45s cubic-bezier(0.22,1,0.36,1)' }}
            onClick={(e) => { e.stopPropagation(); close() }}
          >
            ×
          </button>

          <button
            className="absolute left-6 text-white bg-transparent border-none cursor-pointer z-10 flex items-center gap-1.5 text-xs font-open-sans"
            style={{ top: 'calc(1.1rem + env(safe-area-inset-top))', opacity: Math.max(0, 1 - swipeOffset / 150), transition: isSwipingToClose.current ? 'none' : 'opacity 0.45s cubic-bezier(0.22,1,0.36,1)' }}
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(window.location.href).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              })
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span className="transition-opacity duration-200">{copied ? 'Скопировано' : 'Ссылка'}</span>
          </button>

          <button
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl bg-transparent border-none cursor-pointer leading-none px-2 py-4 z-10"
            style={{ opacity: Math.max(0, 1 - swipeOffset / 150), transition: isSwipingToClose.current ? 'none' : 'opacity 0.45s cubic-bezier(0.22,1,0.36,1)' }}
            onClick={(e) => { e.stopPropagation(); prev() }}
          >
            ‹
          </button>

          <button
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl bg-transparent border-none cursor-pointer leading-none px-2 py-4 z-10"
            style={{ opacity: Math.max(0, 1 - swipeOffset / 150), transition: isSwipingToClose.current ? 'none' : 'opacity 0.45s cubic-bezier(0.22,1,0.36,1)' }}
            onClick={(e) => { e.stopPropagation(); next() }}
          >
            ›
          </button>

          <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                transform: `translateY(${swipeOffset}px)`,
                transition: isSwipingToClose.current ? 'none' : 'transform 0.45s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
            <div
              style={{
                position: 'relative',
                transform: `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${imgZoom})`,
                transformOrigin: 'center',
                transition: (isDragging.current || isPinching.current || isTouchPanning.current) ? 'none' : 'transform 0.18s ease-out',
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
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1 z-10"
            style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))', opacity: Math.max(0, 1 - swipeOffset / 150), transition: isSwipingToClose.current ? 'none' : 'opacity 0.45s cubic-bezier(0.22,1,0.36,1)' }}
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
        </div>,
        document.body
      )}
    </>
  )
}
