# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Qué es The Lamp

App de domótica para controlar la iluminación de la casa: escenas, ambientes y
luces individuales (switch + intensidad). La v0 simula los dispositivos en el
cliente; el modelo vive en `src/lib/lights.ts` y es el punto de enchufe para un
puente real (Home Assistant, Tuya, Hue, etc.). No convertir esto en un sitio de
marketing: es una herramienta.

# Identidad visual

The Lamp hereda la identidad visual de `web-thelab-solutions` (oscuro + técnico:
fondo `#0a0a0a`, superficies `#111/#1a1a1a`, grilla blueprint, glows que
respiran, DM Sans + Montserrat, System Loader con porcentaje) **incluido su
acento cyan/teal de marca `#00d4cc`** (variantes: hover `#19ddd5`, glows
`rgba(0,212,204,α)`, gradiente de barras `#00d4aa → #00d4cc`).

Regla de uso del acento: base oscura y neutra; el cyan entra como **toque** en
lo vivo/activo/interactivo (switch encendido, relleno del slider, glow de luz
encendida, icon-box "lit", punto "En línea", barra de stats, pill del navbar,
System Loader, focus rings, `::selection`) y en la atmósfera (glows del fondo).
Lo estructural/inactivo (bordes, superficies, eyebrows, texto muted) se queda
en gris neutro. El logo también usa el cyan de marca en el casquillo de la
ampolleta. No sumar otros colores saturados; única excepción cromática extra:
`--destructive` para errores.
