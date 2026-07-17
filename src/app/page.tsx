import { ArrowDown, Palette, Component, Type } from "lucide-react"
import { ShapeField } from "@/components/ui/shape-field"
import { CtaButton } from "@/components/ui/cta-button"
import { LumaSpin } from "@/components/ui/luma-spin"

// Home de The Lamp — v0: presenta la app y documenta en vivo su identidad
// visual (heredada de la web de The Lab Solutions, en matiz 50% blanco /
// 50% negro). Las secciones de producto se montan sobre este esqueleto.

const palette = [
  { hex: "#0a0a0a", name: "Fondo", use: "Base de toda la app" },
  { hex: "#111111", name: "Superficie 1", use: "Paneles y sidebar" },
  { hex: "#1a1a1a", name: "Superficie 2", use: "Tarjetas y popovers" },
  { hex: "#2a2a2a", name: "Borde", use: "Líneas y divisores" },
  { hex: "#808080", name: "Acento 50/50", use: "50% blanco + 50% negro" },
  { hex: "#f0f0f0", name: "Texto", use: "Titulares y contenido" },
]

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">
      {children}
    </p>
  )
}

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <ShapeField />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[3px] text-white/60">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#808080] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#808080]" />
              </span>
              The Lamp · Sistema en línea
            </p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.02em] text-white md:text-6xl">
              La app del ecosistema
              <br />
              The Lab Solutions.
            </h1>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-white/60 md:text-lg">
              Misma identidad de la marca — oscura, técnica y precisa — llevada
              a matiz neutro: 50% blanco, 50% negro. Sin color, pura señal.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <CtaButton href="#identidad" arrow size="lg">
                Ver la identidad
              </CtaButton>
              <CtaButton href="#componentes" variant="secondary" size="lg">
                Componentes
              </CtaButton>
            </div>
          </div>
        </div>
        <a
          href="#identidad"
          aria-label="Bajar a la identidad"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 transition-colors hover:text-white/60"
        >
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      {/* ── Identidad ── */}
      <section id="identidad" className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <Kicker>01 · Identidad</Kicker>
          <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
            Una paleta, dos extremos.
          </h2>
          <p className="mt-4 max-w-[56ch] text-sm leading-relaxed text-white/60 md:text-base">
            The Lamp hereda los tokens del ecosistema The Lab y reemplaza el
            acento teal por su punto medio exacto entre blanco y negro:{" "}
            <span className="font-mono text-white/80">#808080</span>.
          </p>

          {/* Paleta */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {palette.map((c) => (
              <div
                key={c.hex}
                className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#141414] transition-colors hover:border-white/20"
              >
                <div
                  className="h-24 w-full border-b border-white/[0.06]"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="p-3.5">
                  <p className="text-sm font-medium text-white/85">{c.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase text-white/40">
                    {c.hex}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-snug text-white/50">{c.use}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tipografía */}
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-7">
              <p className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2px] text-white/45">
                <Type className="h-3.5 w-3.5" /> Montserrat · 600/700
              </p>
              <p className="text-3xl font-bold tracking-[-0.02em] text-white">
                Titulares con peso
                <br />y precisión de taller.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-7">
              <p className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2px] text-white/45">
                <Type className="h-3.5 w-3.5" /> DM Sans · 300/400/500
              </p>
              <p className="text-base leading-relaxed text-white/70">
                El texto corrido usa DM Sans, liviana y legible sobre fondo
                oscuro. La micro-tipografía técnica — etiquetas, estados,
                porcentajes — va en monoespaciada con tracking amplio, igual
                que en la web y el dashboard de The Lab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Componentes ── */}
      <section id="componentes" className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <Kicker>02 · Componentes</Kicker>
          <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
            Las mismas piezas, en gris.
          </h2>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {/* Botones */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-7">
              <p className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2px] text-white/45">
                <Component className="h-3.5 w-3.5" /> Botones CTA
              </p>
              <div className="flex flex-col items-start gap-4">
                <CtaButton href="#contacto" arrow>
                  Acción primaria
                </CtaButton>
                <CtaButton href="#contacto" variant="secondary">
                  Acción secundaria
                </CtaButton>
                <p className="text-[11px] leading-snug text-white/45">
                  Hover lift, glow y barrido de brillo idénticos a la web; el
                  relleno teal pasa a gris 50%.
                </p>
              </div>
            </div>

            {/* Loader */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-7">
              <p className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2px] text-white/45">
                <Component className="h-3.5 w-3.5" /> Loader luma
              </p>
              <div className="flex items-center gap-6">
                <LumaSpin size={52} label="Demo del loader" />
                <p className="text-[11px] leading-snug text-white/45">
                  El mismo luma-spin del System Loader: una figura blanca y una
                  en el acento — antes cian, ahora #808080.
                </p>
              </div>
            </div>

            {/* Estados */}
            <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-7">
              <p className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2px] text-white/45">
                <Palette className="h-3.5 w-3.5" /> Micro-tipografía
              </p>
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[3px] text-[#9a9a9a]">
                  Sistema en línea
                </p>
                <p className="font-mono text-[11px] tracking-[1px] text-white/45">
                  CARGA <span className="font-semibold text-[#b0b0b0]">100%</span>
                </p>
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-[#333]">
                  <div
                    className="h-full w-full rounded-full shadow-[0_0_8px_#808080]"
                    style={{ background: "linear-gradient(90deg, #6e6e6e, #9a9a9a)" }}
                  />
                </div>
                <p className="text-[11px] leading-snug text-white/45">
                  Barras, estados y etiquetas conservan el estilo del loader de
                  la web, en escala de grises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative overflow-hidden py-28">
        <ShapeField />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 text-center lg:px-12">
          <Kicker>03 · Siguiente paso</Kicker>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
            La lámpara está encendida.
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-sm leading-relaxed text-white/60 md:text-base">
            Este esqueleto ya carga toda la identidad. Lo que sigue es
            conectarle las funciones de la app.
          </p>
          <div className="mt-9 flex justify-center">
            <CtaButton href="mailto:hola@thelab.solutions" arrow size="lg" external>
              Escribir a The Lab
            </CtaButton>
          </div>
        </div>
      </section>
    </>
  )
}
