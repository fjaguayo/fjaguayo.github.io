import { motion } from 'framer-motion'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

const CV_URL = `${import.meta.env.BASE_URL}cv/CV_FJAH.pdf`
// Las páginas del PDF como imágenes: se ven igual en todos los navegadores, también en los que no muestran PDF.
const PAGES = [1, 2, 3].map((n) => `${import.meta.env.BASE_URL}cv/pagina_${n}.webp`)

/** El cartel de bienvenida abre el CV en una ficha encima de la ciudad. */
export default function CvInterior({ onExit }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-6">
      {/* la ciudad se queda detrás, oscurecida; un clic fuera de la ficha vuelve */}
      <button
        type="button"
        aria-label="Cerrar el currículum"
        tabIndex={-1}
        onClick={onExit}
        className="absolute inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-label="Currículum de Javier Aguayo"
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative flex h-[min(88dvh,1000px)] w-[min(880px,92vw)] flex-col overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)]"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-ink bg-sun px-5 py-3">
          <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide text-ink">Currículum</h2>
          <div className="flex gap-3">
            <a
              href={CV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-[3px] border-ink bg-cream px-3 py-1.5 text-sm font-bold text-ink no-underline shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky"
            >
              Abrir en otra pestaña
            </a>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#d9d4c7] p-4">
          {PAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Currículum, página ${i + 1} de ${PAGES.length}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
              className="mx-auto mb-4 block w-full max-w-[800px] rounded-md border-2 border-ink/20 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] last:mb-0"
            />
          ))}
        </div>
      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}
