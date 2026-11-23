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
  { id: 'sala', x: 50.6, y: 93.2, width: 102.6 },
  { id: 'vinilo', x: 22.1, y: 81.6, width: 29.5 },
  { id: 'recreativa', x: 42.2, y: 63.6, width: 24.9 },
  { id: 'mesa', x: 71.9, y: 85.8, width: 44.9 },
]

/** Nombre que sale en la etiqueta al pasar el ratón. */
export const LABELS: Record<ArcadeObjectId, string> = {
  vinilo: 'Mi música',
  recreativa: 'Mis juegos',
  mesa: 'Mi campaña de DnD',
}

export const ARCADE_HIT = HIT as {
  sala: { width: number; height: number }
} & Record<ArcadeObjectId | 'corcho', { width: number; height: number; polygons: number[][][] }>

export const arcadeUrl = (file: string) => `${import.meta.env.BASE_URL}arcade/${file}.webp`

// ---------------------------------------------------------------------------
// Mesa de DnD
// ---------------------------------------------------------------------------

/** Tu página de DnD. Mientras esté vacío, la mesa avisa de que llegará pronto. */
export const DND_URL = 'https://carnedetitanes.github.io/'

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
  /** Foto del grupo para el carrusel (p. ej. 'arcade/grupos/eminem.webp'). Si falta, se usa la carátula. */
  photo?: string
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
    photo: 'arcade/grupos/the-neighbourhood.webp',
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
    photo: 'arcade/grupos/arctic-monkeys.webp',
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
    photo: 'arcade/grupos/cigarettes-after-sex.webp',
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
    id: 'imagine-dragons',
    photo: 'arcade/grupos/imagine-dragons.webp',
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

]

export const trackUrl = (album: Album, track: Track) =>
  track.spotify ?? `https://open.spotify.com/search/${encodeURIComponent(`${album.artist ?? album.title} ${track.title}`)}`

// ---------------------------------------------------------------------------
// Máquina recreativa: juegos favoritos
// ---------------------------------------------------------------------------

export interface Game {
  title: string
  /** Número de la app en Steam: sale en la URL de la tienda, store.steampowered.com/app/<número>/ */
  steamId?: number
  /** Para juegos que no están en Steam: enlace a su página. */
  url?: string
  /** Carátula propia (ruta en public/ o URL). Los de Steam la sacan solos de la tienda. */
  cover?: string
  /** Etiqueta corta opcional (plataforma, género, una frase). */
  note?: string
}

// En el mismo orden que mi lista de "Juegos que me gustan".
export const GAMES: Game[] = [
  { title: 'Ghost of Tsushima', steamId: 2215430 },
  { title: 'ARK: Survival Evolved', steamId: 346110 },
  {
    title: 'inFAMOUS Second Son',
    url: 'https://www.playstation.com/es-es/games/infamous-second-son/',
    cover: 'arcade/juegos/infamous-second-son.webp',
    note: 'PlayStation',
  },
  { title: 'Slime Rancher', steamId: 433340 },
  { title: 'No Rest for the Wicked', steamId: 1371980 },
  { title: 'For Honor', steamId: 304390 },
  { title: 'Marvel Rivals', steamId: 2767030 },
  { title: 'Barony', steamId: 371970 },
  { title: "Baldur's Gate 3", steamId: 1086940 },
  { title: 'Grounded 2', steamId: 2661300 },
  { title: 'Subnautica', steamId: 264710 },
  { title: 'Minecraft', url: 'https://www.minecraft.net/es-es', cover: 'arcade/juegos/minecraft.webp', note: 'Minecraft.net' },
]

export const gameUrl = (g: Game) => g.url ?? `https://store.steampowered.com/app/${g.steamId}/`
/** Carátula vertical de la biblioteca de Steam; si no existe, se prueba la cabecera horizontal. */
export const steamCover = (g: Game) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamId}/library_600x900.jpg`
export const steamHeader = (g: Game) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamId}/header.jpg`
