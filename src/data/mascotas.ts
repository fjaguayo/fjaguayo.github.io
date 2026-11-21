import HIT from './mascotasHit.json'

/**
 * Mascotas del Parque. Las posiciones salen del editor de los terrarios:
 * x, y = punto de apoyo (centro de la base) en % del mapa; width = % del ancho del mapa.
 */

export type PetKind = 'lola' | 'an' | 'palo' | 'reina' | 'isopodo'

export interface Pet {
  name: string
  species: string
  info: string
}

export const PETS: Record<PetKind, Pet> = {
  lola: {
    name: 'Lola',
    species: 'Jerbo blanco',
    info: 'Vive en el terrario del arbusto, con su comedero y una rueda para correr.',
  },
  an: {
    name: 'Gustavo',
    species: 'Jerbo negro',
    info: 'Su terrario tiene una casita de madera, una rampa hasta la plataforma de arriba y su bebedero.',
  },
  palo: {
    name: 'Bartolo',
    species: 'Insecto palo',
    info: 'Se camufla entre las ramas secas de su terrario: si se queda quieto, cuesta encontrarlo.',
  },
  reina: {
    name: 'La Reina',
    species: 'Hormiga reina negra',
    info: 'Excava sus túneles en la tierra y es la que pone los huevos de toda la colonia.',
  },
  isopodo: {
    name: 'Isópodos',
    species: 'Isópodos amarillos',
    info: 'Pequeños crustáceos de tierra que se esconden bajo los troncos y se comen la materia orgánica que se descompone.',
  },
}

export interface Placement {
  id: PetKind
  x: number
  y: number
  width: number
  rotate?: number
  flip?: boolean
}

export const PLACEMENTS: Placement[] = [
  { id: 'lola', x: 23.13, y: 45.02, width: 11 },
  { id: 'an', x: 72.62, y: 43.41, width: 10 },
  { id: 'palo', x: 36.57, y: 81.48, width: 18.8, rotate: -49, flip: true },
  { id: 'reina', x: 95, y: 71.33, width: 6 },
  { id: 'isopodo', x: 60.42, y: 94.16, width: 4 },
  { id: 'isopodo', x: 94.22, y: 94.16, width: 4 },
  { id: 'isopodo', x: 68.34, y: 93.5, width: 4 },
  { id: 'isopodo', x: 86.23, y: 92.83, width: 4 },
]

export const PET_HIT = HIT as Record<PetKind, { width: number; height: number; polygons: number[][][] }>

export const MAP = { width: 2000, height: 1493 }

export const parqueUrl = (file: string) => `${import.meta.env.BASE_URL}parque/${file}.webp`
