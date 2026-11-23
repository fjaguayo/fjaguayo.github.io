import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ALBUMS, trackUrl, type Album } from '../../data/arcade'
import { playOpen } from '../../lib/ps2Sound'
import Ps2Carousel from './Ps2Carousel'
import { AlbumCover, Vinyl } from './visuals'

/**
 * Tocadiscos: primero un círculo con los grupos; al entrar en uno, sus canciones como discos
 * en otro círculo. Solo gira el disco del centro, y cada disco abre la canción en Spotify.
 */
export default function MusicMenu({ onClose }: { onClose: () => void }) {
  const [album, setAlbum] = useState<Album | null>(null)
  // al volver de un grupo, el círculo sigue con ese grupo al frente
  const [lastIndex, setLastIndex] = useState(0)

  useEffect(() => playOpen(), [])

  // Escape: del grupo al círculo de grupos; de ahí, fuera. Se captura antes que el botón de volver a la ciudad.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      if (album) setAlbum(null)
      else onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [album, onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[60]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence mode="wait">
        {album ? (
          <motion.div
            key={album.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Ps2Carousel
              round
              path={['Mi música', album.title]}
              enterLabel="Escuchar en Spotify"
              backLabel="Volver"
              onBack={() => setAlbum(null)}
              items={album.tracks.map((t, i) => ({
                key: `${i}-${t.title}`,
                title: t.title,
                subtitle: `${album.artist ?? album.title} · ${String(i + 1).padStart(2, '0')} de ${album.tracks.length}`,
                href: trackUrl(album, t),
                // solo gira el del centro; los demás se quedan quietos donde estaban
                render: (active) => <Vinyl album={album} cover={t.cover} spinning={active} />,
              }))}
            />
          </motion.div>
        ) : (
          <motion.div key="albums" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Ps2Carousel
              path={['Mi música']}
              initialIndex={lastIndex}
              enterLabel="Abrir"
              backLabel="Salir"
              onBack={onClose}
              items={ALBUMS.map((a, i) => ({
                key: a.id,
                title: a.title,
                subtitle: [a.artist, a.year, `${a.tracks.length} canciones`].filter(Boolean).join(' · '),
                onSelect: () => {
                  setLastIndex(i)
                  setAlbum(a)
                },
                render: () => <AlbumCover album={a} />,
              }))}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
