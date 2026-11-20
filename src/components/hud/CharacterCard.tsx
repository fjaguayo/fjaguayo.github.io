import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Globe2, Wrench } from 'lucide-react'
import { asset } from '../../lib/color'

// TODO: rellenar con datos reales
const PLAYER = {
  tag: 'FJAH',
  fullName: 'Javier Aguayo',
  role: 'Ing. Electrónica Industrial',
  level: '??' as string | number, // tu edad
  countries: 13,
  projects: 5,
  cv: 'cv.pdf',
}

export default function CharacterCard() {
  const [noAvatar, setNoAvatar] = useState(false)

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
      className="comic-panel pointer-events-auto flex w-[min(330px,calc(100vw-24px))] items-stretch gap-3 p-3"
    >
      <div className="relative shrink-0">
        <div className="grid h-[84px] w-[84px] place-items-center overflow-hidden rounded-2xl border-4 border-ink bg-sky halftone">
          {noAvatar ? (
            <span className="font-display text-3xl text-paper outline-text">FJ</span>
          ) : (
            <img src={asset('avatar.png')} alt="Avatar de Javier" className="h-full w-full object-cover" onError={() => setNoAvatar(true)} />
          )}
        </div>
        <span className="absolute -bottom-2 -right-2 rounded-lg border-[3px] border-ink bg-sun px-1.5 font-display text-sm leading-6 shadow-comic">
          Nv. {PLAYER.level}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="font-display text-2xl leading-none tracking-wide">{PLAYER.tag}</p>
          <p className="truncate text-sm font-semibold leading-tight">{PLAYER.fullName}</p>
          <p className="truncate text-xs font-medium opacity-70">{PLAYER.role}</p>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Stat icon={<Globe2 size={16} strokeWidth={2.75} />} value={PLAYER.countries} label="países" color="bg-mint" />
          <Stat icon={<Wrench size={16} strokeWidth={2.75} />} value={PLAYER.projects} label="proyectos" color="bg-tangerine" />
          <a
            href={asset(PLAYER.cv)}
            download
            className="comic-btn ml-auto flex items-center gap-1 bg-tomato px-2 py-1 font-display text-sm text-paper"
            title="Descargar CV en PDF"
          >
            <Download size={16} strokeWidth={3} /> CV
          </a>
        </div>
      </div>
    </motion.aside>
  )
}

function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <span className={`flex items-center gap-1 rounded-lg border-[3px] border-ink ${color} px-1.5 py-0.5 text-sm font-bold`} title={`${value} ${label}`}>
      {icon}
      {value}
    </span>
  )
}
