import { useEffect, useRef } from 'react'

/** Botón fijo para volver al mapa. También cierra con Escape. */
export default function ExitButton({ onExit }: { onExit: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)

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
      className="fixed top-5 left-5 z-50 flex cursor-pointer items-center gap-2 rounded-xl border-4 border-ink bg-cream px-4 py-2 font-display text-lg uppercase leading-none tracking-wide text-ink shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] outline-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sun"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3.5}>
        <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Volver a la ciudad
    </button>
  )
}
