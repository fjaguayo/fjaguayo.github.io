import { motion } from 'framer-motion'
import { useLang } from '../lib/i18n'

/**
 * Botón fijo arriba a la derecha para cambiar toda la web entre español e inglés.
 * Está por encima de los interiores, así que se puede cambiar desde cualquier sitio.
 */
export default function LangToggle() {
  const { lang, setLang, t } = useLang()
  const next = lang === 'es' ? 'en' : 'es'

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={t('Cambiar a inglés', 'Switch to Spanish')}
      title={t('Ver la web en inglés', 'Ver la web en español')}
      className="fixed top-[calc(var(--safe-top)+20px)] right-[calc(var(--safe-right)+20px)] z-[40000] flex cursor-pointer items-center rounded-xl border-4 border-ink bg-cream p-1 font-display text-lg leading-none tracking-wide text-ink shadow-[4px_4px_0_var(--color-ink)] transition-transform outline-none hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sun compact:top-[calc(var(--safe-top)+12px)] compact:right-[calc(var(--safe-right)+12px)] compact:text-base"
    >
      {(['es', 'en'] as const).map((l) => (
        <span key={l} className="relative block px-2.5 pt-1.5 pb-1 compact:px-2 compact:pt-1 compact:pb-0.5">
          {lang === l && (
            <motion.span
              layoutId="lang-pill"
              aria-hidden="true"
              className="absolute inset-0 rounded-lg border-[3px] border-ink bg-sun"
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
          <span className={`relative ${lang === l ? 'text-ink' : 'text-ink/45'}`}>{l.toUpperCase()}</span>
        </span>
      ))}
    </button>
  )
}
