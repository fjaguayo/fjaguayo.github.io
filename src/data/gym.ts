/**
 * Gimnasio: rango de Symmetry y la rutina de Javier en cuatro bloques.
 * Las series y repeticiones salen de sus plantillas en la app.
 */

export const SYMMETRY = {
  rank: 'Plata II',
  percentile: 'Top 55 % más fuerte',
  url: 'https://symmetry.club/share/jackks/2940659',
}

export interface Exercise {
  name: string
  /** Detalle entre paréntesis: máquina, mancuerna, barra... */
  gear?: string
  sets: number
  /** Repeticiones o tiempo, tal y como se muestra ("10", "45 s"). */
  reps: string
}

export interface Routine {
  id: string
  name: string
  /** Dónde se hace o cuánto dura. */
  meta: string
  /** Músculos principales que trabaja. */
  focus: string
  color: string
  exercises: Exercise[]
}

export const ROUTINES: Routine[] = [
  {
    id: 'brazo-hombro',
    name: 'Brazo y hombro',
    meta: '88 min',
    focus: 'Bíceps · Dorsales · Tríceps',
    color: 'var(--color-berry)',
    exercises: [
      { name: 'Curl de bíceps', gear: 'Barra EZ', sets: 3, reps: '12' },
      { name: 'Extensión de tríceps', gear: 'Cuerda', sets: 3, reps: '10' },
      { name: 'Aperturas de pecho', gear: 'Pec Deck', sets: 3, reps: '10' },
      { name: 'Jalón al pecho agarre supino', gear: 'Máquina', sets: 3, reps: '10' },
    ],
  },
  {
    id: 'pecho-espalda',
    name: 'Pecho y espalda',
    meta: '52 min',
    focus: 'Hombros · Pecho · Dorsales',
    color: 'var(--color-sky)',
    exercises: [
      { name: 'Press de banca inclinado', gear: 'Mancuerna', sets: 3, reps: '10' },
      { name: 'Aperturas de pecho', gear: 'Pec Deck', sets: 3, reps: '12' },
      { name: 'Aperturas inversas', gear: 'Pec Deck', sets: 4, reps: '12' },
      { name: 'Jalón al pecho agarre supino', gear: 'Máquina', sets: 3, reps: '10' },
    ],
  },
  {
    id: 'piernas',
    name: 'Piernas',
    meta: '52 min',
    focus: 'Cuádriceps · Aductores',
    color: 'var(--color-mint)',
    exercises: [
      { name: 'Extensión de rodilla', gear: 'Máquina', sets: 3, reps: '12' },
      { name: 'Abducción de cadera', gear: 'Máquina', sets: 3, reps: '10' },
      { name: 'Aducción de cadera', gear: 'Máquina', sets: 4, reps: '10' },
      { name: 'Sentadilla búlgara', gear: 'Máquina Smith', sets: 3, reps: '10' },
    ],
  },
  {
    id: 'core',
    name: 'Core en casa',
    meta: 'En casa',
    focus: 'Abdomen · Oblicuos · Lumbar',
    color: 'var(--color-sun)',
    exercises: [
      { name: 'Plancha', sets: 3, reps: '45 s' },
      { name: 'Crunch abdominal', sets: 3, reps: '15' },
      { name: 'Elevación de piernas', sets: 3, reps: '12' },
      { name: 'Russian twist', sets: 3, reps: '20' },
    ],
  },
]

export const gymUrl = (name: string) => `${import.meta.env.BASE_URL}gym/${name}.webp`

/** Textos del gimnasio en inglés. Lo que no aparezca aquí se deja igual (p. ej. "Pec Deck"). */
export const GYM_EN: Record<string, string> = {
  // rango
  'Plata II': 'Silver II',
  'Top 55 % más fuerte': 'Top 55 % strongest',
  // bloques
  'Brazo y hombro': 'Arms and shoulders',
  'Pecho y espalda': 'Chest and back',
  Piernas: 'Legs',
  'Core en casa': 'Core at home',
  'En casa': 'At home',
  'Bíceps · Dorsales · Tríceps': 'Biceps · Lats · Triceps',
  'Hombros · Pecho · Dorsales': 'Shoulders · Chest · Lats',
  'Cuádriceps · Aductores': 'Quads · Adductors',
  'Abdomen · Oblicuos · Lumbar': 'Abs · Obliques · Lower back',
  // ejercicios
  'Curl de bíceps': 'Biceps curl',
  'Extensión de tríceps': 'Triceps extension',
  'Aperturas de pecho': 'Chest fly',
  'Jalón al pecho agarre supino': 'Underhand lat pulldown',
  'Press de banca inclinado': 'Incline bench press',
  'Aperturas inversas': 'Reverse fly',
  'Extensión de rodilla': 'Leg extension',
  'Abducción de cadera': 'Hip abduction',
  'Aducción de cadera': 'Hip adduction',
  'Sentadilla búlgara': 'Bulgarian split squat',
  Plancha: 'Plank',
  'Crunch abdominal': 'Crunch',
  'Elevación de piernas': 'Leg raise',
  // material
  'Barra EZ': 'EZ bar',
  Cuerda: 'Rope',
  Máquina: 'Machine',
  Mancuerna: 'Dumbbell',
  'Máquina Smith': 'Smith machine',
}
