// Transformaciones puras sobre el arreglo de luces. Separadas del store para
// poder testearlas sin React.

import type { Light, LightKind, Scene, SceneSetting } from "@/lib/lights"

export function applySceneToLights(lights: Light[], scene: Scene): Light[] {
  return lights.map((l) => {
    const s: SceneSetting | undefined = scene.settings[l.room]
    if (!s) return l
    return {
      ...l,
      on: s.on,
      brightness: s.on && s.brightness !== undefined ? s.brightness : l.brightness,
      temp: s.on && s.temp !== undefined ? s.temp : l.temp,
    }
  })
}

export const setRoom = (lights: Light[], roomId: string, on: boolean): Light[] =>
  lights.map((l) => (l.room === roomId ? { ...l, on } : l))

export const setGroup = (lights: Light[], ids: string[], on: boolean): Light[] =>
  lights.map((l) => (ids.includes(l.id) ? { ...l, on } : l))

export const setMasterLights = (lights: Light[], pct: number): Light[] =>
  lights.map((l) => (l.on ? { ...l, brightness: pct } : l))

export const patchLight = (lights: Light[], id: string, changes: Partial<Light>): Light[] =>
  lights.map((l) => (l.id === id ? { ...l, ...changes } : l))

export const removeLight = (lights: Light[], id: string): Light[] =>
  lights.filter((l) => l.id !== id)

/** Deriva un id estable y único para una luz nueva a partir de su nombre. */
export function newLightId(existing: Light[], name: string): string {
  const base = "luz-" + (name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "nueva")
  let id = base
  let i = 2
  while (existing.some((l) => l.id === id)) id = `${base}-${i++}`
  return id
}

export function addLight(
  lights: Light[],
  data: { name: string; room: string; kind: LightKind; watts: number },
): Light[] {
  const light: Light = {
    id: newLightId(lights, data.name),
    name: data.name,
    room: data.room,
    kind: data.kind,
    watts: data.watts,
    on: false,
    brightness: 70,
    temp: 4000,
    supportsColor: data.kind === "strip" || data.kind === "bulb",
    color: null,
  }
  return [...lights, light]
}
