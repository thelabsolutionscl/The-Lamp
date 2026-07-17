import type { Metadata, Viewport } from "next"
import { DM_Sans, Montserrat } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { SiteBackground } from "@/components/layout/SiteBackground"
import { SiteLoader } from "@/components/layout/SiteLoader"
import { Footer } from "@/components/layout/Footer"

// Mismas fuentes y pesos que la web de The Lab Solutions.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
})

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  // 800 = peso del wordmark del logo.
  weight: ["600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "The Lamp · Control de iluminación",
    template: "%s · The Lamp",
  },
  description:
    "The Lamp: app de domótica para controlar las luces de tu casa. Identidad visual de The Lab Solutions en matiz 50% blanco y 50% negro.",
  authors: [{ name: "The Lab Solutions" }],
  creator: "The Lab Solutions",
  // La app aún no se lanza públicamente: sin indexar hasta tener dominio y
  // contenido definitivo. Quitar al publicar.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${montserrat.variable} h-full antialiased dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Sin JS no hay forma de ocultar el loader: lo escondemos por completo. */}
        <noscript>
          <style>{`#site-loader{display:none !important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <SiteLoader />
        <SiteBackground />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#808080] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#0a0a0a]"
        >
          Saltar al contenido
        </a>
        <Navbar />
        <main id="contenido" className="flex flex-col flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
