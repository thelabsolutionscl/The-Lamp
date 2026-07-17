"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

// Aviso cuando el dispositivo pierde conexión (relevante con un puente real:
// los comandos no llegarán). Discreto, arriba del todo.
export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  if (!offline) return null
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[140] flex items-center justify-center gap-2 bg-[#ff4444] py-1.5 text-center text-xs font-medium text-white"
    >
      <WifiOff className="h-3.5 w-3.5" />
      Sin conexión — los cambios se guardan localmente y se aplicarán al reconectar.
    </div>
  )
}
