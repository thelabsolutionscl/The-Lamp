// LightBridge — la capa que conecta The Lamp con los dispositivos.
//
// La app nunca habla con hardware directamente: siempre pasa por un LightBridge.
// La v0 usa MockBridge (estado en localStorage). Para hardware real hay un
// HomeAssistantBridge; se elige en Ajustes (ver src/lib/config.ts).

import { SEED_LIGHTS, type Light, type LightKind } from "@/lib/lights"
import { loadBridgeConfig } from "@/lib/config"
import { loadDeviceConfigs, resolveRequests } from "@/lib/devices"

export interface LightBridge {
  /** Nombre legible del puente (se muestra en la UI). */
  readonly name: string
  /** Estado inicial de las luces. */
  load(): Promise<Light[]>
  /** Aplica cambios a una luz. En un puente real, envía el comando al dispositivo. */
  apply(id: string, changes: Partial<Light>): Promise<void>
  /** Persiste el snapshot completo. El mock lo usa; los puentes reales lo dejan no-op. */
  persist(lights: Light[]): Promise<void>
  /** Suscripción a cambios en vivo (opcional). Devuelve una función de limpieza. */
  subscribe?(onChange: (lights: Light[]) => void): () => void
}

// ── Utilidades de color ─────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbToHex([r, g, b]: [number, number, number]): string {
  const h = (x: number) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")
  return `#${h(r)}${h(g)}${h(b)}`
}

// ── Mock (v0) ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "lamp_state_v2"

export class MockBridge implements LightBridge {
  readonly name = "Simulado (v0)"

  async load(): Promise<Light[]> {
    if (typeof localStorage === "undefined") return SEED_LIGHTS.map((l) => ({ ...l }))
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return SEED_LIGHTS.map((l) => ({ ...l }))
      const saved = JSON.parse(raw) as Light[]
      // Base = luces guardadas (para conservar altas/bajas del usuario);
      // completa con la semilla las que no tengan estado previo.
      const seedById = new Map(SEED_LIGHTS.map((l) => [l.id, l]))
      const savedIds = new Set(saved.map((l) => l.id))
      const merged = saved.map((s) => {
        const seed = seedById.get(s.id)
        return seed ? { ...seed, ...s } : s
      })
      for (const seed of SEED_LIGHTS) if (!savedIds.has(seed.id)) merged.push({ ...seed })
      return merged
    } catch {
      return SEED_LIGHTS.map((l) => ({ ...l }))
    }
  }

  async apply(): Promise<void> {}

  async persist(lights: Light[]): Promise<void> {
    if (typeof localStorage === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lights))
    } catch {
      /* almacenamiento no disponible */
    }
  }
}

// ── Home Assistant ──────────────────────────────────────────────────────────
// Implementa la misma interfaz contra la API REST + WebSocket de Home Assistant.
// El estado real vive en HA (no se persiste local). El id de cada luz es su
// entity_id; el "ambiente" se deriva del prefijo del entity_id
// (light.living_lampara → living), convención simple y editable.
type HAState = { entity_id: string; state: string; attributes: Record<string, unknown> }

function guessKind(id: string, name: string): LightKind {
  const s = (id + " " + name).toLowerCase()
  if (/(cenital|ceiling|techo|plafon)/.test(s)) return "ceiling"
  if (/(tira|strip|led|guirnalda|barra)/.test(s)) return "strip"
  if (/(pie|floor)/.test(s)) return "floor"
  if (/(velador|flexo|desk|mesa|escritorio|lampara)/.test(s)) return "desk"
  return "bulb"
}

export class HomeAssistantBridge implements LightBridge {
  readonly name = "Home Assistant"
  private headers: Record<string, string>

  constructor(private baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
    this.headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
  }

  private map(s: HAState): Light {
    const a = s.attributes
    const name = (a.friendly_name as string) || s.entity_id.replace(/^light\./, "")
    const modes = (a.supported_color_modes as string[]) || []
    const rgb = a.rgb_color as [number, number, number] | undefined
    const room = s.entity_id.replace(/^light\./, "").split("_")[0] || "casa"
    return {
      id: s.entity_id,
      name,
      room,
      kind: guessKind(s.entity_id, name),
      watts: (a.wattage as number) || 60,
      on: s.state === "on",
      brightness: a.brightness != null ? Math.round((a.brightness as number) / 255 * 100) : 100,
      temp: (a.color_temp_kelvin as number) ?? (a.color_temp ? Math.round(1e6 / (a.color_temp as number)) : 4000),
      supportsColor: modes.some((m) => ["rgb", "rgbw", "rgbww", "hs", "xy"].includes(m)),
      color: rgb ? rgbToHex(rgb) : null,
    }
  }

  async load(): Promise<Light[]> {
    const res = await fetch(`${this.baseUrl}/api/states`, { headers: this.headers })
    if (!res.ok) throw new Error(`Home Assistant respondió ${res.status}`)
    const all = (await res.json()) as HAState[]
    return all.filter((s) => s.entity_id.startsWith("light.")).map((s) => this.map(s))
  }

  async apply(id: string, changes: Partial<Light>): Promise<void> {
    const off = changes.on === false
    const service = off ? "turn_off" : "turn_on"
    const body: Record<string, unknown> = { entity_id: id }
    if (!off) {
      if (changes.brightness !== undefined) body.brightness_pct = changes.brightness
      if (changes.color) body.rgb_color = hexToRgb(changes.color)
      else if (changes.temp !== undefined) body.color_temp_kelvin = changes.temp
    }
    await fetch(`${this.baseUrl}/api/services/light/${service}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    })
  }

  async persist(): Promise<void> {}

  // Estado en vivo por WebSocket: al cambiar cualquier light.*, recarga y avisa.
  subscribe(onChange: (lights: Light[]) => void): () => void {
    let ws: WebSocket | null = null
    let closed = false
    let debounce: ReturnType<typeof setTimeout> | null = null
    const token = this.headers.Authorization.replace("Bearer ", "")
    try {
      const wsUrl = this.baseUrl.replace(/^http/, "ws") + "/api/websocket"
      ws = new WebSocket(wsUrl)
      let idSeq = 1
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data)
        if (msg.type === "auth_required") ws?.send(JSON.stringify({ type: "auth", access_token: token }))
        else if (msg.type === "auth_ok") ws?.send(JSON.stringify({ id: idSeq++, type: "subscribe_events", event_type: "state_changed" }))
        else if (msg.type === "event" && msg.event?.data?.entity_id?.startsWith?.("light.")) {
          if (debounce) clearTimeout(debounce)
          debounce = setTimeout(() => this.load().then(onChange).catch(() => {}), 250)
        }
      }
    } catch {
      /* si el WS falla, la app sigue con el estado cargado */
    }
    return () => {
      closed = true
      if (debounce) clearTimeout(debounce)
      if (ws && !closed) ws.close()
      ws?.close()
    }
  }
}

// ── Genérico (HTTP / Webhook) ────────────────────────────────────────────────
// Estado local (como el mock) + dispara peticiones reales al backend por cada
// cambio, según los endpoints configurados por luz (ver src/lib/devices.ts).
export class WebhookBridge implements LightBridge {
  readonly name = "Genérico (HTTP)"
  private mock = new MockBridge()

  load(): Promise<Light[]> {
    return this.mock.load()
  }
  persist(lights: Light[]): Promise<void> {
    return this.mock.persist(lights)
  }
  async apply(id: string, changes: Partial<Light>): Promise<void> {
    const cfg = loadDeviceConfigs()[id]
    const requests = resolveRequests(cfg, changes)
    if (requests.length === 0) return
    try {
      await fetch("/api/device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
      })
    } catch {
      /* el backend no respondió; el estado local ya cambió */
    }
  }
}

// ── Selección del puente ─────────────────────────────────────────────────────
let bridge: LightBridge | null = null

export function getBridge(): LightBridge {
  if (bridge) return bridge
  const cfg = loadBridgeConfig()
  if (cfg.kind === "homeassistant" && cfg.haUrl && cfg.haToken) {
    bridge = new HomeAssistantBridge(cfg.haUrl, cfg.haToken)
  } else if (cfg.kind === "webhook") {
    bridge = new WebhookBridge()
  } else {
    bridge = new MockBridge()
  }
  return bridge
}

/** Fuerza recrear el puente (tras cambiar la config en Ajustes). */
export function resetBridge() {
  bridge = null
}
