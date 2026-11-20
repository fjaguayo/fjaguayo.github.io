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
  centro_civico: lazy(() => import('./components/interiors/SocialInterior')),
  aeropuerto: lazy(() => import('./components/interiors/AeropuertoInterior')),
}

/** Interiores en los que la música de la ciudad sigue sonando de fondo. */
export const KEEPS_MUSIC: BuildingId[] = ['cartel_bienvenida', 'centro_civico', 'aeropuerto']

export const hasInterior = (id: BuildingId) => id in INTERIORS
