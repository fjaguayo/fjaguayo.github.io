import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MAP_SIZE, assetUrl } from '../../data/buildings'
import { CATEGORIES, imdbUrl, posterUrl, type CategoryId, type Title } from '../../data/cine'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

// La sala tiene el mismo tamaño que el mapa (2752×1536).
const ratio = MAP_SIZE.width / MAP_SIZE.height

// Hueco negro de la pantalla dentro de Cine_pantalla.jpg, en % de la imagen.
const SCREEN = { left: 19.8, top: 20.7, width: 60.07, height: 41.28 }

export default function CineInterior({ onExit }: Props) {
  const [active, setActive] = useState<CategoryId>('series')
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const category = CATEGORIES.find((c) => c.id === active)!

  // flechas izquierda/derecha entre pestañas, como pide el patrón de tabs accesibles
  const onTabKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + CATEGORIES.length) % CATEGORIES.length
    setActive(CATEGORIES[next].id)
    tabsRef.current[next]?.focus()
  }

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

        {/* la pantalla: un Netflix en miniatura */}
        <motion.section
          aria-label="FJAHFLIX, series y películas favoritas"
          initial={{ opacity: 0, filter: 'brightness(2.2)' }}
          animate={{ opacity: 1, filter: 'brightness(1)' }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          className="absolute flex flex-col overflow-hidden rounded-[0.35cqw] bg-[#141414] text-white [container-type:inline-size]"
          style={{
            left: `${SCREEN.left}%`,
            top: `${SCREEN.top}%`,
            width: `${SCREEN.width}%`,
            height: `${SCREEN.height}%`,
            boxShadow: '0 0 2.5cqw 0.4cqw rgba(229, 9, 20, 0.18)',
          }}
        >
          <header className="flex h-[5cqw] shrink-0 items-center gap-[3cqw] bg-gradient-to-b from-black/80 to-transparent px-[2.6cqw] pt-[0.6cqw]">
            <span
              className="font-display text-[2.7cqw] leading-none tracking-[0.06em] text-[#e50914]"
              style={{ textShadow: '0 0.15cqw 0 #000' }}
            >
              FJAHFLIX
            </span>
            <div role="tablist" aria-label="Categorías" className="flex gap-[2cqw]">
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
                    className={`relative cursor-pointer border-0 bg-transparent px-0 py-[0.4cqw] text-[1.45cqw] font-semibold transition-colors outline-none focus-visible:text-white ${
                      selected ? 'text-white' : 'text-white/55 hover:text-white/85'
                    }`}
                  >
                    {c.label}
                    {selected && (
                      <motion.span
                        layoutId="cine-tab-underline"
                        className="absolute right-0 -bottom-[0.1cqw] left-0 h-[0.22cqw] rounded-full bg-[#e50914]"
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
                initial={{ opacity: 0, x: '2cqw' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-2cqw' }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute inset-0 flex flex-col"
              >
                <h2 className="mt-[1.6cqw] mb-[0.2cqw] px-[2.6cqw] text-[1.8cqw] font-bold leading-none">
                  {category.label}
                  <span className="ml-[0.9cqw] text-[1.1cqw] font-medium text-white/45">
                    {category.items.length} títulos
                  </span>
                </h2>
                <PosterRow items={category.items} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.section>
      </div>

      <ExitButton onExit={onExit} />
    </div>
  )
}

function PosterRow({ items }: { items: Title[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

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
      <ul
        ref={ref}
        onScroll={update}
        className="m-0 flex list-none snap-x snap-mandatory gap-[1cqw] overflow-x-auto scroll-px-[2.6cqw] px-[2.6cqw] py-[1.6cqw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
  return (
    <button
      type="button"
      aria-label={dir === 1 ? 'Ver más títulos' : 'Ver títulos anteriores'}
      onClick={onClick}
      tabIndex={-1}
      className={`absolute top-[1.6cqw] bottom-[1.6cqw] z-20 flex w-[2.6cqw] cursor-pointer items-center justify-center border-0 text-[2.4cqw] text-white opacity-0 transition-opacity group-hover/row:opacity-100 ${
        dir === 1 ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'
      } from-black/85 to-black/20 ${hidden ? 'pointer-events-none !opacity-0' : ''}`}
    >
      <svg viewBox="0 0 24 24" className="h-[2cqw] w-[2cqw]" fill="none" stroke="currentColor" strokeWidth={3}>
        <path d={dir === 1 ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function Poster({ item }: { item: Title }) {
  const [broken, setBroken] = useState(false)
  const showImage = item.poster && !broken

  return (
    <motion.a
      href={imdbUrl(item.imdbId)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} (${item.year}${item.tag ? `, ${item.tag}` : ''}), abrir en IMDb`}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{ rest: { scale: 1, zIndex: 0 }, hover: { scale: 1.07, zIndex: 10 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="relative block aspect-[2/3] w-[15.6cqw] overflow-hidden rounded-[0.45cqw] bg-[#222] shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.6)] outline-none focus-visible:ring-[0.25cqw] focus-visible:ring-white"
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
        className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-[0.9cqw]"
      >
        <span className="text-[1.3cqw] font-bold leading-tight">{item.title}</span>
        <span className="mt-[0.4cqw] flex items-center justify-between text-[0.95cqw] text-white/70">
          {item.tag ? `${item.year} · ${item.tag}` : item.year}
          <span className="rounded-[0.25cqw] bg-[#f5c518] px-[0.5cqw] py-[0.1cqw] text-[0.85cqw] font-black text-black">
            IMDb
          </span>
        </span>
      </motion.div>
    </motion.a>
  )
}

/** Carátula dibujada para los títulos que aún no tienen imagen. */
function FallbackCover({ item }: { item: Title }) {
  let h = 0
  for (const ch of item.title) h = (h * 31 + ch.charCodeAt(0)) % 360
  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-[1cqw]"
      style={{ background: `linear-gradient(160deg, hsl(${h} 55% 32%), hsl(${(h + 40) % 360} 60% 12%))` }}
    >
      <span className="font-display text-[1.5cqw] leading-none text-[#e50914]" style={{ textShadow: '0 0.1cqw 0 #000' }}>
        F
      </span>
      <motion.span
        variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
        transition={{ duration: 0.15 }}
        className="font-display text-[1.7cqw] leading-[1.05] tracking-wide break-words uppercase"
      >
        {item.title}
      </motion.span>
    </div>
  )
}
