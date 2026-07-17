import { describe, it, expect } from "vitest"
import {
  DEFAULT_SUN,
  triggerFireMinute,
  minutesOfDay,
  isDue,
  describeDays,
  type Automation,
} from "./automations"

const auto = (over: Partial<Automation>): Automation => ({
  id: "a",
  name: "a",
  trigger: { type: "time", time: "09:00" },
  action: { type: "allOff" },
  days: [],
  enabled: true,
  ...over,
})

describe("triggerFireMinute", () => {
  it("hora fija", () => {
    expect(triggerFireMinute({ type: "time", time: "09:00" })).toBe(540)
    expect(triggerFireMinute({ type: "time", time: "23:30" })).toBe(1410)
  })
  it("atardecer/amanecer con offset", () => {
    expect(triggerFireMinute({ type: "sunset" })).toBe(DEFAULT_SUN.sunsetMin)
    expect(triggerFireMinute({ type: "sunset", offsetMin: -15 })).toBe(DEFAULT_SUN.sunsetMin - 15)
    expect(triggerFireMinute({ type: "sunrise", offsetMin: 30 })).toBe(DEFAULT_SUN.sunriseMin + 30)
  })
})

describe("minutesOfDay", () => {
  it("convierte hora:min", () => {
    expect(minutesOfDay(new Date(2026, 0, 5, 9, 0, 0))).toBe(540)
  })
})

describe("isDue", () => {
  const monday9 = new Date(2026, 0, 5, 9, 0, 0) // lunes
  const sunday9 = new Date(2026, 0, 4, 9, 0, 0) // domingo

  it("dispara cuando coincide hora y día", () => {
    expect(isDue(auto({}), monday9)).toBe(true)
  })
  it("no dispara si está deshabilitada", () => {
    expect(isDue(auto({ enabled: false }), monday9)).toBe(false)
  })
  it("no dispara fuera del minuto", () => {
    expect(isDue(auto({}), new Date(2026, 0, 5, 9, 1, 0))).toBe(false)
  })
  it("respeta los días de la semana", () => {
    const weekday = auto({ days: [1, 2, 3, 4, 5] })
    expect(isDue(weekday, monday9)).toBe(true)
    expect(isDue(weekday, sunday9)).toBe(false)
  })
})

describe("describeDays", () => {
  it("presets legibles", () => {
    expect(describeDays(auto({ days: [] }))).toBe("Todos los días")
    expect(describeDays(auto({ days: [1, 2, 3, 4, 5] }))).toBe("Días de semana")
    expect(describeDays(auto({ days: [0, 6] }))).toBe("Fin de semana")
  })
})
