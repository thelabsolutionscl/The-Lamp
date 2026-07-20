"use client"

import { useEffect, useRef, useState } from "react"
import { X, Check, Loader2, Zap } from "lucide-react"
import { loadDeviceConfigs, saveDeviceConfig, resolveRequests, type DeviceConfig } from "@/lib/devices"

// Configura los endpoints HTTP reales de UNA luz (puente genérico). Al guardar,
// los comandos se dispararán por el backend cada vez que cambie esa luz.
export function DeviceConfigModal({
  lightId,
  lightName,
  open,
  onClose,
}: {
  lightId: string
  lightName: string
  open: boolean
  onClose: (saved: boolean) => void
}) {
  if (!open) return null
  return <Dialog lightId={lightId} lightName={lightName} onClose={onClose} />
}

type TestState = "idle" | "testing" | "ok" | "fail"

function Dialog({ lightId, lightName, onClose }: { lightId: string; lightName: string; onClose: (saved: boolean) => void }) {
  const initial = loadDeviceConfigs()[lightId] ?? {}
  const [onUrl, setOnUrl] = useState(initial.onUrl ?? "")
  const [offUrl, setOffUrl] = useState(initial.offUrl ?? "")
  const [brightnessUrl, setBrightnessUrl] = useState(initial.brightnessUrl ?? "")
  const [colorUrl, setColorUrl] = useState(initial.colorUrl ?? "")
  const [method, setMethod] = useState<"GET" | "POST">(initial.method ?? "GET")
  const [authHeader, setAuthHeader] = useState(initial.authHeader ?? "")
  const [test, setTest] = useState<TestState>("idle")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose(false)
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    setTimeout(() => ref.current?.querySelector<HTMLInputElement>("input")?.focus(), 20)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const cfg = (): DeviceConfig => ({
    onUrl: onUrl.trim() || undefined,
    offUrl: offUrl.trim() || undefined,
    brightnessUrl: brightnessUrl.trim() || undefined,
    colorUrl: colorUrl.trim() || undefined,
    method,
    authHeader: authHeader.trim() || undefined,
  })

  const testOn = async () => {
    const reqs = resolveRequests(cfg(), { on: true })
    if (reqs.length === 0) return
    setTest("testing")
    try {
      const res = await fetch("/api/device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests: reqs }),
      })
      const data = await res.json()
      setTest(data.results?.[0]?.ok ? "ok" : "fail")
    } catch {
      setTest("fail")
    }
  }

  const save = () => {
    saveDeviceConfig(lightId, cfg())
    onClose(true)
  }

  const field = (label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">{label}</span>
      <input
        value={value}
        onChange={(e) => { set(e.target.value); setTest("idle") }}
        placeholder={placeholder}
        className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none focus:border-[#00d4cc]/50"
      />
    </label>
  )

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onClose(false)} aria-hidden />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={`Conectar ${lightName}`} className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111] shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <h2 className="text-base font-bold tracking-[-0.01em] text-white" style={{ fontFamily: "var(--font-heading)" }}>Conectar “{lightName}”</h2>
          <button type="button" onClick={() => onClose(false)} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/80"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto px-6 py-5">
          {field("URL al encender", onUrl, setOnUrl, "http://192.168.1.50/relay/0?turn=on")}
          {field("URL al apagar", offUrl, setOffUrl, "http://192.168.1.50/relay/0?turn=off")}
          {field("URL de brillo (usa {brightness})", brightnessUrl, setBrightnessUrl, "http://192.168.1.50/color/0?turn=on&gain={brightness}")}
          {field("URL de color (usa {r} {g} {b})", colorUrl, setColorUrl, "http://192.168.1.50/color/0?turn=on&red={r}&green={g}&blue={b}")}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">Método</span>
              <select value={method} onChange={(e) => setMethod(e.target.value as "GET" | "POST")} className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#00d4cc]/50">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-white/40">Authorization (opcional)</span>
              <input value={authHeader} onChange={(e) => setAuthHeader(e.target.value)} placeholder="Bearer …" className="rounded-lg border border-white/[0.12] bg-[#0f0f0f] px-3 py-2 text-sm text-white/85 placeholder:text-white/30 outline-none focus:border-[#00d4cc]/50" />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={testOn} disabled={!onUrl || test === "testing"} className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.14] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40">
              {test === "testing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Probar (encender)
            </button>
            {test === "ok" && <span className="text-xs text-[#00d4cc]">Respondió ✓</span>}
            {test === "fail" && <span className="text-xs text-[#ff6666]">No respondió</span>}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.07] px-6 py-4">
          <button type="button" onClick={() => onClose(false)} className="rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Cancelar</button>
          <button type="button" onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4cc] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#19ddd5]"><Check className="h-4 w-4" /> Guardar</button>
        </div>
      </div>
    </div>
  )
}
