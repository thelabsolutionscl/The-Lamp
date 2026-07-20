// Puente genérico HTTP: cada luz puede apuntar a endpoints reales (on/off/
// brillo). La app nunca llama al dispositivo directamente — manda la petición
// a su propio backend (/api/device), que la ejecuta del lado servidor. Así se
// evitan CORS, "mixed content" y exponer secretos en el navegador.
//
// Funciona con cualquier cosa que tenga API HTTP: Shelly, Tasmota, un webhook
// de Home Assistant, Node-RED, IFTTT, o un proxy a la nube Tuya/Hue.

import type { Light } from "@/lib/lights"

export type DeviceConfig = {
  /** URL a llamar para encender. */
  onUrl?: string
  /** URL a llamar para apagar. */
  offUrl?: string
  /** URL para fijar el brillo. Admite el marcador {brightness} (0–100). */
  brightnessUrl?: string
  /** URL para fijar el color RGB. Admite {r} {g} {b} (0–255) y {hex} (rrggbb). */
  colorUrl?: string
  /** Método HTTP (por defecto GET). */
  method?: "GET" | "POST"
  /** Cabecera Authorization opcional (ej: "Bearer xyz"). */
  authHeader?: string
}

export type OutRequest = { url: string; method: string; headers?: Record<string, string>; body?: string }

const KEY = "lamp_devices_v1"

function tmpl(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))
}

/** ¿Esta luz tiene al menos un endpoint configurado? */
export function isConnected(cfg?: DeviceConfig): boolean {
  return !!(cfg && (cfg.onUrl || cfg.offUrl || cfg.brightnessUrl))
}

/**
 * Traduce un cambio de estado de la luz a las peticiones HTTP reales que hay
 * que disparar, según su configuración. Puro: no llama a la red.
 */
export function resolveRequests(cfg: DeviceConfig | undefined, changes: Partial<Light>): OutRequest[] {
  if (!cfg) return []
  const method = cfg.method || "GET"
  const headers = cfg.authHeader ? { Authorization: cfg.authHeader } : undefined
  const out: OutRequest[] = []

  if (changes.on === false && cfg.offUrl) out.push({ url: cfg.offUrl, method, headers })
  else if (changes.on === true && cfg.onUrl) out.push({ url: cfg.onUrl, method, headers })

  if (changes.brightness != null && cfg.brightnessUrl) {
    out.push({ url: tmpl(cfg.brightnessUrl, { brightness: changes.brightness }), method, headers })
  }
  if (changes.color && cfg.colorUrl) {
    const n = parseInt(changes.color.replace("#", ""), 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    out.push({ url: tmpl(cfg.colorUrl, { r, g, b, hex: changes.color.replace("#", "") }), method, headers })
  }
  return out
}

// ── Persistencia (cliente) ───────────────────────────────────────────────────
export function loadDeviceConfigs(): Record<string, DeviceConfig> {
  if (typeof localStorage === "undefined") return {}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, DeviceConfig>) : {}
  } catch {
    return {}
  }
}

export function saveDeviceConfig(id: string, cfg: DeviceConfig) {
  if (typeof localStorage === "undefined") return
  try {
    const all = loadDeviceConfigs()
    all[id] = cfg
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* almacenamiento no disponible */
  }
}
