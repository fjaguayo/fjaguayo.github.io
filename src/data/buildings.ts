import hitAreas from './hitAreas.json'

export type BuildingId =
  | 'universidad'
  | 'empresa'
  | 'taller'
  | 'centro_civico'
  | 'oficina_correos'
  | 'aeropuerto'
  | 'gimnasio'
  | 'cine'
  | 'arcade'
  | 'parque'
  | 'cartel_bienvenida'
  | 'estacion_metro'

export interface BuildingConfig {
  id: BuildingId
  /** Texto de la etiqueta que aparece bajo el edificio. */
  label: string
  /** Nombre base de la imagen en public/assets (sin extensión ni _hover). */
  image: string
  /** Punto de apoyo de la base, en % del ancho del mapa. */
  x: number
  /** Punto de apoyo de la base, en % del alto del mapa. */
  y: number
  /** Ancho de la imagen, en % del ancho del mapa. */
  width: number
}

/** Tamaño original del mapa, para mantener su proporción. */
export const MAP_SIZE = { width: 2752, height: 1536 }

// Propuesta de colocación. Pendiente de que Javier la apruebe.
// Para afinarla a ojo: `npm run dev` y abrir http://localhost:5173/?edit
export const BUILDINGS: BuildingConfig[] = [
  { id: 'universidad', label: 'Universidad', image: 'universidad', x: 33.5, y: 40.5, width: 12.5 },
  { id: 'empresa', label: 'La Empresa', image: 'empresa', x: 31, y: 70, width: 11.5 },
  { id: 'taller', label: 'El Taller', image: 'taller', x: 17, y: 56, width: 11 },
  { id: 'centro_civico', label: 'Centro Cívico', image: 'centro_civico', x: 41.5, y: 50, width: 9.5 },
  { id: 'oficina_correos', label: 'Correos', image: 'oficina_correos', x: 63.5, y: 48, width: 9 },
  { id: 'aeropuerto', label: 'Aeropuerto', image: 'aeropuerto', x: 82.5, y: 50, width: 16.5 },
  { id: 'gimnasio', label: 'Gimnasio', image: 'gimnasio', x: 53, y: 38, width: 8.5 },
  { id: 'cine', label: 'Cine', image: 'cine', x: 71.5, y: 72, width: 11 },
  { id: 'arcade', label: 'Arcade', image: 'arcade', x: 64, y: 87, width: 9.5 },
  { id: 'parque', label: 'El Parque', image: 'parque', x: 46, y: 80, width: 10 },
  { id: 'cartel_bienvenida', label: 'Bienvenida', image: 'cartel_bienvenida', x: 85, y: 82, width: 9 },
  { id: 'estacion_metro', label: 'Metro', image: 'estacion_metro', x: 64.5, y: 57, width: 6 },
]

export interface HitArea {
  width: number
  height: number
  /** Punto de apoyo de la base dentro de la imagen (0–1). */
  anchor: [number, number]
  /** Contorno del dibujo (0–1), sin la sombra. */
  polygons: [number, number][][]
}

export const HIT_AREAS = hitAreas as unknown as Record<BuildingId, HitArea>

export const assetUrl = (name: string) => `${import.meta.env.BASE_URL}assets/${name}.webp`
