import { AnimatePresence, motion } from 'framer-motion'
import type { BuildingDef } from '../../data/buildings'

// Cartel colgante del centro superior. Muestra el edificio bajo el cursor.
export default function TopSign({ hovered }: { hovered: BuildingDef | null }) {
  const key = hovered?.id ?? 'default'
  const title = hovered?.name ?? 'FJAH City'
  const subtitle = hovered?.section ?? 'Pasa el ratón por los edificios'
  const accent = hovered?.color ?? '#ffd23f'

  return (
    <div className="pointer-events-none flex flex-col items-center">
      {/* cuerdas */}
      <div className="flex w-[180px] justify-between">
        <span className="h-4 w-1 rounded-full bg-ink" />
        <span className="h-4 w-1 rounded-full bg-ink" />
      </div>
      <motion.div
        key={`swing-${key}`}
        initial={{ rotate: -3 }}
        animate={{ rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 8 }}
        style={{ originY: 0 }}
        className="comic-panel relative min-w-[260px] overflow-hidden px-6 pb-2 pt-1.5 text-center"
      >
        <span className="absolute inset-x-0 top-0 h-2" style={{ background: accent }} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={key}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            <p className="font-display text-[28px] leading-tight tracking-wide">{title}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
