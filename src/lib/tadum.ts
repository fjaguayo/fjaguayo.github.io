/**
 * Sonido de apertura del cine: dos golpes graves ("ta-dum") y un acorde que crece.
 * Es un sonido original sintetizado con Web Audio, sin archivos: inspirado en la
 * intro de una plataforma de streaming, pero no es la suya.
 *
 * Devuelve una función para cortarlo antes de tiempo.
 */
export function playTadum(): () => void {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return () => {}

  let ctx: AudioContext
  try {
    ctx = new Ctx()
  } catch {
    return () => {}
  }
  // por si el navegador lo crea suspendido; viene justo de un clic, así que debería reanudarse
  void ctx.resume().catch(() => {})

  const now = ctx.currentTime + 0.05

  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -14
  comp.ratio.value = 4
  const master = ctx.createGain()
  master.gain.value = 0.55
  master.connect(comp).connect(ctx.destination)

  // golpe grave: seno que cae de tono + un clic de ruido filtrado
  const hit = (t: number, from: number, to: number, length: number, level: number) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(from, t)
    osc.frequency.exponentialRampToValueAtTime(to, t + length * 0.6)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(level, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + length)
    osc.connect(g).connect(master)
    osc.start(t)
    osc.stop(t + length + 0.05)

    const noise = ctx.createBufferSource()
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2
    noise.buffer = buf
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    const ng = ctx.createGain()
    ng.gain.value = level * 0.6
    noise.connect(lp).connect(ng).connect(master)
    noise.start(t)
  }

  hit(now, 95, 48, 0.55, 0.9)
  hit(now + 0.3, 110, 42, 1.6, 1)

  // acorde que crece detrás del segundo golpe (La menor con quinta, sierras desafinadas)
  const swellStart = now + 0.32
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 2
  filter.frequency.setValueAtTime(180, swellStart)
  filter.frequency.exponentialRampToValueAtTime(1600, swellStart + 0.9)
  filter.frequency.exponentialRampToValueAtTime(260, swellStart + 2.6)
  const sg = ctx.createGain()
  sg.gain.setValueAtTime(0.0001, swellStart)
  sg.gain.exponentialRampToValueAtTime(0.16, swellStart + 0.7)
  sg.gain.exponentialRampToValueAtTime(0.0001, swellStart + 2.8)
  filter.connect(sg).connect(master)

  for (const f of [55, 82.4, 110, 130.8, 164.8]) {
    for (const detune of [-9, 9]) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.detune.value = detune
      o.connect(filter)
      o.start(swellStart)
      o.stop(swellStart + 3)
    }
  }

  const closeTimer = window.setTimeout(() => void ctx.close().catch(() => {}), 3800)

  return () => {
    window.clearTimeout(closeTimer)
    try {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
    } catch {
      /* contexto ya cerrado */
    }
    window.setTimeout(() => void ctx.close().catch(() => {}), 300)
  }
}
