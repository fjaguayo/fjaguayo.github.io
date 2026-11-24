import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  /** De 0 a 1. */
  volume: number
  onChange: (volume: number) => void
}

/**
 * Botón fijo del volumen de la música de la ciudad. Al pulsarlo se despliega a su derecha una
 * barra para ajustarlo; a 0 la música se calla. Se cierra pulsando fuera, con Escape o con el botón.
 * La rueda del ratón sobre el botón también sube y baja el volumen.
 */
export default function MusicVolume({ volume, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const slider = useRef<HTMLInputElement>(null)
  const panelId = useId()
  // volumen al que vuelve el botón de silencio rápido
  const lastAudible = useRef(volume > 0 ? volume : 1)
  if (volume > 0) lastAudible.current = volume

  useEffect(() => {
    if (!open) return
    slider.current?.focus({ preventScroll: true })
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        root.current?.querySelector<HTMLButtonElement>('button')?.focus()
      }
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const pct = Math.round(volume * 100)
  const label = volume === 0 ? 'Música en silencio' : `Volumen de la música: ${pct} %`
  const set = (v: number) => onChange(Math.round(Math.min(1, Math.max(0, v)) * 20) / 20) // pasos de 5 %

  return (
    <div
      ref={root}
      className="fixed bottom-[calc(var(--safe-bottom)+20px)] left-[calc(var(--safe-left)+20px)] z-[20000] flex items-center gap-3 compact:bottom-[calc(var(--safe-bottom)+12px)] compact:left-[calc(var(--safe-left)+12px)]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onWheel={(e) => set(volume + (e.deltaY < 0 ? 0.05 : -0.05))}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}. Ajustar volumen`}
        title={label}
        className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border-4 border-ink bg-cream text-ink shadow-[4px_4px_0_var(--color-ink)] transition-transform outline-none hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sun compact:h-11 compact:w-11"
      >
        <SpeakerIcon volume={volume} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, x: -10, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 30 }}
            style={{ transformOrigin: 'left center' }}
            className="flex h-12 items-center gap-3 rounded-xl border-4 border-ink bg-cream pr-3 pl-1.5 text-ink shadow-[4px_4px_0_var(--color-ink)] compact:h-11"
          >
            {/* silencio rápido: deja a 0 o vuelve al último volumen */}
            <button
              type="button"
              onClick={() => onChange(volume > 0 ? 0 : lastAudible.current)}
              aria-label={volume > 0 ? 'Silenciar' : 'Quitar el silencio'}
              title={volume > 0 ? 'Silenciar' : 'Quitar el silencio'}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-ink outline-none hover:bg-ink/10 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-sun"
            >
              <SpeakerIcon volume={volume > 0 ? 0 : lastAudible.current} small />
            </button>
            <input
              ref={slider}
              type="range"
              min={0}
              max={100}
              step={5}
              value={pct}
              onChange={(e) => onChange(Number(e.target.value) / 100)}
              aria-label="Volumen de la música"
              aria-valuetext={volume === 0 ? 'Silencio' : `${pct} %`}
              className="fjah-range w-36 compact:w-28"
              style={{ ['--fill' as string]: `${pct}%` }}
            />
            <span className="w-10 text-right font-display text-lg leading-none tabular-nums" aria-hidden="true">
              {pct}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Altavoz con 0, 1 o 2 ondas según el volumen; con una cruz en silencio. */
function SpeakerIcon({ volume, small = false }: { volume: number; small?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={small ? 'h-5 w-5' : 'h-6 w-6'}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
      {volume === 0 ? (
        <path d="M16 9l5 6M21 9l-5 6" />
      ) : (
        <>
          <path d="M16 9.5a3.5 3.5 0 0 1 0 5" />
          {volume > 0.5 && <path d="M18.5 7a7 7 0 0 1 0 10" />}
        </>
      )}
    </svg>
  )
}
