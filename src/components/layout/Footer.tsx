import Link from "next/link"
import { Mail, MapPin } from "lucide-react"
import { LampLogo } from "@/components/brand/LampLogo"

// Footer de The Lamp: mismo lenguaje visual del footer de la web de
// The Lab Solutions (borde superior tenue, columnas de links, micro-tipografía
// uppercase con tracking), reducido a lo que la app necesita hoy.

const productLinks = [
  { label: "Inicio", href: "/" },
  { label: "Identidad", href: "#identidad" },
  { label: "Componentes", href: "#componentes" },
]

const ecosystemLinks = [
  { label: "thelab.solutions", href: "https://thelab.solutions", external: true },
  { label: "Instagram", href: "https://www.instagram.com/thelab.solutions", external: true },
]

export function Footer() {
  return (
    <footer id="contacto" className="border-t border-white/[0.06] pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <LampLogo textClassName="text-base" />
            <p className="text-xs text-white/55 leading-relaxed max-w-[32ch]">
              La app del ecosistema The Lab Solutions. Misma identidad, en 50%
              blanco y 50% negro.
            </p>
            <div className="flex flex-col gap-2.5 mt-2">
              <a
                href="mailto:hola@thelab.solutions"
                className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white/70 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                hola@thelab.solutions
              </a>
              <span className="inline-flex items-start gap-2 text-xs text-white/55">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Zaragoza 8882, Las Condes, Santiago
              </span>
            </div>
          </div>

          {/* Producto */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Producto
            </p>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-white/55 hover:text-white/60 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosistema */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Ecosistema
            </p>
            <ul className="flex flex-col gap-2.5">
              {ecosystemLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/55 hover:text-white/60 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-white/[0.06] pt-6">
          <p className="text-[11px] text-white/40">
            © {new Date().getFullYear()} The Lamp · Un producto de The Lab Solutions
          </p>
          <p className="text-[11px] text-white/40">Hecho en Chile</p>
        </div>
      </div>
    </footer>
  )
}
