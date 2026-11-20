// Aclara (amt > 0) u oscurece (amt < 0) un color hex. amt va de -1 a 1.
export function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const mix = (c: number) =>
    Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

export const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`
