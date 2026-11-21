import { useEffect, useState } from 'react'

/** true mientras se cumpla la media query; se actualiza al girar el móvil o cambiar el tamaño de la ventana. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])

  return matches
}

/** Móvil en vertical o en horizontal: lo mismo que la variante `compact` de index.css. */
export const COMPACT_QUERY = '(max-width: 639px), (max-height: 540px)'
