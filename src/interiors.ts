import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { BuildingId } from './data/buildings'

export interface InteriorProps {
  onExit: () => void
}

/**
 * Edificios que ya tienen interior (fase 2). Los demás siguen mostrando "Próximamente".
 * Cada interior se descarga solo cuando alguien entra.
 */
export const INTERIORS: Partial<Record<BuildingId, LazyExoticComponent<ComponentType<InteriorProps>>>> = {
  cine: lazy(() => import('./components/interiors/CineInterior')),
  cartel_bienvenida: lazy(() => import('./components/interiors/CvInterior')),
}

/** Interiores que se abren encima de la ciudad: la música sigue sonando de fondo. */
export const KEEPS_MUSIC: BuildingId[] = ['cartel_bienvenida']

export const hasInterior = (id: BuildingId) => id in INTERIORS
