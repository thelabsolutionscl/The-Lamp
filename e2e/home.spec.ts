import { test, expect } from "@playwright/test"

test.describe("Panel de The Lamp", () => {
  test("carga, aplica escenas y controla luces", async ({ page }) => {
    await page.goto("/")

    // Tras hidratar aparece el panel.
    await expect(page.getByRole("heading", { name: "Tu casa, en un switch." })).toBeVisible()

    const escenas = page.locator("#escenas")
    // Escena "Todo encendido" → 12/12 luces (anunciado en la región aria-live).
    await escenas.getByText("Todo encendido", { exact: true }).click()
    await expect(page.getByText(/12 de 12 luces encendidas/)).toBeVisible()

    // Escena "Apagar todo" → 0 encendidas.
    await escenas.getByText("Apagar todo", { exact: true }).click()
    await expect(page.getByText(/0 de 12 luces encendidas/)).toBeVisible()
  })

  test("temperatura de color visible al encender una luz", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Tu casa, en un switch." })).toBeVisible()

    await page.getByText("Todo encendido", { exact: true }).click()
    // La tarjeta de "Cenital living" muestra su temperatura en Kelvin.
    const card = page.locator("div", { hasText: "Cenital living" }).last()
    await expect(card.getByText(/\d{4}K/)).toBeVisible()
  })

  test("ajustes abre y cierra", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Tu casa, en un switch." })).toBeVisible()

    await page.getByRole("button", { name: "Ajustes" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("Puente de dispositivos")).toBeVisible()
    await page.getByRole("button", { name: "Cerrar ajustes" }).click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })
})
