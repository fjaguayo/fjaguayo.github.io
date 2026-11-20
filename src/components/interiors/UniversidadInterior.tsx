import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SLIDES, slideUrl } from '../../data/universidad'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

/** Universidad: carrusel lineal con las etapas de formación, una imagen tras otra. */
export default function UniversidadInterior({ onExit }: Props) {
  const [[index, dir], setState] = useState<[number, 1 | -1]>([0, 1])
  const last = SLIDES.length - 1
  const go = (to: number) => {
    if (to < 0 || to > last || to === index) return
    setState([to, to > index ? 1 : -1])
  }

  // flechas del teclado para pasar de foto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1)
      if (e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const slide = SLIDES[index]

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 pt-20 pb-4">
      <button
        type="button"
        aria-label="Cerrar la universidad"
        tabIndex={-1}
        onClick={onExit}
        className="absolute inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-roledescription="carrusel"
        aria-label="Formación de Javier"
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)]"
        // lo más grande posible sin tapar el botón de volver y dejando ver la foto entera (16:10)
        style={{ width: 'min(1640px, 96vw, calc((100dvh - 96px - 62px) * 1.6))' }}
      >
        <header className="flex items-center justify-between border-b-4 border-ink bg-berry px-5 py-3 text-cream">
          <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide">Formación</h2>
          <span className="text-sm font-bold" aria-live="polite">
            {index + 1} / {SLIDES.length}
          </span>
        </header>

        <div className="relative aspect-[16/10] overflow-hidden bg-ink">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={slide.src}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: `${d * 100}%` }),
                center: { x: 0 },
                exit: (d: number) => ({ x: `${-d * 100}%` }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="absolute inset-0"
            >
              {/* relleno: la misma imagen, ampliada y desenfocada, para las fotos que no son 16:10 */}
              <img
                src={slideUrl(slide.src)}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl brightness-75"
              />
              <img
                src={slideUrl(slide.src)}
                alt={slide.caption}
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </motion.div>
          </AnimatePresence>

          <NavArrow side="left" disabled={index === 0} onClick={() => go(index - 1)} />
          <NavArrow side="right" disabled={index === last} onClick={() => go(index + 1)} />
            {/* subtítulo y línea de tiempo, sobre la parte baja de la foto */}
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-6 pt-14 pb-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={slide.caption}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="m-0 text-center font-display text-3xl uppercase leading-tight tracking-wide text-cream [text-shadow:0_3px_0_#1b1b2f]"
                >
                  {slide.caption}
                </motion.p>
              </AnimatePresence>

              {/* línea de tiempo: un punto por etapa, unidos por una línea */}
              {SLIDES.length > 1 && (
                <ol className="relative m-0 mx-auto mt-3 flex max-w-xl list-none items-center justify-between p-0">
                  <span aria-hidden="true" className="absolute top-1/2 right-2 left-2 h-1 -translate-y-1/2 rounded-full bg-white/35" />
                  <motion.span
                    aria-hidden="true"
                    className="absolute top-1/2 left-2 h-1 -translate-y-1/2 rounded-full bg-berry"
                    animate={{ width: `calc(${(index / last) * 100}% - ${(index / last) * 16}px)` }}
                    transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                  />
                  {SLIDES.map((s, i) => (
                    <li key={s.src} className="relative">
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-label={`${i + 1}. ${s.caption}`}
                        aria-current={i === index ? 'step' : undefined}
                        className={`block cursor-pointer rounded-full border-[3px] border-ink transition-all outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky ${
                          i === index ? 'h-5 w-5 bg-berry' : i < index ? 'h-4 w-4 bg-berry' : 'h-4 w-4 bg-cream'
                        }`}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </div>
        </div>

      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}

function NavArrow({ side, disabled, onClick }: { side: 'left' | 'right'; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Foto anterior' : 'Foto siguiente'}
      className={`absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-4 border-ink bg-cream text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[opacity,transform] outline-none hover:scale-105 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun disabled:pointer-events-none disabled:opacity-0 ${
        side === 'left' ? 'left-4' : 'right-4'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3.5}>
        <path d={side === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
