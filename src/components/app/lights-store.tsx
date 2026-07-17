"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  SEED_LIGHTS,
  SCENES,
  estimatedWatts,
  type Light,
  type Scene,
  type SceneSetting,
} from "@/lib/lights"
import { getBridge } from "@/lib/bridge"
import {
  SEED_AUTOMATIONS,
  isDue,
  type Automation,
  type AutomationAction,
} from "@/lib/automations"
import {
  seedHistory,
  pushSample,
  DEFAULT_TARIFF_CLP,
  type EnergySample,
} from "@/lib/energy"

// ── Transformaciones puras sobre el arreglo de luces ────────────────────────
function applySceneToLights(lights: Light[], scene: Scene): Light[] {
  return lights.map((l) => {
    const s: SceneSetting | undefined = scene.settings[l.room]
    if (!s) return l
    return {
      ...l,
      on: s.on,
      brightness: s.on && s.brightness !== undefined ? s.brightness : l.brightness,
      temp: s.on && s.temp !== undefined ? s.temp : l.temp,
    }
  })
}
const setRoom = (lights: Light[], roomId: string, on: boolean) =>
  lights.map((l) => (l.room === roomId ? { ...l, on } : l))
const setGroup = (lights: Light[], ids: string[], on: boolean) =>
  lights.map((l) => (ids.includes(l.id) ? { ...l, on } : l))
const setMasterLights = (lights: Light[], pct: number) =>
  lights.map((l) => (l.on ? { ...l, brightness: pct } : l))

// ── Contexto ────────────────────────────────────────────────────────────────
export type Toast = { id: number; msg: string; actionLabel?: string; onAction?: () => void }

type Ctx = {
  hydrated: boolean
  bridgeName: string
  lights: Light[]
  scenes: Scene[]
  automations: Automation[]
  history: EnergySample[]
  tariff: number
  watts: number
  toggleLight: (id: string, on: boolean) => void
  setBrightness: (id: string, brightness: number) => void
  setTemp: (id: string, temp: number) => void
  setColor: (id: string, color: string | null) => void
  toggleRoom: (roomId: string, on: boolean) => void
  toggleGroup: (ids: string[], on: boolean) => void
  setMaster: (pct: number) => void
  applyScene: (scene: Scene) => void
  saveScene: (name: string) => void
  deleteScene: (id: string) => void
  allOff: () => void
  addAutomation: (a: Automation) => void
  toggleAutomation: (id: string, enabled: boolean) => void
  deleteAutomation: (id: string) => void
  setTariff: (clp: number) => void
  toasts: Toast[]
  dismissToast: (id: number) => void
}

const LightsContext = createContext<Ctx | null>(null)

const LS = {
  scenes: "lamp_scenes_v1",
  autos: "lamp_autos_v1",
  tariff: "lamp_tariff_v1",
  history: "lamp_history_v1",
}

export function LightsProvider({ children }: { children: React.ReactNode }) {
  const bridge = useMemo(() => getBridge(), [])
  const [hydrated, setHydrated] = useState(false)
  const [lights, setLights] = useState<Light[]>(SEED_LIGHTS)
  const [customScenes, setCustomScenes] = useState<Scene[]>([])
  const [automations, setAutomations] = useState<Automation[]>(SEED_AUTOMATIONS)
  const [history, setHistory] = useState<EnergySample[]>([])
  const [tariff, setTariffState] = useState<number>(DEFAULT_TARIFF_CLP)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const scenes = useMemo<Scene[]>(() => [...SCENES, ...customScenes], [customScenes])
  const watts = useMemo(() => estimatedWatts(lights), [lights])

  // Toasts ------------------------------------------------------------------
  const dismissToast = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])
  const pushToast = useCallback(
    (msg: string, undo?: () => void) => {
      const id = ++toastId.current
      setToasts((ts) => [
        ...ts,
        { id, msg, actionLabel: undo ? "Deshacer" : undefined, onAction: undo },
      ])
      setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 5000)
    },
    [],
  )

  // Hidratación (diferida: no setState síncrono en el effect) ----------------
  useEffect(() => {
    let alive = true
    const t = setTimeout(async () => {
      const loaded = await bridge.load()
      if (!alive) return
      setLights(loaded)
      try {
        const cs = JSON.parse(localStorage.getItem(LS.scenes) || "null")
        if (Array.isArray(cs)) setCustomScenes(cs)
        const as = JSON.parse(localStorage.getItem(LS.autos) || "null")
        if (Array.isArray(as)) setAutomations(as)
        const tf = Number(localStorage.getItem(LS.tariff))
        if (tf > 0) setTariffState(tf)
        const hs = JSON.parse(localStorage.getItem(LS.history) || "null")
        setHistory(Array.isArray(hs) && hs.length ? hs : seedHistory(estimatedWatts(loaded)))
      } catch {
        setHistory(seedHistory(estimatedWatts(loaded)))
      }
      setHydrated(true)
    }, 0)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [bridge])

  // Persistencia ------------------------------------------------------------
  useEffect(() => {
    if (hydrated) bridge.persist(lights)
  }, [lights, hydrated, bridge])
  useEffect(() => {
    if (hydrated) try { localStorage.setItem(LS.scenes, JSON.stringify(customScenes)) } catch {}
  }, [customScenes, hydrated])
  useEffect(() => {
    if (hydrated) try { localStorage.setItem(LS.autos, JSON.stringify(automations)) } catch {}
  }, [automations, hydrated])
  useEffect(() => {
    if (hydrated) try { localStorage.setItem(LS.tariff, String(tariff)) } catch {}
  }, [tariff, hydrated])
  useEffect(() => {
    if (hydrated) try { localStorage.setItem(LS.history, JSON.stringify(history)) } catch {}
  }, [history, hydrated])

  // Refs para los intervalos (ven siempre el estado fresco) ------------------
  const ref = useRef({ lights, automations, scenes })
  useEffect(() => {
    ref.current = { lights, automations, scenes }
  })

  // Muestreo de consumo -----------------------------------------------------
  useEffect(() => {
    if (!hydrated) return
    const id = setInterval(() => {
      setHistory((h) => pushSample(h, estimatedWatts(ref.current.lights)))
    }, 30_000)
    return () => clearInterval(id)
  }, [hydrated])

  // Scheduler de automatizaciones -------------------------------------------
  const runAction = useCallback(
    (action: AutomationAction) => {
      setLights((ls) => {
        switch (action.type) {
          case "scene": {
            const sc = ref.current.scenes.find((s) => s.id === action.sceneId)
            return sc ? applySceneToLights(ls, sc) : ls
          }
          case "room":
            return setRoom(ls, action.roomId, action.on)
          case "allOff":
            return ls.map((l) => ({ ...l, on: false }))
        }
      })
    },
    [],
  )
  useEffect(() => {
    if (!hydrated) return
    const fired = new Set<string>()
    const tick = () => {
      const now = new Date()
      const stamp = `${now.getHours()}:${now.getMinutes()}`
      for (const a of ref.current.automations) {
        const key = `${a.id}@${stamp}`
        if (isDue(a, now) && !fired.has(key)) {
          fired.add(key)
          runAction(a.action)
          pushToast(`Automatización: ${a.name}`)
        }
      }
      // Limpia marcas viejas para no crecer sin límite.
      if (fired.size > 64) fired.clear()
    }
    const id = setInterval(tick, 20_000)
    return () => clearInterval(id)
  }, [hydrated, runAction, pushToast])

  // Acciones de luz ---------------------------------------------------------
  const patchLight = useCallback((id: string, changes: Partial<Light>) => {
    setLights((ls) => ls.map((l) => (l.id === id ? { ...l, ...changes } : l)))
  }, [])
  const toggleLight = useCallback((id: string, on: boolean) => patchLight(id, { on }), [patchLight])
  const setBrightness = useCallback((id: string, brightness: number) => patchLight(id, { brightness }), [patchLight])
  const setTemp = useCallback((id: string, temp: number) => patchLight(id, { temp }), [patchLight])
  const setColor = useCallback((id: string, color: string | null) => patchLight(id, { color }), [patchLight])
  const toggleRoom = useCallback((roomId: string, on: boolean) => {
    setLights((ls) => setRoom(ls, roomId, on))
  }, [])
  const toggleGroup = useCallback((ids: string[], on: boolean) => {
    setLights((ls) => setGroup(ls, ids, on))
  }, [])
  const setMaster = useCallback((pct: number) => {
    setLights((ls) => setMasterLights(ls, pct))
  }, [])

  const applyScene = useCallback(
    (scene: Scene) => {
      setLights((prev) => {
        pushToast(`Escena: ${scene.name}`, () => setLights(prev))
        return applySceneToLights(prev, scene)
      })
    },
    [pushToast],
  )
  const allOff = useCallback(() => {
    setLights((prev) => {
      if (!prev.some((l) => l.on)) return prev
      pushToast("Todo apagado", () => setLights(prev))
      return prev.map((l) => ({ ...l, on: false }))
    })
  }, [pushToast])

  const saveScene = useCallback(
    (name: string) => {
      const snapshot = ref.current.lights
      // Deriva el ajuste por ambiente desde el estado actual (promedio de las
      // luces encendidas de cada ambiente).
      const settings: Record<string, SceneSetting> = {}
      for (const l of snapshot) {
        const cur = settings[l.room]
        if (l.on) {
          if (!cur || !cur.on) settings[l.room] = { on: true, brightness: l.brightness, temp: l.temp }
        } else if (!cur) {
          settings[l.room] = { on: false }
        }
      }
      const id = `custom-${name.toLowerCase().replace(/\s+/g, "-")}-${ref.current.scenes.length}`
      setCustomScenes((cs) => [...cs, { id, name, desc: "Escena personalizada", custom: true, settings }])
      pushToast(`Escena "${name}" guardada`)
    },
    [pushToast],
  )
  const deleteScene = useCallback((id: string) => {
    setCustomScenes((cs) => cs.filter((s) => s.id !== id))
  }, [])

  const addAutomation = useCallback((a: Automation) => setAutomations((as) => [...as, a]), [])
  const toggleAutomation = useCallback((id: string, enabled: boolean) => {
    setAutomations((as) => as.map((a) => (a.id === id ? { ...a, enabled } : a)))
  }, [])
  const deleteAutomation = useCallback((id: string) => {
    setAutomations((as) => as.filter((a) => a.id !== id))
  }, [])
  const setTariff = useCallback((clp: number) => setTariffState(Math.max(1, Math.round(clp))), [])

  const value: Ctx = {
    hydrated,
    bridgeName: bridge.name,
    lights,
    scenes,
    automations,
    history,
    tariff,
    watts,
    toggleLight,
    setBrightness,
    setTemp,
    setColor,
    toggleRoom,
    toggleGroup,
    setMaster,
    applyScene,
    saveScene,
    deleteScene,
    allOff,
    addAutomation,
    toggleAutomation,
    deleteAutomation,
    setTariff,
    toasts,
    dismissToast,
  }

  return <LightsContext.Provider value={value}>{children}</LightsContext.Provider>
}

export function useLights(): Ctx {
  const ctx = useContext(LightsContext)
  if (!ctx) throw new Error("useLights debe usarse dentro de <LightsProvider>")
  return ctx
}
