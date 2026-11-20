// Fuente única de verdad para los 12 elementos del mapa.
// x / y: posición del PIE del edificio (centro de la base) en % del mapa base.
// width: ancho del asset en % del ancho del mapa.
// Cuando tengamos mapa_base.png solo hay que retocar x, y y width para encajarlos en sus parcelas.

export type District = 'profesional' | 'social' | 'ocio' | 'navegacion'

export interface BuildingDef {
  id: string
  name: string // lo que se lee en el cartel del HUD
  section: string // subtítulo del cartel
  file: string // PNG dentro de public/assets
  x: number
  y: number
  width: number
  color: string // color de acento de su Sub-UI (y del placeholder)
  district: District
  interior: string // nombre de la sala interior
  planned: string[] // contenido previsto para la Sub-UI
}

export const buildings: BuildingDef[] = [
  {
    id: 'universidad',
    name: 'Universidad',
    section: 'Formación y CV',
    file: 'universidad.png',
    x: 30,
    y: 34,
    width: 11,
    color: '#c8553d',
    district: 'profesional',
    interior: 'Despacho · Aula Magna',
    planned: [
      'Estantería con títulos y diplomas clicables',
      'Pizarra de skills con barras de nivel estilo RPG',
      'Proyectos universitarios destacados',
      'Archivador con descarga del CV en PDF',
    ],
  },
  {
    id: 'empresa',
    name: 'La Empresa',
    section: 'Startup actual',
    file: 'empresa.png',
    x: 47,
    y: 29,
    width: 10,
    color: '#4d9de0',
    district: 'profesional',
    interior: 'Sala de Operaciones',
    planned: [
      'Pitch de la empresa y el problema que resuelve',
      'Métricas y estado del proyecto',
      'Equipo',
      'Enlace a la web oficial',
    ],
  },
  {
    id: 'taller',
    name: 'El Taller',
    section: 'Side-projects y prototipos',
    file: 'taller.png',
    x: 64,
    y: 34,
    width: 10,
    color: '#ff8c42',
    district: 'profesional',
    interior: 'Mesa de Trabajo',
    planned: [
      'Planos y cajas de herramientas por proyecto',
      'Experimentos de código y prototipos',
      'Enlaces a los repositorios de GitHub',
    ],
  },
  {
    id: 'centro_civico',
    name: 'Centro Cívico',
    section: 'Redes sociales',
    file: 'centro_civico.png',
    x: 20,
    y: 52,
    width: 10,
    color: '#7b5ea7',
    district: 'social',
    interior: 'Tablón Comunitario',
    planned: [
      'Trading cards de cada red social',
      'Publicaciones destacadas',
    ],
  },
  {
    id: 'oficina_correos',
    name: 'Correos',
    section: 'Contacto',
    file: 'oficina_correos.png',
    x: 37,
    y: 50,
    width: 9,
    color: '#ffd23f',
    district: 'social',
    interior: 'Mostrador Postal',
    planned: [
      'Formulario de contacto con forma de postal',
      'Selector de sello',
      'Animación de matasellos al enviar',
    ],
  },
  {
    id: 'gimnasio',
    name: 'Gimnasio',
    section: 'Deporte',
    file: 'gimnasio.png',
    x: 55,
    y: 50,
    width: 9,
    color: '#ee4266',
    district: 'ocio',
    interior: 'Vestuario · Tablón de Récords',
    planned: [
      'Ficha de estadísticas físicas',
      'Rutina semanal',
      'Récords personales',
    ],
  },
  {
    id: 'aeropuerto',
    name: 'Aeropuerto',
    section: 'Viajes · 13 países',
    file: 'aeropuerto.png',
    x: 78,
    y: 50,
    width: 14,
    color: '#3bceac',
    district: 'ocio',
    interior: 'Control de Vuelos y Pasaporte',
    planned: [
      'Mapamundi interactivo',
      'Pasaporte con los 13 sellos',
      'Postales con fotos y anécdotas',
    ],
  },
  {
    id: 'cine',
    name: 'Cine',
    section: 'Películas y series',
    file: 'cine.png',
    x: 28,
    y: 70,
    width: 9,
    color: '#b23a48',
    district: 'ocio',
    interior: 'Cartelera y Sala',
    planned: ['Películas y series favoritas', 'Reseñas cortas'],
  },
  {
    id: 'arcade',
    name: 'Arcade',
    section: 'Videojuegos',
    file: 'arcade.png',
    x: 45,
    y: 68,
    width: 9,
    color: '#9b5de5',
    district: 'ocio',
    interior: 'Sala Arcade',
    planned: ['Videojuegos favoritos', 'Uno o dos minijuegos jugables'],
  },
  {
    id: 'parque',
    name: 'El Parque',
    section: 'Desconexión',
    file: 'parque.png',
    x: 63,
    y: 70,
    width: 12,
    color: '#0ead69',
    district: 'ocio',
    interior: 'Cuaderno de Campo',
    planned: [
      'Fotografías personales',
      'Hobbies al aire libre',
      'Equilibrio vida-trabajo',
    ],
  },
  {
    id: 'estacion_metro',
    name: 'Metro',
    section: 'Viaje rápido',
    file: 'estacion_metro.png',
    x: 47,
    y: 86,
    width: 6,
    color: '#ee4266',
    district: 'navegacion',
    interior: 'Plano de Metro',
    planned: [],
  },
  {
    id: 'cartel_bienvenida',
    name: 'Bienvenida',
    section: 'Quién soy',
    file: 'cartel_bienvenida.png',
    x: 84,
    y: 90,
    width: 12,
    color: '#ffd23f',
    district: 'navegacion',
    interior: 'Welcome to FJAH',
    planned: ['Resumen de quién soy en tres líneas'],
  },
]

export const byId = (id: string) => buildings.find((b) => b.id === id)

export const metroLines: { name: string; color: string; stops: string[] }[] = [
  { name: 'Línea Profesional', color: '#4d9de0', stops: ['universidad', 'empresa', 'taller'] },
  { name: 'Línea Social', color: '#7b5ea7', stops: ['cartel_bienvenida', 'centro_civico', 'oficina_correos'] },
  { name: 'Línea Ocio', color: '#0ead69', stops: ['aeropuerto', 'gimnasio', 'cine', 'arcade', 'parque'] },
]
