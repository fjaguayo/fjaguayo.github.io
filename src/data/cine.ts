/**
 * Catálogo del Cine (FJAHFLIX).
 *
 * Para añadir un título:
 *   1. Busca la ficha en IMDb y copia el id de la URL: imdb.com/title/tt0903747/ -> 'tt0903747'.
 *   2. Carátula (opcional): guarda la imagen como public/cine/<imdbId>.webp (unos 360 px de ancho)
 *      y pon su nombre en `poster`. También vale una URL completa (https://...).
 *      Si no hay carátula, se dibuja una tarjeta con el título.
 *   3. `tag` (opcional) es una etiqueta corta que sale junto al año, como el estudio.
 */

export type CategoryId = 'series' | 'peliculas' | 'peliculas_animadas' | 'series_animadas' | 'anime'

export interface Title {
  title: string
  year: string
  /** Id de IMDb, p. ej. 'tt0903747'. El enlace se monta solo. */
  imdbId: string
  /** Archivo dentro de public/cine/ o URL completa. Opcional. */
  poster?: string
  /** Etiqueta corta junto al año (p. ej. el estudio). Opcional. */
  tag?: string
}

export interface Category {
  id: CategoryId
  label: string
  items: Title[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'series',
    label: 'Series',
    items: [
      { title: 'House', year: '2004', imdbId: 'tt0412142', poster: 'tt0412142.webp' },
      { title: 'El mentalista', year: '2008', imdbId: 'tt1196946', poster: 'tt1196946.webp' },
      { title: 'Shameless', year: '2011', imdbId: 'tt1586680', poster: 'tt1586680.webp' },
      { title: 'The Big Bang Theory', year: '2007', imdbId: 'tt0898266', poster: 'tt0898266.webp' },
      { title: 'Grimm', year: '2011', imdbId: 'tt1830617', poster: 'tt1830617.webp' },
    ],
  },
  {
    id: 'peliculas',
    label: 'Películas',
    items: [
      { title: 'Nadie', year: '2021', imdbId: 'tt7888964', poster: 'tt7888964.webp' },
      { title: 'Talk to Me', year: '2022', imdbId: 'tt10638522', poster: 'tt10638522.webp' },
      { title: 'Babylon', year: '2022', imdbId: 'tt10640346', poster: 'tt10640346.webp' },
      { title: 'El gran showman', year: '2017', imdbId: 'tt1485796', poster: 'tt1485796.webp' },
      { title: 'La odisea', year: '2026', imdbId: 'tt33764258', poster: 'tt33764258.webp' },
    ],
  },
  {
    id: 'peliculas_animadas',
    label: 'Películas animadas',
    items: [
      { title: 'WALL·E', year: '2008', imdbId: 'tt0910970', poster: 'tt0910970.webp', tag: 'Pixar' },
      { title: 'Vaiana', year: '2016', imdbId: 'tt3521164', poster: 'tt3521164.webp', tag: 'Disney' },
      { title: 'Rango', year: '2011', imdbId: 'tt1192628', poster: 'tt1192628.webp', tag: 'Paramount' },
      {
        title: 'Monstruos contra alienígenas',
        year: '2009',
        imdbId: 'tt0892782',
        poster: 'tt0892782.webp',
        tag: 'DreamWorks',
      },
      { title: 'Monster House', year: '2006', imdbId: 'tt0385880', poster: 'tt0385880.webp', tag: 'Sony' },
    ],
  },
  {
    id: 'series_animadas',
    label: 'Series animadas',
    items: [
      { title: 'Las Tortugas Ninja', year: '2012', imdbId: 'tt1877889', poster: 'tt1877889.webp' },
      { title: 'El asombroso mundo de Gumball', year: '2011', imdbId: 'tt1942683', poster: 'tt1942683.webp' },
      { title: 'Ben 10', year: '2005', imdbId: 'tt0760437', poster: 'tt0760437.webp' },
      { title: 'Los pingüinos de Madagascar', year: '2008', imdbId: 'tt0892700', poster: 'tt0892700.webp' },
      { title: 'Primal', year: '2019', imdbId: 'tt10332508' },
      { title: 'Avatar: La leyenda de Aang', year: '2005', imdbId: 'tt0417299', poster: 'tt0417299.webp' },
    ],
  },
  {
    id: 'anime',
    label: 'Anime',
    items: [
      { title: 'Vinland Saga', year: '2019', imdbId: 'tt10233448', poster: 'tt10233448.webp' },
      { title: 'Tensei Shitara Slime Datta Ken', year: '2018', imdbId: 'tt9054364', poster: 'tt9054364.webp' },
      { title: 'Shangri-La Frontier', year: '2023', imdbId: 'tt28776190', poster: 'tt28776190.webp' },
      { title: 'One Piece', year: '1999', imdbId: 'tt0388629' },
      { title: 'Black Clover', year: '2017', imdbId: 'tt7441658', poster: 'tt7441658.webp' },
      { title: 'Spy x Family', year: '2022', imdbId: 'tt13706018', poster: 'tt13706018.webp' },
    ],
  },
]

export const imdbUrl = (id: string) => `https://www.imdb.com/title/${id}/`

export const posterUrl = (poster: string) =>
  /^https?:\/\//.test(poster) ? poster : `${import.meta.env.BASE_URL}cine/${poster}`
