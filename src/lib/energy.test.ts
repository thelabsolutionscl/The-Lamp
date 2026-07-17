import { describe, it, expect } from "vitest"
import { dailyKwh, costClp, formatCLP, seedHistory, pushSample, MAX_SAMPLES } from "./energy"

describe("dailyKwh / costClp", () => {
  it("proyecta kWh diarios", () => {
    expect(dailyKwh(1000)).toBe(24)
    expect(dailyKwh(0)).toBe(0)
  })
  it("calcula el costo", () => {
    expect(costClp(24, 160)).toBe(3840)
  })
})

describe("formatCLP", () => {
  it("formatea pesos sin decimales", () => {
    expect(formatCLP(3840).replace(/[.,]/g, "")).toBe("$3840")
    expect(formatCLP(0)).toBe("$0")
  })
})

describe("historial", () => {
  it("seedHistory llena el máximo y termina en el consumo actual", () => {
    const h = seedHistory(120, 1_000_000)
    expect(h).toHaveLength(MAX_SAMPLES)
    expect(h[h.length - 1].w).toBe(120)
  })
  it("pushSample recorta al máximo", () => {
    const full = seedHistory(100, 1_000_000)
    const next = pushSample(full, 42, 2_000_000)
    expect(next).toHaveLength(MAX_SAMPLES)
    expect(next[next.length - 1]).toEqual({ t: 2_000_000, w: 42 })
  })
})
