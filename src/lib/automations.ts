// Automatizaciones: disparan escenas o cambios de ambiente por hora o por el
// ciclo solar. El scheduler vive en el store (un intervalo en el cliente que
// consulta isDue()). Aquí, modelo puro + helpers testeables.

export type AutomationTrigger =
  | { type: "time"; time: string } // "HH:MM"
  | { type: "sunset"; offsetMin?: number }
  | { type: "sunrise"; offsetMin?: number }

export type AutomationAction =
  | { type: "scene"; sceneId: string }
  | { type: "room"; roomId: string; on: boolean }
  | { type: "allOff" }

export type Automation = {
  id: string
  name: string
  trigger: AutomationTrigger
  action: AutomationAction
  /** Días activos 0–6 (dom→sáb). Vacío = todos los días. */
  days: number[]
  enabled: boolean
}

/** Horas aproximadas de amanecer/atardecer (min desde medianoche). v0: fijas
 *  para Santiago; un puente real las calcularía por fecha/ubicación. */
export type SunTimes = { sunriseMin: number; sunsetMin: number }
export const DEFAULT_SUN: SunTimes = { sunriseMin: 7 * 60 + 30, sunsetMin: 20 * 60 }

export const SEED_AUTOMATIONS: Automation[] = [
  {
    id: "auto-atardecer",
    name: "Encender living al atardecer",
    trigger: { type: "sunset", offsetMin: -15 },
    action: { type: "room", roomId: "living", on: true },
    days: [],
    enabled: true,
  },
  {
    id: "auto-trabajo",
    name: "Concentración en la semana",
    trigger: { type: "time", time: "09:00" },
    action: { type: "scene", sceneId: "trabajo" },
    days: [1, 2, 3, 4, 5],
    enabled: true,
  },
  {
    id: "auto-noche",
    name: "Modo Noche",
    trigger: { type: "time", time: "23:30" },
    action: { type: "scene", sceneId: "noche" },
    days: [],
    enabled: true,
  },
  {
    id: "auto-apagar",
    name: "Apagar todo de madrugada",
    trigger: { type: "time", time: "01:00" },
    action: { type: "allOff" },
    days: [],
    enabled: false,
  },
]

const DAY_LABELS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function fmtMinutes(min: number): string {
  const m = ((min % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

/** Minuto del día en que dispara el trigger. */
export function triggerFireMinute(trigger: AutomationTrigger, sun: SunTimes = DEFAULT_SUN): number {
  switch (trigger.type) {
    case "time": {
      const [h, m] = trigger.time.split(":").map(Number)
      return h * 60 + m
    }
    case "sunset":
      return sun.sunsetMin + (trigger.offsetMin ?? 0)
    case "sunrise":
      return sun.sunriseMin + (trigger.offsetMin ?? 0)
  }
}

export function dayMatches(a: Automation, date: Date): boolean {
  return a.days.length === 0 || a.days.includes(date.getDay())
}

/** ¿La automatización debe dispararse en este instante (resolución de 1 min)? */
export function isDue(a: Automation, date: Date, sun: SunTimes = DEFAULT_SUN): boolean {
  if (!a.enabled) return false
  if (!dayMatches(a, date)) return false
  return minutesOfDay(date) === triggerFireMinute(a.trigger, sun)
}

export function describeTrigger(trigger: AutomationTrigger, sun: SunTimes = DEFAULT_SUN): string {
  switch (trigger.type) {
    case "time":
      return trigger.time
    case "sunset":
      return `Atardecer (${fmtMinutes(triggerFireMinute(trigger, sun))})`
    case "sunrise":
      return `Amanecer (${fmtMinutes(triggerFireMinute(trigger, sun))})`
  }
}

export function describeDays(a: Automation): string {
  if (a.days.length === 0) return "Todos los días"
  if (a.days.length === 5 && [1, 2, 3, 4, 5].every((d) => a.days.includes(d))) return "Días de semana"
  if (a.days.length === 2 && a.days.includes(0) && a.days.includes(6)) return "Fin de semana"
  return a.days.map((d) => DAY_LABELS[d]).join(" · ")
}
