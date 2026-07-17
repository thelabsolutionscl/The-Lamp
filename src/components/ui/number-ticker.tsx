"use client"

import { useEffect, useRef, useState } from "react"

// Número que "cuenta" hacia su valor al cambiar (ease-out). Respeta
// prefers-reduced-motion (salta directo). Mismo lenguaje que el NumberTicker
// de la web de The Lab Solutions.
export function NumberTicker({
  value,
  duration = 500,
  format,
  className,
}: {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const [display, setDisplay] = useState(value)
  const from = useRef(value)
  const raf = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (typeof window === "undefined") return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || from.current === value) {
      setDisplay(value)
      from.current = value
      return
    }
    const a = from.current
    const b = value
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(a + (b - a) * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else from.current = b
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [value, duration])

  return <span className={className}>{format ? format(display) : Math.round(display)}</span>
}
