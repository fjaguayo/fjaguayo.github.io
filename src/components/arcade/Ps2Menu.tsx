import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { playTick } from '../../lib/ps2Sound'

export interface Ps2Item {
  key: string
  /** Texto bajo la carátula y arriba a la derecha cuando está seleccionada. */
  title: string
  subtitle?: string
  /** Si hay enlace, la carátula es un <a> que abre otra pestaña. */
  href?: string
  onSelect?: () => void
  /** Lo que se dibuja: carátula, disco... Se pinta dos veces (la segunda es el reflejo). */
  visual: ReactNode
}

interface Props {
  /** Ruta de arriba a la izquierda, p. ej. ['Mi música', 'Discovery']. */
  path: string[]
  items: Ps2Item[]
  /** Forma de las carátulas: cuadradas (álbumes y discos) o altas (cajas de juego). */
  shape: 'square' | 'tall'
  onBack: () => void
  /** Texto del botón de volver (círculo). */
  backLabel: string
  /** Texto del botón de entrar (cruz). */
  enterLabel: string
  /** Para que la animación de entrada no se repita al volver a una vista que ya estaba. */
  viewKey: string
}

/**
 * Menú a pantalla completa con aire de navegador de consola de los 2000: fondo oscuro con niebla
 * azul que se mueve, carátulas flotando en 3D con su reflejo y botones de cruz y círculo abajo.
 */
export default function Ps2Menu({ path, items, shape, onBack, backLabel, enterLabel, viewKey }: Props) {
  const [focus, setFocus] = useState(0)
  const refs = useRef<(HTMLElement | null)[]>([])
  const current = items[focus]

  // la primera carátula recibe el foco al abrir (o al entrar en un álbum)
  useEffect(() => {
    setFocus(0)
    const t = window.setTimeout(() => refs.current[0]?.focus({ preventScroll: true }), 60)
    return () => window.clearTimeout(t)
  }, [viewKey])

  const move = (e: KeyboardEvent, i: number) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!delta) return
    e.preventDefault()
    const next = (i + delta + items.length) % items.length
    refs.current[next]?.focus()
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-[#02040c] text-white select-none">
      <Fog />

      {/* cabecera: ruta a la izquierda, lo seleccionado a la derecha */}
      <header className="pointer-events-none absolute top-[calc(var(--safe-top)+22px)] right-[calc(var(--safe-right)+28px)] left-[calc(var(--safe-left)+28px)] z-10 flex items-start justify-between gap-6 compact:top-[calc(var(--safe-top)+16px)] compact:right-4 compact:left-4">
        <motion.p
          key={path.join('/')}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="m-0 text-[clamp(18px,2.1vw,30px)] font-light tracking-[0.12em] text-[#dfe9ff] compact:text-lg"
          style={{ textShadow: '0 0 14px rgba(110,160,255,0.9), 0 0 2px rgba(255,255,255,0.6)' }}
        >
          {path.map((p, i) => (
            <span key={p} className={i < path.length - 1 ? 'text-[#dfe9ff]/55' : ''}>
              {i > 0 && <span className="px-2 text-[#dfe9ff]/40">›</span>}
              {p}
            </span>
          ))}
        </motion.p>

        <motion.div
          key={current?.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="min-w-0 text-right compact:hidden"
          aria-live="polite"
        >
          <p
            className="m-0 truncate text-[clamp(15px,1.4vw,21px)] font-normal tracking-[0.06em] text-white"
            style={{ textShadow: '0 0 10px rgba(110,160,255,0.8)' }}
          >
            {current?.title}
          </p>
          {current?.subtitle && <p className="m-0 mt-1 truncate text-sm font-light tracking-[0.08em] text-[#9fb6e8]">{current.subtitle}</p>}
        </motion.div>
      </header>

      {/* carátulas */}
      <div className="absolute inset-0 overflow-y-auto overscroll-contain pt-[calc(var(--safe-top)+110px)] pb-[calc(var(--safe-bottom)+96px)] compact:pt-[calc(var(--safe-top)+64px)] compact:pb-[calc(var(--safe-bottom)+70px)]">
        <motion.ul
          key={viewKey}
          initial={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="m-0 mx-auto flex min-h-full max-w-[1400px] list-none flex-wrap content-center items-start justify-center gap-x-[clamp(18px,3.2vw,56px)] gap-y-[clamp(8px,1.6vw,26px)] px-6 [perspective:1100px] compact:gap-x-4 compact:px-3"
        >
          {items.map((item, i) => (
            <li key={item.key}>
              <Cover
                item={item}
                index={i}
                shape={shape}
                active={i === focus}
                setRef={(el) => {
                  refs.current[i] = el
                }}
                onActivate={() => {
                  if (i !== focus) playTick()
                  setFocus(i)
                }}
                onKeyDown={(e) => move(e, i)}
              />
            </li>
          ))}
        </motion.ul>
      </div>

      {/* botones de abajo: cruz para entrar, círculo para volver */}
      <footer className="absolute right-[calc(var(--safe-right)+28px)] bottom-[calc(var(--safe-bottom)+22px)] z-10 flex items-center gap-6 text-[15px] font-light tracking-[0.08em] text-[#dfe9ff] compact:right-4 compact:bottom-[calc(var(--safe-bottom)+14px)] compact:gap-4 compact:text-sm">
        <span className="flex items-center gap-2" aria-hidden="true">
          <PadIcon kind="cross" />
          {enterLabel}
        </span>
        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-2 py-1 font-[inherit] text-inherit tracking-[inherit] outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#7ea6ff]"
        >
          <PadIcon kind="circle" />
          {backLabel}
        </button>
      </footer>
    </div>
  )
}

function Cover({
  item,
  index,
  shape,
  active,
  setRef,
  onActivate,
  onKeyDown,
}: {
  item: Ps2Item
  index: number
  shape: 'square' | 'tall'
  active: boolean
  setRef: (el: HTMLElement | null) => void
  onActivate: () => void
  onKeyDown: (e: KeyboardEvent) => void
}) {
  const size = shape === 'tall' ? 'w-[clamp(100px,11vw,176px)] aspect-[2/3]' : 'w-[clamp(112px,11.5vw,196px)] aspect-square'
  // cada carátula flota a su ritmo, como los iconos del navegador de la consola
  const bob = { duration: 3.2 + (index % 3) * 0.55, delay: (index * 0.37) % 1.6 }

  const body = (
    <>
      <motion.div
        className="relative"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: bob.duration, delay: bob.delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className={`relative ${size}`}
          style={{ transformStyle: 'preserve-3d' }}
          animate={active ? { rotateY: 0, scale: 1.1 } : { rotateY: -16, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <div
            className="absolute inset-0 transition-[filter,box-shadow] duration-300"
            style={{
              filter: active ? 'brightness(1.08)' : 'brightness(0.72) saturate(0.85)',
            }}
          >
            {item.visual}
          </div>
          {/* reflejo en el "suelo" */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-full mt-1.5 h-full opacity-20"
            style={{
              transform: 'scaleY(-1)',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 28%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 28%)',
              filter: 'blur(1px) brightness(0.8)',
            }}
          >
            {item.visual}
          </div>
        </motion.div>
      </motion.div>
      <span
        className={`relative z-10 mt-3 block max-w-[clamp(120px,13vw,210px)] text-center text-[clamp(12px,1.05vw,15px)] leading-tight tracking-[0.06em] transition-colors duration-200 ${
          active ? 'text-white' : 'text-[#9fb0d6]'
        }`}
        style={active ? { textShadow: '0 0 10px rgba(110,160,255,0.95)' } : undefined}
      >
        {item.title}
      </span>
    </>
  )

  const common = {
    ref: setRef,
    onMouseEnter: onActivate,
    onFocus: onActivate,
    onKeyDown,
    'aria-label': [item.title, item.subtitle, item.href ? '(se abre en otra pestaña)' : ''].filter(Boolean).join(', '),
    className:
      'group flex cursor-pointer flex-col items-center rounded-xl border-0 bg-transparent p-2 text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#7ea6ff]/70',
  }

  return item.href ? (
    <a {...common} href={item.href} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <button {...common} type="button" onClick={item.onSelect}>
      {body}
    </button>
  )
}

/** Niebla azulada que se desplaza despacio por el fondo. */
export function Fog() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,#0f2a6b_0%,#061133_38%,#02040c_75%)]" />
      <motion.div
        className="absolute -inset-[20%] opacity-60"
        style={{ background: 'radial-gradient(closest-side, rgba(70,120,255,0.35), transparent 70%)', width: '70%', height: '70%' }}
        animate={{ x: ['0%', '45%', '10%', '0%'], y: ['10%', '0%', '35%', '10%'] }}
        transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -inset-[20%] opacity-50"
        style={{
          background: 'radial-gradient(closest-side, rgba(150,110,255,0.28), transparent 70%)',
          width: '60%',
          height: '60%',
          left: '45%',
          top: '30%',
        }}
        animate={{ x: ['0%', '-40%', '-10%', '0%'], y: ['0%', '-25%', '15%', '0%'] }}
        transition={{ duration: 46, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* horizonte: una línea de luz muy tenue a media altura */}
      <div className="absolute inset-x-0 top-[62%] h-px bg-gradient-to-r from-transparent via-[#5d86ff]/25 to-transparent" />
      {/* grano */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}

/** Iconos de los botones del mando: cruz azul y círculo rojo. */
export function PadIcon({ kind }: { kind: 'cross' | 'circle' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#0b1430" stroke="#c9d6f5" strokeWidth="1.2" />
      {kind === 'cross' ? (
        <path d="M8 8l8 8M16 8l-8 8" stroke="#8fb3ff" strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        <circle cx="12" cy="12" r="4.6" fill="none" stroke="#ff7a8a" strokeWidth="2.2" />
      )}
    </svg>
  )
}
