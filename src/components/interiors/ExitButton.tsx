import { useEffect, useRef } from 'react'
import { useLang } from '../../lib/i18n'

/** Botón fijo para volver al mapa. También cierra con Escape. */
export default function ExitButton({ onExit }: { onExit: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const { t } = useLang()

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onExit()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onExit}
      aria-label={t('Volver a la ciudad', 'Back to the city')}
      className="fixed top-[calc(var(--safe-top)+20px)] left-[calc(var(--safe-left)+20px)] z-50 flex cursor-pointer items-center gap-2 rounded-xl border-4 border-ink bg-cream px-4 py-2 font-display text-lg uppercase leading-none tracking-wide text-ink shadow-[4px_4px_0_var(--color-ink)] transition-transform outline-none hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sun compact:top-[calc(var(--safe-top)+12px)] compact:left-[calc(var(--safe-left)+12px)] compact:gap-1.5 compact:px-3 compact:py-1.5 compact:text-base"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 compact:h-4 compact:w-4" fill="none" stroke="currentColor" strokeWidth={3.5}>
        <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t('Volver', 'Back')}<span className="compact:hidden">&nbsp;{t('a la ciudad', 'to the city')}</span>
    </button>
  )
}
