import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LABELS, type ArcadePieceId, type ArcadePlacement } from '../../data/arcade'
import { heightPct } from '../interiors/ArcadeInterior'

/**
 * Colocación de la sala del Arcade, solo para desarrollo (`npm run dev` + `/?arcade-edit`).
 * - Arrastra una pieza para moverla (se mueve el centro de su base).
 * - Rueda del ratón o + y − para el tamaño. Flechas para afinar (Mayús = ×10). F la espeja.
 * - "Copiar coordenadas" deja el array listo para pegar en src/data/arcade.ts.
 */
interface Props {
  placements: ArcadePlacement[]
  onChange: (next: ArcadePlacement[]) => void
}

const round = (n: number) => Math.round(n * 10) / 10
const name = (id: ArcadePieceId) => (id === 'sala' ? 'Sala' : LABELS[id])

function toSource(list: ArcadePlacement[]) {
  const lines = list.map(
    (p) => `  { id: '${p.id}', x: ${round(p.x)}, y: ${round(p.y)}, width: ${round(p.width)}${p.flip ? ', flip: true' : ''} },`,
  )
  return `export const PLACEMENTS: ArcadePlacement[] = [\n${lines.join('\n')}\n]\n`
}

export default function ArcadeEditor({ placements, onChange }: Props) {
  const [selected, setSelected] = useState<ArcadePieceId | null>(null)
  const [copied, setCopied] = useState(false)
  const layer = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: ArcadePieceId; sx: number; sy: number; x: number; y: number } | null>(null)

  const update = (id: ArcadePieceId, patch: Partial<ArcadePlacement>) =>
    onChange(placements.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected || (e.target as HTMLElement).tagName === 'INPUT') return
      const p = placements.find((x) => x.id === selected)!
      const step = e.shiftKey ? 1 : 0.1
      const moves: Record<string, Partial<ArcadePlacement>> = {
        ArrowLeft: { x: p.x - step },
        ArrowRight: { x: p.x + step },
        ArrowUp: { y: p.y - step },
        ArrowDown: { y: p.y + step },
        '+': { width: p.width + step },
        '=': { width: p.width + step },
        '-': { width: Math.max(1, p.width - step) },
        f: { flip: !p.flip },
        F: { flip: !p.flip },
      }
      if (!(e.key in moves)) return
      e.preventDefault()
      e.stopImmediatePropagation()
      update(selected, moves[e.key])
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    const r = layer.current?.getBoundingClientRect()
    if (!d || !r) return
    update(d.id, { x: d.x + ((e.clientX - d.sx) / r.width) * 100, y: d.y + ((e.clientY - d.sy) / r.height) * 100 })
  }

  const copy = async () => {
    const src = toSource(placements)
    try {
      await navigator.clipboard.writeText(src)
    } catch {
      window.prompt('Copia esto en src/data/arcade.ts', src)
    }
    console.log(src)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const sel = placements.find((p) => p.id === selected)

  return (
    <>
      <div
        ref={layer}
        className="absolute inset-0"
        style={{ zIndex: 15000 }}
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
      >
        {[...placements]
          .sort((a, b) => (a.id === 'sala' ? -1 : b.id === 'sala' ? 1 : a.y - b.y))
          .map((p) => {
            const h = heightPct(p)
            const isSel = p.id === selected
            return (
              <div
                key={p.id}
                onPointerDown={(e) => {
                  e.preventDefault()
                  ;(e.target as Element).setPointerCapture(e.pointerId)
                  setSelected(p.id)
                  drag.current = { id: p.id, sx: e.clientX, sy: e.clientY, x: p.x, y: p.y }
                }}
                onWheel={(e) => update(p.id, { width: Math.max(1, p.width + (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? 1 : 0.25)) })}
                className={`absolute cursor-move border-2 border-dashed ${isSel ? 'border-berry bg-berry/10' : 'border-white/60 hover:border-sun'}`}
                style={{ left: `${p.x - p.width / 2}%`, top: `${p.y - h}%`, width: `${p.width}%`, height: `${h}%` }}
              >
                <span className="pointer-events-none absolute top-1 left-1 rounded bg-ink px-1 text-[11px] font-semibold text-white">
                  {name(p.id)}
                </span>
                <span className="pointer-events-none absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white bg-berry" />
              </div>
            )
          })}
      </div>

      {createPortal(
        <div className="fixed right-3 bottom-3 z-[40000] w-72 rounded-xl border-4 border-ink bg-cream p-3 text-sm text-ink shadow-[4px_4px_0_var(--color-ink)]">
          <p className="m-0 font-display text-lg uppercase leading-none">Colocar el Arcade</p>
          <p className="m-0 mt-1 text-xs leading-snug text-ink/75">
            Arrastra para mover. Rueda o +/− para el tamaño. Flechas para afinar (Mayús = ×10). F espeja.
          </p>
          {sel ? (
            <div className="mt-3 space-y-1.5">
              <p className="m-0 font-bold">{name(sel.id)}</p>
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
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!sel.flip} onChange={(e) => update(sel.id, { flip: e.target.checked })} />
                Espejar
              </label>
            </div>
          ) : (
            <p className="m-0 mt-3 text-ink/75">Selecciona una pieza.</p>
          )}
          <button
            type="button"
            onClick={copy}
            className="mt-3 w-full cursor-pointer rounded-lg border-4 border-ink bg-sun py-1.5 font-display uppercase tracking-wide shadow-[3px_3px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {copied ? 'Copiado' : 'Copiar coordenadas'}
          </button>
        </div>,
        document.body,
      )}
    </>
  )
}
