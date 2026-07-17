import { describe, it, expect } from "vitest"
import {
  SEED_LIGHTS,
  estimatedWatts,
  groupsByKind,
  kelvinToHex,
  lightGlowColor,
  type Light,
} from "./lights"

const mk = (over: Partial<Light>): Light => ({
  id: "x",
  name: "x",
  room: "living",
  kind: "bulb",
  watts: 100,
  on: true,
  brightness: 100,
  temp: 4000,
  ...over,
})

describe("estimatedWatts", () => {
  it("es 0 con todo apagado", () => {
    expect(estimatedWatts(SEED_LIGHTS.map((l) => ({ ...l, on: false })))).toBe(0)
  })
  it("pondera por intensidad", () => {
    expect(estimatedWatts([mk({ watts: 100, on: true, brightness: 50 })])).toBe(50)
    expect(estimatedWatts([mk({ watts: 60, on: true, brightness: 100 })])).toBe(60)
  })
  it("ignora las apagadas", () => {
    expect(estimatedWatts([mk({ watts: 100, on: false, brightness: 100 })])).toBe(0)
  })
})

describe("groupsByKind", () => {
  it("cubre todas las luces sin duplicar", () => {
    const groups = groupsByKind(SEED_LIGHTS)
    const total = groups.reduce((n, g) => n + g.ids.length, 0)
    expect(total).toBe(SEED_LIGHTS.length)
    const all = new Set(groups.flatMap((g) => g.ids))
    expect(all.size).toBe(SEED_LIGHTS.length)
  })
})

describe("kelvinToHex", () => {
  it("devuelve hex válido", () => {
    expect(kelvinToHex(4000)).toMatch(/^#[0-9a-f]{6}$/i)
  })
  it("cálido tiene más rojo que azul; frío al revés", () => {
    const warm = kelvinToHex(2200)
    const cool = kelvinToHex(6500)
    const r = (h: string) => parseInt(h.slice(1, 3), 16)
    const b = (h: string) => parseInt(h.slice(5, 7), 16)
    expect(r(warm)).toBeGreaterThan(b(warm))
    expect(b(cool)).toBeGreaterThanOrEqual(r(cool) - 20)
  })
})

describe("lightGlowColor", () => {
  it("usa el RGB en modo color", () => {
    expect(lightGlowColor(mk({ supportsColor: true, color: "#ff0000" }))).toBe("#ff0000")
  })
  it("usa la temperatura si no hay color", () => {
    expect(lightGlowColor(mk({ temp: 3000, color: null }))).toBe(kelvinToHex(3000))
  })
})
