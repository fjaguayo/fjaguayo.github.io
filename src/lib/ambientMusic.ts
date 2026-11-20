/**
 * Música ambiente de la ciudad, generada en el navegador con Web Audio (sin archivos).
 * Acordes suaves en Do mayor (Cmaj7 · Am7 · Fmaj7 · G), un bajo redondo y notas
 * sueltas tipo kalimba sobre la escala pentatónica, todo con reverberación.
 * Cada vuelta es un poco distinta porque la melodía se elige al azar.
 */

const BPM = 70
const BEAT = 60 / BPM
const STEP = BEAT / 2 // corcheas
const STEPS_PER_CHORD = 16 // dos compases de 4/4
const VOLUME = 0.6 // con un limitador al final para que no sature

const CHORDS = [
  { bass: 36, pad: [60, 64, 67, 71] }, // Cmaj7
  { bass: 33, pad: [57, 60, 64, 67] }, // Am7
  { bass: 29, pad: [53, 57, 60, 64] }, // Fmaj7
  { bass: 31, pad: [55, 59, 62, 67] }, // G
]
// Do pentatónica, octava media-alta
const SCALE = [72, 74, 76, 79, 81, 84, 86, 88]

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

export interface AmbientMusic {
  /** Arranca o reanuda con un fundido de entrada. */
  play: () => void
  /** Baja el volumen con un fundido y deja el audio en pausa. */
  pause: () => void
}

export function createAmbientMusic(): AmbientMusic | null {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null

  let ctx: AudioContext | null = null
  let master: GainNode
  let dry: GainNode
  let wet: ConvolverNode
  let timer: number | undefined
  let nextTime = 0
  let step = 0
  let melodyIndex = 2
  let playing = false
  let suspendTimer: number | undefined

  const setup = () => {
    ctx = new Ctx()
    master = ctx.createGain()
    master.gain.value = 0
    // limitador: con el volumen alto, evita que los picos saturen
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -6
    limiter.knee.value = 4
    limiter.ratio.value = 12
    limiter.attack.value = 0.003
    limiter.release.value = 0.25
    master.connect(limiter).connect(ctx.destination)

    dry = ctx.createGain()
    dry.gain.value = 0.7
    dry.connect(master)

    // reverberación: impulso de ruido que se apaga en ~3 s
    wet = ctx.createConvolver()
    const len = Math.floor(ctx.sampleRate * 3)
    const ir = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3
    }
    wet.buffer = ir
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.55
    wet.connect(wetGain).connect(master)
  }

  const out = (node: AudioNode, reverb = 0.6) => {
    node.connect(dry)
    if (reverb > 0) {
      const send = ctx!.createGain()
      send.gain.value = reverb
      node.connect(send).connect(wet)
    }
  }

  const pad = (t: number, notes: number[], length: number) => {
    const c = ctx!
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(0.05, t + 2)
    g.gain.setValueAtTime(0.05, t + length - 1.5)
    g.gain.linearRampToValueAtTime(0.0001, t + length + 1.5)
    lp.connect(g)
    out(g, 0.8)
    for (const n of notes) {
      for (const detune of [-6, 6]) {
        const o = c.createOscillator()
        o.type = 'triangle'
        o.frequency.value = hz(n)
        o.detune.value = detune
        o.connect(lp)
        o.start(t)
        o.stop(t + length + 1.6)
      }
    }
  }

  const bass = (t: number, note: number, length: number) => {
    const c = ctx!
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = hz(note)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(0.16, t + 0.08)
    g.gain.exponentialRampToValueAtTime(0.0001, t + length)
    o.connect(g)
    out(g, 0.2)
    o.start(t)
    o.stop(t + length + 0.1)
  }

  // nota tipo kalimba: seno con un armónico y caída rápida
  const pluck = (t: number, note: number, level: number) => {
    const c = ctx!
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(level, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
    out(g, 0.9)
    for (const [mult, amp] of [
      [1, 1],
      [3, 0.12],
    ] as const) {
      const o = c.createOscillator()
      o.type = 'sine'
      o.frequency.value = hz(note) * mult
      const og = c.createGain()
      og.gain.value = amp
      o.connect(og).connect(g)
      o.start(t)
      o.stop(t + 1.7)
    }
  }

  const schedule = () => {
    const c = ctx!
    while (nextTime < c.currentTime + 0.6) {
      const chord = CHORDS[Math.floor(step / STEPS_PER_CHORD) % CHORDS.length]
      const inChord = step % STEPS_PER_CHORD

      if (inChord === 0) {
        pad(nextTime, chord.pad, STEPS_PER_CHORD * STEP)
        bass(nextTime, chord.bass, STEP * 7)
      }
      if (inChord === 8) bass(nextTime, chord.bass + 7, STEP * 6)

      // melodía: paseo aleatorio por la escala, más probable en los tiempos fuertes
      const strong = inChord % 4 === 0
      if (Math.random() < (strong ? 0.55 : 0.22)) {
        melodyIndex = Math.min(SCALE.length - 1, Math.max(0, melodyIndex + Math.floor(Math.random() * 5) - 2))
        pluck(nextTime, SCALE[melodyIndex], strong ? 0.09 : 0.06)
      }

      nextTime += STEP
      step++
    }
  }

  return {
    play() {
      if (!ctx) setup()
      const c = ctx!
      window.clearTimeout(suspendTimer)
      void c.resume().catch(() => {})
      if (!playing) {
        playing = true
        if (nextTime < c.currentTime) nextTime = c.currentTime + 0.1
        schedule()
        timer = window.setInterval(schedule, 150)
      }
      master.gain.cancelScheduledValues(c.currentTime)
      master.gain.setValueAtTime(master.gain.value, c.currentTime)
      master.gain.linearRampToValueAtTime(VOLUME, c.currentTime + 2.5)
    },
    pause() {
      if (!ctx || !playing) return
      const c = ctx
      playing = false
      window.clearInterval(timer)
      master.gain.cancelScheduledValues(c.currentTime)
      master.gain.setValueAtTime(master.gain.value, c.currentTime)
      master.gain.linearRampToValueAtTime(0, c.currentTime + 0.8)
      suspendTimer = window.setTimeout(() => void c.suspend().catch(() => {}), 900)
    },
  }
}
