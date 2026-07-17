"use client"

import { Power, Zap } from "lucide-react"
import { useLights } from "@/components/app/lights-store"
import { SCENES } from "@/lib/lights"

// Barra de acciones rápidas fija abajo, solo en móvil: estado + apagar/encender
// todo de un toque (una app de luces se usa desde el teléfono).
export function MobileQuickBar() {
  const { lights, watts, allOff, applyScene, hydrated } = useLights()
  if (!hydrated) return null
  const onCount = lights.filter((l) => l.on).length
  const allScene = SCENES.find((s) => s.id === "todo")!

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#0d0d0d]/95 backdrop-blur-md lg:hidden">
      <div
        className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 pt-2.5"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-white/45">{onCount} encendidas</span>
          <span className="font-mono text-[11px] font-semibold tabular-nums text-[#00d4cc]">{watts} W</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => applyScene(allScene)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] px-3.5 py-2 text-sm font-medium text-white/75 transition-transform active:scale-95"
          >
            <Zap className="h-4 w-4 shrink-0" />
            Todo
          </button>
          <button
            type="button"
            onClick={allOff}
            aria-label="Apagar todo"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4cc] px-3.5 py-2 text-sm font-semibold text-[#0a0a0a] transition-transform active:scale-95"
          >
            <Power className="h-4 w-4 shrink-0" />
            Apagar
          </button>
        </div>
      </div>
    </div>
  )
}
