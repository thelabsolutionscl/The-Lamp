// Mini-proxy HTTP → WiZ (UDP). Las ampolletas WiZ se controlan por UDP en el
// puerto 38899, no por HTTP, así que no se pueden conectar directo a The Lamp.
// Este proxy expone endpoints HTTP simples que The Lamp sí puede llamar, y él
// traduce a los comandos UDP de WiZ. Corre en tu red local (misma WiFi que las
// ampolletas). Sin dependencias — solo Node.
//
//   node tools/wiz-proxy.mjs        (o: npm run wiz)
//
// Luego, en The Lamp, conecta cada luz con (cambia la IP por la de tu ampolleta):
//   Encender : http://localhost:3400/on?ip=192.168.1.77
//   Apagar   : http://localhost:3400/off?ip=192.168.1.77
//   Brillo   : http://localhost:3400/brightness?ip=192.168.1.77&b={brightness}
//   Color    : http://localhost:3400/color?ip=192.168.1.77&r={r}&g={g}&b={b}
//
// Descubre las ampolletas de tu red: abre http://localhost:3400/discover

import http from "node:http"
import dgram from "node:dgram"

const HTTP_PORT = 3400
const WIZ_PORT = 38899

/** Envía un comando UDP a una ampolleta WiZ y espera (breve) su respuesta. */
function sendWiz(ip, payload) {
  return new Promise((resolve) => {
    const sock = dgram.createSocket("udp4")
    let done = false
    const finish = (result) => {
      if (done) return
      done = true
      try { sock.close() } catch {}
      resolve(result)
    }
    sock.on("message", (m) => finish({ ok: true, response: m.toString() }))
    sock.on("error", (e) => finish({ ok: false, error: String(e) }))
    sock.send(Buffer.from(JSON.stringify(payload)), WIZ_PORT, ip, (err) => {
      if (err) finish({ ok: false, error: String(err) })
    })
    // Si no contesta en 1.2s, igual se envió: lo damos por ok.
    setTimeout(() => finish({ ok: true, response: null }), 1200)
  })
}

/** Descubre ampolletas WiZ por broadcast UDP. */
function discover() {
  return new Promise((resolve) => {
    const sock = dgram.createSocket("udp4")
    const found = []
    sock.on("message", (m, rinfo) => {
      try {
        const d = JSON.parse(m.toString())
        if (d.result && d.result.mac) found.push({ ip: rinfo.address, mac: d.result.mac })
      } catch {}
    })
    sock.on("error", () => {})
    sock.bind(() => {
      sock.setBroadcast(true)
      const reg = Buffer.from(JSON.stringify({
        method: "registration",
        params: { phoneMac: "AAAAAAAAAAAA", register: false, phoneIp: "1.2.3.4" },
      }))
      sock.send(reg, WIZ_PORT, "255.255.255.255")
    })
    setTimeout(() => {
      try { sock.close() } catch {}
      // Únicos por ip.
      resolve(Array.from(new Map(found.map((f) => [f.ip, f])).values()))
    }, 1500)
  })
}

http
  .createServer(async (req, res) => {
    const u = new URL(req.url, "http://x")
    const ip = u.searchParams.get("ip")
    const json = (obj, code = 200) => {
      res.writeHead(code, { "content-type": "application/json", "access-control-allow-origin": "*" })
      res.end(JSON.stringify(obj))
    }
    try {
      if (u.pathname === "/discover") return json(await discover())
      if (u.pathname === "/") return json({ ok: true, hint: "Endpoints: /on /off /brightness /color /discover (todos con ?ip=)" })
      if (!ip) return json({ error: "falta el parámetro ?ip=" }, 400)

      if (u.pathname === "/on") return json(await sendWiz(ip, { method: "setState", params: { state: true } }))
      if (u.pathname === "/off") return json(await sendWiz(ip, { method: "setState", params: { state: false } }))
      if (u.pathname === "/brightness") {
        // WiZ acepta dimming 10–100.
        const b = Math.max(10, Math.min(100, Number(u.searchParams.get("b")) || 100))
        return json(await sendWiz(ip, { method: "setPilot", params: { state: true, dimming: b } }))
      }
      if (u.pathname === "/color") {
        const r = Math.max(0, Math.min(255, Number(u.searchParams.get("r")) || 0))
        const g = Math.max(0, Math.min(255, Number(u.searchParams.get("g")) || 0))
        const b = Math.max(0, Math.min(255, Number(u.searchParams.get("b")) || 0))
        return json(await sendWiz(ip, { method: "setPilot", params: { state: true, r, g, b } }))
      }
      return json({ error: "ruta no encontrada" }, 404)
    } catch (e) {
      return json({ error: String(e) }, 500)
    }
  })
  .listen(HTTP_PORT, () => {
    console.log(`WiZ proxy escuchando en http://localhost:${HTTP_PORT}  →  UDP WiZ :${WIZ_PORT}`)
    console.log(`Descubre tus ampolletas en:  http://localhost:${HTTP_PORT}/discover`)
  })
