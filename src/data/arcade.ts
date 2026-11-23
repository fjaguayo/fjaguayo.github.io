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
// Tocadiscos: mis grupos favoritos y sus canciones
// ---------------------------------------------------------------------------

export interface Track {
  title: string
  /** Enlace a la canción en Spotify. Si falta, se abre la búsqueda de Spotify con grupo + título. */
  spotify?: string
  /** Carátula del disco de esta canción (la galleta del vinilo). Si falta, la del grupo. */
  cover?: string
}

export interface Album {
  id: string
  /** Nombre del grupo o del álbum. */
  title: string
  /** Artista, si la carpeta es un álbum y no un grupo. */
  artist?: string
  year?: number
  /** Carátula: ruta en public/ (p. ej. 'arcade/albumes/x.webp') o URL. Si falta, se dibuja una funda con el título. */
  cover?: string
  /** Enlace en Spotify (se usa si una canción no tiene el suyo). */
  spotify?: string
  /** Color de la funda dibujada y del brillo del disco. */
  color: string
  tracks: Track[]
}

/** Enlace a una canción de Spotify a partir de su id (lo que va tras /track/ en el enlace de compartir). */
const tr = (id: string) => `https://open.spotify.com/track/${id}`
/** Carátula de Spotify (640 px) a partir del final del enlace de la imagen. */
const sp = (hash: string) => `https://i.scdn.co/image/ab67616d0000b273${hash}`

export const ALBUMS: Album[] = [
  {
    id: 'the-neighbourhood',
    title: 'The Neighbourhood',
    cover: sp('c91ed3bc3c8d484f532fab2f'),
    color: '#8a8f99',
    tracks: [
      { title: 'A Little Death', spotify: tr('0pxPNTroZcxXA0w6IDgMQJ'), cover: sp('354be6d543058b65075b9d16') },
      { title: 'Sweater Weather', spotify: tr('0cQVqPuHQP4KEwc7ZUQmj6'), cover: sp('c91ed3bc3c8d484f532fab2f') },
      { title: 'Reflections', spotify: tr('2xql0pid3EUwW38AsywxhV'), cover: sp('9b6ac98a52f62d5cb473da40') },
      { title: 'Leaving Tonight', spotify: tr('6C0T7QMpmeDoDkke32Ctqb'), cover: sp('7177fb5667cdafd34b871257') },
      { title: 'Afraid', spotify: tr('7brQHA2CgQpcMBiOlfiXYb'), cover: sp('8265a736a1eb838ad5a0b921') },
      { title: 'Let It Go', spotify: tr('6cWpj6c5pNZYEk5KYjNBji'), cover: sp('8265a736a1eb838ad5a0b921') },
      { title: 'Alleyways', spotify: tr('4V37tyDu9CtqYshvrgLke4'), cover: sp('8265a736a1eb838ad5a0b921') },
    ],
  },
  {
    id: 'arctic-monkeys',
    title: 'Arctic Monkeys',
    cover: sp('4ae1c4c5c45aabe565499163'),
    color: '#c9c9c9',
    tracks: [
      { title: '505', spotify: tr('0BxE4FqsDD1Ot4YuBXwAPp'), cover: sp('b1f8da74f225fa1225cdface') },
      { title: 'I Wanna Be Yours', spotify: tr('5XeFesFbtLpXzIVDNQP22n'), cover: sp('4ae1c4c5c45aabe565499163') },
      { title: 'Knee Socks', spotify: tr('2LGdO5MtFdyphi2EihANZG'), cover: sp('4ae1c4c5c45aabe565499163') },
      { title: 'R U Mine?', spotify: tr('2AT8iROs4FQueDv2c8q2KE'), cover: sp('4ae1c4c5c45aabe565499163') },
      { title: 'Do I Wanna Know?', spotify: tr('5FVd6KXrgO9B3JPmC8OPst'), cover: sp('4ae1c4c5c45aabe565499163') },
      { title: "Why'd You Only Call Me When You're High?", spotify: tr('086myS9r57YsLbJpU0TgK9'), cover: sp('4ae1c4c5c45aabe565499163') },
      { title: 'No. 1 Party Anthem', spotify: tr('5TTGoX70AFrTvuEtqHK37S'), cover: sp('4ae1c4c5c45aabe565499163') },
    ],
  },
  {
    id: 'cigarettes-after-sex',
    title: 'Cigarettes After Sex',
    cover: sp('12b69bf576f5e80291f75161'),
    color: '#9a9a9a',
    tracks: [
      { title: 'K.', spotify: tr('1FWsomP9StpCcXNWmJk8Cl'), cover: sp('12b69bf576f5e80291f75161') },
      { title: 'Sunsetz', spotify: tr('0SpkyS1Q4MD8GaVcP5YjT4'), cover: sp('12b69bf576f5e80291f75161') },
      { title: 'Apocalypse', spotify: tr('0yc6Gst2xkRu0eMLeRMGCX') },
      { title: 'Sweet', spotify: tr('6ilc4vQcwMPlvAHFfsTGng') },
      { title: 'Sesame Syrup', spotify: tr('53k1gKFpKrDbktUzrB80f0') },
      { title: 'Cry', spotify: tr('3p4hRhMcb6ch8OLtATMaLw') },
    ],
  },
  {
    id: 'eminem',
    title: 'Eminem',
    cover: sp('6ca5c90113b30c3c43ffb8f4'),
    color: '#d6a04a',
    tracks: [
      { title: 'Without Me', spotify: tr('7lQ8MOhq6IN2w8EYcFNSUk'), cover: sp('6ca5c90113b30c3c43ffb8f4') },
      { title: 'Superman', spotify: tr('4woTEX1wYOTGDqNXuavlRC') },
      { title: "'Till I Collapse", spotify: tr('4xkOaSrkexMciUUogZKVTS') },
      { title: 'Mockingbird', spotify: tr('561jH07mF1jHuk7KlaeF0s') },
      { title: 'The Real Slim Shady', spotify: tr('3yfqSUWxFvZELEM4PmlwIR') },
      { title: 'Godzilla', spotify: tr('7FIWs0pqAYbP91WWM0vlTQ') },
      { title: 'My Name Is', spotify: tr('75IN3CtuZwTHTnZvYM4qnJ') },
    ],
  },
  {
    id: 'imagine-dragons',
    title: 'Imagine Dragons',
    cover: sp('5675e83f707f1d7271e5cf8a'),
    color: '#4d9de0',
    tracks: [
      { title: 'Bones', spotify: tr('0HqZX76SFLDz2aW8aiqi7G') },
      { title: 'Demons', spotify: tr('5qaEfEh1AtSdrdrByCP7qR') },
      { title: 'Believer', spotify: tr('0pqnGHJpmpxLKifKRmU6WP'), cover: sp('5675e83f707f1d7271e5cf8a') },
      { title: 'Walking the Wire', spotify: tr('1y3bE5i57eUm3hfLAc7h08') },
      { title: 'Dull Knives', spotify: tr('3vThV17aiX6dGokusu6j8N') },
      { title: 'Natural', spotify: tr('2FY7b99s15jUprqC0M5NCT') },
      { title: 'Roots', spotify: tr('4GITtbZtRCQXhWLMXrWXHt') },
      { title: 'Wrecked', spotify: tr('2d1MywHy6FwKdzxFuSJnwl') },
    ],
  },
  {
    id: 'los-diozes',
    title: 'Los Diozes',
    cover: sp('9583673af04af6d27def8a9c'),
    color: '#ee4266',
    tracks: [
      { title: 'LOS DIOZES SON', spotify: tr('55nwmdewvMJQtYzdpO8kQp'), cover: sp('9583673af04af6d27def8a9c') },
      { title: 'KIEN E', spotify: tr('3Gr9GO7T0zWvUxam292xWb') },
      { title: 'PAYAS', spotify: tr('3472HK3lBvAPE6pQw6iCeX') },
      { title: 'CHEKI', spotify: tr('5d7AXylq0DJxs5T3RGhn9v') },
      { title: 'DIABLA', spotify: tr('1ClllOVu94nr1s1c2C7cvK') },
      { title: 'TOP ERDIO', spotify: tr('4bVepteBdttocPtvdUbU80') },
      { title: 'TU KIERE', spotify: tr('3XZ5yzEqFrvbezxOVSK20v') },
    ],
  },
]

export const trackUrl = (album: Album, track: Track) =>
  track.spotify ?? `https://open.spotify.com/search/${encodeURIComponent(`${album.artist ?? album.title} ${track.title}`)}`

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
