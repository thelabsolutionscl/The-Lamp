// Modelo de datos de The Lamp: ambientes, luces y escenas.
// El estado real lo maneja el store (src/components/app/lights-store.tsx) a
// través de un LightBridge (src/lib/bridge.ts). Aquí viven el modelo, la
// semilla y helpers puros (consumo, temperatura de color, grupos).

export type LightKind = "ceiling" | "desk" | "floor" | "strip" | "bulb"

export type Light = {
  id: string
  name: string
  room: string
  kind: LightKind
  /** Potencia nominal en watts, para el consumo estimado. */
  watts: number
  on: boolean
  /** Intensidad 0–100. */
  brightness: number
  /** Temperatura de color en Kelvin (cálida ↔ fría). */
  temp: number
  /** Si la luz admite color RGB (ampolleta smart). */
  supportsColor?: boolean
  /** Color RGB activo (hex) cuando la luz está en modo color; null = blanco. */
  color?: string | null
}

export type Room = {
  id: string
  name: string
}

/** Ajuste de una escena por ambiente. */
export type SceneSetting = { on: boolean; brightness?: number; temp?: number }

export type Scene = {
  id: string
  name: string
  desc: string
  /** true = escena creada por el usuario (se puede borrar). */
  custom?: boolean
  settings: Record<string, SceneSetting>
}

// ── Temperatura de color ──────────────────────────────────────────────────
export const TEMP_MIN = 2200 // cálida (ámbar)
export const TEMP_MAX = 6500 // fría (blanco azulado)

export const ROOMS: Room[] = [
  { id: "living", name: "Living" },
  { id: "cocina", name: "Cocina" },
  { id: "dormitorio", name: "Dormitorio" },
  { id: "escritorio", name: "Escritorio" },
  { id: "terraza", name: "Terraza" },
]

export const KIND_LABEL: Record<LightKind, string> = {
  ceiling: "Cenital",
  desk: "Sobremesa",
  floor: "De pie",
  strip: "Tira LED",
  bulb: "Ampolleta",
}

export const SEED_LIGHTS: Light[] = [
  { id: "living-cenital", name: "Cenital living", room: "living", kind: "ceiling", watts: 60, on: true, brightness: 80, temp: 3200 },
  { id: "living-pie", name: "Lámpara de pie", room: "living", kind: "floor", watts: 40, on: true, brightness: 55, temp: 2700 },
  { id: "living-rack", name: "Tira LED rack", room: "living", kind: "strip", watts: 18, on: false, brightness: 40, temp: 4000, supportsColor: true, color: null },
  { id: "cocina-cenital", name: "Cenital cocina", room: "cocina", kind: "ceiling", watts: 60, on: false, brightness: 100, temp: 4500 },
  { id: "cocina-meson", name: "Barra del mesón", room: "cocina", kind: "strip", watts: 24, on: true, brightness: 70, temp: 5000, supportsColor: true, color: null },
  { id: "dorm-cenital", name: "Cenital dormitorio", room: "dormitorio", kind: "ceiling", watts: 45, on: false, brightness: 60, temp: 3000 },
  { id: "dorm-velador-i", name: "Velador izquierdo", room: "dormitorio", kind: "desk", watts: 12, on: false, brightness: 30, temp: 2400 },
  { id: "dorm-velador-d", name: "Velador derecho", room: "dormitorio", kind: "desk", watts: 12, on: false, brightness: 30, temp: 2400 },
  { id: "escr-flexo", name: "Flexo escritorio", room: "escritorio", kind: "desk", watts: 15, on: true, brightness: 90, temp: 4800 },
  { id: "escr-cenital", name: "Cenital escritorio", room: "escritorio", kind: "ceiling", watts: 45, on: false, brightness: 70, temp: 4000 },
  { id: "terr-aplique", name: "Aplique muro", room: "terraza", kind: "bulb", watts: 20, on: false, brightness: 50, temp: 2700 },
  { id: "terr-guirnalda", name: "Guirnalda", room: "terraza", kind: "strip", watts: 15, on: false, brightness: 60, temp: 2500, supportsColor: true, color: null },
]

export const SCENES: Scene[] = [
  {
    id: "todo",
    name: "Todo encendido",
    desc: "Todas las luces al 100%",
    settings: Object.fromEntries(ROOMS.map((r) => [r.id, { on: true, brightness: 100 }])),
  },
  {
    id: "trabajo",
    name: "Concentración",
    desc: "Escritorio a full y frío, resto tenue",
    settings: {
      escritorio: { on: true, brightness: 95, temp: 5200 },
      living: { on: true, brightness: 35, temp: 3200 },
      cocina: { on: true, brightness: 50, temp: 4500 },
      dormitorio: { on: false },
      terraza: { on: false },
    },
  },
  {
    id: "cine",
    name: "Cine",
    desc: "Living al 15% y cálido",
    settings: {
      living: { on: true, brightness: 15, temp: 2400 },
      cocina: { on: false },
      dormitorio: { on: false },
      escritorio: { on: false },
      terraza: { on: false },
    },
  },
  {
    id: "noche",
    name: "Noche",
    desc: "Solo veladores al 20% muy cálidos",
    settings: {
      living: { on: false },
      cocina: { on: false },
      dormitorio: { on: true, brightness: 20, temp: 2200 },
      escritorio: { on: false },
      terraza: { on: false },
    },
  },
  {
    id: "apagar",
    name: "Apagar todo",
    desc: "Buenas noches",
    settings: Object.fromEntries(ROOMS.map((r) => [r.id, { on: false }])),
  },
]

/** Consumo instantáneo estimado en watts (potencia × intensidad). */
export function estimatedWatts(lights: Light[]): number {
  return Math.round(
    lights.reduce((sum, l) => sum + (l.on ? (l.watts * l.brightness) / 100 : 0), 0),
  )
}

/** Grupos transversales por tipo de luz (p. ej. "todas las cenitales"). */
export function groupsByKind(lights: Light[]): { kind: LightKind; label: string; ids: string[] }[] {
  const order: LightKind[] = ["ceiling", "desk", "floor", "strip", "bulb"]
  return order
    .map((kind) => ({
      kind,
      label: KIND_LABEL[kind],
      ids: lights.filter((l) => l.kind === kind).map((l) => l.id),
    }))
    .filter((g) => g.ids.length > 0)
}

/**
 * Aproximación de temperatura de color (Kelvin) a hex (algoritmo de Tanner
 * Helland, simplificado). Se usa para el degradado del slider y el tinte del
 * glow/ícono de cada luz. Cálida = ámbar; fría = blanco azulado.
 */
export function kelvinToHex(kelvin: number): string {
  const t = Math.max(1000, Math.min(40000, kelvin)) / 100
  let r: number, g: number, b: number

  if (t <= 66) {
    r = 255
    g = 99.4708025861 * Math.log(t) - 161.1195681661
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592)
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  }
  if (t >= 66) {
    b = 255
  } else if (t <= 19) {
    b = 0
  } else {
    b = 138.5177312231 * Math.log(t - 10) - 305.0447927307
  }

  const clamp = (x: number) => Math.round(Math.max(0, Math.min(255, x)))
  const hex = (x: number) => clamp(x).toString(16).padStart(2, "0")
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

/** Color efectivo con el que "emite" una luz: su RGB si está en modo color, si
 *  no el tinte de su temperatura de color. */
export function lightGlowColor(light: Light): string {
  if (light.supportsColor && light.color) return light.color
  return kelvinToHex(light.temp)
}
