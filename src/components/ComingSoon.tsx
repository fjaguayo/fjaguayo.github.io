import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BUILDINGS, type BuildingId } from '../data/buildings'
import { ENTER_EVENT } from '../lib/enterBuilding'
import { hasInterior } from '../interiors'

/** Aviso discreto de "Próximamente" al hacer clic en un edificio que aún no tiene interior. */
export default function ComingSoon() {
  const [current, setCurrent] = useState<{ id: BuildingId; n: number } | null>(null)

  useEffect(() => {
    const onEnter = (e: Event) => {
      const id = (e as CustomEvent<BuildingId>).detail
      if (hasInterior(id)) return
      setCurrent((prev) => ({ id, n: (prev?.n ?? 0) + 1 }))
    }
    window.addEventListener(ENTER_EVENT, onEnter)
    return () => window.removeEventListener(ENTER_EVENT, onEnter)
  }, [])

  useEffect(() => {
    if (!current) return
    const t = window.setTimeout(() => setCurrent(null), 2200)
    return () => window.clearTimeout(t)
  }, [current])

  const label = current && BUILDINGS.find((b) => b.id === current.id)?.label

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[20000] -translate-x-1/2"
    >
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.n}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="rounded-xl border-4 border-ink bg-cream px-5 py-3 text-center shadow-[4px_4px_0_var(--color-ink)]"
          >
            <span className="block font-display text-xl uppercase leading-none tracking-wide text-ink">
              {label}
            </span>
            <span className="mt-1 block text-sm font-semibold text-ink/80">Próximamente</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
