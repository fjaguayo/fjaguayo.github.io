import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GAMES, steamUrl } from '../../data/arcade'
import { playOpen } from '../../lib/ps2Sound'
import Ps2Menu from './Ps2Menu'
import { GameCover } from './visuals'

/** Máquina recreativa: las cajas de mis juegos favoritos. Cada una abre su página de Steam. */
export default function GamesMenu({ onClose }: { onClose: () => void }) {
  useEffect(() => playOpen(), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[60]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Ps2Menu
        viewKey="games"
        path={['Mis juegos']}
        shape="tall"
        enterLabel="Ver en Steam"
        backLabel="Salir"
        onBack={onClose}
        items={GAMES.map((g) => ({
          key: String(g.steamId),
          title: g.title,
          subtitle: g.note ?? 'Steam',
          href: steamUrl(g),
          visual: <GameCover game={g} />,
        }))}
      />
    </motion.div>
  )
}
