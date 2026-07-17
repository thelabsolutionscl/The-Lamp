"use client"

import {
  Lightbulb,
  LampCeiling,
  LampDesk,
  LampFloor,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import type { Light, LightKind } from "@/lib/lights"
import { cn } from "@/lib/utils"

const KIND_ICONS: Record<LightKind, LucideIcon> = {
  ceiling: LampCeiling,
  desk: LampDesk,
  floor: LampFloor,
  strip: Sparkles,
  bulb: Lightbulb,
}

// Switch on/off con el lenguaje de la identidad: track oscuro, knob claro y
// glow gris 50% al encender.
export function LampSwitch({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (on: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#808080]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
        on
          ? "border-[#808080]/60 bg-[#808080]/90 shadow-[0_0_14px_-2px_rgba(128,128,128,0.8)]"
          : "border-white/[0.12] bg-[#2a2a2a]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all duration-200",
          on ? "left-[calc(100%-1.25rem)] bg-[#0a0a0a]" : "left-1 bg-[#888888]",
        )}
      />
    </button>
  )
}

// Tarjeta de una luz: ícono según tipo, switch y slider de intensidad.
// Encendida, la tarjeta "emite": borde más claro y glow gris tenue.
export function LightCard({
  light,
  onToggle,
  onBrightness,
}: {
  light: Light
  onToggle: (id: string, on: boolean) => void
  onBrightness: (id: string, brightness: number) => void
}) {
  const Icon = KIND_ICONS[light.kind]
  const pct = light.brightness

  return (
    <div
      className={cn(
        "rounded-xl border bg-[#141414] p-5 transition-all duration-300",
        light.on
          ? "border-white/20 shadow-[0_0_28px_-10px_rgba(128,128,128,0.55)]"
          : "border-white/[0.08]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-300",
              light.on
                ? "border-[#808080]/40 bg-[#808080]/15 text-[#d0d0d0]"
                : "border-white/[0.08] bg-white/[0.02] text-white/30",
            )}
          >
            <Icon className="h-4.5 w-4.5" aria-hidden />
          </span>
          <div>
            <p className={cn("text-sm font-medium transition-colors", light.on ? "text-white/90" : "text-white/50")}>
              {light.name}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[1.5px] text-white/35">
              {light.watts} W · {light.on ? `${pct}%` : "Apagada"}
            </p>
          </div>
        </div>
        <LampSwitch
          on={light.on}
          onChange={(on) => onToggle(light.id, on)}
          label={`${light.on ? "Apagar" : "Encender"} ${light.name}`}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={100}
          value={pct}
          disabled={!light.on}
          onChange={(e) => onBrightness(light.id, Number(e.target.value))}
          aria-label={`Intensidad de ${light.name}`}
          className="lamp-range flex-1"
          style={{
            background: light.on
              ? `linear-gradient(90deg, #9a9a9a ${pct}%, #333333 ${pct}%)`
              : undefined,
          }}
        />
        <span
          className={cn(
            "w-10 text-right font-mono text-[11px] font-semibold tabular-nums",
            light.on ? "text-[#b0b0b0]" : "text-white/25",
          )}
        >
          {pct}%
        </span>
      </div>
    </div>
  )
}
