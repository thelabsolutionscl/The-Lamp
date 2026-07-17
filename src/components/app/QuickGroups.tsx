"use client"

import { useMemo } from "react"
import { Gauge, LampCeiling, LampDesk, Sparkles, Lightbulb, type LucideIcon } from "lucide-react"
import { groupsByKind, type LightKind } from "@/lib/lights"
import { useLights } from "@/components/app/lights-store"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<LightKind, LucideIcon> = {
  ceiling: LampCeiling,
  desk: LampDesk,
  floor: LampDesk,
  strip: Sparkles,
  bulb: Lightbulb,
}

export function QuickGroups() {
  const { lights, setMaster, toggleGroup } = useLights()

  const onLights = lights.filter((l) => l.on)
  const master = onLights.length
    ? Math.round(onLights.reduce((s, l) => s + l.brightness, 0) / onLights.length)
    : 0
  const groups = useMemo(() => groupsByKind(lights), [lights])

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      {/* Master global de intensidad */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-[#00d4cc]" />
          <p className="font-mono text-[10px] uppercase tracking-[2px] text-white/45">Intensidad general</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={100}
            value={master || 1}
            disabled={onLights.length === 0}
            onChange={(e) => setMaster(Number(e.target.value))}
            aria-label="Intensidad de todas las luces encendidas"
            className="lamp-range flex-1"
            style={{
              background: onLights.length ? `linear-gradient(90deg, #00d4cc ${master}%, #333333 ${master}%)` : undefined,
            }}
          />
          <span className={cn("w-10 text-right font-mono text-sm font-semibold tabular-nums", onLights.length ? "text-[#00d4cc]" : "text-white/25")}>
            {master}%
          </span>
        </div>
        <p className="mt-2 text-[11px] text-white/40">Ajusta de golpe todas las luces encendidas.</p>
      </div>

      {/* Grupos transversales por tipo */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[2px] text-white/45">Grupos rápidos</p>
        <div className="flex flex-wrap gap-2.5">
          {groups.map((g) => {
            const Icon = KIND_ICON[g.kind]
            const onCount = lights.filter((l) => g.ids.includes(l.id) && l.on).length
            const allOn = onCount === g.ids.length
            return (
              <button
                key={g.kind}
                type="button"
                onClick={() => toggleGroup(g.ids, !allOn)}
                aria-pressed={onCount > 0}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors",
                  onCount > 0
                    ? "border-[#00d4cc]/40 bg-[#00d4cc]/12 text-white/90"
                    : "border-white/[0.1] text-white/55 hover:border-white/25 hover:text-white/80",
                )}
              >
                <Icon className={cn("h-4 w-4", onCount > 0 ? "text-[#00d4cc]" : "text-white/40")} />
                {g.label}
                <span className="font-mono text-[10px] tabular-nums text-white/40">{onCount}/{g.ids.length}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
