import { useState } from 'react'
import { steamCover, steamHeader, type Album, type Game } from '../../data/arcade'

const resolve = (src: string) => (/^https?:\/\//.test(src) ? src : `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`)

/** Funda dibujada cuando no hay carátula: color del álbum, surcos marcados y el título. */
export function Sleeve({ title, subtitle, color, disc = true }: { title: string; subtitle?: string; color: string; disc?: boolean }) {
  return (
    <div
      className="absolute inset-0 flex flex-col justify-end overflow-hidden rounded-[6px] p-[9%] [container-type:inline-size]"
      style={{
        background: `radial-gradient(circle at 70% 28%, rgba(255,255,255,0.22), transparent 42%), linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 45%, #05060f))`,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18), 0 10px 28px rgba(0,0,0,0.55)',
      }}
    >
      {/* un disco asomando, para que se lea como funda de vinilo */}
      {disc && (
        <div
          className="absolute top-[12%] right-[-28%] aspect-square w-[78%] rounded-full opacity-35"
          style={{ background: 'repeating-radial-gradient(circle, #000 0 1.2px, #1a1a1a 1.2px 2.6px)' }}
        />
      )}
      <span
        className="relative font-display text-[13cqw] leading-[0.95] tracking-wide text-white uppercase"
        style={{ textShadow: '0 2px 0 rgba(0,0,0,0.45)' }}
      >
        {title}
      </span>
      {subtitle && <span className="relative mt-[4%] text-[8cqw] font-semibold tracking-wide text-white/80">{subtitle}</span>}
    </div>
  )
}

/** Carátula de un álbum: la imagen si la hay; si no, o si falla, la funda dibujada. */
export function AlbumCover({ album }: { album: Album }) {
  const [failed, setFailed] = useState(false)
  if (!album.cover || failed) return <Sleeve title={album.title} subtitle={album.artist} color={album.color} />
  return (
    <img
      src={resolve(album.cover)}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full rounded-[6px] object-cover"
      style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18), 0 10px 28px rgba(0,0,0,0.55)' }}
    />
  )
}

/** Disco de vinilo girando, con la carátula del álbum como galleta central. */
export function Vinyl({ album, cover }: { album: Album; cover?: string }) {
  const [failed, setFailed] = useState(false)
  const label = cover ?? album.cover
  const showCover = label && !failed
  return (
    <div className="absolute inset-0">
      {/* resplandor del color del álbum detrás del disco */}
      <div className="absolute inset-[6%] rounded-full blur-xl" style={{ background: album.color, opacity: 0.35 }} />
      <div
        className="absolute inset-0 rounded-full motion-safe:animate-[record-spin_1.8s_linear_infinite] motion-reduce:animate-[record-spin_12s_linear_infinite]"
        style={{
          background:
            'radial-gradient(circle, transparent 0 31%, rgba(255,255,255,0.05) 31.5%, transparent 33%), repeating-radial-gradient(circle, #0c0c0e 0 1.1px, #1b1b1f 1.1px 2.4px)',
          boxShadow: '0 0 0 2px #050505, 0 12px 30px rgba(0,0,0,0.65)',
        }}
      >
        {/* galleta: carátula o color */}
        <div
          className="absolute inset-[32%] overflow-hidden rounded-full"
          style={{ background: album.color, boxShadow: '0 0 0 2px rgba(0,0,0,0.6)' }}
        >
          {showCover ? (
            <img src={resolve(label!)} alt="" draggable={false} onError={() => setFailed(true)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-start justify-center pt-[18%] text-[0px]">
              <span className="block h-[10%] w-[60%] rounded-full bg-white/50" />
            </div>
          )}
        </div>
        {/* agujero central */}
        <div className="absolute top-1/2 left-1/2 h-[4%] w-[4%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#02040c]" />
      </div>
      {/* brillo fijo: no gira, así se nota que el disco sí */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 30deg, transparent 0deg, rgba(255,255,255,0.16) 25deg, transparent 60deg, transparent 180deg, rgba(255,255,255,0.12) 205deg, transparent 240deg)',
          maskImage: 'radial-gradient(circle, transparent 0 32%, #000 33%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 0 32%, #000 33%)',
        }}
      />
    </div>
  )
}

/** Caja de un juego: carátula vertical de Steam; si no existe, la cabecera; si tampoco, una caja dibujada. */
export function GameCover({ game }: { game: Game }) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const shell = 'absolute inset-0 overflow-hidden rounded-[6px]'
  const shadow = { boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18), 0 10px 28px rgba(0,0,0,0.6)' }

  if (step === 2) return <Sleeve title={game.title} subtitle={game.note} color="#2b3a67" disc={false} />
  return (
    <div className={`${shell} bg-[#0b1020]`} style={shadow}>
      {step === 0 ? (
        <img src={steamCover(game)} alt="" draggable={false} onError={() => setStep(1)} className="h-full w-full object-cover" />
      ) : (
        <>
          <img
            src={steamHeader(game)}
            alt=""
            draggable={false}
            onError={() => setStep(2)}
            className="absolute inset-0 h-full w-full scale-150 object-cover opacity-40 blur-md"
          />
          <img src={steamHeader(game)} alt="" draggable={false} className="absolute top-1/2 left-0 w-full -translate-y-1/2" />
        </>
      )}
      {/* lomo de la caja */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-white/25 to-transparent" />
    </div>
  )
}
