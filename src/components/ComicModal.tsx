import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  color?: string
  children: ReactNode
}

// Ventana reutilizable para todas las Sub-UIs interiores
export default function ComicModal({ open, onClose, title, subtitle, color = '#ffd23f', children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[5000] grid place-items-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={onClose} />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ scale: 0.6, y: 60, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.7, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] border-4 border-ink bg-cream shadow-comic-lg"
          >
            <header
              className="relative flex items-center gap-3 border-b-4 border-ink px-5 py-3"
              style={{ background: color }}
            >
              <div className="halftone pointer-events-none absolute inset-0 opacity-60" />
              <div className="relative min-w-0 flex-1">
                <h2 className="truncate font-display text-3xl leading-none text-paper outline-text">{title}</h2>
                {subtitle && (
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink/80">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="comic-btn relative grid h-10 w-10 shrink-0 place-items-center bg-paper"
              >
                <X strokeWidth={3.5} />
              </button>
            </header>

            <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
