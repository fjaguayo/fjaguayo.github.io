/**
 * Catálogo del Cine (FJAHFLIX).
 *
 * Para añadir un título:
 *   1. Busca la ficha en IMDb y copia el id de la URL: imdb.com/title/tt0903747/ -> 'tt0903747'.
 *   2. Carátula (opcional): guarda la imagen como public/cine/<imdbId>.webp (o .jpg)
 *      y pon su nombre en `poster`. También vale una URL completa (https://...).
 *      Si no hay carátula, se dibuja una tarjeta con el título.
 *
 * Los títulos de abajo son de ejemplo: sustitúyelos por los tuyos.
 */

export type CategoryId = 'series' | 'peliculas' | 'peliculas_animadas' | 'series_animadas'

export interface Title {
  title: string
  year: string
  /** Id de IMDb, p. ej. 'tt0903747'. El enlace se monta solo. */
  imdbId: string
  /** Archivo dentro de public/cine/ o URL completa. Opcional. */
  poster?: string
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
      { title: 'Breaking Bad', year: '2008', imdbId: 'tt0903747' },
      { title: 'Juego de Tronos', year: '2011', imdbId: 'tt0944947' },
      { title: 'Stranger Things', year: '2016', imdbId: 'tt4574334' },
      { title: 'Dark', year: '2017', imdbId: 'tt5753856' },
      { title: 'The Office', year: '2005', imdbId: 'tt0386676' },
      { title: 'Peaky Blinders', year: '2013', imdbId: 'tt2442560' },
      { title: 'Chernobyl', year: '2019', imdbId: 'tt7366338' },
    ],
  },
  {
    id: 'peliculas',
    label: 'Películas',
    items: [
      { title: 'Interstellar', year: '2014', imdbId: 'tt0816692' },
      { title: 'Origen', year: '2010', imdbId: 'tt1375666' },
      { title: 'El caballero oscuro', year: '2008', imdbId: 'tt0468569' },
      { title: 'Matrix', year: '1999', imdbId: 'tt0133093' },
      { title: 'Pulp Fiction', year: '1994', imdbId: 'tt0110912' },
      { title: 'Gladiator', year: '2000', imdbId: 'tt0172495' },
      { title: 'Regreso al futuro', year: '1985', imdbId: 'tt0088763' },
    ],
  },
  {
    id: 'peliculas_animadas',
    label: 'Películas animadas',
    items: [
      { title: 'El viaje de Chihiro', year: '2001', imdbId: 'tt0245429' },
      { title: 'Spider-Man: Un nuevo universo', year: '2018', imdbId: 'tt4633694' },
      { title: 'Toy Story', year: '1995', imdbId: 'tt0114709' },
      { title: 'Up', year: '2009', imdbId: 'tt1049413' },
      { title: 'Coco', year: '2017', imdbId: 'tt2380307' },
      { title: 'WALL·E', year: '2008', imdbId: 'tt0910970' },
      { title: 'El rey león', year: '1994', imdbId: 'tt0110357' },
    ],
  },
  {
    id: 'series_animadas',
    label: 'Series animadas',
    items: [
      { title: 'Avatar: La leyenda de Aang', year: '2005', imdbId: 'tt0417299' },
      { title: 'Arcane', year: '2021', imdbId: 'tt11126994' },
      { title: 'Rick y Morty', year: '2013', imdbId: 'tt2861424' },
      { title: 'Ataque a los titanes', year: '2013', imdbId: 'tt2560140' },
      { title: 'BoJack Horseman', year: '2014', imdbId: 'tt3398228' },
      { title: 'Los Simpson', year: '1989', imdbId: 'tt0096697' },
    ],
  },
]

export const imdbUrl = (id: string) => `https://www.imdb.com/title/${id}/`

export const posterUrl = (poster: string) =>
  /^https?:\/\//.test(poster) ? poster : `${import.meta.env.BASE_URL}cine/${poster}`
