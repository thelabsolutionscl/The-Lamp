"use client"

import { useState } from "react"
import { Zap, Sun, Film, Moon, Power, Star, Plus, X, Check, type LucideIcon } from "lucide-react"
import { useLights } from "@/components/app/lights-store"
import type { Scene } from "@/lib/lights"

const SCENE_ICONS: Record<string, LucideIcon> = {
  todo: Zap,
  trabajo: Sun,
  cine: Film,
  noche: Moon,
  apagar: Power,
}

export function SceneBar() {
  const { scenes, applyScene, saveScene, deleteScene } = useLights()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")

  const commit = () => {
    const n = name.trim()
    if (n) saveScene(n)
    setName("")
    setAdding(false)
  }

  const iconFor = (s: Scene): LucideIcon => SCENE_ICONS[s.id] ?? Star

  return (
    <section id="escenas" className="mt-16 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">01 · Escenas</p>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">Un toque, toda la casa.</h2>
        </div>
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-3.5 py-2 text-xs font-medium text-white/70 transition-colors hover:border-[#00d4cc]/40 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Guardar escena actual
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-white/[0.12] py-1 pl-3 pr-1">
            <input
              value={name}
              autoFocus
              placeholder="Nombre de la escena"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit()
                if (e.key === "Escape") setAdding(false)
              }}
              className="w-44 bg-transparent text-sm text-white/85 placeholder:text-white/30 outline-none"
            />
            <button type="button" onClick={commit} aria-label="Guardar" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00d4cc]/15 text-[#00d4cc] hover:bg-[#00d4cc]/25">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => setAdding(false)} aria-label="Cancelar" className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.06] hover:text-white/70">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {scenes.map((scene) => {
          const Icon = iconFor(scene)
          return (
            <div key={scene.id} className="group relative">
              <button
                type="button"
                onClick={() => applyScene(scene)}
                className="h-full w-full rounded-xl border border-white/[0.08] bg-[#141414] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00d4cc]/40 hover:shadow-[0_10px_34px_-12px_rgba(0,212,204,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4cc]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/50 transition-colors duration-200 group-hover:border-[#00d4cc]/40 group-hover:bg-[#00d4cc]/15 group-hover:text-[#d0d0d0]">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <p className="mt-3.5 text-sm font-medium text-white/85">{scene.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-white/45">{scene.desc}</p>
              </button>
              {scene.custom && (
                <button
                  type="button"
                  onClick={() => deleteScene(scene.id)}
                  aria-label={`Borrar escena ${scene.name}`}
                  className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.1] bg-[#0f0f0f] text-white/40 opacity-0 transition-opacity hover:text-[#ff4444] group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
