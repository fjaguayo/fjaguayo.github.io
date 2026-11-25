import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import CityMap from './components/CityMap'
import ComingSoon from './components/ComingSoon'
import MusicToggle from './components/MusicToggle'
import LangToggle from './components/LangToggle'
import { BUILDINGS, type BuildingId } from './data/buildings'
import { ENTER_EVENT } from './lib/enterBuilding'
import { createAmbientMusic } from './lib/ambientMusic'
import { INTERIORS, KEEPS_MUSIC } from './interiors'
import { useLang } from './lib/i18n'

// Modo de colocación: solo en desarrollo y con ?edit en la URL.
// En producción esta rama desaparece del bundle.
const PlacementEditor = import.meta.env.DEV ? lazy(() => import('./components/PlacementEditor')) : null
const editing = !!PlacementEditor && new URLSearchParams(window.location.search).has('edit')

export default function App() {
  const { t, buildingName } = useLang()
  const [buildings, setBuildings] = useState(BUILDINGS)
  const [inside, setInside] = useState<BuildingId | null>(null)
  // al salir, el foco vuelve al edificio por el que se entró
  const returnFocus = useRef<HTMLElement | null>(null)
  const insideRef = useRef<BuildingId | null>(null)
  insideRef.current = inside

  // música de la ciudad: el navegador no deja sonar nada hasta el primer clic o tecla
  const music = useRef(createAmbientMusic())
  const [musicOn, setMusicOn] = useState(true)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    if (unlocked) return
    const unlock = () => setUnlocked(true)
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [unlocked])

  // suena en la ciudad y en las fichas que se abren encima; se calla en el cine, que tiene su propio sonido
  useEffect(() => {
    const m = music.current
    if (!m || !unlocked) return
    if (musicOn && (!inside || KEEPS_MUSIC.includes(inside))) m.play()
    else m.pause()
  }, [unlocked, musicOn, inside])

  useEffect(() => {
    const onEnter = (e: Event) => {
      const id = (e as CustomEvent<BuildingId>).detail
      if (!INTERIORS[id]) return
      // desde el metro se salta de un interior a otro: el foco vuelve al edificio por el que se entró al principio
      if (!insideRef.current) returnFocus.current = document.activeElement as HTMLElement | null
      setInside(id)
    }
    window.addEventListener(ENTER_EVENT, onEnter)
    return () => window.removeEventListener(ENTER_EVENT, onEnter)
  }, [])

  // colocar el Arcade: /?arcade-edit en desarrollo, o el build de vista previa con VITE_ARCADE_EDITOR=1, entran directos en la sala
  useEffect(() => {
    const preview = import.meta.env.VITE_ARCADE_EDITOR === '1'
    if (preview || (import.meta.env.DEV && new URLSearchParams(window.location.search).has('arcade-edit'))) setInside('arcade')
  }, [])

  const exit = useCallback(() => setInside(null), [])
  const Interior = inside ? INTERIORS[inside] : null

  return (
    <MotionConfig reducedMotion="user">
      <h1 className="sr-only">{t('FJAH City, el portfolio de Javier Aguayo', "FJAH City, Javier Aguayo's portfolio")}</h1>
      <div inert={!!inside}>
        <CityMap buildings={buildings} editing={editing}>
          {editing && PlacementEditor && (
            <Suspense fallback={null}>
              <PlacementEditor buildings={buildings} onChange={setBuildings} />
            </Suspense>
          )}
        </CityMap>
        <ComingSoon />
        {music.current && <MusicToggle on={musicOn} onToggle={() => setMusicOn((v) => !v)} />}
      </div>

      <AnimatePresence mode="wait" onExitComplete={() => !insideRef.current && returnFocus.current?.focus({ preventScroll: true })}>
        {Interior && (
          <motion.div
            key={inside}
            role="dialog"
            aria-modal="true"
            aria-label={inside ? buildingName(inside) : undefined}
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

      <LangToggle />
    </MotionConfig>
  )
}
