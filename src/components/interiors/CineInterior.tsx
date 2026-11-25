import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MAP_SIZE, assetUrl } from '../../data/buildings'
import { CATEGORIES, imdbUrl, posterUrl, type CategoryId, type Title } from '../../data/cine'
import { playTadum } from '../../lib/tadum'
import { useMediaQuery } from '../../lib/useMediaQuery'
import ExitButton from './ExitButton'
import { useLang } from '../../lib/i18n'

interface Props {
  onExit: () => void
}

// La sala tiene el mismo tamaño que el mapa (2752×1536).
const ratio = MAP_SIZE.width / MAP_SIZE.height

// Hueco negro de la pantalla dentro de Cine_pantalla.jpg, en % de la imagen.
const SCREEN = { left: 19.8, top: 20.7, width: 60.07, height: 41.28 }

/**
 * En pantallas pequeñas (móvil, tableta en vertical) el hueco de la pantalla del dibujo es diminuto:
 * entonces el catálogo se enseña a pantalla completa, con la sala de fondo.
 */
const TV_QUERY = '(max-width: 899px), (max-height: 540px), (max-aspect-ratio: 10/7)'

// Duración de la intro (logo + sonido) antes de enseñar el catálogo, en ms.
const INTRO_MS = 2300

export default function CineInterior({ onExit }: Props) {
  const [active, setActive] = useState<CategoryId>('series')
  const [phase, setPhase] = useState<'intro' | 'ui'>('intro')
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const category = CATEGORIES.find((c) => c.id === active)!
  const tv = useMediaQuery(TV_QUERY)
  const { t, pick } = useLang()

  // sonido de apertura e intro; un clic o una tecla (que no sea Escape) la salta
  useEffect(() => {
    const stop = playTadum()
    const t = window.setTimeout(() => setPhase('ui'), INTRO_MS)
    const skip = (e: Event) => {
      if (e instanceof globalThis.KeyboardEvent && e.key === 'Escape') return
      setPhase('ui')
    }
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      stop()
      window.clearTimeout(t)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [])

  // flechas izquierda/derecha entre pestañas, como pide el patrón de tabs accesibles
  const onTabKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + CATEGORIES.length) % CATEGORIES.length
    setActive(CATEGORIES[next].id)
    tabsRef.current[next]?.focus()
  }

  // la pantalla: un Netflix en miniatura
  const screen = (
        <motion.section
          aria-label={t('FJAHFLIX, series y películas favoritas', 'FJAHFLIX, favorite shows and movies')}
          initial={{ opacity: 0, filter: 'brightness(2.4)' }}
          animate={{ opacity: [0, 1, 0.75, 1], filter: 'brightness(1)' }}
          transition={{ duration: 0.6, delay: 0.1, times: [0, 0.4, 0.6, 1], ease: 'easeOut' }}
          className={`absolute flex flex-col overflow-hidden bg-[#141414] text-white [container-type:inline-size] ${
            tv ? 'rounded-xl border-[3px] border-white/10' : 'rounded-[calc(var(--u)*0.35)]'
          }`}
          style={
            tv
              ? {
                  // la unidad crece con la pantalla del móvil, sin pasarse del alto en horizontal
                  ['--u' as string]: 'min(2.5vw, 2.2dvh)',
                  ['--intro' as string]: 'min(13vw, 16dvh)',
                  left: 'calc(var(--safe-left) + 8px)',
                  right: 'calc(var(--safe-right) + 8px)',
                  top: 'calc(var(--safe-top) + 64px)',
                  bottom: 'calc(var(--safe-bottom) + 8px)',
                  boxShadow: '0 0 40px 6px rgba(229, 9, 20, 0.18)',
                }
              : {
                  ['--u' as string]: '1cqw',
                  ['--intro' as string]: '9cqw',
                  left: `${SCREEN.left}%`,
                  top: `${SCREEN.top}%`,
                  width: `${SCREEN.width}%`,
                  height: `${SCREEN.height}%`,
                  boxShadow: '0 0 2.5cqw 0.4cqw rgba(229, 9, 20, 0.18)',
                }
          }
        >
          <AnimatePresence>{phase === 'intro' && <Intro key="intro" />}</AnimatePresence>

          {phase === 'ui' && (
            <motion.div
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            >
              <header className="flex min-h-[calc(var(--u)*5)] shrink-0 flex-wrap items-center gap-x-[calc(var(--u)*3)] gap-y-[calc(var(--u)*0.6)] bg-gradient-to-b from-black/80 to-transparent px-[calc(var(--u)*2.6)] pt-[calc(var(--u)*0.6)]">
                <span
                  className="font-display text-[length:calc(var(--u)*2.7)] leading-none tracking-[0.06em] text-[#e50914]"
                  style={{ textShadow: '0 calc(var(--u) * 0.15) 0 #000' }}
                >
                  FJAHFLIX
                </span>
                <div role="tablist" aria-label={t('Categorías', 'Categories')} className="no-scrollbar -mx-[calc(var(--u)*2.6)] flex max-w-[calc(100%_+_var(--u)*5.2)] min-w-0 gap-[calc(var(--u)*2)] overflow-x-auto px-[calc(var(--u)*2.6)]">
                  {CATEGORIES.map((c, i) => {
                    const selected = c.id === active
                    return (
                      <button
                        key={c.id}
                        ref={(el) => {
                          tabsRef.current[i] = el
                        }}
                        role="tab"
                        id={`tab-${c.id}`}
                        aria-selected={selected}
                        aria-controls="cine-panel"
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setActive(c.id)}
                        onKeyDown={(e) => onTabKey(e, i)}
                        className={`relative shrink-0 cursor-pointer border-0 bg-transparent px-0 py-[calc(var(--u)*0.4)] whitespace-nowrap text-[length:calc(var(--u)*1.45)] font-semibold transition-colors outline-none focus-visible:text-white ${
                          selected ? 'text-white' : 'text-white/55 hover:text-white/85'
                        }`}
                      >
                        {pick(c, 'label')}
                        {selected && (
                          <motion.span
                            layoutId="cine-tab-underline"
                            className="absolute right-0 -bottom-[calc(var(--u)*0.1)] left-0 h-[calc(var(--u)*0.22)] rounded-full bg-[#e50914]"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </header>

              <div id="cine-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="relative min-h-0 flex-1">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    // título y fila centrados en el alto que queda bajo la cabecera
                    className="absolute inset-0 flex flex-col justify-center"
                  >
                    <h2 className="m-0 px-[calc(var(--u)*2.6)] text-[length:calc(var(--u)*1.8)] font-bold leading-none">
                      {pick(category, 'label')}
                      <span className="ml-[calc(var(--u)*0.9)] text-[length:calc(var(--u)*1.1)] font-medium text-white/45">
                        {t(`${category.items.length} títulos`, `${category.items.length} titles`)}
                      </span>
                    </h2>
                    <PosterRow items={category.items} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </motion.section>
  )

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [container-type:inline-size]"
        style={{
          width: `min(max(100vw, calc(100dvh * ${ratio})), calc(100vw / 0.8), calc(100dvh * ${ratio} / 0.85))`,
          aspectRatio: `${MAP_SIZE.width} / ${MAP_SIZE.height}`,
        }}
      >
        <img
          src={assetUrl('interiores/cine_sala')}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full"
        />

        {/* luces de la sala: se encienden al entrar y se atenúan cuando empieza la "película" */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: tv ? 0.6 : phase === 'intro' ? 0.15 : 0.32 }}
          transition={{ duration: phase === 'intro' ? 0.6 : 1.2, ease: 'easeOut' }}
        />

        {!tv && screen}
      </div>

      {tv && screen}

      <ExitButton onExit={onExit} />
    </div>
  )
}

/** Intro: el logo aparece con los dos golpes del sonido y sale disparado hacia la cámara. */
function Intro() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-black"
      exit={{ opacity: 0, transition: { duration: 0.45, delay: 0.15 } }}
    >
      {/* destello rojo con el segundo golpe */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.55), transparent 60%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 0.35] }}
        transition={{ duration: 1.6, times: [0, 0.25, 0.32, 1], ease: 'easeOut' }}
      />
      <motion.span
        className="relative font-display text-[length:var(--intro)] leading-none tracking-[0.08em] text-[#e50914]"
        style={{ textShadow: '0 0 calc(var(--u) * 2) rgba(229,9,20,0.6), 0 calc(var(--u) * 0.4) 0 #000' }}
        initial={{ opacity: 0, scale: 0.55, letterSpacing: '0.3em' }}
        animate={{ opacity: [0, 1, 1], scale: [0.55, 0.92, 1], letterSpacing: ['0.3em', '0.1em', '0.08em'] }}
        transition={{ duration: 1.4, times: [0, 0.25, 1], ease: 'easeOut' }}
        exit={{ scale: 5, opacity: 0, filter: 'blur(8px)', transition: { duration: 0.55, ease: 'easeIn' } }}
      >
        FJAHFLIX
      </motion.span>
    </motion.div>
  )
}

function PosterRow({ items }: { items: Title[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const update = () => {
    const el = ref.current
    if (!el) return
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 })
  }

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [items])

  const page = (dir: 1 | -1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className="group/row relative">
      {/* cinco carátulas caben enteras; con más, aparecen las flechas */}
      <ul
        ref={ref}
        onScroll={update}
        className="m-0 flex list-none snap-x snap-mandatory gap-[calc(var(--u)*1)] overflow-x-auto scroll-px-[calc(var(--u)*2.6)] px-[calc(var(--u)*2.6)] py-[calc(var(--u)*1.2)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((t) => (
          <li key={t.imdbId} className="shrink-0 snap-start">
            <Poster item={t} />
          </li>
        ))}
      </ul>
      <Arrow dir={-1} hidden={edges.start} onClick={() => page(-1)} />
      <Arrow dir={1} hidden={edges.end} onClick={() => page(1)} />
    </div>
  )
}

function Arrow({ dir, hidden, onClick }: { dir: 1 | -1; hidden: boolean; onClick: () => void }) {
  const { t } = useLang()
  return (
    <button
      type="button"
      aria-label={dir === 1 ? t('Ver más títulos', 'See more titles') : t('Ver títulos anteriores', 'See previous titles')}
      onClick={onClick}
      tabIndex={-1}
      className={`absolute top-[calc(var(--u)*1.2)] bottom-[calc(var(--u)*1.2)] z-20 flex w-[calc(var(--u)*2.6)] cursor-pointer items-center justify-center border-0 text-[length:calc(var(--u)*2.4)] text-white opacity-0 transition-opacity group-hover/row:opacity-100 ${
        dir === 1 ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'
      } from-black/85 to-black/20 ${hidden ? 'pointer-events-none !opacity-0' : ''}`}
    >
      <svg viewBox="0 0 24 24" className="h-[calc(var(--u)*2)] w-[calc(var(--u)*2)]" fill="none" stroke="currentColor" strokeWidth={3}>
        <path d={dir === 1 ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function Poster({ item }: { item: Title }) {
  const { t, pick } = useLang()
  const title = pick(item, 'title')
  const [broken, setBroken] = useState(false)
  const showImage = item.poster && !broken

  return (
    <motion.a
      href={imdbUrl(item.imdbId)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} (${item.year}${item.tag ? `, ${item.tag}` : ''}), ${t('abrir en IMDb', 'open on IMDb')}`}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{ rest: { scale: 1, zIndex: 0 }, hover: { scale: 1.05, zIndex: 10 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      // 17 unidades: cinco carátulas llenan el ancho útil de la pantalla y caben en su alto
      className="relative block aspect-[2/3] w-[calc(var(--u)*17)] overflow-hidden rounded-[calc(var(--u)*0.45)] bg-[#222] shadow-[0_calc(var(--u)*0.4)_var(--u)_rgba(0,0,0,0.6)] outline-none focus-visible:ring-[length:calc(var(--u)*0.25)] focus-visible:ring-white"
    >
      {showImage ? (
        <img
          src={posterUrl(item.poster!)}
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <FallbackCover item={item} />
      )}

      <motion.div
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-[calc(var(--u)*0.9)]"
      >
        <span className="text-[length:calc(var(--u)*1.3)] font-bold leading-tight">{title}</span>
        <span className="mt-[calc(var(--u)*0.4)] flex items-center justify-between text-[length:calc(var(--u)*0.95)] text-white/70">
          {item.tag ? `${item.year} · ${item.tag}` : item.year}
          <span className="rounded-[calc(var(--u)*0.25)] bg-[#f5c518] px-[calc(var(--u)*0.5)] py-[calc(var(--u)*0.1)] text-[length:calc(var(--u)*0.85)] font-black text-black">
            IMDb
          </span>
        </span>
      </motion.div>
    </motion.a>
  )
}

/** Carátula dibujada para los títulos que aún no tienen imagen. */
function FallbackCover({ item }: { item: Title }) {
  const { pick } = useLang()
  let h = 0
  for (const ch of item.title) h = (h * 31 + ch.charCodeAt(0)) % 360
  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-[calc(var(--u)*1)]"
      style={{ background: `linear-gradient(160deg, hsl(${h} 55% 32%), hsl(${(h + 40) % 360} 60% 12%))` }}
    >
      <span className="font-display text-[length:calc(var(--u)*1.5)] leading-none text-[#e50914]" style={{ textShadow: '0 calc(var(--u) * 0.1) 0 #000' }}>
        F
      </span>
      <motion.span
        variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
        transition={{ duration: 0.15 }}
        className="font-display text-[length:calc(var(--u)*1.7)] leading-[1.05] tracking-wide break-words uppercase"
      >
        {pick(item, 'title')}
      </motion.span>
    </div>
  )
}
