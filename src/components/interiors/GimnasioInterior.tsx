import { motion } from 'framer-motion'
import { ROUTINES, SYMMETRY, gymUrl, type Routine } from '../../data/gym'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

/** El Gimnasio: en el centro, el cuerpo y el rango de Symmetry; a los lados, la rutina en cuatro bloques. */
export default function GimnasioInterior({ onExit }: Props) {
  const left = ROUTINES.slice(0, 2)
  const right = ROUTINES.slice(2)

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 pt-20 pb-4">
      <button
        type="button"
        aria-label="Cerrar el gimnasio"
        tabIndex={-1}
        onClick={onExit}
        className="absolute inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-label="Gimnasio: rango y rutina de entrenamiento"
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative flex max-h-full w-[min(1400px,96vw)] flex-col overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)]"
      >
        <header className="flex items-center justify-between border-b-4 border-ink bg-berry px-5 py-3">
          <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide text-white">Gimnasio</h2>
          <span className="text-sm font-bold text-white/90">Mi rutina semanal</span>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[1fr_minmax(260px,320px)_1fr] gap-5 overflow-y-auto p-5">
          <div className="flex flex-col gap-5">
            {left.map((r, i) => (
              <RoutineCard key={r.id} routine={r} delay={0.1 + i * 0.08} from={-24} />
            ))}
          </div>

          <RankPanel />

          <div className="flex flex-col gap-5">
            {right.map((r, i) => (
              <RoutineCard key={r.id} routine={r} delay={0.1 + i * 0.08} from={24} />
            ))}
          </div>
        </div>
      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}

function RankPanel() {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.05 }}
      className="flex min-h-0 flex-col items-center gap-4 rounded-2xl border-4 border-ink bg-[#121212] p-4 shadow-[4px_4px_0_var(--color-ink)]"
    >
      <div className="flex w-full items-center gap-3 rounded-xl border-[3px] border-white/25 bg-white/5 px-4 py-3">
        <SilverBadge />
        <div className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-white/50">Rango Symmetry</span>
          <span className="block font-display text-3xl uppercase leading-none tracking-wide text-[#dfe6ee]">
            {SYMMETRY.rank}
          </span>
          <span className="block text-sm font-semibold text-white/70">{SYMMETRY.percentile}</span>
        </div>
      </div>

      <img
        src={gymUrl('cuerpo')}
        alt="Mapa muscular de Symmetry: core y aductores en oro, el resto del cuerpo en plata"
        draggable={false}
        className="min-h-0 w-auto flex-1 object-contain"
        style={{ maxHeight: 'calc(100dvh - 400px)' }}
      />

      <motion.a
        href={SYMMETRY.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver mi perfil en Symmetry (se abre en otra pestaña)"
        whileHover={{ y: -3, scale: 1.03 }}
        whileFocus={{ y: -3, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-4 border-ink bg-sun px-4 py-2.5 font-display text-lg uppercase leading-none tracking-wide text-ink no-underline shadow-[4px_4px_0_#000] outline-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sky"
      >
        Ver mi Symmetry
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.a>
    </motion.div>
  )
}

function RoutineCard({ routine, delay, from }: { routine: Routine; delay: number; from: number }) {
  return (
    <motion.article
      initial={{ x: from, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
      className="overflow-hidden rounded-xl border-4 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)]"
    >
      <header
        className="flex items-baseline justify-between gap-3 border-b-4 border-ink px-4 py-2"
        style={{ background: routine.color }}
      >
        <h3 className="m-0 font-display text-xl uppercase leading-none tracking-wide text-ink">{routine.name}</h3>
        <span className="shrink-0 rounded-full border-[3px] border-ink bg-white px-2.5 py-0.5 text-xs font-extrabold uppercase text-ink">
          {routine.meta}
        </span>
      </header>

      <p className="m-0 px-4 pt-2 text-xs font-bold uppercase tracking-wide text-ink/55">{routine.focus}</p>

      <ol className="m-0 list-none px-4 pt-1 pb-3">
        {routine.exercises.map((ex) => (
          <li key={ex.name + ex.gear} className="flex items-center justify-between gap-3 border-b-2 border-dashed border-ink/15 py-1.5 last:border-b-0">
            <span className="min-w-0 text-[15px] font-semibold leading-tight text-ink">
              {ex.name}
              {ex.gear && <span className="font-medium text-ink/55"> · {ex.gear}</span>}
            </span>
            <span className="shrink-0 rounded-md border-2 border-ink bg-cream px-2 py-0.5 font-display text-sm leading-none tracking-wide text-ink">
              {ex.sets} × {ex.reps}
            </span>
          </li>
        ))}
      </ol>
    </motion.article>
  )
}

/** Insignia de plata dibujada a mano (rombo con alas y estrella). */
function SilverBadge() {
  return (
    <svg viewBox="0 0 64 52" className="h-12 w-14 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#c3ccd6" />
          <stop offset="1" stopColor="#7d8a99" />
        </linearGradient>
      </defs>
      <path d="M4 22c6 2 10 8 12 14-6-2-10-7-12-14zM60 22c-6 2-10 8-12 14 6-2 10-7 12-14z" fill="url(#silver)" stroke="#1b1b2f" strokeWidth="2" />
      <path d="M32 3l17 22-17 24-17-24z" fill="url(#silver)" stroke="#1b1b2f" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 17l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#fff" stroke="#1b1b2f" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
