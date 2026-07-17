import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// <LumaSpin> — loader "luma": dos figuras redondeadas que recorren las esquinas
// de un cuadro, creando un giro/pliegue continuo. Mismo componente que la web
// de The Lab Solutions, adaptado a The Lamp: una figura en gris 50% (#00d4cc)
// y la otra en blanco. CSS puro, sin dependencias.
// Respeta prefers-reduced-motion. Accesible (role=status).
// ─────────────────────────────────────────────────────────────────────────────

type LumaSpinProps = {
  /** Lado del cuadro en px. */
  size?: number
  /** Color de la primera figura (por defecto el gris 50% de marca). */
  color?: string
  /** Color de la segunda figura. */
  color2?: string
  /** Grosor del trazo de cada figura en px. */
  stroke?: number
  className?: string
  /** Texto para lectores de pantalla. */
  label?: string
}

export function LumaSpin({
  size = 44,
  color = "#00d4cc",
  color2 = "#f4f4f5",
  stroke = 3,
  className,
  label = "Cargando…",
}: LumaSpinProps) {
  // Separación entre esquinas: misma proporción (35/65) que el original.
  const gap = Math.round(size * 0.54)
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size, ["--ls-gap"]: `${gap}px` } as CSSProperties}
    >
      <style>{`
        @keyframes ls-luma{
          0%{inset:0 var(--ls-gap) var(--ls-gap) 0}
          12.5%{inset:0 var(--ls-gap) 0 0}
          25%{inset:var(--ls-gap) var(--ls-gap) 0 0}
          37.5%{inset:var(--ls-gap) 0 0 0}
          50%{inset:var(--ls-gap) 0 0 var(--ls-gap)}
          62.5%{inset:0 0 0 var(--ls-gap)}
          75%{inset:0 0 var(--ls-gap) var(--ls-gap)}
          87.5%{inset:0 0 var(--ls-gap) 0}
          100%{inset:0 var(--ls-gap) var(--ls-gap) 0}
        }
        .ls-luma-fig{position:absolute;border-radius:9999px;animation:ls-luma 2.5s infinite;will-change:inset}
        @media (prefers-reduced-motion:reduce){.ls-luma-fig{animation-duration:0s}}
      `}</style>
      <span className="ls-luma-fig" style={{ boxShadow: `inset 0 0 0 ${stroke}px ${color}` }} />
      <span
        className="ls-luma-fig"
        style={{ boxShadow: `inset 0 0 0 ${stroke}px ${color2}`, animationDelay: "-1.25s" }}
      />
    </span>
  )
}
