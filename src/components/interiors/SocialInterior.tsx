import { motion } from 'framer-motion'
import ExitButton from './ExitButton'

interface Props {
  onExit: () => void
}

const NETWORKS = [
  { name: 'GitHub', handle: 'fjaguayo', url: 'https://github.com/fjaguayo', logo: 'github' },
  { name: 'Instagram', handle: '@jaguayo27', url: 'https://www.instagram.com/jaguayo27/', logo: 'instagram' },
  {
    name: 'LinkedIn',
    handle: 'Javier Aguayo',
    url: 'https://www.linkedin.com/in/francisco-javier-aguayo-hern%C3%A1ndez-10a50b295/',
    logo: 'linkedin',
  },
  { name: 'Steam', handle: 'jackks7', url: 'https://steamcommunity.com/id/jackks7/', logo: 'steam' },
  { name: 'Spotify', handle: 'glachimon127', url: 'https://open.spotify.com/user/glachimon127', logo: 'spotify' },
]

const logoUrl = (name: string) => `${import.meta.env.BASE_URL}social/${name}.webp`

/** El Centro Cívico abre un tablón con las redes sociales de Javier. */
export default function SocialInterior({ onExit }: Props) {
  return (
    <div className="fixed inset-0 flex overflow-y-auto px-4 pt-20 pb-4 compact:px-3 compact:pt-16 compact:pb-[calc(var(--safe-bottom)+12px)]">
      {/* la ciudad se queda detrás, oscurecida; un clic fuera del tablón vuelve */}
      <button
        type="button"
        aria-label="Cerrar las redes sociales"
        tabIndex={-1}
        onClick={onExit}
        className="fixed inset-0 cursor-default border-0 bg-ink/60 backdrop-blur-sm"
      />

      <motion.section
        aria-label="Redes sociales de Javier Aguayo"
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="relative m-auto w-[min(1120px,94vw)] overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)] compact:w-full compact:max-w-[1120px] compact:shadow-[5px_5px_0_var(--color-ink)]"
      >
        <header className="border-b-4 border-ink bg-mint px-5 py-3 compact:px-4 compact:py-2.5">
          <h2 className="m-0 font-display text-2xl uppercase leading-none tracking-wide text-ink compact:text-xl">Redes sociales</h2>
        </header>

        {/* cinco en fila en el ordenador; en el móvil, dos (vertical) o cinco más pequeñas (horizontal) */}
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:gap-5 sm:p-6 lg:grid-cols-5 lg:p-7 short:grid-cols-5 short:gap-3 short:p-4">
          {NETWORKS.map((n, i) => (
            <motion.li
              key={n.name}
              // la última, sola en su fila, se centra
              className="max-sm:last:col-span-2 max-sm:last:mx-auto max-sm:last:w-[calc(50%-8px)]"
              initial={{ y: 24, opacity: 0, rotate: 0 }}
              animate={{ y: 0, opacity: 1, rotate: [-2, 1.5, -1, 2, -1.5][i] }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.12 + i * 0.08 }}
            >
              <motion.a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${n.name}: ${n.handle} (se abre en otra pestaña)`}
                whileHover={{ y: -6, rotate: 0, scale: 1.04 }}
                whileFocus={{ y: -6, rotate: 0, scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="flex flex-col items-center gap-3 rounded-xl border-4 border-ink bg-white px-4 pt-6 pb-5 text-ink no-underline shadow-[4px_4px_0_var(--color-ink)] outline-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sky compact:gap-2 compact:px-2 compact:pt-4 compact:pb-3"
              >
                <img src={logoUrl(n.logo)} alt="" draggable={false} className="h-24 w-24 compact:h-16 compact:w-16 short:h-14 short:w-14" />
                <span className="font-display text-xl uppercase leading-none tracking-wide compact:text-lg">{n.name}</span>
                <span className="max-w-full truncate text-sm font-semibold text-ink/70 compact:text-xs">{n.handle}</span>
              </motion.a>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <ExitButton onExit={onExit} />
    </div>
  )
}
