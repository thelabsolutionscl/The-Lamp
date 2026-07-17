"use client"

import { useEffect } from "react"

// Registra el service worker (solo en producción; en dev estorbaría con la
// caché). Silencioso si el navegador no lo soporta.
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
  }, [])
  return null
}
