"use client"

import { useEffect, useRef, useState } from "react"
import { X, Check, Loader2, Cpu, Server } from "lucide-react"
import { loadBridgeConfig, saveBridgeConfig, type BridgeKind } from "@/lib/config"
import { resetBridge } from "@/lib/bridge"
import { useLights } from "@/components/app/lights-store"
import { cn } from "@/lib/utils"

type TestState = "idle" | "testing" | "ok" | "fail"

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // El diálogo se monta solo al abrir: así inicializa su estado desde la config
  // en los inicializadores de useState (sin setState dentro de un effect).
  if (!open) return null
  return <SettingsDialog onClose={onClose} />
}

function SettingsDialog({ onClose }: { onClose: () => void }) {
  const { tariff, setTariff, bridgeName } = useLights()
  const initial = loadBridgeConfig()
  const [kind, setKind] = useState<BridgeKind>(initial.kind)
  const [haUrl, setHaUrl] = useState(initial.haUrl ?? "")
  const [haToken, setHaToken] = useState(initial.haToken ?? "")
  const [test, setTest] = useState<TestState>("idle")
  const [tariffDraft, setTariffDraft] = useState(String(tariff))
  const dialogRef = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement
    const el = dialogRef.current
    const focusables = () =>
      Array.from(el?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? [])
        .filter((n) => !n.hasAttribute("disabled"))
    const t = setTimeout(() => focusables()[0]?.focus(), 20)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Tab") {
        const f = focusables()
        if (f.length === 0) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      clearTimeout(t)
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
      opener.current?.focus()
    }
  }, [onClose])

  const testConnection = async () => {
    setTest("testing")
    try {
      const res = await fetch(`${haUrl.replace(/\/$/, "")}/api/states`, { headers: { Authorization: `Bearer ${haToken}` } })
      setTest(res.ok ? "ok" : "fail")
    } catch {
      setTest("fail")
    }
  }

  const save = () => {
    const t = Number(tariffDraft)
    if (t > 0) setTariff(t)
    const prev = loadBridgeConfig()
    const next = { kind, haUrl: haUrl.trim(), haToken: haToken.trim() }
    saveBridgeConfig(next)
    if (prev.kind !== next.kind || prev.haUrl !== next.haUrl || prev.haToken !== next.haToken) {
      resetBridge()
      window.location.reload()
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="settings-title" className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111] shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <h2 id="settings-title" className="text-base font-bold tracking-[-0.01em] text-white" style={{ fontFamily: "var(--font-heading)" }}>Ajustes</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar ajustes" className="flex h-8 w-8 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/80"><X className="h-4 w-4" /></button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[2px] text-white/40">Puente de dispositivos</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {([
              { k: "mock" as const, icon: Cpu, title: "Simulado", desc: "Estado local (v0)" },
              { k: "homeassistant" as const, icon: Server, title: "Home Assistant", desc: "Luces reales" },
            ]).map(({ k, icon: Icon, title, desc }) => (
              <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k}
                className={cn("flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors", kind === k ? "border-[#00d4cc]/50 bg-[#00d4cc]/[0.08]" : "border-white/[0.1] hover:border-white/25")}>
                <Icon className={cn("h-4.5 w-4.5", kind === k ? "text-[#00d4cc]" : "text-white/45")} />
                <span className="mt-1 text-sm font-medium text-white/85">{title}</span>
                <span className="text-[11px] text-white/45">{desc}</span>
              </button>
            ))}
          </div>

          {kind === "homeassistant" && (
            <div className="mt-5 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">URL de Home Assistant</span>
                <input value={haUrl} onChange={(e) => { setHaUrl(e.target.value); setTest("idle") }} placeholder="http://homeassistant.local:8123" className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none focus:border-[#00d4cc]/50" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">Token de larga duración</span>
                <input type="password" value={haToken} onChange={(e) => { setHaToken(e.target.value); setTest("idle") }} placeholder="••••••••••••" className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none focus:border-[#00d4cc]/50" />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={testConnection} disabled={!haUrl || !haToken || test === "testing"} className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.14] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40">
                  {test === "testing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Probar conexión
                </button>
                {test === "ok" && <span className="text-xs text-[#00d4cc]">Conexión correcta ✓</span>}
                {test === "fail" && <span className="text-xs text-[#ff6666]">No se pudo conectar (revisa URL/token/CORS)</span>}
              </div>
              <p className="text-[11px] leading-relaxed text-white/40">Crea el token en Home Assistant → tu perfil → “Tokens de acceso de larga duración”. HA debe permitir CORS para este origen.</p>
            </div>
          )}

          <div className="mt-6 border-t border-white/[0.07] pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[2px] text-white/40">Tarifa eléctrica</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-sm text-white/40">$</span>
              <input type="number" value={tariffDraft} onChange={(e) => setTariffDraft(e.target.value)} className="w-24 rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50" />
              <span className="font-mono text-xs text-white/40">CLP / kWh</span>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-white/30">Puente activo: {bridgeName} · The Lamp v0.1</p>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.07] px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Cancelar</button>
          <button type="button" onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4cc] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#19ddd5]"><Check className="h-4 w-4" /> Guardar</button>
        </div>
      </div>
    </div>
  )
}
