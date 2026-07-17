import { describe, it, expect } from "vitest"
import { sunTimesUTC, sunEvents, SANTIAGO } from "./sun"

describe("sunTimesUTC", () => {
  it("amanecer antes que atardecer, en Santiago", () => {
    const { sunriseMin, sunsetMin } = sunTimesUTC(new Date("2026-03-21T12:00:00Z"), SANTIAGO.lat, SANTIAGO.lon)
    expect(sunriseMin).toBeLessThan(sunsetMin)
  })
  it("duración del día plausible (8–16 h) en equinoccio", () => {
    const { sunriseMin, sunsetMin } = sunTimesUTC(new Date("2026-03-21T12:00:00Z"), SANTIAGO.lat, SANTIAGO.lon)
    const hours = (sunsetMin - sunriseMin) / 60
    expect(hours).toBeGreaterThan(11)
    expect(hours).toBeLessThan(13) // en equinoccio ~12 h
  })
})

describe("sunEvents casos polares", () => {
  it("noche polar → sin amanecer/atardecer", () => {
    // Muy al norte, en pleno invierno boreal: el sol no sale.
    const { sunrise, sunset } = sunEvents(new Date("2026-12-21T12:00:00Z"), 85, 0)
    expect(sunrise).toBeNull()
    expect(sunset).toBeNull()
  })
})
