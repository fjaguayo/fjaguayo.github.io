import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ALBUMS, trackUrl, type Album } from '../../data/arcade'
import { playOpen } from '../../lib/ps2Sound'
import Ps2Carousel from './Ps2Carousel'
import { AlbumCover, Vinyl } from './visuals'
import { useLang } from '../../lib/i18n'

/**
 * Tocadiscos: primero un círculo con los grupos; al entrar en uno, sus canciones como discos
 * en otro círculo. Solo gira el disco del centro, y cada disco abre la canción en Spotify.
 */
export default function MusicMenu({ onClose }: { onClose: () => void }) {
  const [album, setAlbum] = useState<Album | null>(null)
  // al volver de un grupo, el círculo sigue con ese grupo al frente
  const [lastIndex, setLastIndex] = useState(0)
  const { t } = useLang()
  const root = t('Mi música', 'My music')

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
              path={[root, album.title]}
              enterLabel={t('Escuchar en Spotify', 'Listen on Spotify')}
              backLabel={t('Volver', 'Back')}
              onBack={() => setAlbum(null)}
              items={album.tracks.map((track, i) => ({
                key: `${i}-${track.title}`,
                title: track.title,
                subtitle: `${album.artist ?? album.title} · ${String(i + 1).padStart(2, '0')} ${t('de', 'of')} ${album.tracks.length}`,
                href: trackUrl(album, track),
                // solo gira el del centro; los demás se quedan quietos donde estaban
                render: (active) => <Vinyl album={album} cover={track.cover} spinning={active} />,
              }))}
            />
          </motion.div>
        ) : (
          <motion.div key="albums" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Ps2Carousel
              path={[root]}
              initialIndex={lastIndex}
              enterLabel={t('Abrir', 'Open')}
              backLabel={t('Salir', 'Exit')}
              onBack={onClose}
              items={ALBUMS.map((a, i) => ({
                key: a.id,
                title: a.title,
                subtitle: [a.artist, a.year, t(`${a.tracks.length} canciones`, `${a.tracks.length} songs`)].filter(Boolean).join(' · '),
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
