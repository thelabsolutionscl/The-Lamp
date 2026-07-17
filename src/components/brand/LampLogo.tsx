import { Lamp } from "lucide-react"
import { cn } from "@/lib/utils"

// Marca de The Lamp: ícono + wordmark en Montserrat (la fuente de títulos de
// la identidad The Lab). Todo en monocromo: ícono gris 50% y texto blanco.
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
      <Lamp className={cn("h-5 w-5 text-[#808080]", iconClassName)} aria-hidden />
      <span
        className={cn(
          "font-bold uppercase tracking-[0.22em] text-white",
          textClassName,
        )}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        The&nbsp;Lamp
      </span>
    </span>
  )
}
