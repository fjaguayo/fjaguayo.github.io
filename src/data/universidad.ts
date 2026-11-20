/**
 * Carrusel de la Universidad: etapas de formación, en orden.
 * Imágenes en public/universidad/. Cualquier proporción vale: se ven enteras, y si no son 16:10
 * el hueco que sobra se rellena con la misma imagen desenfocada.
 */
export interface Slide {
  src: string
  caption: string
}

export const SLIDES: Slide[] = [
  { src: '01_divina_pastora.webp', caption: 'Colegio Divina Pastora - Córdoba' },
  { src: '02_la_salle.webp', caption: 'Colegio La Salle - Córdoba' },
]

export const slideUrl = (src: string) => `${import.meta.env.BASE_URL}universidad/${src}`
