import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import CityMap from './components/CityMap'
import CharacterCard from './components/hud/CharacterCard'
import TopSign from './components/hud/TopSign'
import ComicModal from './components/ComicModal'
import PlaceholderInterior from './components/subui/PlaceholderInterior'
import MetroPlan from './components/subui/MetroPlan'
import { byId, type BuildingDef } from './data/buildings'

export default function App() {
  const [hovered, setHovered] = useState<BuildingDef | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const open = openId ? byId(openId) : undefined
  const close = useCallback(() => setOpenId(null), [])

  return (
    <main className="relative h-full w-full">
      <CityMap onHover={setHovered} onOpen={setOpenId} />

      {/* HUD: capa fija que no bloquea el mapa salvo en sus propios paneles */}
      <div className="pointer-events-none absolute inset-0 z-[3000]">
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <CharacterCard />
        </div>

        <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 md:block">
          <TopSign hovered={hovered} />
        </div>

        <motion.button
          type="button"
          onClick={() => setOpenId('estacion_metro')}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
          className="comic-btn pointer-events-auto absolute bottom-4 left-4 flex items-center gap-2 bg-paper py-1.5 pl-1.5 pr-4"
          aria-label="Abrir plano de metro"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-tomato font-display text-2xl text-paper">
            M
          </span>
          <span className="font-display text-lg">Metro</span>
        </motion.button>
      </div>

      <ComicModal
        open={!!open}
        onClose={close}
        title={open?.name ?? ''}
        subtitle={open?.interior}
        color={open?.color}
      >
        {open?.id === 'estacion_metro' ? (
          <MetroPlan onTravel={(id) => setOpenId(id)} />
        ) : (
          open && <PlaceholderInterior def={open} />
        )}
      </ComicModal>
    </main>
  )
}
