import { describe, it, expect } from "vitest"
import { SEED_LIGHTS, SCENES, type Light } from "./lights"
import {
  applySceneToLights,
  setRoom,
  setGroup,
  setMasterLights,
  addLight,
  removeLight,
  newLightId,
} from "./mutations"

const seed = () => SEED_LIGHTS.map((l) => ({ ...l }))

describe("applySceneToLights", () => {
  it("la escena 'apagar' apaga todo", () => {
    const apagar = SCENES.find((s) => s.id === "apagar")!
    const out = applySceneToLights(seed(), apagar)
    expect(out.every((l) => !l.on)).toBe(true)
  })
  it("aplica brillo y temperatura de la escena", () => {
    const cine = SCENES.find((s) => s.id === "cine")!
    const out = applySceneToLights(seed(), cine)
    const living = out.filter((l) => l.room === "living")
    expect(living.every((l) => l.on && l.brightness === 15 && l.temp === 2400)).toBe(true)
  })
})

describe("setRoom / setGroup / setMasterLights", () => {
  it("setRoom afecta solo al ambiente", () => {
    const out = setRoom(seed(), "cocina", true)
    expect(out.filter((l) => l.room === "cocina").every((l) => l.on)).toBe(true)
    expect(out.filter((l) => l.room !== "cocina")).toEqual(seed().filter((l) => l.room !== "cocina"))
  })
  it("setGroup afecta solo a los ids dados", () => {
    const ids = ["living-cenital", "cocina-cenital"]
    const out = setGroup(seed(), ids, true)
    expect(out.filter((l) => ids.includes(l.id)).every((l) => l.on)).toBe(true)
  })
  it("setMasterLights solo cambia las encendidas", () => {
    const out = setMasterLights(seed(), 50)
    for (const l of out) {
      if (l.on) expect(l.brightness).toBe(50)
    }
    const offBefore = seed().filter((l) => !l.on)
    const offAfter = out.filter((l) => !l.on)
    expect(offAfter).toEqual(offBefore)
  })
})

describe("altas y bajas de luces", () => {
  it("newLightId es único", () => {
    const lights = seed()
    const a = newLightId(lights, "Aplique")
    const withA: Light = { ...lights[0], id: a }
    const b = newLightId([...lights, withA], "Aplique")
    expect(a).not.toBe(b)
  })
  it("addLight agrega una y removeLight la quita", () => {
    const base = seed()
    const added = addLight(base, { name: "Aplique nuevo", room: "terraza", kind: "bulb", watts: 20 })
    expect(added.length).toBe(base.length + 1)
    const nueva = added[added.length - 1]
    expect(nueva.room).toBe("terraza")
    expect(nueva.on).toBe(false)
    const removed = removeLight(added, nueva.id)
    expect(removed.length).toBe(base.length)
    expect(removed.find((l) => l.id === nueva.id)).toBeUndefined()
  })
})
