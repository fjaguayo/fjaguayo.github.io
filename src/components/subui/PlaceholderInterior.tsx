import { Hammer } from 'lucide-react'
import type { BuildingDef } from '../../data/buildings'

// Interior provisional: enseña lo que irá dentro según las especificaciones
export default function PlaceholderInterior({ def }: { def: BuildingDef }) {
  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
      <div>
        <p className="text-lg font-medium leading-snug">
          Esta sala aún está en obras. Cuando esté lista vas a encontrar aquí:
        </p>
        <ul className="mt-4 grid gap-2">
          {def.planned.map((item) => (
            <li
              key={item}
              className="rounded-xl border-[3px] border-ink bg-paper px-3 py-2 font-semibold shadow-comic"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="hidden h-36 w-36 place-items-center self-start rounded-2xl border-4 border-ink shadow-comic sm:grid"
        style={{
          background: `repeating-linear-gradient(-45deg, #ffd23f 0 16px, #1b1b2f 16px 32px)`,
        }}
      >
        <span className="grid h-16 w-16 place-items-center rounded-full border-4 border-ink bg-paper">
          <Hammer strokeWidth={2.75} size={30} />
        </span>
      </div>
    </div>
  )
}
