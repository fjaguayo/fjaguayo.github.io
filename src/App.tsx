import { Suspense, lazy, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import CityMap from './components/CityMap'
import ComingSoon from './components/ComingSoon'
import { BUILDINGS } from './data/buildings'

// Modo de colocación: solo en desarrollo y con ?edit en la URL.
// En producción esta rama desaparece del bundle.
const PlacementEditor = import.meta.env.DEV ? lazy(() => import('./components/PlacementEditor')) : null
const editing = !!PlacementEditor && new URLSearchParams(window.location.search).has('edit')

export default function App() {
  const [buildings, setBuildings] = useState(BUILDINGS)

  return (
    <MotionConfig reducedMotion="user">
      <h1 className="sr-only">FJAH City, el portfolio de Javier Aguayo</h1>
      <CityMap buildings={buildings} editing={editing}>
        {editing && PlacementEditor && (
          <Suspense fallback={null}>
            <PlacementEditor buildings={buildings} onChange={setBuildings} />
          </Suspense>
        )}
      </CityMap>
      <ComingSoon />
    </MotionConfig>
  )
}
