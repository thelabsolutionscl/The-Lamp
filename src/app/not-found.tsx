import Link from "next/link"
import { LampLogo } from "@/components/brand/LampLogo"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[1400px] flex-col items-center justify-center px-6 text-center">
      <LampLogo iconClassName="h-10 w-10" textClassName="text-xl" />
      <p className="mt-8 font-mono text-[11px] uppercase tracking-[3px] text-[#00d4cc]">Error 404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">Esta luz no existe.</h1>
      <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-white/55">
        La página que buscas no está en el tablero. Volvamos al panel de control.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#00d4cc] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#19ddd5]"
      >
        Volver al panel
      </Link>
    </div>
  )
}
