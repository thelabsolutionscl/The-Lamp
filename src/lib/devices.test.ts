import { describe, it, expect } from "vitest"
import { resolveRequests, isConnected, type DeviceConfig } from "./devices"

const cfg: DeviceConfig = {
  onUrl: "http://dev.local/on",
  offUrl: "http://dev.local/off",
  brightnessUrl: "http://dev.local/set?b={brightness}",
  colorUrl: "http://dev.local/color?r={r}&g={g}&b={b}",
  method: "GET",
  authHeader: "Bearer abc",
}

describe("isConnected", () => {
  it("false sin config o sin URLs", () => {
    expect(isConnected(undefined)).toBe(false)
    expect(isConnected({})).toBe(false)
    expect(isConnected({ onUrl: "http://x" })).toBe(true)
  })
})

describe("resolveRequests", () => {
  it("encender usa onUrl", () => {
    const r = resolveRequests(cfg, { on: true })
    expect(r).toHaveLength(1)
    expect(r[0].url).toBe("http://dev.local/on")
    expect(r[0].headers).toEqual({ Authorization: "Bearer abc" })
  })
  it("apagar usa offUrl", () => {
    expect(resolveRequests(cfg, { on: false })[0].url).toBe("http://dev.local/off")
  })
  it("brillo interpola {brightness}", () => {
    const r = resolveRequests(cfg, { brightness: 42 })
    expect(r[0].url).toBe("http://dev.local/set?b=42")
  })
  it("encender + brillo dispara dos peticiones", () => {
    const r = resolveRequests(cfg, { on: true, brightness: 80 })
    expect(r.map((x) => x.url)).toEqual(["http://dev.local/on", "http://dev.local/set?b=80"])
  })
  it("color interpola {r} {g} {b} desde el hex", () => {
    const r = resolveRequests(cfg, { color: "#ff8800" })
    expect(r[0].url).toBe("http://dev.local/color?r=255&g=136&b=0")
  })
  it("color null no dispara nada", () => {
    expect(resolveRequests(cfg, { color: null })).toEqual([])
  })
  it("sin config → sin peticiones", () => {
    expect(resolveRequests(undefined, { on: true })).toEqual([])
    expect(resolveRequests({}, { on: true })).toEqual([])
  })
})
