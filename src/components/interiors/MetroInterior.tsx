import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BUILDINGS, type BuildingId } from '../../data/buildings'
import { enterBuilding } from '../../lib/enterBuilding'
import { hasInterior } from '../../interiors'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

/**
 * Metro: plano esquemático con una parada por edificio. Todas las líneas pasan por
 * la estación central, que es donde estás. Pulsar una parada te lleva directo al edificio.
 * Coordenadas en el viewBox de 1000×600.
 */

const HUB = { x: 500, y: 300 }

type Station = { id: BuildingId; x: number; y: number; label: 'left' | 'right' | 'top' | 'bottom' }

const LINES: { name: string; color: string; path: string; stations: Station[] }[] = [
  {
    name: 'Línea 1 · Profesional',
    color: '#ee4266',
    path: 'M120 300 H880',
    stations: [
      { id: 'universidad', x: 140, y: 300, label: 'bottom' },
      { id: 'empresa', x: 320, y: 300, label: 'bottom' },
      { id: 'taller', x: 690, y: 300, label: 'bottom' },
    ],
  },
  {
    name: 'Línea 2 · Social',
    color: '#4d9de0',
    path: 'M500 70 V530',
    stations: [
      { id: 'centro_civico', x: 500, y: 90, label: 'right' },
      { id: 'oficina_correos', x: 500, y: 190, label: 'right' },
      { id: 'cartel_bienvenida', x: 500, y: 510, label: 'right' },
    ],
  },
  {
    name: 'Línea 3 · Ocio',
    color: '#3bceac',
    path: 'M270 90 L480 300 L690 510 H810',
    stations: [
      { id: 'gimnasio', x: 270, y: 90, label: 'left' },
      { id: 'arcade', x: 370, y: 190, label: 'left' },
      { id: 'cine', x: 610, y: 410, label: 'right' },
      { id: 'parque', x: 800, y: 510, label: 'right' },
    ],
  },
  {
    name: 'Línea 4 · Viajes',
    color: '#ffd23f',
    path: 'M500 300 L390 410 H150',
    stations: [{ id: 'aeropuerto', x: 170, y: 410, label: 'bottom' }],
  },
]

const LABEL_OFFSET = {
  left: { dx: -22, dy: 6, anchor: 'end' },
  right: { dx: 22, dy: 6, anchor: 'start' },
  top: { dx: 0, dy: -24, anchor: 'middle' },
  bottom: { dx: 0, dy: 36, anchor: 'middle' },
} as const

const nameOf = (id: BuildingId) => BUILDINGS.find((b) => b.id === id)?.label ?? id

export default function MetroInterior({ onExit }: Props) {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState<BuildingId | null>(null)

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Cerrar el plano del metro"
        tabIndex={-1}
        onClick={onExit}
        className="absolute inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-label="Plano del metro: acceso rápido a todos los edificios"
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative w-[min(1120px,94vw)] overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)]"
      >
        <header className="flex items-center gap-3 border-b-4 border-ink bg-ink px-5 py-3 text-cream">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-cream bg-berry font-display text-xl leading-none">
            M
          </span>
          <div>
            <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide">Metro de FJAH City</h2>
            <p className="m-0 mt-1 text-sm font-semibold text-cream/75">Pulsa una parada para ir directo</p>
          </div>
        </header>

        <div className="p-4">
          <svg viewBox="0 0 1000 600" className="block h-auto w-full" role="group" aria-label="Paradas">
            {/* fondo de plano: cuadrícula suave */}
            <defs>
              <pattern id="metro-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="#1b1b2f" strokeOpacity="0.06" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="1000" height="600" fill="url(#metro-grid)" />

            {/* líneas: contorno de tinta y color encima */}
            {LINES.map((l) => (
              <g key={l.name}>
                <path d={l.path} fill="none" stroke="#1b1b2f" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
                <path d={l.path} fill="none" stroke={l.color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ))}

            {/* trenes que van y vienen por cada línea */}
            {!reduce &&
              LINES.map((l, i) => (
                <rect key={l.name} x={-13} y={-7} width={26} height={14} rx={5} fill="#fff6e3" stroke="#1b1b2f" strokeWidth={3}>
                  <animateMotion dur={`${9 + i * 2}s`} repeatCount="indefinite" path={l.path} rotate="auto" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" />
                </rect>
              ))}

            {/* estación central */}
            <g aria-hidden="true">
              <rect x={HUB.x - 46} y={HUB.y - 26} width={92} height={52} rx={26} fill="#fff" stroke="#1b1b2f" strokeWidth={6} />
              <text x={HUB.x} y={HUB.y + 8} textAnchor="middle" className="font-display" fontSize={24} fill="#1b1b2f">
                M
              </text>
              <g transform={`translate(${HUB.x + 56} ${HUB.y - 48})`}>
                <rect x={0} y={-22} width={150} height={34} rx={10} fill="#1b1b2f" />
                <text x={75} y={2} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff6e3">
                  Estás aquí
                </text>
              </g>
            </g>

            {/* paradas */}
            {LINES.flatMap((l) =>
              l.stations.map((s) => {
                const open = hasInterior(s.id)
                const on = hover === s.id
                const o = LABEL_OFFSET[s.label]
                const name = nameOf(s.id)
                return (
                  <g
                    key={s.id}
                    role="button"
                    tabIndex={open ? 0 : -1}
                    aria-disabled={!open}
                    aria-label={open ? `Ir a ${name}` : `${name}, próximamente`}
                    onClick={() => open && enterBuilding(s.id)}
                    onKeyDown={(e) => {
                      if (open && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        enterBuilding(s.id)
                      }
                    }}
                    onMouseEnter={() => setHover(s.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(s.id)}
                    onBlur={() => setHover(null)}
                    className={`outline-none ${open ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    {/* zona de clic generosa */}
                    <circle cx={s.x} cy={s.y} r={30} fill="transparent" />
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={on && open ? 19 : 15}
                      fill={open ? '#fff' : '#d6d1c4'}
                      stroke="#1b1b2f"
                      strokeWidth={6}
                      style={{ transition: 'r 0.15s ease' }}
                    />
                    <text
                      x={s.x + o.dx}
                      y={s.y + o.dy}
                      textAnchor={o.anchor}
                      fontSize={on && open ? 25 : 22}
                      fill={open ? '#1b1b2f' : '#1b1b2f80'}
                      stroke="#fff6e3"
                      strokeWidth={6}
                      paintOrder="stroke"
                      className="font-display uppercase"
                      style={{ transition: 'font-size 0.15s ease' }}
                    >
                      {name}
                    </text>
                    {!open && (
                      <text
                        x={s.x + o.dx}
                        y={s.y + o.dy + 20}
                        textAnchor={o.anchor}
                        fontSize={14}
                        fontWeight={700}
                        fill="#1b1b2f80"
                        stroke="#fff6e3"
                        strokeWidth={4}
                        paintOrder="stroke"
                      >
                        Próximamente
                      </text>
                    )}
                  </g>
                )
              }),
            )}
          </svg>

          {/* leyenda */}
          <ul className="m-0 mt-2 flex list-none flex-wrap justify-center gap-x-6 gap-y-2 p-0">
            {LINES.map((l) => (
              <li key={l.name} className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="h-3 w-8 rounded-full border-2 border-ink" style={{ background: l.color }} />
                {l.name}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}
