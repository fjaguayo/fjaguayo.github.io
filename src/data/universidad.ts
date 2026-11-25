/**
 * Carrusel de la Universidad: etapas de formación, en orden.
 * Imágenes en public/universidad/. Cualquier proporción vale: se ven enteras, y si no son 16:10
 * el hueco que sobra se rellena con la misma imagen desenfocada.
 */
export interface Slide {
  src: string
  caption: string
  captionEn?: string
  /** Texto pequeño bajo el subtítulo. Opcional. */
  note?: string
  noteEn?: string
}

export const SLIDES: Slide[] = [
  { src: '01_divina_pastora.webp', caption: 'Colegio Divina Pastora - Córdoba', captionEn: 'Divina Pastora School - Córdoba' },
  { src: '02_la_salle.webp', caption: 'Bachillerato tecnológico', captionEn: 'High school, technology track' },
  { src: '03_san_jose.webp', caption: 'FP Automatización y Robótica Industrial', captionEn: 'Vocational degree in Industrial Automation and Robotics' },
  { src: '04_uma.webp', caption: 'Ingeniería Electrónica Industrial - UMA', captionEn: 'Industrial Electronics Engineering - UMA', note: '(3 años, sin finalizar)', noteEn: '(3 years, not completed)' },
  { src: '05_python.webp', caption: 'Programación con Python', captionEn: 'Python programming' },
]

export const slideUrl = (src: string) => `${import.meta.env.BASE_URL}universidad/${src}`
