# Guía: de la app a controlar luces de verdad

The Lamp puede quedarse en modo **Simulado** (para verla/mostrarla) o controlar
**dispositivos reales** vía su puente **Genérico (HTTP)**.

## ¿Tengo que hacer los 3 caminos?

**No.** Son por objetivo, no una secuencia obligatoria:

| Tu objetivo | Camino |
| --- | --- |
| Ver que funciona, sin comprar nada | **1** |
| Controlar una ampolleta real en tu casa | **2** (el 1 es opcional) |
| Usarla desde el teléfono / fuera de casa | **3** (+ dispositivo accesible por internet) |

El Camino 2 no requiere el 1. El Camino 3 es solo para uso remoto.

**Requisitos comunes:** [Node](https://nodejs.org) 18+ y `git`. Comprueba con
`node -v`.

---

## Camino 1 — Verla funcionar hoy (sin hardware, ~2 min)

1. Descarga y arranca la app:
   ```bash
   git clone https://github.com/thelabsolutionscl/The-Lamp.git
   cd The-Lamp
   npm install
   npm run dev
   ```
   Abre **http://localhost:3000**.
2. Abre [webhook.site](https://webhook.site) en otra pestaña y **copia tu URL
   única** (el recuadro "Your unique URL": `https://webhook.site/<id>`).
   ⚠️ No copies la de la barra del navegador si trae `#!/` en medio.
3. En The Lamp: **⚙️ Ajustes → "Genérico (HTTP)" → Guardar** (se recarga).
4. En una luz (Ambientes → "Cenital living") toca el **🔌**, pega tu URL en
   **"URL al encender"** y en **"URL al apagar"** → **Probar (encender)**
   (debería decir "Respondió ✓") → **Guardar**.
5. Toca el **switch** de esa luz: verás las peticiones llegar en vivo a
   webhook.site. Eso es la app mandando comandos reales. ✅

---

## Camino 2 — Controlar una ampolleta real

1. **Compra un dispositivo con API HTTP local.** El más simple para esto:
   **Shelly** (enchufe, relé o ampolleta). Alternativa: cualquiera con firmware
   **Tasmota**. (Evita las Tuya/Smart Life genéricas al principio: no tienen API
   local abierta sin trucos.)
2. **Conéctalo a tu WiFi** con su app oficial y **anota su IP local**
   (ej. `192.168.1.50`).
3. **Sus URLs** (para pegar en la app):
   - Shelly Gen2/Plus: `http://192.168.1.50/rpc/Switch.Set?id=0&on=true` /
     `...&on=false`
   - Shelly Gen1: `http://192.168.1.50/relay/0?turn=on` / `...?turn=off`
   - Tasmota: `http://192.168.1.50/cm?cmnd=Power%20On` / `...Power%20Off`
4. **Corre la app en un dispositivo de la MISMA WiFi** (pasos de Camino 1).
   ⚠️ Importante: la app tiene que poder alcanzar la IP local del aparato.
5. En la app: **⚙️ Ajustes → Genérico → Guardar**. En tu luz, **🔌** → pega las
   URLs de encender/apagar (y opcional la de brillo) → **Probar** → **Guardar**.
6. El **switch de la app** ahora enciende y apaga la ampolleta real. 🎉

---

## Camino 3 — Usarla desde el teléfono / fuera de casa (desplegar)

1. Crea una cuenta gratis en **Cloudflare**.
2. En el repo:
   ```bash
   npx wrangler login
   npm run deploy
   ```
   Te queda una URL `https://the-lamp.<tu-cuenta>.workers.dev`, instalable como
   app (PWA) en el teléfono.
3. ⚠️ **Dispositivos locales**: la versión desplegada vive en la nube y **no
   alcanza una IP `192.168.x.x`** de tu casa. Para controlarlos desde afuera el
   dispositivo tiene que ser accesible por internet (**Shelly Cloud**, o un túnel
   como **Cloudflare Tunnel** hacia tu red). Para uso solo-en-casa, el Camino 2
   (app corriendo en tu red) basta.

---

## Si algo se traba

- **Error al instalar/arrancar** → casi siempre Node viejo; instala la LTS.
- **"Port 3000 in use"** → usa el puerto que indique (ej. 3001) o cierra lo que
  lo ocupa.
- **"Probar" dice "No respondió"** → revisa que la URL esté completa (`http://…`
  o `https://…`) y reintenta. Si es un aparato local, confirma que estás en la
  misma WiFi y que la IP es correcta.
