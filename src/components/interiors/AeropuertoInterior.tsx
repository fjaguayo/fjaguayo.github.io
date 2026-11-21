import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { VISITED } from '../../data/viajes'
import type { Globe } from '../../lib/globe'
import { useMediaQuery } from '../../lib/useMediaQuery'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

// Despegue: el cielo pasa a toda velocidad y se oscurece hasta el espacio (ms).
const TAKEOFF_MS = 2000

/** Aeropuerto: despegas hasta el espacio y ves el globo con los países visitados. */
export default function AeropuertoInterior({ onExit }: Props) {
  const reduce = useReducedMotion()
  const mountRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [takeoff, setTakeoff] = useState(!reduce)
  const [failed, setFailed] = useState(false)
  const touch = useMediaQuery('(pointer: coarse)')

  useEffect(() => {
    let globe: Globe | null = null
    let cancelled = false
    // three.js y el mapa solo se descargan al entrar aquí
    import('../../lib/globe')
      .then(({ Globe }) => {
        if (cancelled || !mountRef.current || !labelRef.current) return
        globe = new Globe({
          container: mountRef.current,
          label: labelRef.current,
          countries: VISITED,
          reducedMotion: !!reduce,
          onSelect: setSelected,
        })
        globe.startIntro(reduce ? 0 : TAKEOFF_MS - 500, reduce ? 1 : 2400)
        globeRef.current = globe
      })
      .catch(() => setFailed(true))

    const t = window.setTimeout(() => setTakeoff(false), TAKEOFF_MS)
    return () => {
      cancelled = true
      window.clearTimeout(t)
      globe?.dispose()
      globeRef.current = null
    }
  }, [reduce])

  return (
    <div className="fixed inset-0 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #13204a 0%, #070a1c 55%, #020308 100%)' }}>
      {/* el globo */}
      <div ref={mountRef} className="absolute inset-0" role="img" aria-label="Globo terráqueo con los países que ha visitado Javier marcados con chinchetas" />
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 rounded-lg border-[3px] border-ink bg-cream px-3 py-1 font-display text-lg uppercase leading-none tracking-wide whitespace-nowrap text-ink opacity-0 shadow-[3px_3px_0_var(--color-ink)] transition-opacity duration-150"
      />

      {failed && (
        <p className="absolute inset-0 m-auto h-fit text-center font-semibold text-cream">
          Tu navegador no puede mostrar el globo en 3D.
        </p>
      )}

      {/* pasaporte: la lista de países; al pulsar uno, el globo gira hasta él */}
      <motion.aside
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: reduce ? 0 : TAKEOFF_MS / 1000 + 1.2, type: 'spring', stiffness: 260, damping: 26 }}
        // en el móvil en vertical, el pasaporte baja al pie de la pantalla como una tira de países
        className="absolute top-1/2 right-6 z-20 w-64 -translate-y-1/2 overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[6px_6px_0_var(--color-ink)] max-sm:top-auto max-sm:right-[calc(var(--safe-right)+8px)] max-sm:bottom-[calc(var(--safe-bottom)+8px)] max-sm:left-[calc(var(--safe-left)+8px)] max-sm:w-auto max-sm:translate-y-0 max-sm:shadow-[4px_4px_0_var(--color-ink)] short:right-[calc(var(--safe-right)+12px)] short:w-56"
      >
        <header className="border-b-4 border-ink bg-sky px-4 py-3 text-cream compact:py-2 max-sm:flex max-sm:items-baseline max-sm:justify-between max-sm:gap-3">
          <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide compact:text-xl">Pasaporte</h2>
          <p className="m-0 mt-1 text-sm font-semibold max-sm:mt-0 max-sm:text-xs">{VISITED.length} países visitados</p>
        </header>
        <ul className="m-0 max-h-[68dvh] list-none overflow-y-auto overscroll-contain p-2 max-sm:no-scrollbar max-sm:flex max-sm:max-h-none max-sm:gap-1.5 max-sm:overflow-x-auto max-sm:overflow-y-hidden short:max-h-[calc(100dvh-150px)]">
          {VISITED.map((c, i) => (
            <li key={c.id} className="max-sm:shrink-0">
              <button
                type="button"
                onClick={() => globeRef.current?.flyTo(i)}
                aria-pressed={selected === i}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 px-3 py-1 text-left text-[15px] font-semibold text-ink outline-none transition-colors focus-visible:outline-3 focus-visible:outline-sky max-sm:rounded-full max-sm:border-2 max-sm:border-ink max-sm:py-1.5 max-sm:whitespace-nowrap short:py-0.5 ${
                  selected === i ? 'bg-sun' : 'bg-transparent hover:bg-sun/40'
                }`}
              >
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-berry" />
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </motion.aside>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : TAKEOFF_MS / 1000 + 1.6 }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-20 m-0 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-cream max-sm:top-[calc(var(--safe-top)+64px)] max-sm:bottom-auto max-sm:px-3 max-sm:text-xs short:bottom-3 short:text-xs"
      >
        {touch
          ? 'Arrastra para girar · pellizca para acercar'
          : 'Arrastra para girar la Tierra · rueda para acercar · pulsa una chincheta'}
      </motion.p>

      <AnimatePresence>{takeoff && <Takeoff key="takeoff" />}</AnimatePresence>

      <ExitButton onExit={onExit} />
    </div>
  )
}

/** Despegue: nubes que pasan hacia abajo cada vez más rápido y el cielo que se vuelve espacio. */
function Takeoff() {
  const clouds = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 37) % 100,
    size: 18 + ((i * 13) % 22),
    delay: (i % 7) * 0.12,
  }))
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      style={{ background: 'linear-gradient(#7fd0f0, #d8f1fb)' }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      {/* el cielo se oscurece: azul intenso y luego espacio */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(#1f4fa0, #5fb6ea)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: TAKEOFF_MS / 1000 * 0.55, ease: 'easeIn' }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(#070a1c, #13204a)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: TAKEOFF_MS / 1000 * 0.45, delay: TAKEOFF_MS / 1000 * 0.55, ease: 'easeIn' }}
      />
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/90 blur-md"
          style={{ left: `${c.left}%`, width: `${c.size}vw`, height: `${c.size * 0.45}vw` }}
          initial={{ top: '-30%' }}
          animate={{ top: '130%' }}
          transition={{ duration: 1.1, delay: c.delay, ease: 'easeIn', repeat: 1 }}
        />
      ))}
    </motion.div>
  )
}
