/**
 * Países visitados, para el globo del Aeropuerto.
 * `id` es el código ISO numérico que usa world-atlas (sirve para pintar el país en el mapa).
 * `lat`/`lon` es donde se clava la chincheta.
 */
export interface Country {
  name: string
  nameEn: string
  id: string
  lat: number
  lon: number
}

export const VISITED: Country[] = [
  { name: 'España', nameEn: 'Spain', id: '724', lat: 40.2, lon: -3.7 },
  { name: 'Portugal', nameEn: 'Portugal', id: '620', lat: 39.6, lon: -8.1 },
  { name: 'Andorra', nameEn: 'Andorra', id: '020', lat: 42.55, lon: 1.58 },
  { name: 'Francia', nameEn: 'France', id: '250', lat: 46.6, lon: 2.4 },
  { name: 'Bélgica', nameEn: 'Belgium', id: '056', lat: 50.6, lon: 4.6 },
  { name: 'Inglaterra', nameEn: 'England', id: '826', lat: 52.4, lon: -1.5 },
  { name: 'Italia', nameEn: 'Italy', id: '380', lat: 42.8, lon: 12.6 },
  { name: 'Montenegro', nameEn: 'Montenegro', id: '499', lat: 42.75, lon: 19.3 },
  { name: 'Grecia', nameEn: 'Greece', id: '300', lat: 39.2, lon: 22.0 },
  { name: 'Turquía', nameEn: 'Türkiye', id: '792', lat: 39.0, lon: 35.2 },
  { name: 'Cabo Verde', nameEn: 'Cape Verde', id: '132', lat: 15.1, lon: -23.6 },
  { name: 'República Dominicana', nameEn: 'Dominican Republic', id: '214', lat: 18.8, lon: -70.3 },
  { name: 'Mauricio', nameEn: 'Mauritius', id: '480', lat: -20.3, lon: 57.55 },
  { name: 'Maldivas', nameEn: 'Maldives', id: '462', lat: 3.2, lon: 73.2 },
]
