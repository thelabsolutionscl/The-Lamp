"use client"

import { useState } from "react"
import { Clock, Sunset, Sunrise, Plus, Check, Trash2, type LucideIcon } from "lucide-react"
import { ROOMS } from "@/lib/lights"
import {
  describeTrigger,
  describeDays,
  type Automation,
  type AutomationAction,
  type AutomationTrigger,
} from "@/lib/automations"
import { useLights } from "@/components/app/lights-store"
import { LampSwitch } from "@/components/app/LightCard"
import { cn } from "@/lib/utils"

const TRIGGER_ICON: Record<AutomationTrigger["type"], LucideIcon> = {
  time: Clock,
  sunset: Sunset,
  sunrise: Sunrise,
}

function describeAction(action: AutomationAction, sceneName: (id: string) => string): string {
  switch (action.type) {
    case "scene":
      return `Escena: ${sceneName(action.sceneId)}`
    case "room": {
      const r = ROOMS.find((x) => x.id === action.roomId)?.name ?? action.roomId
      return `${r}: ${action.on ? "encender" : "apagar"}`
    }
    case "allOff":
      return "Apagar todo"
  }
}

const DAY_PRESETS: { label: string; days: number[] }[] = [
  { label: "Todos los días", days: [] },
  { label: "Días de semana", days: [1, 2, 3, 4, 5] },
  { label: "Fin de semana", days: [0, 6] },
]

export function Automations() {
  const { automations, scenes, addAutomation, toggleAutomation, deleteAutomation } = useLights()
  const [adding, setAdding] = useState(false)

  // Estado del formulario
  const [name, setName] = useState("")
  const [triggerType, setTriggerType] = useState<AutomationTrigger["type"]>("time")
  const [time, setTime] = useState("19:00")
  const [actionKind, setActionKind] = useState<string>("scene:trabajo")
  const [dayPreset, setDayPreset] = useState(0)

  const sceneName = (id: string) => scenes.find((s) => s.id === id)?.name ?? id

  const resetForm = () => {
    setName("")
    setTriggerType("time")
    setTime("19:00")
    setActionKind("scene:trabajo")
    setDayPreset(0)
    setAdding(false)
  }

  const commit = () => {
    const n = name.trim() || "Automatización"
    const trigger: AutomationTrigger =
      triggerType === "time" ? { type: "time", time } : { type: triggerType, offsetMin: 0 }
    let action: AutomationAction
    if (actionKind === "allOff") action = { type: "allOff" }
    else if (actionKind.startsWith("scene:")) action = { type: "scene", sceneId: actionKind.slice(6) }
    else action = { type: "room", roomId: actionKind.slice(5), on: true }

    const a: Automation = {
      id: `auto-custom-${automations.length}-${n.toLowerCase().replace(/\s+/g, "-")}`,
      name: n,
      trigger,
      action,
      days: DAY_PRESETS[dayPreset].days,
      enabled: true,
    }
    addAutomation(a)
    resetForm()
  }

  return (
    <section id="automatizaciones" className="mt-16 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">02 · Automatizaciones</p>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">Que la casa se maneje sola.</h2>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-3.5 py-2 text-xs font-medium text-white/70 transition-colors hover:border-[#00d4cc]/40 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva automatización
          </button>
        )}
      </div>

      {/* Formulario */}
      {adding && (
        <div className="mt-6 rounded-xl border border-white/[0.1] bg-[#141414] p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">Nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Bienvenida"
                className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none focus:border-[#00d4cc]/50"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">Cuándo</span>
              <div className="flex gap-2">
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as AutomationTrigger["type"])}
                  className="flex-1 rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50"
                >
                  <option value="time">Hora fija</option>
                  <option value="sunset">Atardecer</option>
                  <option value="sunrise">Amanecer</option>
                </select>
                {triggerType === "time" && (
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-2 py-2 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50"
                  />
                )}
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">Qué hace</span>
              <select
                value={actionKind}
                onChange={(e) => setActionKind(e.target.value)}
                className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50"
              >
                <optgroup label="Escenas">
                  {scenes.map((s) => (
                    <option key={s.id} value={`scene:${s.id}`}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Ambientes (encender)">
                  {ROOMS.map((r) => (
                    <option key={r.id} value={`room:${r.id}`}>{r.name}</option>
                  ))}
                </optgroup>
                <option value="allOff">Apagar todo</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">Días</span>
              <select
                value={dayPreset}
                onChange={(e) => setDayPreset(Number(e.target.value))}
                className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50"
              >
                {DAY_PRESETS.map((d, i) => (
                  <option key={d.label} value={i}>{d.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">
              Cancelar
            </button>
            <button
              type="button"
              onClick={commit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4cc] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#19ddd5]"
            >
              <Check className="h-4 w-4" />
              Crear
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="mt-6 flex flex-col gap-3">
        {automations.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/[0.1] bg-[#111] p-6 text-center text-sm text-white/40">
            Sin automatizaciones. Crea una para que las luces reaccionen solas.
          </p>
        )}
        {automations.map((a) => {
          const TIcon = TRIGGER_ICON[a.trigger.type]
          return (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-4 rounded-xl border bg-[#141414] p-4 transition-colors",
                a.enabled ? "border-white/[0.1]" : "border-white/[0.05] opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                  a.enabled ? "border-[#00d4cc]/40 bg-[#00d4cc]/12 text-[#00d4cc]" : "border-white/[0.08] bg-white/[0.02] text-white/35",
                )}
              >
                <TIcon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/85">{a.name}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">
                  {describeTrigger(a.trigger)} · {describeAction(a.action, sceneName)} · {describeDays(a)}
                </p>
              </div>
              <LampSwitch on={a.enabled} onChange={(on) => toggleAutomation(a.id, on)} label={`${a.enabled ? "Desactivar" : "Activar"} ${a.name}`} />
              <button
                type="button"
                onClick={() => deleteAutomation(a.id)}
                aria-label={`Borrar ${a.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.05] hover:text-[#ff4444]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
