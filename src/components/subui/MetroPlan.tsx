import { byId, metroLines } from '../../data/buildings'

// Plano esquemático: cada parada abre directamente la Sub-UI del edificio
export default function MetroPlan({ onTravel }: { onTravel: (id: string) => void }) {
  return (
    <div className="grid gap-7">
      {metroLines.map((line) => (
        <div key={line.name}>
          <p className="mb-3 font-display text-lg tracking-wide" style={{ color: line.color }}>
            {line.name}
          </p>
          <div className="relative">
            <div
              className="absolute left-4 right-4 top-[18px] h-3 rounded-full border-[3px] border-ink"
              style={{ background: line.color }}
            />
            <ol className="relative flex justify-between gap-2">
              {line.stops.map((id) => {
                const b = byId(id)!
                return (
                  <li key={id} className="flex min-w-0 flex-1 flex-col items-center">
                    <button
                      type="button"
                      onClick={() => onTravel(id)}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <span className="h-10 w-10 rounded-full border-4 border-ink bg-paper transition-transform group-hover:scale-125" />
                      <span className="max-w-[110px] text-center text-sm font-bold leading-tight group-hover:underline">
                        {b.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      ))}
    </div>
  )
}
