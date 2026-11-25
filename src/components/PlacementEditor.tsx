import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HIT_AREAS, MAP_SIZE, type BuildingConfig, type BuildingId } from '../data/buildings'

/**
 * Modo de colocación, solo para desarrollo (`npm run dev` + `?edit`).
 * - Arrastra un edificio para moverlo (se mueve su punto de apoyo).
 * - Rueda del ratón sobre él, o las teclas + y -, para cambiar su tamaño.
 * - Flechas para moverlo con precisión (con Mayús, pasos más grandes).
 * - "Copiar" deja en el portapapeles el array listo para pegar en src/data/buildings.ts.
 */
interface Props {
  buildings: BuildingConfig[]
  onChange: (next: BuildingConfig[]) => void
}

const round = (n: number) => Math.round(n * 100) / 100
const mapRatio = MAP_SIZE.width / MAP_SIZE.height

function bbox(b: BuildingConfig) {
  const hit = HIT_AREAS[b.id]
  const ax = b.flip ? 1 - hit.anchor[0] : hit.anchor[0]
  const ay = hit.anchor[1]
  const pts = hit.polygons.flat()
  const xs = pts.map((p) => (b.flip ? 1 - p[0] : p[0]))
  const ys = pts.map((p) => p[1])
  const hPct = b.width * (hit.height / hit.width) * mapRatio // alto de la imagen en % del alto del mapa
  return {
    left: b.x + (Math.min(...xs) - ax) * b.width,
    top: b.y + (Math.min(...ys) - ay) * hPct,
    width: (Math.max(...xs) - Math.min(...xs)) * b.width,
    height: (Math.max(...ys) - Math.min(...ys)) * hPct,
  }
}

function toSource(buildings: BuildingConfig[]) {
  const lines = buildings.map(
    (b) =>
      `  { id: '${b.id}', label: '${b.label}', labelEn: '${b.labelEn}', image: '${b.image}', x: ${round(b.x)}, y: ${round(b.y)}, width: ${round(b.width)}${b.rotate ? `, rotate: ${b.rotate}` : ''}${b.flip ? ', flip: true' : ''} },`,
  )
  return `export const BUILDINGS: BuildingConfig[] = [\n${lines.join('\n')}\n]\n`
}

export default function PlacementEditor({ buildings, onChange }: Props) {
  const [selected, setSelected] = useState<BuildingId | null>(null)
  const [copied, setCopied] = useState(false)
  const layerRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: BuildingId; startX: number; startY: number; bx: number; by: number } | null>(null)

  const update = (id: BuildingId, patch: Partial<BuildingConfig>) =>
    onChange(buildings.map((b) => (b.id === id ? { ...b, ...patch } : b)))

  // teclado: flechas mueven, +/- cambian el tamaño
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected || (e.target as HTMLElement).tagName === 'INPUT') return
      const b = buildings.find((x) => x.id === selected)!
      const step = e.shiftKey ? 1 : 0.1
      const moves: Record<string, Partial<BuildingConfig>> = {
        ArrowLeft: { x: b.x - step },
        ArrowRight: { x: b.x + step },
        ArrowUp: { y: b.y - step },
        ArrowDown: { y: b.y + step },
        '+': { width: b.width + step },
        '=': { width: b.width + step },
        '-': { width: Math.max(1, b.width - step) },
        Escape: {},
      }
      if (!(e.key in moves)) return
      e.preventDefault()
      if (e.key === 'Escape') setSelected(null)
      else update(selected, moves[e.key])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onPointerDown = (e: React.PointerEvent, b: BuildingConfig) => {
    e.preventDefault()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    setSelected(b.id)
    drag.current = { id: b.id, startX: e.clientX, startY: e.clientY, bx: b.x, by: b.y }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    const rect = layerRef.current?.getBoundingClientRect()
    if (!d || !rect) return
    update(d.id, {
      x: d.bx + ((e.clientX - d.startX) / rect.width) * 100,
      y: d.by + ((e.clientY - d.startY) / rect.height) * 100,
    })
  }

  const onWheel = (e: React.WheelEvent, b: BuildingConfig) => {
    const step = e.shiftKey ? 1 : 0.25
    update(b.id, { width: Math.max(1, b.width + (e.deltaY < 0 ? step : -step)) })
  }

  const copy = async () => {
    const src = toSource(buildings)
    try {
      await navigator.clipboard.writeText(src)
    } catch {
      window.prompt('Copia esto en src/data/buildings.ts', src)
    }
    console.log(src)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const sel = buildings.find((b) => b.id === selected)

  return (
    <>
      <div
        ref={layerRef}
        className="absolute inset-0"
        style={{ zIndex: 15000 }}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
      >
        {[...buildings]
          .sort((a, b) => a.y - b.y)
          .map((b) => {
            const box = bbox(b)
            const isSel = b.id === selected
            return (
              <div
                key={b.id}
                title={b.label}
                onPointerDown={(e) => onPointerDown(e, b)}
                onWheel={(e) => onWheel(e, b)}
                className={`absolute cursor-move border-2 border-dashed ${
                  isSel ? 'border-berry bg-berry/10' : 'border-white/70 hover:border-sun'
                }`}
                style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}
              >
                <span className="pointer-events-none absolute -top-5 left-0 rounded bg-ink px-1 text-[11px] font-semibold text-white">
                  {b.label}
                </span>
              </div>
            )
          })}
        {buildings.map((b) => (
          <span
            key={b.id}
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-berry"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
          />
        ))}
      </div>

      {createPortal(
        <div className="fixed top-3 left-3 z-[30000] w-72 rounded-xl border-4 border-ink bg-cream p-3 text-sm text-ink shadow-[4px_4px_0_var(--color-ink)]">
          <p className="font-display text-lg uppercase leading-none">Modo colocación</p>
          <p className="mt-1 text-xs leading-snug text-ink/75">
            Arrastra para mover. Rueda o +/− para el tamaño. Flechas para afinar (Mayús = ×10).
          </p>
          {sel ? (
            <div className="mt-3 space-y-1.5">
              <p className="font-bold">{sel.label}</p>
              {(['x', 'y', 'width'] as const).map((k) => (
                <label key={k} className="flex items-center justify-between gap-2">
                  <span className="w-12 font-mono">{k}</span>
                  <input
                    type="number"
                    step={0.1}
                    value={round(sel[k])}
                    onChange={(e) => update(sel.id, { [k]: Number(e.target.value) })}
                    className="w-full rounded border-2 border-ink bg-white px-1.5 py-0.5 font-mono"
                  />
                  <span className="text-xs">%</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-ink/75">Selecciona un edificio.</p>
          )}
          <button
            type="button"
            onClick={copy}
            className="mt-3 w-full rounded-lg border-4 border-ink bg-sun py-1.5 font-display uppercase tracking-wide shadow-[3px_3px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {copied ? 'Copiado' : 'Copiar coordenadas'}
          </button>
        </div>,
        document.body,
      )}
    </>
  )
}
