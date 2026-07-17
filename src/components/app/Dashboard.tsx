"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Sofa,
  Utensils,
  BedDouble,
  Monitor,
  TreePine,
  Zap,
  Sun,
  Film,
  Moon,
  Power,
  type LucideIcon,
} from "lucide-react"
import {
  ROOMS,
  SEED_LIGHTS,
  SCENES,
  estimatedWatts,
  type Light,
  type Scene,
} from "@/lib/lights"
import { LightCard, LampSwitch } from "@/components/app/LightCard"
import { cn } from "@/lib/utils"

// Panel de control de iluminación de The Lamp. v0 simulada: el estado vive en
// localStorage; el modelo y las acciones están en src/lib/lights.ts para
// enchufar un puente real después.

const STORAGE_KEY = "lamp_state_v1"

const ROOM_ICONS: Record<string, LucideIcon> = {
  living: Sofa,
  cocina: Utensils,
  dormitorio: BedDouble,
  escritorio: Monitor,
  terraza: TreePine,
}

const SCENE_ICONS: Record<string, LucideIcon> = {
  todo: Zap,
  trabajo: Sun,
  cine: Film,
  noche: Moon,
  apagar: Power,
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">
      {children}
    </p>
  )
}

export function Dashboard() {
  const [lights, setLights] = useState<Light[]>(SEED_LIGHTS)
  const [hydrated, setHydrated] = useState(false)

  // Carga el estado guardado después de montar (el primer render debe
  // coincidir con el HTML del servidor). Diferido con setTimeout — no
  // setState síncrono en el effect —, mismo patrón del SiteLoader.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const saved = JSON.parse(raw) as Light[]
          // Reconcilia con la semilla: sobreviven ids conocidos, entran los nuevos.
          setLights(
            SEED_LIGHTS.map((seed) => {
              const s = saved.find((l) => l.id === seed.id)
              return s ? { ...seed, on: s.on, brightness: s.brightness } : seed
            }),
          )
        }
      } catch {
        /* almacenamiento no disponible: se usa la semilla */
      }
      setHydrated(true)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lights))
    } catch {
      /* sin persistencia */
    }
  }, [lights, hydrated])

  const toggleLight = (id: string, on: boolean) =>
    setLights((ls) => ls.map((l) => (l.id === id ? { ...l, on } : l)))

  const setBrightness = (id: string, brightness: number) =>
    setLights((ls) => ls.map((l) => (l.id === id ? { ...l, brightness } : l)))

  const toggleRoom = (roomId: string, on: boolean) =>
    setLights((ls) => ls.map((l) => (l.room === roomId ? { ...l, on } : l)))

  const applyScene = (scene: Scene) =>
    setLights((ls) =>
      ls.map((l) => {
        const s = scene.settings[l.room]
        if (!s) return l
        return {
          ...l,
          on: s.on,
          brightness: s.on && s.brightness !== undefined ? s.brightness : l.brightness,
        }
      }),
    )

  const onCount = lights.filter((l) => l.on).length
  const watts = estimatedWatts(lights)
  const activeRooms = new Set(lights.filter((l) => l.on).map((l) => l.room)).size
  const avgBrightness = useMemo(() => {
    const on = lights.filter((l) => l.on)
    if (on.length === 0) return 0
    return Math.round(on.reduce((s, l) => s + l.brightness, 0) / on.length)
  }, [lights])

  const stats = [
    {
      label: "Luces encendidas",
      value: `${onCount}`,
      suffix: `/ ${lights.length}`,
      bar: (onCount / lights.length) * 100,
    },
    { label: "Consumo estimado", value: `${watts}`, suffix: "W" },
    { label: "Intensidad promedio", value: `${avgBrightness}`, suffix: "%" },
    { label: "Ambientes activos", value: `${activeRooms}`, suffix: `/ ${ROOMS.length}` },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 pb-20 pt-28 lg:px-12">
      {/* ── Encabezado ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>Panel · Control de iluminación</Kicker>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
            Tu casa, en un switch.
          </h1>
        </div>
        <p className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[2.5px] text-white/60">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#808080] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#808080]" />
          </span>
          {onCount > 0 ? `${onCount} en línea` : "Todo apagado"}
        </p>
      </div>

      {/* ── Estado ── */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/[0.08] bg-[#141414] p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[2px] text-white/45">
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-[-0.02em] text-white">
              {s.value}
              <span className="ml-1.5 text-sm font-semibold text-white/40">{s.suffix}</span>
            </p>
            {s.bar !== undefined && (
              <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-[#333]">
                <div
                  className="h-full rounded-full shadow-[0_0_8px_#808080] transition-all duration-500"
                  style={{
                    width: `${s.bar}%`,
                    background: "linear-gradient(90deg, #6e6e6e, #9a9a9a)",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Escenas ── */}
      <section id="escenas" className="mt-16 scroll-mt-24">
        <Kicker>01 · Escenas</Kicker>
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">
          Un toque, toda la casa.
        </h2>
        <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {SCENES.map((scene) => {
            const Icon = SCENE_ICONS[scene.id]
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => applyScene(scene)}
                className="group rounded-xl border border-white/[0.08] bg-[#141414] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#808080]/40 hover:shadow-[0_10px_34px_-12px_rgba(128,128,128,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#808080]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/50 transition-colors duration-200 group-hover:border-[#808080]/40 group-hover:bg-[#808080]/15 group-hover:text-[#d0d0d0]">
                  {Icon && <Icon className="h-4.5 w-4.5" aria-hidden />}
                </span>
                <p className="mt-3.5 text-sm font-medium text-white/85">{scene.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-white/45">{scene.desc}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Ambientes ── */}
      <section id="ambientes" className="mt-16 scroll-mt-24">
        <Kicker>02 · Ambientes</Kicker>
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">
          Luz por luz.
        </h2>

        <div className="mt-7 flex flex-col gap-10">
          {ROOMS.map((room) => {
            const roomLights = lights.filter((l) => l.room === room.id)
            const roomOn = roomLights.filter((l) => l.on).length
            const Icon = ROOM_ICONS[room.id]
            return (
              <div key={room.id}>
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors duration-300",
                        roomOn > 0
                          ? "border-[#808080]/40 bg-[#808080]/15 text-[#d0d0d0]"
                          : "border-white/[0.08] bg-white/[0.02] text-white/35",
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" aria-hidden />}
                    </span>
                    <h3 className="text-lg font-bold tracking-[-0.01em] text-white">
                      {room.name}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-[2px] text-white/35">
                      {roomOn}/{roomLights.length} encendidas
                    </span>
                  </div>
                  <LampSwitch
                    on={roomOn > 0}
                    onChange={(on) => toggleRoom(room.id, on)}
                    label={`${roomOn > 0 ? "Apagar" : "Encender"} todo ${room.name}`}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {roomLights.map((light) => (
                    <LightCard
                      key={light.id}
                      light={light}
                      onToggle={toggleLight}
                      onBrightness={setBrightness}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
