"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { LampLogo } from "@/components/brand/LampLogo"

// Navbar de The Lamp: mismo lenguaje que la web de The Lab Solutions
// (header fijo que se funde al hacer scroll, pill deslizante bajo el
// cursor/foco), con el acento en gris 50% y links propios de la app.

const links = [
  { label: "Panel", href: "/" },
  { label: "Escenas", href: "#escenas" },
  { label: "Ambientes", href: "#ambientes" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // slide-tabs: un pill que se desliza al ítem del nav bajo el cursor/foco.
  const navRef = useRef<HTMLElement>(null)
  const [cursor, setCursor] = useState({ left: 0, width: 0, opacity: 0 })
  const moveCursorTo = (el: HTMLElement | null) => {
    if (!el || !navRef.current) return
    const nav = navRef.current.getBoundingClientRect()
    const box = el.getBoundingClientRect()
    setCursor({ left: box.left - nav.left, width: box.width, opacity: 1 })
  }
  const hideCursor = () => setCursor((c) => ({ ...c, opacity: 0 }))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Cierra el menú móvil con Escape.
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? "bg-[#0a0a0a]/92 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={closeMobile}>
          <LampLogo iconClassName="h-12 w-12" textClassName="text-lg md:text-xl" />
        </Link>

        {/* Navegación de escritorio — slide-tabs */}
        <nav
          ref={navRef}
          aria-label="Navegación principal"
          onMouseLeave={hideCursor}
          className="relative hidden lg:flex items-center gap-1"
        >
          {/* Pill deslizante */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-9 -translate-y-1/2 rounded-full border border-[#00d4cc]/25 bg-[#00d4cc]/[0.12] shadow-[0_0_18px_-6px_rgba(0,212,204,0.6)] transition-all duration-300 ease-out"
            style={{ left: cursor.left, width: cursor.width, opacity: cursor.opacity }}
          />

          {links.map((l) => (
            <div
              key={l.href}
              className="relative"
              onMouseEnter={(e) => moveCursorTo(e.currentTarget)}
            >
              <Link
                href={l.href}
                onFocus={(e) => moveCursorTo(e.currentTarget.parentElement)}
                className="relative z-10 block rounded-full px-3 py-2 text-sm text-white/65 transition-colors duration-150 hover:text-white"
              >
                {l.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Estado del sistema (micro-tipografía de la identidad) */}
        <span className="hidden lg:inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[2.5px] text-white/60">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00d4cc] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00d4cc]" />
          </span>
          En línea
        </span>

        {/* Navegación móvil */}
        <button
          className="lg:hidden p-2 text-white/65 hover:text-white transition-colors"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Menú móvil"
          className="lg:hidden border-t border-white/[0.07] bg-[#0f0f0f]/97 backdrop-blur-md"
        >
          <div className="max-w-[1400px] mx-auto flex flex-col px-6 pb-6 pt-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={closeMobile}
                className="border-b border-white/[0.07] py-3 text-sm font-medium text-white/85 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
