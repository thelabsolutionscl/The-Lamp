import type { MetadataRoute } from "next"

// PWA: permite instalar The Lamp como app en el teléfono (una app de luces se
// usa desde el móvil). Se sirve en /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Lamp · Control de iluminación",
    short_name: "The Lamp",
    description:
      "Controla las luces de tu casa: escenas, ambientes, intensidad y temperatura de color.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/lamp-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/lamp-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  }
}
