/**
 * Carrusel de la Universidad: etapas de formación, en orden.
 * Imágenes en public/universidad/ (1200×750, formato 16:10).
 */
export interface Slide {
  src: string
  caption: string
}

export const SLIDES: Slide[] = [{ src: '01_divina_pastora.webp', caption: 'Colegio Divina Pastora - Córdoba' }]

export const slideUrl = (src: string) => `${import.meta.env.BASE_URL}universidad/${src}`
