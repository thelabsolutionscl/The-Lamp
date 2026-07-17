# The Lamp

App de **domótica para controlar la iluminación de la casa**, del ecosistema
**The Lab Solutions**. Hereda la identidad visual de
[thelab.solutions](https://thelab.solutions) — oscura, técnica y precisa — con
su acento cyan de marca (`#00d4cc`) reservado para lo vivo/activo y la atmósfera.

## Qué hace

- **Panel de estado**: luces encendidas, consumo estimado (con sparkline),
  costo proyectado en CLP (tarifa editable) e intensidad promedio.
- **Intensidad general** (master) y **grupos rápidos** por tipo de luz
  (cenitales, sobremesa, tiras LED…).
- **Escenas** de un toque + **escenas personalizadas** (guarda el estado actual).
- **Automatizaciones**: dispara escenas o ambientes por hora o por atardecer/
  amanecer, con días configurables. Un scheduler en el cliente las ejecuta.
- **Control por ambiente y por luz**: switch, intensidad 1–100%, **temperatura
  de color** (cálida ↔ fría) y **color RGB** en las luces que lo soportan. La
  tarjeta “emite”: el glow toma el color real de la luz y escala con el brillo.
- **Deshacer** (toast) tras aplicar escenas o apagar todo.
- **PWA instalable** + barra de acciones rápidas en móvil.
- Persistencia en `localStorage`.

## Arquitectura: puente a hardware

La app nunca habla con dispositivos directamente: pasa por un **`LightBridge`**
(`src/lib/bridge.ts`). La v0 usa `MockBridge` (estado simulado en localStorage).
Para producción se implementa la misma interfaz contra un puente real
(Home Assistant, Hue, Tuya…) y se cambia `getBridge()` — el resto de la app no
cambia. El modelo y la semilla viven en `src/lib/lights.ts`.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19
- Tailwind CSS 4 · TypeScript
- Vitest (tests de lógica) · OpenNext + Cloudflare Workers (deploy)
- Tipografías: DM Sans (texto) + Montserrat (títulos), igual que la web

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm run lint
npm test        # tests unitarios (vitest)
```

## Deploy (Cloudflare Workers)

Configurado con [OpenNext](https://opennext.js.org/cloudflare) como la web:

```bash
npm run preview   # build + preview local en el runtime de Workers
npm run deploy    # build + deploy a Cloudflare (requiere wrangler login)
```

`wrangler.jsonc` define el Worker (`the-lamp`). Ajusta el `name` y añade una
caché R2 si más adelante hay ISR/SSR pesado.

## Estructura

| Área | Archivos |
| --- | --- |
| Modelo, semilla y helpers | `src/lib/lights.ts` |
| Puente a dispositivos | `src/lib/bridge.ts` |
| Automatizaciones (modelo + scheduler puro) | `src/lib/automations.ts` |
| Consumo y costo | `src/lib/energy.ts` |
| Store (estado, acciones, persistencia, scheduler) | `src/components/app/lights-store.tsx` |
| Panel y secciones | `src/components/app/*` |
| Identidad (loader, fondo, navbar, logo) | `src/components/layout/*`, `src/components/brand/*` |

Regla de identidad (ver `AGENTS.md`): base oscura y neutra; el cyan de marca
entra como **toque** en lo activo/vivo y en la atmósfera. Sin otros colores
saturados (excepto `--destructive` y el color propio de cada luz).
