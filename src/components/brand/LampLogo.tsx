import { cn } from "@/lib/utils"

// Marca oficial de The Lamp: ampolleta inclinada (trazo blanco, casquillo
// azul) + wordmark "THE LAMP" en Montserrat extra bold. El azul del casquillo
// es la única excepción cromática a la paleta monocroma de la app.
export function LampMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-1 -1 26 26" fill="none" className={className} aria-hidden="true">
      <g transform="rotate(35 12 12)">
        {/* Vidrio de la ampolleta */}
        <path
          d="M12 2.6a6.6 6.6 0 0 1 6.6 6.6c0 2.3-1.1 3.6-2.2 4.8-.7.8-1.2 1.5-1.4 2.4h-6c-.2-.9-.7-1.6-1.4-2.4-1.1-1.2-2.2-2.5-2.2-4.8A6.6 6.6 0 0 1 12 2.6Z"
          stroke="#f0f0f0"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        {/* Brillo/filamento */}
        <path
          d="M10.1 8.2 13.6 11.7"
          stroke="#f0f0f0"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        {/* Casquillo azul */}
        <path d="M9.7 18.9h4.6" stroke="#3FA9F5" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M10.2 21.3h3.6" stroke="#3FA9F5" strokeWidth="1.9" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function LampLogo({
  className,
  iconClassName,
  textClassName,
}: {
  className?: string
  iconClassName?: string
  textClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LampMark className={cn("h-6 w-6", iconClassName)} />
      <span
        className={cn(
          "font-extrabold uppercase tracking-[0.05em] text-white",
          textClassName,
        )}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        The&nbsp;Lamp
      </span>
    </span>
  )
}
