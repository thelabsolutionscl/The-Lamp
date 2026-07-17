// Consumo y costo. El consumo instantáneo sale de estimatedWatts(); aquí se
// acumula un histórico (para el sparkline) y se estima kWh y costo en CLP.

export type EnergySample = { t: number; w: number }

/** Tarifa eléctrica de referencia (CLP por kWh). Ajustable por el usuario. */
export const DEFAULT_TARIFF_CLP = 160

/** Máximo de puntos que guarda el histórico (sparkline). */
export const MAX_SAMPLES = 48

/** Genera un histórico plausible terminando en el consumo actual, para que el
 *  sparkline no arranque vacío. Curva suave con algo de ruido. */
export function seedHistory(currentW: number, now = Date.now(), stepMs = 15 * 60 * 1000): EnergySample[] {
  const out: EnergySample[] = []
  for (let i = MAX_SAMPLES - 1; i >= 0; i--) {
    const phase = (MAX_SAMPLES - i) / MAX_SAMPLES
    // Onda diurna suave + ruido determinista-ish (sin depender de nada externo).
    const wave = 0.55 + 0.45 * Math.sin(phase * Math.PI * 1.5)
    const noise = 0.9 + 0.2 * Math.sin(i * 2.399963)
    const base = i === 0 ? currentW : Math.max(0, Math.round(currentW * wave * noise))
    out.push({ t: now - i * stepMs, w: base })
  }
  return out
}

/** Añade una muestra y recorta al máximo de puntos. */
export function pushSample(history: EnergySample[], w: number, now = Date.now()): EnergySample[] {
  return [...history, { t: now, w }].slice(-MAX_SAMPLES)
}

/** Proyección de energía diaria (kWh) si el consumo actual se mantuviera. */
export function dailyKwh(currentW: number): number {
  return (currentW * 24) / 1000
}

/** Costo en CLP para una cantidad de kWh. */
export function costClp(kwh: number, tariff = DEFAULT_TARIFF_CLP): number {
  return Math.round(kwh * tariff)
}

/** Formato de pesos chilenos: $1.234 (sin decimales, separador de miles). */
export function formatCLP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL")
}
