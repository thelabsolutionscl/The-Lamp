// Configuración del puente elegido (persistida en localStorage). La usa
// getBridge() para decidir contra qué hablar, y el panel de Ajustes para
// editarla.

export type BridgeKind = "mock" | "homeassistant" | "webhook"

export type BridgeConfig = {
  kind: BridgeKind
  haUrl?: string
  haToken?: string
}

const KEY = "lamp_bridge_cfg_v1"

export function loadBridgeConfig(): BridgeConfig {
  if (typeof localStorage === "undefined") return { kind: "mock" }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const c = JSON.parse(raw) as BridgeConfig
      if (c && (c.kind === "mock" || c.kind === "homeassistant" || c.kind === "webhook")) return c
    }
  } catch {
    /* ignora */
  }
  return { kind: "mock" }
}

export function saveBridgeConfig(cfg: BridgeConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg))
  } catch {
    /* almacenamiento no disponible */
  }
}
