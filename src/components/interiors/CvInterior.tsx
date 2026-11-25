import { motion } from 'framer-motion'
import ExitButton from './ExitButton'
import { useLang } from '../../lib/i18n'

interface Props {
  onExit: () => void
}

const CV_URL = `${import.meta.env.BASE_URL}cv/CV_FJAH.pdf`
// Las páginas del PDF como imágenes: se ven igual en todos los navegadores, también en los que no muestran PDF.
const PAGES = [1, 2, 3].map((n) => `${import.meta.env.BASE_URL}cv/pagina_${n}.webp`)

/** El cartel de bienvenida abre el CV en una ficha encima de la ciudad. */
export default function CvInterior({ onExit }: Props) {
  const { t } = useLang()
  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 pt-20 pb-4 compact:px-2 compact:pt-16 compact:pb-[calc(var(--safe-bottom)+8px)]">
      {/* la ciudad se queda detrás, oscurecida; un clic fuera de la ficha vuelve */}
      <button
        type="button"
        aria-label={t('Cerrar el currículum', 'Close the résumé')}
        tabIndex={-1}
        onClick={onExit}
        className="absolute inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-label={t('Currículum de Javier Aguayo', "Javier Aguayo's résumé")}
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative flex h-full max-h-[1000px] w-[min(880px,92vw)] flex-col overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)] compact:w-full compact:max-w-[880px] compact:shadow-[5px_5px_0_var(--color-ink)]"
      >
        <header className="flex items-center justify-between gap-3 border-b-4 border-ink bg-sun px-5 py-3 compact:px-4 compact:py-2.5">
          <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide text-ink compact:text-xl">{t('Currículum', 'Résumé')}</h2>
          <a
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border-[3px] border-ink bg-cream px-3 py-1.5 text-sm font-bold text-ink no-underline shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky"
          >
            <span className="compact:hidden">{t('Abrir en otra pestaña', 'Open in a new tab')}</span>
            <span className="hidden compact:inline">{t('Abrir el PDF', 'Open the PDF')}</span>
          </a>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#d9d4c7] p-4 compact:p-2">
          {PAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={t(`Currículum, página ${i + 1} de ${PAGES.length}`, `Résumé, page ${i + 1} of ${PAGES.length}`)}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
              className="mx-auto mb-4 block w-full max-w-[800px] rounded-md border-2 border-ink/20 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] last:mb-0 compact:mb-2"
            />
          ))}
        </div>
      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}
