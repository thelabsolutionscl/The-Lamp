"use client"

import { useEffect, useState } from "react"
import { LampLogo } from "@/components/brand/LampLogo"
import { LumaSpin } from "@/components/ui/luma-spin"
import { ShapeField } from "@/components/ui/shape-field"

// Pantalla de carga con porcentaje. Mismo "System Loader" de la web de
// The Lab Solutions (formas flotantes, logo, barra de progreso y luma-spin),
// con el acento en gris 50%.
//
// Se renderiza también en el HTML del servidor (es un Client Component, así que
// forma parte del primer pintado) para cubrir el contenido sin parpadeo. El
// efecto anima el porcentaje y lo oculta al terminar la carga; hay un failsafe
// por si `load` nunca dispara, y un <noscript> lo esconde si no hay JS.
const STEPS = [
  { pct: 22, msg: "Iniciando sistema…" },
  { pct: 48, msg: "Cargando recursos…" },
  { pct: 72, msg: "Encendiendo la lámpara…" },
  { pct: 91, msg: "Casi listo…" },
]

export function SiteLoader() {
  const [pct, setPct] = useState(8)
  const [msg, setMsg] = useState("Iniciando sistema…")
  const [hidden, setHidden] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    // Solo se muestra una vez por sesión: en visitas/recargas posteriores se
    // descarta al instante para no penalizar el LCP con el overlay.
    let alreadySeen = false
    try {
      alreadySeen = sessionStorage.getItem("lamp_seen") === "1"
      sessionStorage.setItem("lamp_seen", "1")
    } catch {
      /* sessionStorage no disponible: se muestra normal */
    }
    let timers: ReturnType<typeof setTimeout>[] = []

    if (alreadySeen) {
      // Diferido (no setState síncrono en el effect) para descartar el overlay
      // en el primer frame en visitas posteriores.
      timers.push(setTimeout(() => setGone(true), 0))
      return () => timers.forEach(clearTimeout)
    }

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      // Cancela los pasos pendientes: el % no debe retroceder al vaciar la rampa.
      timers.forEach(clearTimeout)
      timers = []
      setPct(100)
      setMsg("Sistema listo ✓")
      timers.push(setTimeout(() => setHidden(true), 280))
      timers.push(setTimeout(() => setGone(true), 780))
    }

    STEPS.forEach((s, i) => {
      timers.push(
        setTimeout(() => {
          setPct(s.pct)
          setMsg(s.msg)
        }, 120 + i * 150),
      )
    })

    // No esperamos `window.load` (que se retrasa hasta que cargan TODAS las
    // imágenes/fuentes y dispararía el LCP varios segundos): ocultamos apenas el
    // DOM está listo, tras un mínimo visible corto para conservar el intro.
    const MIN_VISIBLE_MS = 600
    const start = performance.now()
    const finishWhenReady = () => {
      timers.push(
        setTimeout(finish, Math.max(0, MIN_VISIBLE_MS - (performance.now() - start))),
      )
    }
    if (document.readyState === "interactive" || document.readyState === "complete") {
      finishWhenReady()
    } else {
      document.addEventListener("DOMContentLoaded", finishWhenReady, { once: true })
    }
    // Failsafe: la pantalla nunca queda congelada.
    timers.push(setTimeout(finish, 1600))

    // Bloquea el scroll mientras el loader cubre la pantalla.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      timers.forEach(clearTimeout)
      document.removeEventListener("DOMContentLoaded", finishWhenReady)
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // Restaura el scroll en cuanto arranca el fundido de salida.
  useEffect(() => {
    if (hidden) document.body.style.overflow = ""
  }, [hidden])

  if (gone) return null

  return (
    <div id="site-loader" className={hidden ? "is-hidden" : undefined} aria-hidden="true">
      <ShapeField />
      <div className="sl-content">
        <div className="sl-logo-wrap">
          <span className="sl-logo">
            <LampLogo iconClassName="h-7 w-7" textClassName="text-xl" />
          </span>
          <span className="sl-subtitle">Sistema The Lab</span>
        </div>
        <div className="sl-progress-wrap">
          <div className="sl-progress-head">
            <span className="sl-status">{msg}</span>
            <span className="sl-pct">{pct}%</span>
          </div>
          <div className="sl-progress-track">
            <div className="sl-progress-bar" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-center pt-1">
            <LumaSpin size={40} label="Cargando The Lamp" />
          </div>
        </div>
      </div>
    </div>
  )
}
