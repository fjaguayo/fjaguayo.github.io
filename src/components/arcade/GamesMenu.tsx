import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GAMES, gameUrl } from '../../data/arcade'
import { playOpen } from '../../lib/ps2Sound'
import Ps2Carousel from './Ps2Carousel'
import { GameCover } from './visuals'

/** Máquina recreativa: mis juegos favoritos en un círculo. El del centro abre su página (Steam o la oficial). */
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
      <Ps2Carousel
        path={['Mis juegos']}
        enterLabel="Ver el juego"
        backLabel="Salir"
        onBack={onClose}
        items={GAMES.map((g) => ({
          key: g.title,
          title: g.title,
          subtitle: g.note ?? (g.steamId ? 'Steam' : undefined),
          href: gameUrl(g),
          render: () => <GameCover game={g} />,
        }))}
      />
    </motion.div>
  )
}
