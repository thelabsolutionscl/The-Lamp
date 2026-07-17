"use client"

import { useEffect } from "react"
import Link from "next/link"

// Límite de error de la ruta (App Router): captura fallos de render en cliente
// y ofrece reintentar sin recargar toda la app.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // En producción, aquí iría el envío a un servicio de observabilidad.
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[1400px] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[3px] text-[#ff6666]">Algo se apagó</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">Se produjo un error.</h1>
      <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-white/55">
        Ocurrió un problema al mostrar el panel. Puedes reintentar; tu configuración de luces está guardada.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00d4cc] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#19ddd5]"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.14] px-6 py-3 text-sm font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  )
}
