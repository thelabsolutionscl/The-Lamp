// Modelo de datos de The Lamp: ambientes, luces y escenas.
// v0 sin backend: el estado vive en el cliente (localStorage) con esta semilla.
// Cuando exista un puente real (Home Assistant, Tuya, Hue, etc.) este módulo
// es el único punto a reemplazar.

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
}

export type Room = {
  id: string
  name: string
}

export type Scene = {
  id: string
  name: string
  desc: string
  /** Ajuste por ambiente: apagado, o encendido con una intensidad dada. */
  settings: Record<string, { on: boolean; brightness?: number }>
}

export const ROOMS: Room[] = [
  { id: "living", name: "Living" },
  { id: "cocina", name: "Cocina" },
  { id: "dormitorio", name: "Dormitorio" },
  { id: "escritorio", name: "Escritorio" },
  { id: "terraza", name: "Terraza" },
]

export const SEED_LIGHTS: Light[] = [
  { id: "living-cenital", name: "Cenital living", room: "living", kind: "ceiling", watts: 60, on: true, brightness: 80 },
  { id: "living-pie", name: "Lámpara de pie", room: "living", kind: "floor", watts: 40, on: true, brightness: 55 },
  { id: "living-rack", name: "Tira LED rack", room: "living", kind: "strip", watts: 18, on: false, brightness: 40 },
  { id: "cocina-cenital", name: "Cenital cocina", room: "cocina", kind: "ceiling", watts: 60, on: false, brightness: 100 },
  { id: "cocina-meson", name: "Barra del mesón", room: "cocina", kind: "strip", watts: 24, on: true, brightness: 70 },
  { id: "dorm-cenital", name: "Cenital dormitorio", room: "dormitorio", kind: "ceiling", watts: 45, on: false, brightness: 60 },
  { id: "dorm-velador-i", name: "Velador izquierdo", room: "dormitorio", kind: "desk", watts: 12, on: false, brightness: 30 },
  { id: "dorm-velador-d", name: "Velador derecho", room: "dormitorio", kind: "desk", watts: 12, on: false, brightness: 30 },
  { id: "escr-flexo", name: "Flexo escritorio", room: "escritorio", kind: "desk", watts: 15, on: true, brightness: 90 },
  { id: "escr-cenital", name: "Cenital escritorio", room: "escritorio", kind: "ceiling", watts: 45, on: false, brightness: 70 },
  { id: "terr-aplique", name: "Aplique muro", room: "terraza", kind: "bulb", watts: 20, on: false, brightness: 50 },
  { id: "terr-guirnalda", name: "Guirnalda", room: "terraza", kind: "strip", watts: 15, on: false, brightness: 60 },
]

export const SCENES: Scene[] = [
  {
    id: "todo",
    name: "Todo encendido",
    desc: "Todas las luces al 100%",
    settings: {
      living: { on: true, brightness: 100 },
      cocina: { on: true, brightness: 100 },
      dormitorio: { on: true, brightness: 100 },
      escritorio: { on: true, brightness: 100 },
      terraza: { on: true, brightness: 100 },
    },
  },
  {
    id: "trabajo",
    name: "Concentración",
    desc: "Escritorio a full, el resto tenue",
    settings: {
      escritorio: { on: true, brightness: 95 },
      living: { on: true, brightness: 35 },
      cocina: { on: true, brightness: 50 },
      dormitorio: { on: false },
      terraza: { on: false },
    },
  },
  {
    id: "cine",
    name: "Cine",
    desc: "Living al 15%, el resto apagado",
    settings: {
      living: { on: true, brightness: 15 },
      cocina: { on: false },
      dormitorio: { on: false },
      escritorio: { on: false },
      terraza: { on: false },
    },
  },
  {
    id: "noche",
    name: "Noche",
    desc: "Solo veladores al 20%",
    settings: {
      living: { on: false },
      cocina: { on: false },
      dormitorio: { on: true, brightness: 20 },
      escritorio: { on: false },
      terraza: { on: false },
    },
  },
  {
    id: "apagar",
    name: "Apagar todo",
    desc: "Buenas noches",
    settings: {
      living: { on: false },
      cocina: { on: false },
      dormitorio: { on: false },
      escritorio: { on: false },
      terraza: { on: false },
    },
  },
]

/** Consumo instantáneo estimado en watts (potencia × intensidad). */
export function estimatedWatts(lights: Light[]): number {
  return Math.round(
    lights.reduce((sum, l) => sum + (l.on ? (l.watts * l.brightness) / 100 : 0), 0),
  )
}
