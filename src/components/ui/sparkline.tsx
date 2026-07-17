import { useId } from "react"

// Sparkline de área: línea + relleno degradado + punto final marcado. Sin
// dependencias, SVG puro. Acento cyan de marca. Puramente decorativo/informativo.
export function Sparkline({
  data,
  width = 120,
  height = 34,
  stroke = "#00d4cc",
  className,
  responsive = false,
}: {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  className?: string
  /** Si true, el SVG llena el ancho del contenedor (para móvil / cards angostas). */
  responsive?: boolean
}) {
  const gid = useId()
  // En modo responsivo el ancho lo pone el contenedor (CSS), no el atributo.
  const svgW = responsive ? "100%" : width
  if (data.length < 2) {
    return <svg width={svgW} height={height} className={className} aria-hidden />
  }
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const span = max - min || 1
  const pad = 2
  const w = width - pad * 2
  const h = height - pad * 2
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w
    const y = pad + h - ((v - min) / span) * h
    return [x, y] as const
  })
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${height} L${pts[0][0].toFixed(1)} ${height} Z`
  const [ex, ey] = pts[pts.length - 1]

  return (
    <svg
      width={svgW}
      height={height}
      className={className}
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={responsive ? "none" : "xMidYMid meet"}
    >
      <defs>
        <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={ex} cy={ey} r="2.2" fill={stroke} />
    </svg>
  )
}
