"use client"

import { Undo2, X } from "lucide-react"
import { useLights } from "@/components/app/lights-store"

// Cola de avisos (abajo, centrada). Algunos traen acción "Deshacer".
export function Toaster() {
  const { toasts, dismissToast } = useLights()
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/[0.1] bg-[#161616]/95 py-2 pl-4 pr-2 shadow-2xl shadow-black/50 backdrop-blur-md"
        >
          <span className="text-sm text-white/85">{t.msg}</span>
          {t.actionLabel && t.onAction && (
            <button
              type="button"
              onClick={() => {
                t.onAction?.()
                dismissToast(t.id)
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4cc]/15 px-3 py-1 text-xs font-medium text-[#00d4cc] transition-colors hover:bg-[#00d4cc]/25"
            >
              <Undo2 className="h-3.5 w-3.5" />
              {t.actionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Cerrar aviso"
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
