import { useLang } from '../lib/i18n'

interface Props {
  on: boolean
  onToggle: () => void
}

/** Botón fijo para encender o apagar la música de la ciudad. */
export default function MusicToggle({ on, onToggle }: Props) {
  const { t } = useLang()
  const text = on ? t('Silenciar la música', 'Mute the music') : t('Activar la música', 'Turn the music on')
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={text}
      title={text}
      className="fixed bottom-[calc(var(--safe-bottom)+20px)] left-[calc(var(--safe-left)+20px)] z-[20000] flex h-12 w-12 compact:bottom-[calc(var(--safe-bottom)+12px)] compact:left-[calc(var(--safe-left)+12px)] compact:h-11 compact:w-11 cursor-pointer items-center justify-center rounded-xl border-4 border-ink bg-cream text-ink shadow-[4px_4px_0_var(--color-ink)] transition-transform outline-none hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sun"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? (
          <>
            <path d="M16 9.5a3.5 3.5 0 0 1 0 5" />
            <path d="M18.5 7a7 7 0 0 1 0 10" />
          </>
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" />
        )}
      </svg>
    </button>
  )
}
