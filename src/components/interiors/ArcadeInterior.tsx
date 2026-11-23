import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ARCADE_HIT, DND_URL, LABELS, PLACEMENTS, STAGE, arcadeUrl, type ArcadeObjectId, type ArcadePlacement } from '../../data/arcade'
import ExitButton from './ExitButton'

const MusicMenu = lazy(() => import('../arcade/MusicMenu'))
const GamesMenu = lazy(() => import('../arcade/GamesMenu'))

// Editor de colocación: solo en desarrollo y con ?arcade-edit en la URL.
const ArcadeEditor = import.meta.env.DEV ? lazy(() => import('../arcade/ArcadeEditor')) : null
const editing = !!ArcadeEditor && new URLSearchParams(window.location.search).has('arcade-edit')

interface Props {
  onExit: () => void
}

type Menu = 'music' | 'games'

const ratio = STAGE.width / STAGE.height

/** Alto de una pieza en % del alto del escenario. */
export const heightPct = (p: ArcadePlacement) => {
  const size = p.id === 'sala' ? ARCADE_HIT.sala : ARCADE_HIT[p.id]
  return p.width * (size.height / size.width) * ratio
}

/** El Salón Recreativo: una sala con neones y tres objetos que se pueden tocar. */
export default function ArcadeInterior({ onExit }: Props) {
  const [placements, setPlacements] = useState(PLACEMENTS)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [toast, setToast] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  // en el móvil en vertical la sala se ve más grande y se recorre deslizando: se empieza por el centro
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(false), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const open = (id: ArcadeObjectId, el: HTMLElement) => {
    opener.current = el
    if (id === 'vinilo') setMenu('music')
    else if (id === 'recreativa') setMenu('games')
    else setToast(true) // la mesa sin enlace todavía
  }

  const closeMenu = useCallback(() => setMenu(null), [])
  const room = placements.find((p) => p.id === 'sala')!

  return (
    <>
      <div
        inert={!!menu}
        className="fixed inset-0 flex items-center justify-center px-4 pt-20 pb-4 compact:px-2 compact:pt-16 compact:pb-[calc(var(--safe-bottom)+8px)]"
      >
        <button
          type="button"
          aria-label="Cerrar el salón recreativo"
          tabIndex={-1}
          onClick={onExit}
          className="absolute inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
        />

        <motion.section
          aria-label="Salón recreativo: música, juegos y DnD"
          initial={{ y: 40, scale: 0.94, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="relative overflow-hidden rounded-2xl border-4 border-ink bg-[#140d26] shadow-[8px_8px_0_var(--color-ink)] compact:w-full! compact:shadow-[5px_5px_0_var(--color-ink)]"
          style={{ width: `min(1500px, 96vw, calc((100dvh - 96px - 62px) * ${ratio}))` }}
        >
          <header className="flex items-center justify-between gap-3 border-b-4 border-ink bg-ink px-5 py-3 compact:px-4 compact:py-2.5">
            <h2
              className="m-0 font-display text-2xl uppercase leading-none tracking-wide text-[#ff9be0] compact:text-xl"
              style={{ textShadow: '0 0 10px rgba(255, 90, 200, 0.75)' }}
            >
              Salón recreativo
            </h2>
            <span className="text-right text-sm font-bold text-white/75 compact:text-xs">
              <span className="compact:hidden">Pulsa en algo para usarlo</span>
              <span className="hidden compact:inline">Toca algo para usarlo</span>
            </span>
          </header>

          <div className="relative">
            <div ref={scroller} className="no-scrollbar compact:overflow-auto compact:overscroll-contain short:max-h-[calc(100dvh-122px)]">
              <div
                className="relative [container-type:inline-size] [--ph:min(calc(100dvh-140px),620px)] max-sm:h-[var(--ph)] max-sm:w-[calc(var(--ph)*var(--ratio))]"
                style={{
                  aspectRatio: `${STAGE.width} / ${STAGE.height}`,
                  ['--ratio' as string]: ratio,
                  background: 'radial-gradient(ellipse 70% 60% at 50% 42%, #2a1d4f 0%, #140d26 70%)',
                }}
              >
                <img
                  src={arcadeUrl('sala')}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute"
                  style={{
                    left: `${room.x - room.width / 2}%`,
                    top: `${room.y - heightPct(room)}%`,
                    width: `${room.width}%`,
                  }}
                />
                {placements
                  .filter((p): p is ArcadePlacement & { id: ArcadeObjectId } => p.id !== 'sala')
                  .map((p) => (
                    <ObjectSprite key={p.id} p={p} onOpen={(el) => open(p.id, el)} />
                  ))}
                {editing && ArcadeEditor && (
                  <Suspense fallback={null}>
                    <ArcadeEditor placements={placements} onChange={setPlacements} />
                  </Suspense>
                )}
              </div>
            </div>

            <AnimatePresence>
              {toast && (
                <motion.p
                  role="status"
                  className="absolute bottom-4 left-1/2 z-[20000] m-0 rounded-xl border-4 border-ink bg-cream px-4 py-2 text-center font-display text-lg uppercase leading-none tracking-wide text-ink shadow-[4px_4px_0_var(--color-ink)]"
                  initial={{ opacity: 0, y: 12, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 6, x: '-50%' }}
                >
                  Mi página de DnD llegará pronto
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        <ExitButton onExit={onExit} />
      </div>

      <AnimatePresence onExitComplete={() => opener.current?.focus({ preventScroll: true })}>
        {menu && (
          <Suspense key={menu} fallback={<div className="fixed inset-0 z-[60] bg-[#02040c]" />}>
            {menu === 'music' ? <MusicMenu onClose={closeMenu} /> : <GamesMenu onClose={closeMenu} />}
          </Suspense>
        )}
      </AnimatePresence>
    </>
  )
}

function ObjectSprite({ p, onOpen }: { p: ArcadePlacement & { id: ArcadeObjectId }; onOpen: (el: HTMLElement) => void }) {
  const hit = ARCADE_HIT[p.id]
  const label = LABELS[p.id]
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = hovered || focused
  const hitPath = hit.polygons.map((poly) => `M${poly.map(([x, y]) => `${x},${y}`).join('L')}Z`).join('')
  const link = p.id === 'mesa' && DND_URL

  const style = {
    left: `${p.x}%`,
    top: `${p.y}%`,
    width: `${p.width}%`,
    aspectRatio: `${hit.width} / ${hit.height}`,
    transform: 'translate(-50%, -100%)',
    zIndex: Math.round(p.y * 10) + (active ? 10000 : 0),
  }
  const className = 'pointer-events-none absolute block cursor-pointer border-0 bg-transparent p-0 outline-none'
  const handlers = {
    onFocus: (e: React.FocusEvent<HTMLElement>) => setFocused(e.currentTarget.matches(':focus-visible')),
    onBlur: () => setFocused(false),
  }

  const inner = (
    <>
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: '50% 100%' }}
        animate={active ? { scale: 1.06, y: -5 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.7 }}
      >
        <div className="absolute inset-0" style={{ transform: p.flip ? 'scaleX(-1)' : undefined }}>
          <img src={arcadeUrl(p.id)} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
          <img
            src={arcadeUrl(`${p.id}_hover`)}
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
            className="absolute bottom-[2%] left-1/2 whitespace-nowrap rounded-xl border-4 border-ink bg-white px-[0.7em] pt-[0.35em] pb-[0.2em] font-display uppercase leading-none tracking-wide text-ink shadow-[4px_4px_0_var(--color-ink)]"
            style={{ x: '-50%', fontSize: 'clamp(14px, 1.5cqw, 24px)' }}
            initial={{ opacity: 0, y: 6, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.85, transition: { duration: 0.1 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  )

  return link ? (
    <a
      href={DND_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (se abre en otra pestaña)`}
      className={className}
      style={style}
      {...handlers}
    >
      {inner}
    </a>
  ) : (
    <button type="button" aria-label={label} className={className} style={style} onClick={(e) => onOpen(e.currentTarget)} {...handlers}>
      {inner}
    </button>
  )
}
