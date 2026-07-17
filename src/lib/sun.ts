// Cálculo de amanecer/atardecer por fecha y ubicación (algoritmo de la
// "sunrise equation", el mismo núcleo que SunCalc). Reemplaza las horas fijas
// de las automatizaciones solares.

export const SANTIAGO = { lat: -33.4489, lon: -70.6693 }

const rad = Math.PI / 180
const dayMs = 86400000
const J1970 = 2440588
const J2000 = 2451545
const e = rad * 23.4397 // oblicuidad de la eclíptica

const toJulian = (d: Date) => d.valueOf() / dayMs - 0.5 + J1970
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * dayMs)
const toDays = (d: Date) => toJulian(d) - J2000

const solarMeanAnomaly = (d: number) => rad * (357.5291 + 0.98560028 * d)
const eclipticLongitude = (M: number) => {
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  const P = rad * 102.9372
  return M + C + P + Math.PI
}
const declination = (l: number) => Math.asin(Math.sin(l) * Math.sin(e))
const julianCycle = (d: number, lw: number) => Math.round(d - 0.0009 - lw / (2 * Math.PI))
const approxTransit = (Ht: number, lw: number, n: number) => 0.0009 + (Ht + lw) / (2 * Math.PI) + n
const solarTransitJ = (ds: number, M: number, L: number) =>
  J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L)

/** Devuelve las horas de salida/puesta del sol como Date (UTC interno). */
export function sunEvents(date: Date, lat: number, lon: number): { sunrise: Date | null; sunset: Date | null } {
  const lw = rad * -lon
  const phi = rad * lat
  const d = toDays(date)
  const n = julianCycle(d, lw)
  const ds = approxTransit(0, lw, n)
  const M = solarMeanAnomaly(ds)
  const L = eclipticLongitude(M)
  const dec = declination(L)
  const Jnoon = solarTransitJ(ds, M, L)
  const h0 = -0.833 * rad
  const cosArg = (Math.sin(h0) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec))
  if (cosArg < -1 || cosArg > 1) return { sunrise: null, sunset: null } // sol de medianoche / noche polar
  const w0 = Math.acos(cosArg)
  const a = approxTransit(w0, lw, n)
  const Jset = solarTransitJ(a, M, L)
  const Jrise = Jnoon - (Jset - Jnoon)
  return { sunrise: fromJulian(Jrise), sunset: fromJulian(Jset) }
}

const localMin = (d: Date) => d.getHours() * 60 + d.getMinutes()
const utcMin = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes()

/** Minutos locales (según la zona del navegador) de amanecer y atardecer. */
export function sunTimesLocal(
  date: Date,
  lat = SANTIAGO.lat,
  lon = SANTIAGO.lon,
): { sunriseMin: number; sunsetMin: number } {
  const { sunrise, sunset } = sunEvents(date, lat, lon)
  return {
    sunriseMin: sunrise ? localMin(sunrise) : 7 * 60 + 30,
    sunsetMin: sunset ? localMin(sunset) : 20 * 60,
  }
}

/** Igual que sunTimesLocal pero en minutos UTC (determinista, para tests). */
export function sunTimesUTC(
  date: Date,
  lat = SANTIAGO.lat,
  lon = SANTIAGO.lon,
): { sunriseMin: number; sunsetMin: number } {
  const { sunrise, sunset } = sunEvents(date, lat, lon)
  return {
    sunriseMin: sunrise ? utcMin(sunrise) : 7 * 60 + 30,
    sunsetMin: sunset ? utcMin(sunset) : 20 * 60,
  }
}
