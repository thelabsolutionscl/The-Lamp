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
respiran, DM Sans + Montserrat, System Loader con porcentaje) con una regla:
**el acento es siempre gris 50%** (`#808080` = 50% blanco + 50% negro) donde la
web usa teal `#00d4cc`. No introducir colores con saturación; la paleta de la
app es 100% monocroma. Únicas excepciones: `--destructive` para errores y el
azul `#3FA9F5` del casquillo del logo oficial (solo en la marca, nunca en UI).
