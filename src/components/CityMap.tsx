import type { ReactNode } from 'react'
import { MAP_SIZE, assetUrl, type BuildingConfig } from '../data/buildings'
import Birds from './Birds'
import Building from './Building'

interface Props {
  buildings: BuildingConfig[]
  editing?: boolean
  /** Capas extra dentro del sistema de coordenadas del mapa (p. ej. el modo de colocación). */
  children?: ReactNode
}

const ratio = MAP_SIZE.width / MAP_SIZE.height

export default function CityMap({ buildings, editing = false, children }: Props) {
  // orden de dibujo y de tabulación: de arriba abajo según la base
  const ordered = [...buildings].sort((a, b) => a.y - b.y)

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
        <img
          src={assetUrl('mapa_base')}
          alt=""
          draggable={false}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full"
        />
        <nav aria-label="Edificios de FJAH City" className="absolute inset-0">
          {ordered.map((b) => (
            <Building key={b.id} building={b} editing={editing} />
          ))}
        </nav>
        <Birds />
        {children}
      </div>
    </div>
  )
}
