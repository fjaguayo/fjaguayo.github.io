/**
 * Sonidos de los menús del Arcade, sintetizados con Web Audio (sin archivos).
 * Un barrido grave con brillo al abrir, al estilo de los menús de consola de los 2000,
 * y un clic suave al moverse entre carátulas. Son sonidos originales.
 */

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (ctx) return ctx
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  try {
    ctx = new Ctx()
  } catch {
    return null
  }
  return ctx
}

/** Barrido de apertura: un pad grave que sube y una campanita aguda encima. */
export function playOpen() {
  const c = audio()
  if (!c) return
  void c.resume().catch(() => {})
  const t = c.currentTime + 0.02

  const master = c.createGain()
  master.gain.value = 0.22
  master.connect(c.destination)

  // pad: dos sierras desafinadas, filtradas y con el filtro abriéndose
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(220, t)
  filter.frequency.exponentialRampToValueAtTime(2400, t + 0.9)
  filter.frequency.exponentialRampToValueAtTime(400, t + 2.2)
  const pad = c.createGain()
  pad.gain.setValueAtTime(0.0001, t)
  pad.gain.exponentialRampToValueAtTime(0.5, t + 0.35)
  pad.gain.exponentialRampToValueAtTime(0.0001, t + 2.3)
  filter.connect(pad).connect(master)
  for (const [f, d] of [
    [110, -7],
    [110, 7],
    [165, 0],
  ]) {
    const o = c.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = f
    o.detune.value = d
    o.connect(filter)
    o.start(t)
    o.stop(t + 2.4)
  }

  // campanitas: tres senos agudos en arpegio
  ;[880, 1318.5, 1760].forEach((f, i) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const g = c.createGain()
    const s = t + 0.25 + i * 0.09
    g.gain.setValueAtTime(0.0001, s)
    g.gain.exponentialRampToValueAtTime(0.12, s + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, s + 1.1)
    o.connect(g).connect(master)
    o.start(s)
    o.stop(s + 1.2)
  })
}

/** Clic corto y suave al pasar por una carátula. */
export function playTick() {
  const c = audio()
  if (!c || c.state !== 'running') return
  const t = c.currentTime
  const o = c.createOscillator()
  o.type = 'triangle'
  o.frequency.setValueAtTime(1500, t)
  o.frequency.exponentialRampToValueAtTime(900, t + 0.05)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + 0.08)
}
