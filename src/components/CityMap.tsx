import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Maximize2, Minus, Plus } from 'lucide-react'
import { buildings, type BuildingDef } from '../data/buildings'
import { asset } from '../lib/color'
import Building from './Building'
import MapPlaceholder, { PLACEHOLDER_H, PLACEHOLDER_W } from './MapPlaceholder'

interface Props {
  onHover: (b: BuildingDef | null) => void
  onOpen: (id: string) => void
}

type View = { x: number; y: number; s: number }

const MAX_ZOOM = 2.6 // relativo al zoom de "encaje"
const DRAG_THRESHOLD = 6

export default function CityMap({ onHover, onOpen }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [world, setWorld] = useState({ w: PLACEHOLDER_W, h: PLACEHOLDER_H })
  const [hasBase, setHasBase] = useState(true)
  const [view, setView] = useState<View>({ x: 0, y: 0, s: 0.5 })
  const viewRef = useRef(view)
  viewRef.current = view

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef({ moved: 0, pinchDist: 0 })

  // Escala mínima = la que cubre toda la pantalla (sin bordes vacíos)
  const fitScale = useCallback(() => {
    const el = containerRef.current
    if (!el) return 1
    return Math.max(el.clientWidth / world.w, el.clientHeight / world.h)
  }, [world])

  const clamp = useCallback(
    (v: View): View => {
      const el = containerRef.current
      if (!el) return v
      const cw = el.clientWidth
      const ch = el.clientHeight
      const min = fitScale()
      const s = Math.min(Math.max(v.s, min), min * MAX_ZOOM)
      const x = Math.min(0, Math.max(cw - world.w * s, v.x))
      const y = Math.min(0, Math.max(ch - world.h * s, v.y))
      return { x, y, s }
    },
    [fitScale, world],
  )

  const fit = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const s = fitScale()
    setView(
      clamp({
        s,
        x: (el.clientWidth - world.w * s) / 2,
        y: (el.clientHeight - world.h * s) / 2,
      }),
    )
  }, [clamp, fitScale, world])

  useLayoutEffect(() => {
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [fit])

  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      const v = viewRef.current
      const target = clamp({ ...v, s: v.s * factor })
      const k = target.s / v.s
      setView(clamp({ s: target.s, x: px - (px - v.x) * k, y: py - (py - v.y) * k }))
    },
    [clamp],
  )

  // Rueda del ratón (listener nativo para poder hacer preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0015))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // Arrastre y pinch con Pointer Events
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const p = pointers.current
      const prev = p.get(e.pointerId)
      if (!prev) return
      const el = containerRef.current!
      const r = el.getBoundingClientRect()

      if (p.size === 1) {
        const dx = e.clientX - prev.x
        const dy = e.clientY - prev.y
        gesture.current.moved += Math.abs(dx) + Math.abs(dy)
        const v = viewRef.current
        setView(clamp({ ...v, x: v.x + dx, y: v.y + dy }))
      }
      p.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (p.size === 2) {
        const [a, b] = [...p.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (gesture.current.pinchDist > 0) {
          zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, dist / gesture.current.pinchDist)
        }
        gesture.current.pinchDist = dist
        gesture.current.moved += DRAG_THRESHOLD
      }
    }
    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId)
      if (pointers.current.size < 2) gesture.current.pinchDist = 0
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [clamp, zoomAt])

  const onPointerDown = (e: React.PointerEvent) => {
    if (pointers.current.size === 0) gesture.current.moved = 0
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
  }

  // Si el usuario estaba arrastrando, el "click" final no debe abrir un edificio
  const onClickCapture = (e: React.MouseEvent) => {
    if (gesture.current.moved > DRAG_THRESHOLD) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  const zoomButton = (factor: number) => {
    const el = containerRef.current!
    zoomAt(el.clientWidth / 2, el.clientHeight / 2, factor)
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
    >
      <div
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          width: world.w,
          height: world.h,
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
        }}
      >
        {hasBase ? (
          <img
            src={asset('mapa_base.png')}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full"
            onLoad={(e) => {
              const img = e.currentTarget
              setWorld({ w: img.naturalWidth, h: img.naturalHeight })
            }}
            onError={() => setHasBase(false)}
          />
        ) : (
          <div className="absolute inset-0">
            <MapPlaceholder />
          </div>
        )}

        {buildings.map((b) => (
          <Building key={b.id} def={b} onHover={onHover} onOpen={onOpen} />
        ))}
      </div>

      {/* controles de zoom */}
      <div
        className="absolute bottom-4 right-4 z-[2000] flex flex-col gap-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button type="button" aria-label="Acercar" className="comic-btn grid h-11 w-11 place-items-center bg-paper" onClick={() => zoomButton(1.3)}>
          <Plus strokeWidth={3} />
        </button>
        <button type="button" aria-label="Alejar" className="comic-btn grid h-11 w-11 place-items-center bg-paper" onClick={() => zoomButton(1 / 1.3)}>
          <Minus strokeWidth={3} />
        </button>
        <button type="button" aria-label="Encajar mapa" className="comic-btn grid h-11 w-11 place-items-center bg-sun" onClick={fit}>
          <Maximize2 strokeWidth={3} size={20} />
        </button>
      </div>
    </div>
  )
}
