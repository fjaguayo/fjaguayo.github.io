import HIT from './arcadeHit.json'

/**
 * Salón Recreativo (Arcade): la sala, los objetos que se pueden tocar y lo que hay dentro de cada uno.
 *
 * Colocación: x, y = punto de apoyo (centro de la base de la imagen) en % del escenario;
 * width = % del ancho del escenario. Se ajusta con el editor: `npm run dev`, abrir
 * `/?arcade-edit`, entrar en el Arcade, colocar y pulsar "Copiar coordenadas".
 */

export type ArcadeObjectId = 'vinilo' | 'recreativa' | 'mesa'
export type ArcadePieceId = 'sala' | ArcadeObjectId

/** Escenario virtual (proporción del recuadro donde se dibuja la sala). */
export const STAGE = { width: 1600, height: 1000 }

export interface ArcadePlacement {
  id: ArcadePieceId
  x: number
  y: number
  width: number
  flip?: boolean
}

export const PLACEMENTS: ArcadePlacement[] = [
  { id: 'sala', x: 50, y: 67.2, width: 70.5 },
  { id: 'vinilo', x: 28.1, y: 94.4, width: 20.5 },
  { id: 'recreativa', x: 61.8, y: 93.6, width: 17.3 },
  { id: 'mesa', x: 82.6, y: 85.2, width: 31.2 },
]

/** Nombre que sale en la etiqueta al pasar el ratón. */
export const LABELS: Record<ArcadeObjectId, string> = {
  vinilo: 'Mi música',
  recreativa: 'Mis juegos',
  mesa: 'Mi mesa de DnD',
}

export const ARCADE_HIT = HIT as {
  sala: { width: number; height: number }
} & Record<ArcadeObjectId | 'corcho', { width: number; height: number; polygons: number[][][] }>

export const arcadeUrl = (file: string) => `${import.meta.env.BASE_URL}arcade/${file}.webp`

// ---------------------------------------------------------------------------
// Mesa de DnD
// ---------------------------------------------------------------------------

/** Tu página de DnD. Mientras esté vacío, la mesa avisa de que llegará pronto. */
export const DND_URL = ''

// ---------------------------------------------------------------------------
// Tocadiscos: álbumes favoritos
// ---------------------------------------------------------------------------

export interface Track {
  title: string
  /** Enlace a la canción en Spotify. Si falta, se abre la búsqueda de Spotify con artista + título. */
  spotify?: string
}

export interface Album {
  id: string
  title: string
  artist: string
  year?: number
  /** Carátula: ruta en public/ (p. ej. 'arcade/albumes/x.webp') o URL. Si falta, se dibuja una funda con el título. */
  cover?: string
  /** Enlace al álbum en Spotify (se usa si una canción no tiene el suyo). */
  spotify?: string
  /** Color de la funda dibujada y del brillo del disco. */
  color: string
  tracks: Track[]
}

// EJEMPLO: sustitúyelo por tus álbumes favoritos antes de publicar.
export const ALBUMS: Album[] = [
  {
    id: 'random-access-memories',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    year: 2013,
    color: '#c9a45c',
    tracks: [{ title: 'Give Life Back to Music' }, { title: 'Instant Crush' }, { title: 'Get Lucky' }, { title: 'Doin’ It Right' }],
  },
  {
    id: 'currents',
    title: 'Currents',
    artist: 'Tame Impala',
    year: 2015,
    color: '#b8325a',
    tracks: [{ title: 'Let It Happen' }, { title: 'The Less I Know the Better' }, { title: 'Eventually' }],
  },
  {
    id: 'am',
    title: 'AM',
    artist: 'Arctic Monkeys',
    year: 2013,
    color: '#2b2b2b',
    tracks: [{ title: 'Do I Wanna Know?' }, { title: 'R U Mine?' }, { title: 'Arabella' }, { title: '505' }],
  },
  {
    id: 'discovery',
    title: 'Discovery',
    artist: 'Daft Punk',
    year: 2001,
    color: '#4d9de0',
    tracks: [{ title: 'One More Time' }, { title: 'Digital Love' }, { title: 'Harder, Better, Faster, Stronger' }],
  },
  {
    id: 'plastic-beach',
    title: 'Plastic Beach',
    artist: 'Gorillaz',
    year: 2010,
    color: '#3bceac',
    tracks: [{ title: 'Stylo' }, { title: 'On Melancholy Hill' }, { title: 'Rhinestone Eyes' }],
  },
  {
    id: 'nevermind',
    title: 'Nevermind',
    artist: 'Nirvana',
    year: 1991,
    color: '#1f6fb2',
    tracks: [{ title: 'Smells Like Teen Spirit' }, { title: 'Come as You Are' }, { title: 'Lithium' }],
  },
]

export const trackUrl = (album: Album, track: Track) =>
  track.spotify ?? `https://open.spotify.com/search/${encodeURIComponent(`${album.artist} ${track.title}`)}`

// ---------------------------------------------------------------------------
// Máquina recreativa: juegos favoritos
// ---------------------------------------------------------------------------

export interface Game {
  title: string
  /** Número de la app en Steam: sale en la URL de la tienda, store.steampowered.com/app/<número>/ */
  steamId: number
  /** Etiqueta corta opcional (género, horas, una frase). */
  note?: string
}

// EJEMPLO: sustitúyelo por tus juegos favoritos antes de publicar.
export const GAMES: Game[] = [
  { title: 'Hollow Knight', steamId: 367520 },
  { title: 'Hades', steamId: 1145360 },
  { title: 'Stardew Valley', steamId: 413150 },
  { title: 'Celeste', steamId: 504230 },
  { title: 'Terraria', steamId: 105600 },
  { title: "Baldur's Gate 3", steamId: 1086940 },
]

export const steamUrl = (g: Game) => `https://store.steampowered.com/app/${g.steamId}/`
/** Carátula vertical de la biblioteca de Steam; si no existe, se prueba la cabecera horizontal. */
export const steamCover = (g: Game) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamId}/library_600x900.jpg`
export const steamHeader = (g: Game) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamId}/header.jpg`
