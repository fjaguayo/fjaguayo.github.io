import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { BuildingId } from '../../data/buildings'
import { enterBuilding } from '../../lib/enterBuilding'
import { hasInterior } from '../../interiors'
import ExitButton from './ExitButton'
import { useLang } from '../../lib/i18n'

interface Props {
  onExit: () => void
}

/**
 * Metro: plano esquemático con una parada por edificio. Todas las líneas pasan por
 * la estación central, que es donde estás. Pulsar una parada te lleva directo al edificio.
 * Coordenadas en el viewBox de 1000×600.
 */

const HUB = { x: 500, y: 300 }

type Station = {
  id: BuildingId
  x: number
  y: number
  label: 'left' | 'right' | 'top' | 'bottom'
  /** Desplaza el texto (nombre y subtítulo) en horizontal, para que no pise una línea. */
  nudge?: number
}

const LINES: { name: string; nameEn: string; color: string; path: string; stations: Station[] }[] = [
  {
    name: 'Línea 1 · Profesional',
    nameEn: 'Line 1 · Professional',
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
    nameEn: 'Line 2 · Social',
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
    nameEn: 'Line 3 · Leisure',
    color: '#3bceac',
    path: 'M270 90 L480 300 L690 510 H810',
    stations: [
      { id: 'gimnasio', x: 270, y: 90, label: 'left' },
      { id: 'arcade', x: 370, y: 190, label: 'left' },
      { id: 'cine', x: 610, y: 410, label: 'right', nudge: 16 },
      { id: 'parque', x: 800, y: 510, label: 'bottom' },
    ],
  },
  {
    name: 'Línea 4 · Viajes',
    nameEn: 'Line 4 · Travel',
    color: '#ffd23f',
    path: 'M500 300 L390 410 H150',
    stations: [{ id: 'aeropuerto', x: 170, y: 410, label: 'bottom' }],
  },
]

/** Lo que encuentras en cada parada, en una frase. Las que aún no tienen interior dicen "Próximamente". */
const BLURBS: Partial<Record<BuildingId, { es: string; en: string }>> = {
  universidad: { es: 'Mi formación, paso a paso', en: 'My education, step by step' },
  centro_civico: { es: 'Mis redes sociales', en: 'My social networks' },
  oficina_correos: { es: 'Mándame una postal', en: 'Send me a postcard' },
  cartel_bienvenida: { es: 'Mi currículum', en: 'My résumé' },
  gimnasio: { es: 'Mi rutina y mi rango', en: 'My routine and rank' },
  arcade: { es: 'Música, juegos y DnD', en: 'Music, games and DnD' },
  cine: { es: 'Mis series y pelis favoritas', en: 'My favorite shows and films' },
  parque: { es: 'Mis mascotas y sus terrarios', en: 'My pets and their terrariums' },
  aeropuerto: { es: 'Los países que he visitado', en: "Countries I've visited" },
}

const LABEL_OFFSET = {
  left: { dx: -22, dy: 6, anchor: 'end' },
  right: { dx: 22, dy: 6, anchor: 'start' },
  top: { dx: 0, dy: -24, anchor: 'middle' },
  bottom: { dx: 0, dy: 36, anchor: 'middle' },
} as const

export default function MetroInterior({ onExit }: Props) {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState<BuildingId | null>(null)
  const { en, t, buildingName: nameOf } = useLang()

  return (
    <div className="fixed inset-0 flex overflow-y-auto overscroll-contain px-6 pt-20 pb-6 compact:px-3 compact:pt-16 compact:pb-[calc(var(--safe-bottom)+12px)]">
      <button
        type="button"
        aria-label={t('Cerrar el plano del metro', 'Close the metro map')}
        tabIndex={-1}
        onClick={onExit}
        className="fixed inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-label={t('Plano del metro: acceso rápido a todos los edificios', 'Metro map: quick access to every building')}
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative m-auto w-[min(1120px,94vw)] overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)] compact:w-full compact:max-w-[1120px] compact:shadow-[5px_5px_0_var(--color-ink)]"
      >
        <header className="flex items-center gap-3 border-b-4 border-ink bg-ink px-5 py-3 text-cream compact:px-4 compact:py-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-cream bg-berry font-display text-xl leading-none">
            M
          </span>
          <div>
            <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide compact:text-xl">{t('Metro de FJAH City', 'FJAH City Metro')}</h2>
            <p className="m-0 mt-1 text-sm font-semibold text-cream/75">{t('Pulsa una parada para ir directo', 'Click a stop to go straight there')}</p>
          </div>
        </header>

        {/* en el móvil el plano quedaría diminuto: se enseñan las líneas como listas de paradas */}
        <MetroList />

        <div className="p-4 compact:hidden">
          <svg viewBox="0 0 1000 600" className="block h-auto w-full" role="group" aria-label={t('Paradas', 'Stops')}>
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
                  {t('Estás aquí', 'You are here')}
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
                const blurb = open ? BLURBS[s.id]?.[en ? 'en' : 'es'] : t('Próximamente', 'Coming soon')
                return (
                  <g
                    key={s.id}
                    role="button"
                    tabIndex={open ? 0 : -1}
                    aria-disabled={!open}
                    aria-label={open ? t(`Ir a ${name}: ${blurb}`, `Go to ${name}: ${blurb}`) : t(`${name}, próximamente`, `${name}, coming soon`)}
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
                      x={s.x + o.dx + (s.nudge ?? 0)}
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
                    {blurb && (
                      <text
                        x={s.x + o.dx + (s.nudge ?? 0)}
                        y={s.y + o.dy + 21}
                        textAnchor={o.anchor}
                        fontSize={15}
                        fontWeight={700}
                        fill={open ? '#1b1b2fb3' : '#1b1b2f80'}
                        stroke="#fff6e3"
                        strokeWidth={5}
                        paintOrder="stroke"
                      >
                        {blurb}
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
                {en ? l.nameEn : l.name}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}

/** Versión para el móvil: cada línea es una lista vertical de paradas, como el cartel de un andén. */
function MetroList() {
  const { en, t, buildingName: nameOf } = useLang()
  return (
    <div className="hidden grid-cols-2 gap-3 p-3 compact:grid short:grid-cols-4">
      {LINES.map((l) => (
        <section key={l.name} aria-label={en ? l.nameEn : l.name} className="min-w-0 rounded-xl border-[3px] border-ink bg-white p-3 shadow-[3px_3px_0_var(--color-ink)]">
          <h3 className="m-0 flex items-center gap-2 text-[13px] font-extrabold leading-tight text-ink">
            <span className="h-3 w-6 shrink-0 rounded-full border-2 border-ink" style={{ background: l.color }} />
            {en ? l.nameEn : l.name}
          </h3>
          <ol className="relative m-0 mt-2 list-none p-0">
            {/* el trazado de la línea, detrás de los puntos */}
            <span
              aria-hidden="true"
              className="absolute top-3 bottom-3 left-[9px] w-[6px] rounded-full border-2 border-ink"
              style={{ background: l.color }}
            />
            {l.stations.map((st) => {
              const open = hasInterior(st.id)
              const name = nameOf(st.id)
              const blurb = BLURBS[st.id]?.[en ? 'en' : 'es']
              return (
                <li key={st.id}>
                  <button
                    type="button"
                    disabled={!open}
                    onClick={() => enterBuilding(st.id)}
                    aria-label={open ? t(`Ir a ${name}: ${blurb}`, `Go to ${name}: ${blurb}`) : t(`${name}, próximamente`, `${name}, coming soon`)}
                    className="relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent py-1.5 pr-1 text-left outline-none active:bg-sun/40 focus-visible:outline-3 focus-visible:outline-sky disabled:cursor-not-allowed"
                  >
                    <span
                      aria-hidden="true"
                      className={`relative z-10 h-6 w-6 shrink-0 rounded-full border-4 border-ink ${open ? 'bg-white' : 'bg-[#d6d1c4]'}`}
                    />
                    <span className="min-w-0">
                      <span className={`block font-display text-[15px] uppercase leading-none tracking-wide ${open ? 'text-ink' : 'text-ink/45'}`}>
                        {name}
                      </span>
                      {open ? (
                        blurb && <span className="mt-0.5 block text-[11px] leading-tight font-semibold text-ink/65">{blurb}</span>
                      ) : (
                        <span className="mt-0.5 block text-[11px] font-bold text-ink/45">{t('Próximamente', 'Coming soon')}</span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
