'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { PageViewState } from '@/lib/stores/chat-store'

// ─── Fullscreen Lightbox ─────────────────────────────────────────────

function PageLightbox({
  url,
  pageNum,
  onClose,
}: {
  url: string
  pageNum: number
  onClose: () => void
}) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4))
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5))
  const resetZoom = () => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setScale((s) => Math.min(Math.max(s + delta, 0.5), 4))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    translateStart.current = { ...translate }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    setTranslate({
      x: translateStart.current.x + (e.clientX - dragStart.current.x),
      y: translateStart.current.y + (e.clientY - dragStart.current.y),
    })
  }
  const onPointerUp = () => setDragging(false)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-sm font-medium text-white/80">Page {pageNum}</span>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-white/60 min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={resetZoom} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button onClick={onClose} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`Page ${pageNum}`}
          className="max-h-[calc(100vh-5rem)] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
          }}
          draggable={false}
        />
      </div>
    </div>
  )
}

// ─── Page Viewer Panel ──────────────────────────────────────────────

export function PageViewerPanel({
  data,
  highlightPage,
  onClose,
}: {
  data: PageViewState
  highlightPage?: string
  onClose: () => void
}) {
  const highlightRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<{ url: string; pageNum: number } | null>(null)

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [highlightPage])

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors lg:hidden">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <FileText className="h-4 w-4 text-brand shrink-0" />
        <span className="text-sm font-medium truncate">{data.docName}</span>
        <div className="flex-1" />
        <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {data.pages.map(({ pageNum, url }) => (
          <div
            key={pageNum}
            ref={highlightPage === String(pageNum) ? highlightRef : undefined}
            className={cn(
              'rounded-lg overflow-hidden border transition-all cursor-pointer group',
              highlightPage === String(pageNum)
                ? 'border-brand shadow-lg shadow-brand/10'
                : 'border-border hover:border-brand/50',
            )}
            onClick={() => setLightbox({ url, pageNum })}
          >
            <div className="bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Page {pageNum}</span>
              <ZoomIn className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Page ${pageNum}`} className="w-full" loading="lazy" />
          </div>
        ))}
      </div>
      {lightbox && <PageLightbox url={lightbox.url} pageNum={lightbox.pageNum} onClose={() => setLightbox(null)} />}
    </div>
  )
}

// ─── Animated Page Viewer Wrapper ───────────────────────────────────

export function PageViewer({
  data,
  highlightPage,
  onClose,
}: {
  data: PageViewState | null
  highlightPage?: string
  onClose: () => void
}) {
  const open = !!data

  return (
    <AnimatePresence>
      {open && data && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-md',
              'lg:relative lg:z-auto lg:w-[420px] lg:max-w-none lg:shrink-0',
            )}
          >
            <PageViewerPanel data={data} highlightPage={highlightPage} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
