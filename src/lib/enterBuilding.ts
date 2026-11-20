import type { BuildingId } from '../data/buildings'

export const ENTER_EVENT = 'fjah:enter-building'

/**
 * Punto de entrada a cada edificio. En la fase 1 no abre nada: solo avisa de que
 * el interior llegará pronto. En la fase 2 abrirá el frontend de cada edificio.
 */
export function enterBuilding(id: BuildingId) {
  window.dispatchEvent(new CustomEvent<BuildingId>(ENTER_EVENT, { detail: id }))
}
