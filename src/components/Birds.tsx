import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Gaviotas que cruzan el mapa de vez en cuando, solas o en grupitos.
 * Van por encima de los edificios y no reciben el ratón.
 * Las posiciones son en % del mapa, igual que los edificios.
 */

interface Flock {
  id: number
  /** 1: de izquierda a derecha; -1: al revés. */
  dir: 1 | -1
  /** Altura de entrada y de salida, en % del alto del mapa. */
  y0: number
  y1: number
  /** Segundos que tarda en cruzar. */
  duration: number
  /** Ancho de cada gaviota, en % del ancho del mapa. */
  size: number
  birds: { dx: number; dy: number; flap: number; delay: number }[]
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

let nextId = 0

function makeFlock(): Flock {
  const count = Math.random() < 0.45 ? 1 : Math.random() < 0.6 ? 2 : 3
  const y0 = rand(8, 60)
  return {
    id: nextId++,
    dir: Math.random() < 0.5 ? 1 : -1,
    y0,
    y1: y0 + rand(-12, 12),
    duration: rand(16, 26),
    size: rand(2.2, 3),
    // formación en V suelta: cada una un poco detrás y desplazada
    birds: Array.from({ length: count }, (_, i) => ({
      dx: i === 0 ? 0 : -i * rand(3, 4.2),
      dy: i === 0 ? 0 : (i % 2 ? -1 : 1) * Math.ceil(i / 2) * rand(2, 3),
      flap: rand(0.45, 0.65),
      delay: rand(0, 0.4),
    })),
  }
}

export default function Birds() {
  const reduce = useReducedMotion()
  const [flocks, setFlocks] = useState<Flock[]>([])

  useEffect(() => {
    if (reduce) return
    let timer: number
    const spawn = () => {
      if (!document.hidden) setFlocks((f) => [...f.slice(-4), makeFlock()])
      timer = window.setTimeout(spawn, rand(7000, 15000))
    }
    // la primera bandada llega pronto para que se vea al entrar
    timer = window.setTimeout(spawn, 1500)
    return () => window.clearTimeout(timer)
  }, [reduce])

  if (reduce) return null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5000] overflow-hidden">
      {flocks.map((f) => (
        <motion.div
          key={f.id}
          className="absolute top-0 left-0"
          initial={{ left: f.dir === 1 ? '-8%' : '108%', top: `${f.y0}%` }}
          animate={{ left: f.dir === 1 ? '108%' : '-8%', top: [`${f.y0}%`, `${(f.y0 + f.y1) / 2 - 3}%`, `${f.y1}%`] }}
          transition={{ duration: f.duration, ease: 'linear', top: { duration: f.duration, ease: 'easeInOut' } }}
          onAnimationComplete={() => setFlocks((all) => all.filter((x) => x.id !== f.id))}
        >
          {f.birds.map((b, i) => (
            <Gull key={i} size={f.size} dx={b.dx * f.dir} dy={b.dy} flap={b.flap} delay={b.delay} />
          ))}
        </motion.div>
      ))}
    </div>
  )
}

// Alas arriba, en cruz y abajo: el trazado se interpola entre las tres formas.
const WING_UP = 'M2 4 Q11 1 20 12 Q29 1 38 4'
const WING_MID = 'M2 10 Q11 5 20 12 Q29 5 38 10'
const WING_DOWN = 'M3 17 Q11 11 20 12 Q29 11 37 17'
const FLAP = [WING_UP, WING_MID, WING_DOWN, WING_MID, WING_UP]

function Gull({ size, dx, dy, flap, delay }: { size: number; dx: number; dy: number; flap: number; delay: number }) {
  const transition = { duration: flap, repeat: Infinity, ease: 'easeInOut' as const, delay }
  return (
    <svg
      viewBox="0 0 40 22"
      className="absolute overflow-visible"
      // el tamaño va en unidades del contenedor del mapa (cqw = % del ancho del mapa)
      style={{ width: `${size}cqw`, left: `${dx}cqw`, top: `${dy}cqw`, transform: 'translate(-50%, -50%)' }}
    >
      {/* contorno de tinta y relleno blanco, como los edificios */}
      <motion.path
        d={WING_UP}
        animate={{ d: FLAP }}
        transition={transition}
        fill="none"
        stroke="#1b1b2f"
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d={WING_UP}
        animate={{ d: FLAP }}
        transition={transition}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx={20} cy={12.5} rx={3.2} ry={2.4} fill="#ffffff" stroke="#1b1b2f" strokeWidth={1.6} />
    </svg>
  )
}
