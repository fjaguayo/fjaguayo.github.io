import { useState } from 'react'
import { motion } from 'framer-motion'
import type { BuildingDef } from '../data/buildings'
import { asset, shade } from '../lib/color'

interface Props {
  def: BuildingDef
  onHover: (b: BuildingDef | null) => void
  onOpen: (id: string) => void
}

export default function Building({ def, onHover, onOpen }: Props) {
  const [missing, setMissing] = useState(false)

  return (
    <div
      className="absolute"
      style={{
        left: `${def.x}%`,
        top: `${def.y}%`,
        width: `${def.width}%`,
        transform: 'translate(-50%, -100%)',
        zIndex: Math.round(def.y * 10),
      }}
    >
      <motion.button
        type="button"
        aria-label={`${def.name}: ${def.section}`}
        className="group relative block w-full cursor-pointer outline-none"
        style={{ originY: 1 }}
        whileHover={{ scale: 1.07, y: -8 }}
        whileFocus={{ scale: 1.07, y: -8 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        onPointerEnter={() => onHover(def)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(def)}
        onBlur={() => onHover(null)}
        onClick={() => onOpen(def.id)}
      >
        {missing ? (
          <PlaceholderBlock def={def} />
        ) : (
          <img
            src={asset(def.file)}
            alt=""
            draggable={false}
            onError={() => setMissing(true)}
            className="block w-full select-none transition-[filter] duration-150 [filter:drop-shadow(0_6px_0_rgba(27,27,47,0.35))] group-hover:[filter:drop-shadow(0_10px_0_rgba(27,27,47,0.35))_brightness(1.08)]"
          />
        )}
      </motion.button>
    </div>
  )
}

// Bloque isométrico provisional hasta que llegue el PNG real
function PlaceholderBlock({ def }: { def: BuildingDef }) {
  const base = def.color
  return (
    <div className="relative">
      <svg viewBox="0 0 200 200" className="block w-full overflow-visible">
        <ellipse cx="100" cy="186" rx="78" ry="14" fill="rgba(27,27,47,0.25)" />
        <path d="M20 80 L100 120 L100 190 L20 150 Z" fill={base} stroke="#1b1b2f" strokeWidth="6" strokeLinejoin="round" />
        <path d="M100 120 L180 80 L180 150 L100 190 Z" fill={shade(base, -0.28)} stroke="#1b1b2f" strokeWidth="6" strokeLinejoin="round" />
        <path d="M100 40 L180 80 L100 120 L20 80 Z" fill={shade(base, 0.35)} stroke="#1b1b2f" strokeWidth="6" strokeLinejoin="round" />
        {/* ventanas */}
        {[0, 1].map((i) => (
          <path
            key={i}
            d={`M${38 + i * 30} ${108 + i * 15} l18 9 l0 20 l-18 -9 Z`}
            fill="#fff6e3"
            stroke="#1b1b2f"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        ))}
        <path d="M128 128 l30 -15 l0 32 l-30 15 Z" fill="#1b1b2f" opacity="0.85" />
      </svg>
      <span className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 whitespace-nowrap rounded-lg border-4 border-ink bg-paper px-3 py-1 font-display text-[30px] leading-none shadow-comic">
        {def.name}
      </span>
    </div>
  )
}
