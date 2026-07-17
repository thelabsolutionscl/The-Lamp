import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// <ShapeField> — capa de fondo decorativa con formas geométricas translúcidas
// que flotan. Mismo componente que la web de The Lab Solutions, con la paleta
// traducida a monocromo: donde la web usa teal/naranjo/violeta, The Lamp usa
// grises entre el 50% y el blanco. CSS puro; respeta prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

type Shape = {
  w: number
  h: number
  grad: string
  rot: number
  dur: string
  delay: string
  pos: CSSProperties
}

const SHAPES: Shape[] = [
  { w: 460, h: 120, grad: "rgba(0,212,204,0.35)", rot: 12, dur: "11s", delay: "0s", pos: { top: "14%", left: "-4%" } },
  { w: 380, h: 100, grad: "rgba(200,200,200,0.22)", rot: -15, dur: "13s", delay: "0.6s", pos: { top: "56%", right: "-3%" } },
  { w: 250, h: 78, grad: "rgba(160,160,160,0.3)", rot: -8, dur: "12s", delay: "1.1s", pos: { bottom: "8%", left: "6%" } },
  { w: 180, h: 58, grad: "rgba(0,212,204,0.3)", rot: 20, dur: "10s", delay: "0.3s", pos: { top: "12%", right: "13%" } },
  { w: 140, h: 46, grad: "rgba(0,212,204,0.24)", rot: 28, dur: "14s", delay: "1.6s", pos: { top: "70%", left: "22%" } },
]

export function ShapeField({
  veil = true,
  className,
}: {
  /** Velo vertical que funde con las secciones vecinas y da contraste al texto. */
  veil?: boolean
  className?: string
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <style>{`
        @keyframes ts-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        .ts-float{animation:ts-float var(--ts-d) ease-in-out var(--ts-delay) infinite;will-change:transform}
        @media (prefers-reduced-motion:reduce){.ts-float{animation:none}}
      `}</style>

      {/* Formas flotantes */}
      {SHAPES.map((s, i) => (
        <div key={i} className="absolute" style={{ ...s.pos, transform: `rotate(${s.rot}deg)` }}>
          <div
            className="ts-float"
            style={{ ["--ts-d"]: s.dur, ["--ts-delay"]: s.delay } as CSSProperties}
          >
            <div
              style={{
                width: s.w,
                height: s.h,
                borderRadius: 9999,
                background: `linear-gradient(to right, ${s.grad}, transparent)`,
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(2px)",
                boxShadow: `0 8px 44px -10px ${s.grad}`,
              }}
            />
          </div>
        </div>
      ))}

      {veil && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/85 via-[#0a0a0a]/25 to-[#0a0a0a]/85" />
      )}
    </div>
  )
}
