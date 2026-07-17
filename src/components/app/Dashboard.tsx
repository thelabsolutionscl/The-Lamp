"use client"

import { useState } from "react"
import {
  Sofa, Utensils, BedDouble, Monitor, TreePine, Home, Plus, Pencil, Check, X,
  type LucideIcon,
} from "lucide-react"
import { KIND_LABEL, type LightKind, type Room } from "@/lib/lights"
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
const KINDS = Object.keys(KIND_LABEL) as LightKind[]

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

function RoomSection({ room }: { room: Room }) {
  const { lights, toggleRoom, renameRoom, addLight } = useLights()
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(room.name)
  const [adding, setAdding] = useState(false)
  const [nl, setNl] = useState({ name: "", kind: "bulb" as LightKind, watts: 40 })

  const roomLights = lights.filter((l) => l.room === room.id)
  const roomOn = roomLights.filter((l) => l.on).length
  const Icon = ROOM_ICONS[room.id] ?? Home

  const commitName = () => {
    const n = name.trim()
    if (n) renameRoom(room.id, n)
    else setName(room.name)
    setRenaming(false)
  }
  const commitAdd = () => {
    const n = nl.name.trim()
    if (n) addLight({ name: n, room: room.id, kind: nl.kind, watts: Number(nl.watts) || 40 })
    setNl({ name: "", kind: "bulb", watts: 40 })
    setAdding(false)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
        <div className="group/rh flex items-center gap-3">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors duration-300",
              roomOn > 0 ? "border-[#00d4cc]/40 bg-[#00d4cc]/15 text-[#d0d0d0]" : "border-white/[0.08] bg-white/[0.02] text-white/35",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          {renaming ? (
            <div className="flex items-center gap-1.5">
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") { setName(room.name); setRenaming(false) } }}
                className="w-40 rounded border border-white/[0.14] bg-[#0f0f0f] px-2 py-0.5 text-lg font-bold text-white outline-none focus:border-[#00d4cc]/50"
              />
              <button type="button" onClick={commitName} aria-label="Guardar nombre" className="text-[#00d4cc] hover:text-[#19ddd5]"><Check className="h-4 w-4" /></button>
            </div>
          ) : (
            <h3 className="flex items-center gap-2 text-lg font-bold tracking-[-0.01em] text-white">
              {room.name}
              <button type="button" onClick={() => { setName(room.name); setRenaming(true) }} aria-label={`Renombrar ${room.name}`} className="text-white/25 opacity-100 transition-opacity hover:text-white/60 focus-visible:opacity-100 lg:opacity-0 lg:group-hover/rh:opacity-100">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </h3>
          )}
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-white/35">{roomOn}/{roomLights.length} encendidas</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setAdding((o) => !o)} className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[1.5px] text-white/55 transition-colors hover:border-[#00d4cc]/40 hover:text-white/80">
            <Plus className="h-3 w-3" /> Luz
          </button>
          <LampSwitch on={roomOn > 0} onChange={(on) => toggleRoom(room.id, on)} label={`${roomOn > 0 ? "Apagar" : "Encender"} todo ${room.name}`} />
        </div>
      </div>

      {adding && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-white/[0.1] bg-[#141414] p-4">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-white/40">Nombre</span>
            <input value={nl.name} autoFocus onChange={(e) => setNl({ ...nl, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && commitAdd()} placeholder="Ej: Aplique" className="w-44 rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none focus:border-[#00d4cc]/50" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-white/40">Tipo</span>
            <select value={nl.kind} onChange={(e) => setNl({ ...nl, kind: e.target.value as LightKind })} className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50">
              {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-white/40">Watts</span>
            <input type="number" value={nl.watts} onChange={(e) => setNl({ ...nl, watts: Number(e.target.value) })} className="w-20 rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50" />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={commitAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4cc] px-4 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[#19ddd5]"><Check className="h-4 w-4" />Agregar</button>
            <button type="button" onClick={() => setAdding(false)} aria-label="Cancelar" className="rounded-lg px-3 py-2 text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roomLights.map((light) => <LightCard key={light.id} light={light} />)}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { lights, rooms, hydrated, bridgeName, watts } = useLights()
  const onCount = lights.filter((l) => l.on).length

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 pb-24 pt-24 lg:px-12 lg:pb-20 lg:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">Panel · Control de iluminación</p>
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

      {/* Anuncio para lectores de pantalla del estado agregado. */}
      <p className="sr-only" aria-live="polite" role="status">
        {onCount} de {lights.length} luces encendidas. Consumo estimado {watts} vatios.
      </p>

      {!hydrated ? (
        <Skeleton />
      ) : (
        <>
          <StatsBar />
          <QuickGroups />
          <SceneBar />
          <Automations />
          <section id="ambientes" className="mt-16 scroll-mt-24">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">03 · Ambientes</p>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">Luz por luz.</h2>
            <div className="mt-7 flex flex-col gap-10">
              {rooms.map((room) => <RoomSection key={room.id} room={room} />)}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
