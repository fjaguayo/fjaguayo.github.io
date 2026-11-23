import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ALBUMS, trackUrl, type Album } from '../../data/arcade'
import { playOpen } from '../../lib/ps2Sound'
import Ps2Menu from './Ps2Menu'
import { AlbumCover, Vinyl } from './visuals'

/**
 * Tocadiscos: primero las carátulas de los álbumes; al entrar en uno, sus canciones
 * como discos girando. Cada disco abre la canción en Spotify.
 */
export default function MusicMenu({ onClose }: { onClose: () => void }) {
  const [album, setAlbum] = useState<Album | null>(null)

  useEffect(() => playOpen(), [])

  // Escape: del álbum a la lista; de la lista, fuera. Se captura antes que el botón de volver a la ciudad.
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
            <Ps2Menu
              viewKey={album.id}
              path={['Mi música', album.title]}
              shape="square"
              enterLabel="Escuchar en Spotify"
              backLabel="Volver"
              onBack={() => setAlbum(null)}
              items={album.tracks.map((t, i) => ({
                key: `${i}-${t.title}`,
                title: t.title,
                subtitle: `${album.artist ?? album.title} · ${String(i + 1).padStart(2, '0')}`,
                href: trackUrl(album, t),
                visual: <Vinyl album={album} cover={t.cover} />,
              }))}
            />
          </motion.div>
        ) : (
          <motion.div key="albums" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Ps2Menu
              viewKey="albums"
              path={['Mi música']}
              shape="square"
              enterLabel="Abrir"
              backLabel="Salir"
              onBack={onClose}
              items={ALBUMS.map((a) => ({
                key: a.id,
                title: a.title,
                subtitle: [a.artist, a.year, `${a.tracks.length} canciones`].filter(Boolean).join(' · '),
                onSelect: () => setAlbum(a),
                visual: <AlbumCover album={a} />,
              }))}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
