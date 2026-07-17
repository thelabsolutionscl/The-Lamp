// LightBridge — la capa que conecta The Lamp con los dispositivos.
//
// La app nunca habla con hardware directamente: siempre pasa por un LightBridge.
// La v0 usa MockBridge (estado en localStorage). Para producción se implementa
// esta misma interfaz contra un puente real (Home Assistant, Hue, Tuya…) y el
// resto de la app no cambia.

import { SEED_LIGHTS, type Light } from "@/lib/lights"

export interface LightBridge {
  /** Nombre legible del puente (se muestra en la UI). */
  readonly name: string
  /** Estado inicial de las luces. */
  load(): Promise<Light[]>
  /** Aplica cambios a una luz. En un puente real, envía el comando al dispositivo. */
  apply(id: string, changes: Partial<Light>): Promise<void>
  /** Persiste el snapshot completo. Conveniencia del mock; los puentes reales
   *  pueden dejarlo como no-op y confiar en apply(). */
  persist(lights: Light[]): Promise<void>
}

const STORAGE_KEY = "lamp_state_v2"

/** Puente simulado: mantiene el estado en localStorage, reconciliado con la semilla. */
export class MockBridge implements LightBridge {
  readonly name = "Simulado (v0)"

  async load(): Promise<Light[]> {
    if (typeof localStorage === "undefined") return SEED_LIGHTS.map((l) => ({ ...l }))
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return SEED_LIGHTS.map((l) => ({ ...l }))
      const saved = JSON.parse(raw) as Light[]
      // Sobreviven los ids conocidos con su estado guardado; entran los nuevos.
      return SEED_LIGHTS.map((seed) => {
        const s = saved.find((l) => l.id === seed.id)
        return s
          ? {
              ...seed,
              on: s.on,
              brightness: s.brightness,
              temp: s.temp ?? seed.temp,
              color: s.color ?? seed.color ?? null,
            }
          : { ...seed }
      })
    } catch {
      return SEED_LIGHTS.map((l) => ({ ...l }))
    }
  }

  // El mock no tiene dispositivos: el estado vive en el snapshot que persist()
  // guarda, así que apply() no necesita hacer nada por su cuenta.
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

// ── Puentes reales (esqueletos para cuando se conecte hardware) ──────────────
//
// Implementar cualquiera de estos y cambiar getBridge() para activarlo.
//
// class HomeAssistantBridge implements LightBridge {
//   readonly name = "Home Assistant"
//   constructor(private baseUrl: string, private token: string) {}
//   async load() {
//     const res = await fetch(`${this.baseUrl}/api/states`, {
//       headers: { Authorization: `Bearer ${this.token}` },
//     })
//     // mapear entidades light.* → Light[]
//     return [] as Light[]
//   }
//   async apply(id, changes) {
//     const service = changes.on ? "turn_on" : "turn_off"
//     await fetch(`${this.baseUrl}/api/services/light/${service}`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${this.token}` },
//       body: JSON.stringify({
//         entity_id: id,
//         brightness_pct: changes.brightness,
//         color_temp_kelvin: changes.temp,
//         rgb_color: changes.color ? hexToRgb(changes.color) : undefined,
//       }),
//     })
//   }
//   async persist() {} // el estado real vive en HA; no se persiste local
//   // Además: abrir un WebSocket a /api/websocket para recibir cambios en vivo.
// }
//
// class HueBridge implements LightBridge { /* CLIP v2 sobre el puente local */ }
// class TuyaBridge implements LightBridge { /* Tuya Cloud API */ }

let bridge: LightBridge | null = null

/** Punto único de selección del puente. Cambiar aquí para enchufar hardware. */
export function getBridge(): LightBridge {
  if (!bridge) bridge = new MockBridge()
  return bridge
}
