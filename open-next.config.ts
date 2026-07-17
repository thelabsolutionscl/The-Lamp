import { defineCloudflareConfig } from "@opennextjs/cloudflare"

// The Lamp es esencialmente estática (una SPA cliente), así que la config por
// defecto basta. Si más adelante hay ISR/SSR pesado, se puede añadir una caché
// incremental en R2 como en web-thelab-solutions.
export default defineCloudflareConfig()
