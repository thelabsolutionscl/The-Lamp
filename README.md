# The Lamp

La app del ecosistema **The Lab Solutions**. Hereda la identidad visual de
[thelab.solutions](https://thelab.solutions) — oscura, técnica y precisa — en
matiz neutro: 50% blanco y 50% negro (`#808080` como acento, en vez del teal
`#00d4cc` de la web).

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
| Tokens y keyframes de marca | `src/app/globals.css` |
| Fondo blueprint + glows | `src/components/layout/SiteBackground.tsx` |
| System Loader con porcentaje | `src/components/layout/SiteLoader.tsx` |
| Navbar con pill deslizante | `src/components/layout/Navbar.tsx` |
| Botón CTA con shine | `src/components/ui/cta-button.tsx` |
| Loader luma-spin | `src/components/ui/luma-spin.tsx` |
| Formas flotantes de fondo | `src/components/ui/shape-field.tsx` |

Regla de oro: **ningún color saturado**. Donde la web usa teal, The Lamp usa
gris 50% (`#808080`).
