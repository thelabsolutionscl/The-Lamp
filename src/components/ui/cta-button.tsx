import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CtaButtonProps {
  href: string
  children: ReactNode
  variant?: "primary" | "secondary"
  size?: "md" | "lg"
  icon?: LucideIcon
  arrow?: boolean
  external?: boolean
  className?: string
  id?: string
  onClick?: () => void
  "aria-label"?: string
}

/**
 * Botón CTA animado: hover lift, sombra glow, barrido de brillo y flecha
 * opcional. Idéntico al de la web de The Lab Solutions, con el acento en
 * gris 50% (#808080) en vez de teal. Respeta prefers-reduced-motion.
 * Server Component puro — usa <Link> en rutas internas, <a> en el resto.
 */
export function CtaButton({
  href,
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  arrow = false,
  external = false,
  className,
  ...rest
}: CtaButtonProps) {
  const base =
    "group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg font-semibold transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#808080]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:transition-none motion-reduce:hover:translate-y-0"

  const sizes = {
    md: "px-6 py-3 text-sm",
    lg: "px-7 py-3.5 text-sm",
  }

  const variants = {
    primary:
      "bg-[#808080] text-[#0a0a0a] shadow-[0_4px_22px_-6px_#8080808c] hover:-translate-y-0.5 hover:bg-[#999999] hover:shadow-[0_14px_40px_-8px_#808080b3]",
    secondary:
      "border border-white/[0.14] text-white/70 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04] hover:text-white",
  }

  const classes = cn(base, sizes[size], variants[variant], className)

  const inner = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-[250%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-[450%] motion-reduce:hidden" />
        </span>
      )}
      {Icon && <Icon className="relative z-10 h-4 w-4" />}
      <span className="relative z-10">{children}</span>
      {arrow && (
        <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
      )}
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {inner}
      </a>
    )
  }

  if (href.startsWith("/") && !href.startsWith("/#")) {
    return (
      <Link href={href} className={classes} {...rest}>
        {inner}
      </Link>
    )
  }

  return (
    <a href={href} className={classes} {...rest}>
      {inner}
    </a>
  )
}
