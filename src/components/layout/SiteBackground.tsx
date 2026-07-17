// Fondo global del sitio: capa fija detrás de todo el contenido.
// Estética de marca: oscuro + técnico (grilla "blueprint") + glows muy tenues
// que "respiran". Idéntico al de la web de The Lab Solutions, con los glows en
// gris 50% (#808080) en vez de teal. Animación ligera (transform/opacity).
//
// - aria-hidden + pointer-events-none: puramente decorativo.
// - Opacidades bajas para no afectar el contraste AA del texto.
// - prefers-reduced-motion (reset global en globals.css) lo deja estático.
export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]"
    >
      {/* Grilla técnica que deriva muy lento (transform → suave en GPU). */}
      <div
        className="absolute -inset-24"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          animation: "grid-drift 30s linear infinite",
          maskImage:
            "radial-gradient(ellipse 130% 95% at 50% 0%, #000 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 130% 95% at 50% 0%, #000 50%, transparent 100%)",
        }}
      />

      {/* Glow gris superior-izquierdo (respira). */}
      <div
        className="absolute left-[-12%] top-[-8%] h-[60vh] w-[60vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(128,128,128,0.12), transparent 68%)",
          filter: "blur(32px)",
          animation: "glow-breathe-a 24s ease-in-out infinite",
        }}
      />

      {/* Glow gris medio-derecho (respira, en contrafase). */}
      <div
        className="absolute right-[-10%] top-[40%] h-[55vh] w-[55vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(128,128,128,0.09), transparent 70%)",
          filter: "blur(42px)",
          animation: "glow-breathe-b 31s ease-in-out infinite",
        }}
      />

      {/* Viñeta inferior para asentar el pie de página. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40vh]"
        style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }}
      />
    </div>
  )
}
