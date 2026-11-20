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
}

export const hasInterior = (id: BuildingId) => id in INTERIORS
