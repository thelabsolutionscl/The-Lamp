// Rasteriza el logo (public/lamp-mark.svg) a los PNG que pide la PWA.
// Correr con: node scripts/icons.mjs
import sharp from "sharp"
import { readFileSync, mkdirSync } from "node:fs"

mkdirSync("public/icons", { recursive: true })
const svg = readFileSync("public/lamp-mark.svg")

const outputs = [
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
]

await Promise.all(
  outputs.map(([file, size]) => sharp(svg).resize(size, size).png().toFile(file)),
)
console.log("Íconos generados:", outputs.map(([f]) => f).join(", "))
