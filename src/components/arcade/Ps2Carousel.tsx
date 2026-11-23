import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import { playTick } from '../../lib/ps2Sound'
import { Fog, PadIcon } from './Ps2Menu'

export interface CarouselItem {
  key: string
  title: string
  subtitle?: string
  /** Si hay enlace, el elemento del centro es un <a> que abre otra pestaña. */
  href?: string
  onSelect?: () => void
  /** Lo que se dibuja. `active` es true solo para el que está al frente. */
  render: (active: boolean) => ReactNode
}

interface Props {
  path: string[]
  items: CarouselItem[]
  onBack: () => void
  backLabel: string
  enterLabel: string
  /** Forma de lo que gira: cuadrado (carátulas) o círculo (discos). */
  round?: boolean
  /** Elemento que empieza al frente (al volver de un grupo, el mismo grupo). */
  initialIndex?: number
}

/**
 * Carrusel en círculo con aire de consola de los 2000: lo del centro, grande y de frente;
 * los demás se van haciendo pequeños hacia los lados y por detrás. Gira con las flechas
 * (pantalla o teclado), arrastrando, o pulsando uno de los laterales. Da la vuelta completa.
 */
export default function Ps2Carousel({ path, items, onBack, backLabel, enterLabel, round = false, initialIndex = 0 }: Props) {
  const n = items.length
  // posición continua: sube o baja sin límite, así el giro siempre va por el camino corto
  const [pos, setPos] = useState(initialIndex)
  const active = ((pos % n) + n) % n
  const current = items[active]
  const centerRef = useRef<HTMLElement | null>(null)
  const moved = useRef(false)

  const step = useCallback((delta: number) => {
    if (!delta) return
    playTick()
    moved.current = true
    setPos((p) => p + delta)
  }, [])

  // el del centro se lleva el foco tras cada giro: Enter lo abre
  useEffect(() => {
    const t = window.setTimeout(() => centerRef.current?.focus({ preventScroll: true }), moved.current ? 0 : 80)
    return () => window.clearTimeout(t)
  }, [active])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        step(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 40) return
    step(info.offset.x < 0 ? 1 : -1)
  }

  // reparto en el círculo: con pocos elementos el paso es de 60° como mucho, para que se vean los laterales
  const angleStep = (2 * Math.PI) / Math.max(n, 6)

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-[#02040c] text-white select-none">
      <Fog />

      <header className="pointer-events-none absolute top-[calc(var(--safe-top)+22px)] right-[calc(var(--safe-right)+28px)] left-[calc(var(--safe-left)+28px)] z-10 compact:top-[calc(var(--safe-top)+16px)] compact:right-4 compact:left-4">
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
      </header>

      {/* el círculo */}
      <motion.div
        className="absolute inset-x-0 top-[44%] h-0 touch-pan-y [perspective:1400px]"
        onPanEnd={onPanEnd}
        initial={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {items.map((item, i) => {
          // distancia al centro, envuelta para que el círculo no tenga final
          const d = ((((i - pos) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2)
          const angle = d * angleStep
          const depth = Math.cos(angle) // 1 al frente, -1 detrás
          const front = (depth + 1) / 2
          const isActive = d === 0
          const x = Math.sin(angle) * 34 // en vw
          const scale = isActive ? 1 : 0.42 + 0.4 * front ** 1.6
          const opacity = depth < -0.55 ? 0 : 0.25 + 0.75 * front ** 1.3
          const common = {
            'aria-label': [item.title, item.subtitle, isActive && item.href ? '(se abre en otra pestaña)' : ''].filter(Boolean).join(', '),
            tabIndex: isActive ? 0 : -1,
            className:
              'block h-full w-full cursor-pointer rounded-[10px] border-0 bg-transparent p-0 text-inherit outline-none focus-visible:ring-4 focus-visible:ring-[#7ea6ff]/70' +
              (round ? ' rounded-full' : ''),
          }
          const visual = (
            <>
              <div className="absolute inset-0" style={{ filter: isActive ? 'brightness(1.08)' : 'brightness(0.62) saturate(0.8)' }}>
                {item.render(isActive)}
              </div>
              {/* reflejo */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-full mt-2 h-full opacity-25"
                style={{
                  transform: 'scaleY(-1)',
                  maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 30%)',
                  WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 30%)',
                  filter: 'blur(1.5px) brightness(0.7)',
                }}
              >
                {item.render(false)}
              </div>
            </>
          )
          return (
            <motion.div
              key={item.key}
              className="absolute top-0 left-1/2 aspect-square w-[clamp(180px,25vw,360px)] compact:w-[min(56vw,42dvh)]"
              style={{ zIndex: Math.round(depth * 100) + 100, pointerEvents: opacity < 0.05 ? 'none' : 'auto' }}
              initial={false}
              animate={{
                x: `calc(-50% + ${x}vw)`,
                y: '-50%',
                scale,
                opacity,
                rotateY: -Math.sin(angle) * 28,
              }}
              transition={{ type: 'spring', stiffness: 170, damping: 24, mass: 0.9 }}
            >
              <motion.div
                className="relative h-full w-full"
                animate={isActive ? { y: [0, -8, 0] } : { y: 0 }}
                transition={isActive ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
              >
                {isActive && item.href ? (
                  <a {...common} ref={(el) => void (centerRef.current = el)} href={item.href} target="_blank" rel="noopener noreferrer">
                    {visual}
                  </a>
                ) : (
                  <button
                    {...common}
                    ref={(el) => {
                      if (isActive) centerRef.current = el
                    }}
                    type="button"
                    onClick={() => (isActive ? item.onSelect?.() : step(d))}
                  >
                    {visual}
                  </button>
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* flechas */}
      {n > 1 && (
        <>
          <ArrowButton side="left" onClick={() => step(-1)} />
          <ArrowButton side="right" onClick={() => step(1)} />
        </>
      )}

      {/* lo que está al frente */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(44%+min(12.5vw,180px)+60px)] z-10 px-6 text-center compact:top-[calc(44%+min(28vw,21dvh)+48px)]">
        <motion.p
          key={current?.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="m-0 text-[clamp(20px,2.4vw,34px)] font-normal tracking-[0.06em] text-white"
          style={{ textShadow: '0 0 14px rgba(110,160,255,0.85)' }}
          aria-live="polite"
        >
          {current?.title}
        </motion.p>
        {current?.subtitle && (
          <p className="m-0 mt-1.5 text-[clamp(13px,1.1vw,16px)] font-light tracking-[0.1em] text-[#9fb6e8]">{current.subtitle}</p>
        )}
        {/* puntos: dónde estás en el círculo */}
        <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
          {items.map((it, i) => (
            <span
              key={it.key}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-[#9fc0ff]' : 'w-1.5 bg-white/25'}`}
            />
          ))}
        </div>
      </div>

      <footer className="absolute right-[calc(var(--safe-right)+28px)] bottom-[calc(var(--safe-bottom)+22px)] z-10 flex items-center gap-6 text-[15px] font-light tracking-[0.08em] text-[#dfe9ff] compact:right-4 compact:bottom-[calc(var(--safe-bottom)+14px)] compact:gap-4 compact:text-sm">
        <span className="flex items-center gap-2 compact:hidden" aria-hidden="true">
          <span className="rounded border border-[#c9d6f5]/60 px-1.5 text-xs">← →</span>
          Girar
        </span>
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

function ArrowButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={side === 'left' ? 'Anterior' : 'Siguiente'}
      onClick={onClick}
      className={`absolute top-[44%] z-[300] flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#c9d6f5]/40 bg-[#0b1430]/70 text-[#dfe9ff] backdrop-blur-sm transition hover:scale-110 hover:border-[#c9d6f5] hover:text-white compact:h-11 compact:w-11 ${
        side === 'left' ? 'left-[calc(var(--safe-left)+3vw)]' : 'right-[calc(var(--safe-right)+3vw)]'
      }`}
      style={{ boxShadow: '0 0 18px rgba(110,160,255,0.35)' }}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.4}>
        <path d={side === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
