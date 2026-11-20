import { buildings } from '../data/buildings'

// Mapa provisional dibujado en SVG mientras no exista public/assets/mapa_base.png.
// Mantiene la misma proporción (2400x1500) para que las posiciones en % sigan valiendo.

export const PLACEHOLDER_W = 2400
export const PLACEHOLDER_H = 1500

const INK = '#1b1b2f'
const LAND = 'M1200 70 L2360 690 L1240 1430 L40 760 Z'
const SAND = 'M1200 30 L2420 690 L1240 1480 L-20 760 Z'

export default function MapPlaceholder() {
  const W = PLACEHOLDER_W
  const H = PLACEHOLDER_H

  // carreteras en los dos ejes isométricos (pendiente ±0.5)
  const roadsA = [-120, 160, 440, 720] // y = 0.5x + c
  const roadsB = [900, 1180, 1460, 1740] // y = -0.5x + c

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      className="block"
      aria-hidden
    >
      <defs>
        <clipPath id="land-clip">
          <path d={LAND} />
        </clipPath>
        <pattern id="waves" width="80" height="40" patternUnits="userSpaceOnUse">
          <path d="M5 25 q15 -12 30 0 t30 0" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
        </pattern>
        <pattern id="grass" width="60" height="30" patternUnits="userSpaceOnUse">
          <path d="M10 20 l4 -8 l4 8 M38 12 l4 -8 l4 8" fill="none" stroke="#5aa845" strokeWidth="3" strokeLinecap="round" />
        </pattern>
      </defs>

      {/* mar */}
      <rect width={W} height={H} fill="#3fa7d6" />
      <rect width={W} height={H} fill="url(#waves)" />

      {/* playa + tierra */}
      <path d={SAND} fill="#f5d98b" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
      <path d={LAND} fill="#8fd16a" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
      <path d={LAND} fill="url(#grass)" />

      <g clipPath="url(#land-clip)">
        {/* montañas al fondo */}
        {[
          [980, 330, 260],
          [1230, 300, 320],
          [1500, 360, 240],
          [760, 420, 200],
        ].map(([x, y, s], i) => (
          <g key={i}>
            <path
              d={`M${x - s} ${y + 40} L${x} ${y - s * 0.75} L${x + s} ${y + 40} Z`}
              fill="#9a8c7a"
              stroke={INK}
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <path
              d={`M${x - s * 0.28} ${y - s * 0.75 + s * 0.28 * 0.86} L${x} ${y - s * 0.75} L${x + s * 0.28} ${y - s * 0.75 + s * 0.28 * 0.86} L${x + s * 0.1} ${y - s * 0.4} L${x - s * 0.08} ${y - s * 0.5} Z`}
              fill="#ffffff"
              stroke={INK}
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </g>
        ))}

        {/* carreteras */}
        {roadsA.map((c) => (
          <g key={`a${c}`}>
            <line x1={0} y1={c} x2={W} y2={c + W * 0.5} stroke={INK} strokeWidth="58" />
            <line x1={0} y1={c} x2={W} y2={c + W * 0.5} stroke="#6b6b7b" strokeWidth="46" />
            <line x1={0} y1={c} x2={W} y2={c + W * 0.5} stroke="#fff6e3" strokeWidth="5" strokeDasharray="30 26" />
          </g>
        ))}
        {roadsB.map((c) => (
          <g key={`b${c}`}>
            <line x1={0} y1={c} x2={W} y2={c - W * 0.5} stroke={INK} strokeWidth="58" />
            <line x1={0} y1={c} x2={W} y2={c - W * 0.5} stroke="#6b6b7b" strokeWidth="46" />
            <line x1={0} y1={c} x2={W} y2={c - W * 0.5} stroke="#fff6e3" strokeWidth="5" strokeDasharray="30 26" />
          </g>
        ))}

        {/* parcelas bajo cada edificio */}
        {buildings.map((b) => {
          const cx = (b.x / 100) * W
          const cy = (b.y / 100) * H - 10
          const hw = (b.width / 100) * W * 0.62
          const hh = hw * 0.5
          return (
            <path
              key={b.id}
              d={`M${cx} ${cy - hh} L${cx + hw} ${cy} L${cx} ${cy + hh} L${cx - hw} ${cy} Z`}
              fill="#c9e7a8"
              stroke={INK}
              strokeWidth="6"
              strokeLinejoin="round"
            />
          )
        })}
      </g>

      {/* palmeras en la playa */}
      {[
        [300, 900],
        [2150, 960],
        [1700, 1290],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0 q10 -60 -6 -120" fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round" />
          <path d="M0 0 q10 -60 -6 -120" fill="none" stroke="#a0703c" strokeWidth="10" strokeLinecap="round" />
          {[-60, -20, 25, 70].map((rot) => (
            <path
              key={rot}
              d="M-6 -120 q40 -30 80 10 q-40 -10 -80 -10 Z"
              transform={`rotate(${rot} -6 -120)`}
              fill="#2f9e44"
              stroke={INK}
              strokeWidth="5"
              strokeLinejoin="round"
            />
          ))}
        </g>
      ))}
    </svg>
  )
}
