import type { NextRequest } from "next/server"

// Backend proxy de dispositivos. La app manda aquí las peticiones HTTP que hay
// que hacer a los dispositivos reales, y este handler las ejecuta del lado
// servidor (evita CORS y "mixed content", y mantiene los secretos fuera del
// navegador). Es el "hub" mínimo que hace funcional el puente genérico.

type OutRequest = { url: string; method?: string; headers?: Record<string, string>; body?: string }

export async function POST(req: NextRequest) {
  let payload: { requests?: OutRequest[] }
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 })
  }
  const requests = Array.isArray(payload.requests) ? payload.requests : []
  if (requests.length === 0) return Response.json({ results: [] })
  if (requests.length > 8) return Response.json({ error: "Demasiadas peticiones" }, { status: 400 })

  const results = await Promise.all(
    requests.map(async (r) => {
      // Solo http/https (evita esquemas raros); el usuario configura sus propias URLs.
      if (!/^https?:\/\//i.test(r.url || "")) return { ok: false, error: "URL no válida" }
      try {
        const res = await fetch(r.url, {
          method: r.method || "GET",
          headers: r.headers,
          body: r.body,
          signal: AbortSignal.timeout(6000),
        })
        return { ok: res.ok, status: res.status }
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "fallo de red" }
      }
    }),
  )
  return Response.json({ results })
}
