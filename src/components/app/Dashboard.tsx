"use client"

import { Sofa, Utensils, BedDouble, Monitor, TreePine, type LucideIcon } from "lucide-react"
import { ROOMS } from "@/lib/lights"
import { useLights } from "@/components/app/lights-store"
import { LightCard, LampSwitch } from "@/components/app/LightCard"
import { StatsBar } from "@/components/app/StatsBar"
import { QuickGroups } from "@/components/app/QuickGroups"
import { SceneBar } from "@/components/app/SceneBar"
import { Automations } from "@/components/app/Automations"
import { cn } from "@/lib/utils"

const ROOM_ICONS: Record<string, LucideIcon> = {
  living: Sofa,
  cocina: Utensils,
  dormitorio: BedDouble,
  escritorio: Monitor,
  terraza: TreePine,
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-64 rounded bg-white/[0.05]" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-white/[0.06] bg-[#111]" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl border border-white/[0.06] bg-[#111]" />
        ))}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { lights, hydrated, bridgeName, toggleRoom } = useLights()
  const onCount = lights.filter((l) => l.on).length

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 pb-24 pt-24 lg:px-12 lg:pb-20 lg:pt-28">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">
            Panel · Control de iluminación
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">Tu casa, en un switch.</h1>
        </div>
        <p className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[2.5px] text-white/60">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00d4cc] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00d4cc]" />
          </span>
          {bridgeName} · {onCount > 0 ? `${onCount} en línea` : "Todo apagado"}
        </p>
      </div>

      {!hydrated ? (
        <Skeleton />
      ) : (
        <>
          <StatsBar />
          <QuickGroups />
          <SceneBar />
          <Automations />

          {/* Ambientes */}
          <section id="ambientes" className="mt-16 scroll-mt-24">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">03 · Ambientes</p>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">Luz por luz.</h2>

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
                              ? "border-[#00d4cc]/40 bg-[#00d4cc]/15 text-[#d0d0d0]"
                              : "border-white/[0.08] bg-white/[0.02] text-white/35",
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" aria-hidden />}
                        </span>
                        <h3 className="text-lg font-bold tracking-[-0.01em] text-white">{room.name}</h3>
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
                        <LightCard key={light.id} light={light} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
