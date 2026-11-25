import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BUILDINGS, type BuildingId } from '../data/buildings'

/**
 * Idioma de la web: español por defecto, inglés con el botón ES/EN.
 * No se guarda nada entre visitas; solo se lee ?lang=en de la URL, para poder
 * mandar el enlace directamente en inglés (y el botón la mantiene al día).
 */
export type Lang = 'es' | 'en'

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangState>({ lang: 'es', setLang: () => {} })

const TITLES: Record<Lang, string> = {
  es: 'FJAH City · Javier Aguayo',
  en: 'FJAH City · Javier Aguayo',
}

const DESCRIPTIONS: Record<Lang, string> = {
  es: 'Portfolio de Francisco Javier Aguayo Hernández, estudiante de Ingeniería Electrónica Industrial en la Universidad de Málaga.',
  en: 'Portfolio of Francisco Javier Aguayo Hernández, Industrial Electronics Engineering student at the University of Málaga.',
}

function initialLang(): Lang {
  try {
    return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    // la URL refleja el idioma, sin tocar el resto de parámetros (?edit, ?arcade-edit...)
    try {
      const url = new URL(window.location.href)
      if (next === 'en') url.searchParams.set('lang', 'en')
      else url.searchParams.delete('lang')
      window.history.replaceState(window.history.state, '', url)
    } catch {
      /* sin History API: no pasa nada */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = TITLES[lang]
    document.querySelector('meta[name="description"]')?.setAttribute('content', DESCRIPTIONS[lang])
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

/**
 * `t('Hola', 'Hello')` devuelve el texto en el idioma activo.
 * `pick(obj, 'name')` elige entre obj.name y obj.nameEn (si existe).
 */
export function useLang() {
  const { lang, setLang } = useContext(LangContext)
  const en = lang === 'en'
  const t = useCallback((es: string, enText: string) => (en ? enText : es), [en])
  const pick = useCallback(
    <T extends object, K extends keyof T & string>(obj: T, key: K): T[K] => {
      if (!en) return obj[key]
      const alt = (obj as Record<string, unknown>)[`${key}En`]
      return (alt ?? obj[key]) as T[K]
    },
    [en],
  )
  const buildingName = useCallback(
    (id: BuildingId) => {
      const b = BUILDINGS.find((x) => x.id === id)
      if (!b) return id
      return en ? b.labelEn : b.label
    },
    [en],
  )
  return { lang, setLang, en, t, pick, buildingName }
}
