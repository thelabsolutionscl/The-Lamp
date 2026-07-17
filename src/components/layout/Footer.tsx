// Footer de The Lamp: barra angosta de app (no el footer de marketing de la
// web), con la micro-tipografía de la identidad.
export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.06] py-6">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 md:flex-row lg:px-12">
        <p className="font-mono text-[10px] uppercase tracking-[2.5px] text-white/40">
          The Lamp · Control de iluminación
        </p>
        <p className="text-[11px] text-white/40">
          © {new Date().getFullYear()} The Lab Solutions · Hecho en Chile
        </p>
      </div>
    </footer>
  )
}
