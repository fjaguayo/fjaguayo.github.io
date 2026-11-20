import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import CityMap from './components/CityMap'
import ComingSoon from './components/ComingSoon'
import { BUILDINGS, type BuildingId } from './data/buildings'
import { ENTER_EVENT } from './lib/enterBuilding'
import { INTERIORS } from './interiors'

// Modo de colocación: solo en desarrollo y con ?edit en la URL.
// En producción esta rama desaparece del bundle.
const PlacementEditor = import.meta.env.DEV ? lazy(() => import('./components/PlacementEditor')) : null
const editing = !!PlacementEditor && new URLSearchParams(window.location.search).has('edit')

export default function App() {
  const [buildings, setBuildings] = useState(BUILDINGS)
  const [inside, setInside] = useState<BuildingId | null>(null)
  // al salir, el foco vuelve al edificio por el que se entró
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onEnter = (e: Event) => {
      const id = (e as CustomEvent<BuildingId>).detail
      if (!INTERIORS[id]) return
      returnFocus.current = document.activeElement as HTMLElement | null
      setInside(id)
    }
    window.addEventListener(ENTER_EVENT, onEnter)
    return () => window.removeEventListener(ENTER_EVENT, onEnter)
  }, [])

  const exit = useCallback(() => setInside(null), [])
  const Interior = inside ? INTERIORS[inside] : null

  return (
    <MotionConfig reducedMotion="user">
      <h1 className="sr-only">FJAH City, el portfolio de Javier Aguayo</h1>
      <div inert={!!inside}>
        <CityMap buildings={buildings} editing={editing}>
          {editing && PlacementEditor && (
            <Suspense fallback={null}>
              <PlacementEditor buildings={buildings} onChange={setBuildings} />
            </Suspense>
          )}
        </CityMap>
        <ComingSoon />
      </div>

      <AnimatePresence onExitComplete={() => returnFocus.current?.focus({ preventScroll: true })}>
        {Interior && (
          <motion.div
            key={inside}
            role="dialog"
            aria-modal="true"
            aria-label={BUILDINGS.find((b) => b.id === inside)?.label}
            className="fixed inset-0 z-[30000]"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
              <Interior onExit={exit} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
