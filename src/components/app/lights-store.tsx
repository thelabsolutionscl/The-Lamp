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
  deriveRooms,
  estimatedWatts,
  type Light,
  type LightKind,
  type Room,
  type Scene,
  type SceneSetting,
} from "@/lib/lights"
import {
  applySceneToLights,
  setRoom,
  setGroup,
  setMasterLights,
  patchLight as patchLightArr,
  removeLight as removeLightArr,
  addLight as addLightArr,
} from "@/lib/mutations"
import { getBridge } from "@/lib/bridge"
import { loadBridgeConfig, type BridgeKind } from "@/lib/config"
import { SEED_AUTOMATIONS, isDue, triggerFireMinute, minutesOfDay, type Automation, type AutomationAction } from "@/lib/automations"
import { sunTimesLocal } from "@/lib/sun"
import { seedHistory, pushSample, DEFAULT_TARIFF_CLP, type EnergySample } from "@/lib/energy"

export type Toast = { id: number; msg: string; actionLabel?: string; onAction?: () => void }

type Ctx = {
  hydrated: boolean
  bridgeName: string
  bridgeKind: BridgeKind
  lights: Light[]
  rooms: Room[]
  scenes: Scene[]
  automations: Automation[]
  history: EnergySample[]
  tariff: number
  watts: number
  sunTimes: { sunriseMin: number; sunsetMin: number }
  toggleLight: (id: string, on: boolean) => void
  setBrightness: (id: string, brightness: number) => void
  setTemp: (id: string, temp: number) => void
  setColor: (id: string, color: string | null) => void
  renameLight: (id: string, name: string) => void
  addLight: (data: { name: string; room: string; kind: LightKind; watts: number }) => void
  removeLight: (id: string) => void
  renameRoom: (id: string, name: string) => void
  toggleRoom: (roomId: string, on: boolean) => void
  toggleGroup: (ids: string[], on: boolean) => void
  setMaster: (pct: number) => void
  applyScene: (scene: Scene) => void
  saveScene: (name: string) => void
  deleteScene: (id: string) => void
  allOff: () => void
  addAutomation: (a: Automation) => void
  updateAutomation: (a: Automation) => void
  toggleAutomation: (id: string, enabled: boolean) => void
  deleteAutomation: (id: string) => void
  setTariff: (clp: number) => void
  toasts: Toast[]
  pushToast: (msg: string, undo?: () => void) => void
  dismissToast: (id: number) => void
}

const LightsContext = createContext<Ctx | null>(null)

const LS = {
  scenes: "lamp_scenes_v1",
  autos: "lamp_autos_v1",
  tariff: "lamp_tariff_v1",
  history: "lamp_history_v1",
  roomNames: "lamp_roomnames_v1",
  lastSeen: "lamp_lastseen_v1",
}

export function LightsProvider({ children }: { children: React.ReactNode }) {
  const bridge = useMemo(() => getBridge(), [])
  const [hydrated, setHydrated] = useState(false)
  const [lights, setLights] = useState<Light[]>(SEED_LIGHTS)
  const [customScenes, setCustomScenes] = useState<Scene[]>([])
  const [automations, setAutomations] = useState<Automation[]>(SEED_AUTOMATIONS)
  const [history, setHistory] = useState<EnergySample[]>([])
  const [tariff, setTariffState] = useState<number>(DEFAULT_TARIFF_CLP)
  const [roomNames, setRoomNames] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const scenes = useMemo<Scene[]>(() => [...SCENES, ...customScenes], [customScenes])
  const rooms = useMemo<Room[]>(() => deriveRooms(lights, roomNames), [lights, roomNames])
  const watts = useMemo(() => estimatedWatts(lights), [lights])
  const sunTimes = useMemo(() => sunTimesLocal(new Date()), [])
  const bridgeKind = useMemo<BridgeKind>(() => loadBridgeConfig().kind, [])

  // Toasts ------------------------------------------------------------------
  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), [])
  const pushToast = useCallback((msg: string, undo?: () => void) => {
    const id = ++toastId.current
    setToasts((ts) => [...ts, { id, msg, actionLabel: undo ? "Deshacer" : undefined, onAction: undo }])
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 5000)
  }, [])

  // Hidratación -------------------------------------------------------------
  useEffect(() => {
    let alive = true
    const t = setTimeout(async () => {
      let loaded: Light[]
      try {
        loaded = await bridge.load()
      } catch {
        loaded = SEED_LIGHTS.map((l) => ({ ...l }))
        setTimeout(() => pushToast("No se pudo conectar al puente; usando estado local"), 60)
      }
      if (!alive) return
      setLights(loaded)
      try {
        const cs = JSON.parse(localStorage.getItem(LS.scenes) || "null")
        if (Array.isArray(cs)) setCustomScenes(cs)
        const as = JSON.parse(localStorage.getItem(LS.autos) || "null")
        if (Array.isArray(as)) setAutomations(as)
        const rn = JSON.parse(localStorage.getItem(LS.roomNames) || "null")
        if (rn && typeof rn === "object") setRoomNames(rn)
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
  }, [bridge, pushToast])

  // Suscripción a cambios en vivo (puentes reales) --------------------------
  useEffect(() => {
    if (!hydrated || !bridge.subscribe) return
    return bridge.subscribe((incoming) => setLights(incoming))
  }, [hydrated, bridge])

  // Persistencia ------------------------------------------------------------
  useEffect(() => { if (hydrated) bridge.persist(lights) }, [lights, hydrated, bridge])
  useEffect(() => { if (hydrated) try { localStorage.setItem(LS.scenes, JSON.stringify(customScenes)) } catch {} }, [customScenes, hydrated])
  useEffect(() => { if (hydrated) try { localStorage.setItem(LS.autos, JSON.stringify(automations)) } catch {} }, [automations, hydrated])
  useEffect(() => { if (hydrated) try { localStorage.setItem(LS.roomNames, JSON.stringify(roomNames)) } catch {} }, [roomNames, hydrated])
  useEffect(() => { if (hydrated) try { localStorage.setItem(LS.tariff, String(tariff)) } catch {} }, [tariff, hydrated])
  useEffect(() => { if (hydrated) try { localStorage.setItem(LS.history, JSON.stringify(history)) } catch {} }, [history, hydrated])

  // Refs para intervalos ----------------------------------------------------
  const ref = useRef({ lights, automations, scenes })
  useEffect(() => { ref.current = { lights, automations, scenes } })

  // Aplica una acción de automatización sobre las luces ---------------------
  const runAction = useCallback((action: AutomationAction) => {
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
  }, [])

  // Catch-up: aplica la automatización más reciente que debió dispararse
  // mientras la app estaba cerrada (mismo día). Corre una sola vez al hidratar.
  const caughtUp = useRef(false)
  useEffect(() => {
    if (!hydrated || caughtUp.current) return
    caughtUp.current = true
    try {
      const now = new Date()
      const nowMin = minutesOfDay(now)
      const last = Number(localStorage.getItem(LS.lastSeen))
      localStorage.setItem(LS.lastSeen, String(now.getTime()))
      if (!last) return
      const lastDate = new Date(last)
      const sameDay = lastDate.toDateString() === now.toDateString()
      if (!sameDay) return
      const lastMin = minutesOfDay(lastDate)
      const due = ref.current.automations
        .filter((a) => a.enabled && (a.days.length === 0 || a.days.includes(now.getDay())))
        .map((a) => ({ a, m: triggerFireMinute(a.trigger, sunTimes) }))
        .filter(({ m }) => m > lastMin && m <= nowMin)
        .sort((x, y) => y.m - x.m)[0]
      if (due) {
        runAction(due.a.action)
        pushToast(`Se aplicó "${due.a.name}" mientras no estabas`)
      }
    } catch {
      /* ignora */
    }
  }, [hydrated, runAction, pushToast, sunTimes])

  // Muestreo de consumo -----------------------------------------------------
  useEffect(() => {
    if (!hydrated) return
    const id = setInterval(() => {
      setHistory((h) => pushSample(h, estimatedWatts(ref.current.lights)))
      try { localStorage.setItem(LS.lastSeen, String(Date.now())) } catch {}
    }, 30_000)
    return () => clearInterval(id)
  }, [hydrated])

  // Scheduler ---------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return
    const fired = new Set<string>()
    const tick = () => {
      const now = new Date()
      const stamp = `${now.getHours()}:${now.getMinutes()}`
      for (const a of ref.current.automations) {
        const key = `${a.id}@${stamp}`
        if (isDue(a, now, sunTimes) && !fired.has(key)) {
          fired.add(key)
          runAction(a.action)
          pushToast(`Automatización: ${a.name}`)
        }
      }
      if (fired.size > 64) fired.clear()
    }
    const id = setInterval(tick, 20_000)
    return () => clearInterval(id)
  }, [hydrated, runAction, pushToast, sunTimes])

  // Acciones de luz ---------------------------------------------------------
  const patch = useCallback((id: string, changes: Partial<Light>) => {
    setLights((ls) => patchLightArr(ls, id, changes))
    bridge.apply(id, changes).catch(() => {})
  }, [bridge])
  const toggleLight = useCallback((id: string, on: boolean) => patch(id, { on }), [patch])
  const setBrightness = useCallback((id: string, brightness: number) => patch(id, { brightness }), [patch])
  const setTemp = useCallback((id: string, temp: number) => patch(id, { temp }), [patch])
  const setColor = useCallback((id: string, color: string | null) => patch(id, { color }), [patch])
  const renameLight = useCallback((id: string, name: string) => setLights((ls) => patchLightArr(ls, id, { name })), [])
  const addLight = useCallback((data: { name: string; room: string; kind: LightKind; watts: number }) => {
    setLights((ls) => addLightArr(ls, data))
    pushToast(`Luz "${data.name}" agregada`)
  }, [pushToast])
  const removeLight = useCallback((id: string) => {
    setLights((prev) => {
      const l = prev.find((x) => x.id === id)
      if (l) pushToast(`Luz "${l.name}" eliminada`, () => setLights((cur) => [...cur, l]))
      return removeLightArr(prev, id)
    })
  }, [pushToast])
  const renameRoom = useCallback((id: string, name: string) => setRoomNames((m) => ({ ...m, [id]: name })), [])

  const toggleRoom = useCallback((roomId: string, on: boolean) => setLights((ls) => setRoom(ls, roomId, on)), [])
  const toggleGroup = useCallback((ids: string[], on: boolean) => setLights((ls) => setGroup(ls, ids, on)), [])
  const setMaster = useCallback((pct: number) => setLights((ls) => setMasterLights(ls, pct)), [])

  const applyScene = useCallback((scene: Scene) => {
    setLights((prev) => {
      pushToast(`Escena: ${scene.name}`, () => setLights(prev))
      return applySceneToLights(prev, scene)
    })
  }, [pushToast])
  const allOff = useCallback(() => {
    setLights((prev) => {
      if (!prev.some((l) => l.on)) return prev
      pushToast("Todo apagado", () => setLights(prev))
      return prev.map((l) => ({ ...l, on: false }))
    })
  }, [pushToast])

  const saveScene = useCallback((name: string) => {
    const snapshot = ref.current.lights
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
  }, [pushToast])
  const deleteScene = useCallback((id: string) => setCustomScenes((cs) => cs.filter((s) => s.id !== id)), [])

  const addAutomation = useCallback((a: Automation) => setAutomations((as) => [...as, a]), [])
  const updateAutomation = useCallback((a: Automation) => setAutomations((as) => as.map((x) => (x.id === a.id ? a : x))), [])
  const toggleAutomation = useCallback((id: string, enabled: boolean) => setAutomations((as) => as.map((a) => (a.id === id ? { ...a, enabled } : a))), [])
  const deleteAutomation = useCallback((id: string) => setAutomations((as) => as.filter((a) => a.id !== id)), [])
  const setTariff = useCallback((clp: number) => setTariffState(Math.max(1, Math.round(clp))), [])

  const value: Ctx = {
    hydrated, bridgeName: bridge.name, bridgeKind, lights, rooms, scenes, automations, history, tariff, watts, sunTimes,
    toggleLight, setBrightness, setTemp, setColor, renameLight, addLight, removeLight, renameRoom,
    toggleRoom, toggleGroup, setMaster, applyScene, saveScene, deleteScene, allOff,
    addAutomation, updateAutomation, toggleAutomation, deleteAutomation, setTariff,
    toasts, pushToast, dismissToast,
  }

  return <LightsContext.Provider value={value}>{children}</LightsContext.Provider>
}

export function useLights(): Ctx {
  const ctx = useContext(LightsContext)
  if (!ctx) throw new Error("useLights debe usarse dentro de <LightsProvider>")
  return ctx
}
