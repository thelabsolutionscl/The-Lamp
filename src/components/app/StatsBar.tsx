"use client"

import { useMemo, useState } from "react"
import { Check, Pencil } from "lucide-react"
import { ROOMS } from "@/lib/lights"
import { dailyKwh, costClp, formatCLP } from "@/lib/energy"
import { useLights } from "@/components/app/lights-store"
import { Sparkline } from "@/components/ui/sparkline"
import { NumberTicker } from "@/components/ui/number-ticker"

export function StatsBar() {
  const { lights, watts, history, tariff, setTariff } = useLights()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(tariff))

  const onCount = lights.filter((l) => l.on).length
  const activeRooms = new Set(lights.filter((l) => l.on).map((l) => l.room)).size
  const avg = useMemo(() => {
    const on = lights.filter((l) => l.on)
    return on.length ? Math.round(on.reduce((s, l) => s + l.brightness, 0) / on.length) : 0
  }, [lights])
  const kwh = dailyKwh(watts)
  const cost = costClp(kwh, tariff)
  const spark = history.map((h) => h.w)

  const commitTariff = () => {
    const n = Number(draft)
    if (n > 0) setTariff(n)
    else setDraft(String(tariff))
    setEditing(false)
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Luces encendidas */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-white/45">Luces encendidas</p>
        <p className="mt-2 text-3xl font-bold tracking-[-0.02em] text-white tabular-nums">
          <NumberTicker value={onCount} />
          <span className="ml-1.5 text-sm font-semibold text-white/40">/ {lights.length}</span>
        </p>
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-[#333]">
          <div
            className="h-full rounded-full shadow-[0_0_8px_#00d4cc] transition-all duration-500"
            style={{ width: `${(onCount / lights.length) * 100}%`, background: "linear-gradient(90deg, #00d4aa, #00d4cc)" }}
          />
        </div>
      </div>

      {/* Consumo + sparkline */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-white/45">Consumo estimado</p>
        <div className="flex items-end justify-between gap-2">
          <p className="mt-2 text-3xl font-bold tracking-[-0.02em] text-white tabular-nums">
            <NumberTicker value={watts} />
            <span className="ml-1.5 text-sm font-semibold text-white/40">W</span>
          </p>
          <Sparkline data={spark} className="mb-1 shrink-0" />
        </div>
      </div>

      {/* Costo proyectado + tarifa editable */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-white/45">Costo proyectado</p>
        <p className="mt-2 text-3xl font-bold tracking-[-0.02em] text-white tabular-nums">
          <NumberTicker value={cost} format={formatCLP} />
          <span className="ml-1.5 text-sm font-semibold text-white/40">/ día</span>
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          {editing ? (
            <>
              <span className="font-mono text-[11px] text-white/40">$</span>
              <input
                type="number"
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitTariff()}
                className="w-16 rounded border border-white/[0.12] bg-[#0f0f0f] px-1.5 py-0.5 font-mono text-[11px] text-white/80 outline-none focus:border-[#00d4cc]/50"
              />
              <span className="font-mono text-[10px] text-white/40">/kWh</span>
              <button type="button" onClick={commitTariff} aria-label="Guardar tarifa" className="text-[#00d4cc] hover:text-[#19ddd5]">
                <Check className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(String(tariff))
                setEditing(true)
              }}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.5px] text-white/45 transition-colors hover:text-white/70"
            >
              {kwh.toFixed(1)} kWh · {formatCLP(tariff)}/kWh
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Ambientes / intensidad */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-white/45">Ambientes activos</p>
        <p className="mt-2 text-3xl font-bold tracking-[-0.02em] text-white tabular-nums">
          <NumberTicker value={activeRooms} />
          <span className="ml-1.5 text-sm font-semibold text-white/40">/ {ROOMS.length}</span>
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">
          Intensidad prom. <span className="text-[#00d4cc]"><NumberTicker value={avg} />%</span>
        </p>
      </div>
    </div>
  )
}
