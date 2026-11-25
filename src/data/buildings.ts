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
  | 'casa'

export interface BuildingConfig {
  id: BuildingId
  /** Texto de la etiqueta que aparece bajo el edificio. */
  label: string
  /** La misma etiqueta en inglés. */
  labelEn: string
  /** Nombre base de la imagen en public/assets (sin extensión ni _hover). */
  image: string
  /** Punto de apoyo de la base, en % del ancho del mapa. */
  x: number
  /** Punto de apoyo de la base, en % del alto del mapa. */
  y: number
  /** Ancho de la imagen, en % del ancho del mapa. */
  width: number
  /** Giro en grados alrededor del punto de apoyo (opcional). */
  rotate?: number
  /** Espejo horizontal, para que la fachada mire a la carretera (opcional). */
  flip?: boolean
}

/** Tamaño original del mapa, para mantener su proporción. */
export const MAP_SIZE = { width: 2752, height: 1536 }

// Colocación elegida por Javier en el editor (20/11/2026; casa añadida el 21/11/2026).
// Para afinarla a ojo: `npm run dev` y abrir http://localhost:5173/?edit
export const BUILDINGS: BuildingConfig[] = [
  { id: 'universidad', label: 'Universidad', labelEn: 'University', image: 'universidad', x: 32.88, y: 72.71, width: 12.5, flip: true },
  { id: 'empresa', label: 'La Empresa', labelEn: 'The Company', image: 'empresa', x: 53.48, y: 62.17, width: 11.99, rotate: -3, flip: true },
  { id: 'taller', label: 'El Taller', labelEn: 'The Workshop', image: 'taller', x: 60.11, y: 83.99, width: 11 },
  { id: 'centro_civico', label: 'Centro Cívico', labelEn: 'Civic Center', image: 'centro_civico', x: 42.04, y: 85.75, width: 9.5 },
  { id: 'oficina_correos', label: 'Correos', labelEn: 'Post Office', image: 'oficina_correos', x: 61.64, y: 49.38, width: 9 },
  { id: 'aeropuerto', label: 'Aeropuerto', labelEn: 'Airport', image: 'aeropuerto', x: 24.2, y: 51.72, width: 16.5, flip: true },
  { id: 'gimnasio', label: 'Gimnasio', labelEn: 'Gym', image: 'gimnasio', x: 36.02, y: 39.56, width: 8.5, flip: true },
  { id: 'cine', label: 'Cine', labelEn: 'Cinema', image: 'cine', x: 73.59, y: 72.88, width: 11, flip: true },
  { id: 'arcade', label: 'Arcade', labelEn: 'Arcade', image: 'arcade', x: 47.25, y: 37.24, width: 9.5 },
  { id: 'parque', label: 'El Parque', labelEn: 'The Park', image: 'parque', x: 70.53, y: 43.18, width: 10.43 },
  { id: 'cartel_bienvenida', label: 'Bienvenida', labelEn: 'Welcome', image: 'cartel_bienvenida', x: 57.24, y: 37.06, width: 10.44 },
  { id: 'estacion_metro', label: 'Metro', labelEn: 'Metro', image: 'estacion_metro', x: 40.7, y: 54.04, width: 7.86 },
  { id: 'casa', label: 'Casa', labelEn: 'Home', image: 'casa', x: 81.73, y: 49.84, width: 11.61 },
]

export interface HitArea {
  width: number
  height: number
  /** Punto de apoyo de la base dentro de la imagen (0–1). */
  anchor: [number, number]
  /** Contorno del dibujo (0–1), sin la sombra, más los huecos de fondo atrapado (se combinan con evenodd). */
  polygons: [number, number][][]
}

export const HIT_AREAS = hitAreas as unknown as Record<BuildingId, HitArea>

export const assetUrl = (name: string) => `${import.meta.env.BASE_URL}assets/${name}.webp`
