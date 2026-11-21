import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MAP, PETS, PET_HIT, PLACEMENTS, parqueUrl, type Placement, type PetKind } from '../../data/mascotas'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

const ratio = MAP.width / MAP.height

/** El Parque: los terrarios de Javier con sus mascotas. Al pulsar una, sale su ficha. */
export default function ParqueInterior({ onExit }: Props) {
  const [open, setOpen] = useState<PetKind | null>(null)

  // Escape cierra primero la ficha (ExitButton escucha en window; aquí paramos antes en captura)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        setOpen(null)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 pt-20 pb-4">
      <button
        type="button"
        aria-label="Cerrar el parque"
        tabIndex={-1}
        onClick={onExit}
        className="absolute inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-label="Mis mascotas"
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)]"
        style={{ width: `min(1500px, 96vw, calc((100dvh - 96px - 62px) * ${ratio}))` }}
      >
        <header className="flex items-center justify-between border-b-4 border-ink bg-mint px-5 py-3">
          <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide text-ink">Mis mascotas</h2>
          <span className="text-sm font-bold text-ink/80">Pulsa en una para conocerla</span>
        </header>

        <div className="relative [container-type:inline-size]" style={{ aspectRatio: `${MAP.width} / ${MAP.height}` }}>
          <img src={parqueUrl('terrarios')} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
          {PLACEMENTS.map((p, i) => (
            <PetSprite key={i} p={p} onOpen={() => setOpen(p.id)} />
          ))}

          <AnimatePresence>{open && <PetCard key={open} kind={open} onClose={() => setOpen(null)} />}</AnimatePresence>
        </div>
      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}

function PetSprite({ p, onOpen }: { p: Placement; onOpen: () => void }) {
  const hit = PET_HIT[p.id]
  const pet = PETS[p.id]
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = hovered || focused
  const hitPath = hit.polygons.map((poly) => `M${poly.map(([x, y]) => `${x},${y}`).join('L')}Z`).join('')
  const rot = p.rotate ?? 0

  return (
    <button
      type="button"
      aria-label={`${pet.name}, ${pet.species}`}
      onClick={onOpen}
      onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
      className="pointer-events-none absolute block cursor-pointer border-0 bg-transparent p-0 outline-none"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: `${p.width}%`,
        aspectRatio: `${hit.width} / ${hit.height}`,
        transform: 'translate(-50%, -100%)',
        zIndex: Math.round(p.y * 10) + (active ? 10000 : 0),
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: '50% 100%' }}
        animate={active ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.7 }}
      >
        <div
          className="absolute inset-0"
          style={{ transformOrigin: '50% 100%', transform: `rotate(${rot}deg) scaleX(${p.flip ? -1 : 1})` }}
        >
          <img src={parqueUrl(p.id)} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
          <img
            src={parqueUrl(`${p.id}_hover`)}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full transition-opacity duration-100"
            style={{ opacity: active ? 1 : 0 }}
          />
          {/* solo el dibujo responde al ratón */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
            <path
              d={hitPath}
              fill="transparent"
              style={{ pointerEvents: 'auto' }}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            />
          </svg>
        </div>
      </motion.div>

      <AnimatePresence>
        {active && (
          <motion.span
            className="absolute top-full left-1/2 whitespace-nowrap rounded-xl border-4 border-ink bg-white px-[0.7em] pt-[0.35em] pb-[0.2em] font-display uppercase leading-none tracking-wide text-ink shadow-[4px_4px_0_var(--color-ink)]"
            style={{ x: '-50%', fontSize: 'clamp(14px, 1.5cqw, 24px)' }}
            initial={{ opacity: 0, y: -4, scale: 0.7 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.85, transition: { duration: 0.1 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
          >
            {pet.name}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

function PetCard({ kind, onClose }: { kind: PetKind; onClose: () => void }) {
  const pet = PETS[kind]
  return (
    <motion.div
      className="absolute inset-0 z-[20000] flex items-center justify-center bg-ink/45"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-label={`Ficha de ${pet.name}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, scale: 0.9, rotate: -2 }}
        animate={{ y: 0, scale: 1, rotate: 0 }}
        exit={{ y: 20, scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="relative flex w-[min(560px,80%)] items-center gap-5 rounded-2xl border-4 border-ink bg-cream p-5 shadow-[6px_6px_0_var(--color-ink)]"
      >
        <div className="flex h-36 w-44 shrink-0 items-center justify-center rounded-xl border-[3px] border-ink bg-[#cfe9f2]">
          <img src={parqueUrl(kind)} alt="" className="max-h-[85%] max-w-[85%]" />
        </div>
        <div className="min-w-0">
          <span className="inline-block rounded-full border-[3px] border-ink bg-sun px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide text-ink">
            {pet.species}
          </span>
          <h3 className="m-0 mt-2 font-display text-3xl uppercase leading-none tracking-wide text-ink">{pet.name}</h3>
          <p className="m-0 mt-2 text-[15px] leading-snug font-medium text-ink/85">{pet.info}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Cerrar la ficha"
          className="absolute -top-4 -right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-ink bg-berry text-white shadow-[3px_3px_0_var(--color-ink)] outline-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sun"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  )
}
