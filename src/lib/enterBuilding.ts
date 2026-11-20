import type { BuildingId } from '../data/buildings'

export const ENTER_EVENT = 'fjah:enter-building'

/**
 * Punto de entrada a cada edificio. Si el edificio tiene interior (src/interiors.ts),
 * App lo abre; si no, ComingSoon avisa de que llegará pronto.
 */
export function enterBuilding(id: BuildingId) {
  window.dispatchEvent(new CustomEvent<BuildingId>(ENTER_EVENT, { detail: id }))
}
