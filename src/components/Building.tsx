import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HIT_AREAS, assetUrl, type BuildingConfig } from '../data/buildings'
import { enterBuilding } from '../lib/enterBuilding'

interface Props {
  building: BuildingConfig
  /** En el modo de colocación el edificio no reacciona: lo maneja la capa de edición. */
  editing?: boolean
}

const spring = { type: 'spring', stiffness: 380, damping: 22, mass: 0.7 } as const

export default function Building({ building, editing = false }: Props) {
  const { id, label, image, x, y, width } = building
  const hit = HIT_AREAS[id]
  const [ax, ay] = hit.anchor
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = !editing && (hovered || focused)

  return (
    <button
      type="button"
      aria-label={label}
      tabIndex={editing ? -1 : 0}
      onClick={() => !editing && enterBuilding(id)}
      onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
      className="pointer-events-none absolute block cursor-pointer border-0 bg-transparent p-0 outline-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        aspectRatio: `${hit.width} / ${hit.height}`,
        transform: `translate(${-ax * 100}%, ${-ay * 100}%)`,
        // lo que está más abajo en pantalla queda delante; el activo, encima de todo
        zIndex: Math.round(y * 10) + (active ? 10000 : 0),
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: `${ax * 100}% ${ay * 100}%` }}
        animate={active ? { scale: 1.08, y: -6 } : { scale: 1, y: 0 }}
        transition={spring}
      >
        <img
          src={assetUrl(image)}
          alt=""
          draggable={false}
          decoding="async"
          className="absolute inset-0 h-full w-full"
        />
        <img
          src={assetUrl(`${image}_hover`)}
          alt=""
          draggable={false}
          decoding="async"
          className="absolute inset-0 h-full w-full transition-opacity duration-100"
          style={{ opacity: active ? 1 : 0 }}
        />
        {/* solo el dibujo responde al ratón, no el rectángulo transparente */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {hit.polygons.map((poly, i) => (
            <polygon
              key={i}
              points={poly.map(([px, py]) => `${px},${py}`).join(' ')}
              fill="transparent"
              style={{ pointerEvents: editing ? 'none' : 'auto' }}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            />
          ))}
        </svg>
      </motion.div>

      <AnimatePresence>
        {active && (
          <motion.span
            key="label"
            className="absolute whitespace-nowrap rounded-xl border-4 border-ink bg-white px-[0.7em] pt-[0.35em] pb-[0.2em] font-display uppercase leading-none tracking-wide text-ink shadow-[4px_4px_0_var(--color-ink)]"
            style={{
              left: `${ax * 100}%`,
              top: `${ay * 100}%`,
              x: '-50%',
              fontSize: 'clamp(15px, 1.15cqw, 26px)',
            }}
            initial={{ opacity: 0, y: -4, scale: 0.7 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.85, transition: { duration: 0.1 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
