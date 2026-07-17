"use client"

import { useState } from "react"
import {
  Lightbulb,
  LampCeiling,
  LampDesk,
  Sparkles,
  Palette,
  Pencil,
  Trash2,
  Check,
  type LucideIcon,
} from "lucide-react"
import {
  TEMP_MIN,
  TEMP_MAX,
  kelvinToHex,
  lightGlowColor,
  type Light,
  type LightKind,
} from "@/lib/lights"
import { useLights } from "@/components/app/lights-store"
import { cn } from "@/lib/utils"

const KIND_ICONS: Record<LightKind, LucideIcon> = {
  ceiling: LampCeiling,
  desk: LampDesk,
  floor: LampDesk,
  strip: Sparkles,
  bulb: Lightbulb,
}

// Presets de color para luces RGB (única concesión cromática de la app, y solo
// en luces que lo soportan).
const COLOR_PRESETS = ["#ff5a5a", "#ffb020", "#7CFC98", "#3FA9F5", "#c084fc", "#ff5aa8"]

/** hex #rrggbb + alpha (0–1) → rgba(). */
function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// Switch on/off con el acento cyan y glow al encender. Presentacional.
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
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4cc]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
        on
          ? "border-[#00d4cc]/60 bg-[#00d4cc]/90 shadow-[0_0_14px_-2px_rgba(0,212,204,0.8)]"
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

// Tarjeta de una luz: switch, intensidad, temperatura de color y (si aplica)
// color RGB. Encendida, la tarjeta "emite": el glow y el ícono toman el color
// real de la luz (su temperatura o su RGB) y la intensidad del halo escala con
// el brillo. Toma sus acciones del store.
export function LightCard({ light }: { light: Light }) {
  const { toggleLight, setBrightness, setTemp, setColor, renameLight, removeLight } = useLights()
  const [colorOpen, setColorOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(light.name)
  const Icon = KIND_ICONS[light.kind]
  const pct = light.brightness
  const glow = lightGlowColor(light)
  const inColor = !!(light.supportsColor && light.color)

  // Glow proporcional al brillo: más intensidad → halo más grande y opaco.
  const glowStyle = light.on
    ? {
        boxShadow: `0 0 ${Math.round(12 + pct * 0.4)}px ${Math.round(-14 + pct * 0.06)}px ${hexA(glow, 0.15 + pct / 320)}`,
        borderColor: hexA(glow, 0.22),
      }
    : undefined

  const commitRename = () => {
    const n = draft.trim()
    if (n) renameLight(light.id, n)
    else setDraft(light.name)
    setRenaming(false)
  }

  return (
    <div
      className={cn(
        "group/lc relative rounded-xl border bg-[#141414] p-4 transition-all duration-300 sm:p-5",
        !light.on && "border-white/[0.08] hover:border-white/[0.14]",
      )}
      style={glowStyle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-300",
              light.on && "lamp-pop",
            )}
            style={
              light.on
                ? { borderColor: hexA(glow, 0.5), background: hexA(glow, 0.14), color: "#f4f4f5" }
                : undefined
            }
          >
            <Icon
              className={cn("h-4.5 w-4.5", !light.on && "text-white/30")}
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            {renaming ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename()
                    if (e.key === "Escape") { setDraft(light.name); setRenaming(false) }
                  }}
                  className="w-32 rounded border border-white/[0.14] bg-[#0f0f0f] px-1.5 py-0.5 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50"
                />
                <button type="button" onClick={commitRename} aria-label="Guardar nombre" className="text-[#00d4cc] hover:text-[#19ddd5]">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors", light.on ? "text-white/90" : "text-white/50")}>
                {light.name}
                <span className="inline-flex items-center gap-1 opacity-100 transition-opacity focus-within:opacity-100 lg:opacity-0 lg:group-hover/lc:opacity-100">
                  <button
                    type="button"
                    onClick={() => { setDraft(light.name); setRenaming(true) }}
                    aria-label={`Renombrar ${light.name}`}
                    className="text-white/25 transition-colors hover:text-white/60"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLight(light.id)}
                    aria-label={`Eliminar ${light.name}`}
                    className="text-white/25 transition-colors hover:text-[#ff4444]"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              </p>
            )}
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[1.5px] text-white/35">
              {light.on ? `${light.watts} W · ${pct}% · ${inColor ? "Color" : `${light.temp}K`}` : `${light.watts} W · Apagada`}
            </p>
          </div>
        </div>
        <LampSwitch
          on={light.on}
          onChange={(on) => toggleLight(light.id, on)}
          label={`${light.on ? "Apagar" : "Encender"} ${light.name}`}
        />
      </div>

      {/* Intensidad */}
      <div className="mt-5 flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={100}
          value={pct}
          disabled={!light.on}
          onChange={(e) => setBrightness(light.id, Number(e.target.value))}
          aria-label={`Intensidad de ${light.name}`}
          className="lamp-range flex-1"
          style={{
            background: light.on
              ? `linear-gradient(90deg, #00d4cc ${pct}%, #333333 ${pct}%)`
              : undefined,
          }}
        />
        <span
          className={cn(
            "w-10 text-right font-mono text-[11px] font-semibold tabular-nums",
            light.on ? "text-[#00d4cc]" : "text-white/25",
          )}
        >
          {pct}%
        </span>
      </div>

      {/* Temperatura de color (y color RGB si aplica) — solo cuando está encendida */}
      {light.on && (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/35">
              {inColor ? "Color" : "Temperatura"}
            </span>
            {light.supportsColor && (
              <button
                type="button"
                onClick={() => setColorOpen((o) => !o)}
                aria-expanded={colorOpen}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[1.5px] text-white/55 transition-colors hover:border-white/25 hover:text-white/80"
              >
                <Palette className="h-3 w-3" />
                {inColor ? "Cambiar" : "Color"}
              </button>
            )}
          </div>

          {inColor ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border border-white/20" style={{ background: glow }} />
              <span className="font-mono text-[11px] text-white/60">{light.color}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={TEMP_MIN}
                max={TEMP_MAX}
                step={100}
                value={light.temp}
                onChange={(e) => setTemp(light.id, Number(e.target.value))}
                aria-label={`Temperatura de color de ${light.name}`}
                className="lamp-range flex-1"
                style={{
                  background: `linear-gradient(90deg, ${kelvinToHex(TEMP_MIN)}, ${kelvinToHex(3500)}, ${kelvinToHex(TEMP_MAX)})`,
                }}
              />
              <span className="w-12 text-right font-mono text-[11px] font-semibold tabular-nums text-white/60">
                {light.temp}K
              </span>
            </div>
          )}

          {light.supportsColor && colorOpen && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setColor(light.id, null)
                  setColorOpen(false)
                }}
                aria-label="Volver a blanco"
                className={cn(
                  "flex h-6 items-center rounded-full border px-2.5 font-mono text-[9px] uppercase tracking-[1.5px] transition-colors",
                  !light.color
                    ? "border-[#00d4cc]/60 text-[#00d4cc]"
                    : "border-white/[0.12] text-white/55 hover:text-white/80",
                )}
              >
                Blanco
              </button>
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(light.id, c)
                    setColorOpen(false)
                  }}
                  aria-label={`Color ${c}`}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                    light.color === c ? "border-white" : "border-white/20",
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
