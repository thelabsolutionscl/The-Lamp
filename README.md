# The Lamp

App de **domótica para controlar la iluminación de la casa**, del ecosistema
**The Lab Solutions**. Hereda la identidad visual de
[thelab.solutions](https://thelab.solutions) — oscura, técnica y precisa — en
matiz neutro: 50% blanco y 50% negro (`#808080` como acento, en vez del teal
`#00d4cc` de la web).

## Qué hace (v0)

- Panel con estado general: luces encendidas, consumo estimado, intensidad
  promedio y ambientes activos.
- Escenas de un toque: Todo encendido, Concentración, Cine, Noche, Apagar todo.
- Control por ambiente (Living, Cocina, Dormitorio, Escritorio, Terraza) y por
  luz: switch on/off e intensidad 1–100%.
- El estado persiste en `localStorage`. **Todavía no hay puente real a
  hardware**: el modelo y la semilla viven en `src/lib/lights.ts`, que es el
  único módulo a reemplazar cuando se conecte un backend (Home Assistant,
  Tuya, Hue, etc.).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19
- Tailwind CSS 4
- TypeScript
- Tipografías: DM Sans (texto) + Montserrat (títulos), igual que la web

## Desarrollo

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # build de producción
npm run lint
```

## Identidad visual

Los tokens viven en `src/app/globals.css` (bloque `.dark`). Piezas heredadas de
la web, en versión monocroma:

| Pieza | Archivo |
| --- | --- |
| Tokens, keyframes y slider de intensidad | `src/app/globals.css` |
| Fondo blueprint + glows | `src/components/layout/SiteBackground.tsx` |
| System Loader con porcentaje | `src/components/layout/SiteLoader.tsx` |
| Navbar con pill deslizante | `src/components/layout/Navbar.tsx` |
| Botón CTA con shine (disponible para flujos futuros) | `src/components/ui/cta-button.tsx` |
| Loader luma-spin | `src/components/ui/luma-spin.tsx` |
| Formas flotantes (loader) | `src/components/ui/shape-field.tsx` |

Piezas propias de la app:

| Pieza | Archivo |
| --- | --- |
| Modelo de luces, ambientes y escenas | `src/lib/lights.ts` |
| Panel de control | `src/components/app/Dashboard.tsx` |
| Tarjeta de luz + switch | `src/components/app/LightCard.tsx` |

Regla de oro: **ningún color saturado**. Donde la web usa teal, The Lamp usa
gris 50% (`#808080`).
