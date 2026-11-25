import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MAP_SIZE, assetUrl, type BuildingConfig } from '../data/buildings'
import { useMediaQuery } from '../lib/useMediaQuery'
import { useLang } from '../lib/i18n'
import Birds from './Birds'
import Building from './Building'

interface Props {
  buildings: BuildingConfig[]
  editing?: boolean
  /** Capas extra dentro del sistema de coordenadas del mapa (p. ej. el modo de colocación). */
  children?: ReactNode
}

const ratio = MAP_SIZE.width / MAP_SIZE.height

/**
 * Por debajo de esta proporción (ancho / alto) el mapa entero ya no cabe sin dejar bandas:
 * pasa en el móvil en vertical y en tabletas. Entonces el mapa ocupa todo el alto y se
 * recorre deslizando de lado.
 */
const SCROLL_QUERY = '(max-aspect-ratio: 10/7)'

export default function CityMap({ buildings, editing = false, children }: Props) {
  // orden de dibujo y de tabulación: de arriba abajo según la base
  const ordered = [...buildings].sort((a, b) => a.y - b.y)
  const scrollMode = useMediaQuery(SCROLL_QUERY) && !editing
  const scroller = useRef<HTMLDivElement>(null)
  const [hint, setHint] = useState(false)
  const { t } = useLang()

  // al entrar (o al girar el móvil) se empieza mirando el centro de la ciudad
  useLayoutEffect(() => {
    const el = scroller.current
    if (!scrollMode || !el) return
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
  }, [scrollMode])

  // aviso de "desliza" hasta que alguien mueve el mapa o pasan unos segundos
  useEffect(() => {
    if (!scrollMode) return setHint(false)
    setHint(true)
    const t = window.setTimeout(() => setHint(false), 5000)
    return () => window.clearTimeout(t)
  }, [scrollMode])

  const map = (
    <>
      <img
        src={assetUrl('mapa_base')}
        alt=""
        draggable={false}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full"
      />
      <nav aria-label={t('Edificios de FJAH City', 'FJAH City buildings')} className="absolute inset-0">
        {ordered.map((b) => (
          <Building key={b.id} building={b} editing={editing} />
        ))}
      </nav>
      <Birds />
      {children}
    </>
  )

  if (scrollMode) {
    return (
      <div
        ref={scroller}
        className="no-scrollbar fixed inset-0 overflow-x-auto overflow-y-hidden overscroll-x-contain"
        onScroll={() => hint && setHint(false)}
        // con ratón, la rueda vertical también mueve el mapa de lado
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY
        }}
      >
        <div
          id="city-map"
          className="relative [container-type:inline-size]"
          style={{ height: '100dvh', width: `calc(100dvh * ${ratio})` }}
        >
          {map}
        </div>

        <AnimatePresence>
          {hint && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none fixed left-1/2 z-[20000] flex -translate-x-1/2 items-center gap-2 rounded-full border-4 border-ink bg-cream px-4 py-2 text-sm font-bold whitespace-nowrap text-ink shadow-[4px_4px_0_var(--color-ink)]"
              style={{ top: 'calc(var(--safe-top) + 16px)' }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.6 }}
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ x: [-4, 4, -4] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18" />
              </motion.svg>
              {t('Desliza para recorrer la ciudad', 'Swipe to explore the city')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* relleno para ventanas con proporciones raras: el propio mapa, desenfocado */}
      <img
        src={assetUrl('mapa_base')}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-90"
      />
      {/*
        El mapa cubre la ventana sin deformarse; las posiciones van en % del mapa.
        Se recorta como mucho un 10 % por cada lado (horizontal) o un 7,5 % (vertical)
        para que ningún edificio quede fuera en monitores 5:4 o ultrapanorámicos.
      */}
      <div
        id="city-map"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [container-type:inline-size]"
        style={{
          width: `min(max(100vw, calc(100dvh * ${ratio})), calc(100vw / 0.8), calc(100dvh * ${ratio} / 0.85))`,
          aspectRatio: `${MAP_SIZE.width} / ${MAP_SIZE.height}`,
        }}
      >
        {map}
      </div>
    </div>
  )
}
