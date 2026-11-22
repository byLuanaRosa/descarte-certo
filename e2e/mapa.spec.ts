import { expect, test } from "@playwright/test";
import { simularSupabase } from "./supabase-simulado";

test("aba Mapa mostra um marcador por ponto, com popup e Como chegar", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  // Não depende do servidor de mapas: os quadros do mapa voltam vazios.
  await page.route("**/tile.openstreetmap.org/**", (r) => r.fulfill({ status: 204, body: "" }));
  await simularSupabase(page);

  await page.goto("/pontos");
  await expect(page.getByRole("tab", { name: "Lista" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".leaflet-container")).toHaveCount(0); // mapa só monta quando a aba abre

  await page.getByRole("tab", { name: "Mapa" }).click();
  const mapa = page.getByRole("region", { name: "Mapa dos pontos de coleta" });
  await expect(mapa).toBeVisible();
  await expect(mapa.locator(".leaflet-marker-icon")).toHaveCount(3);

  await mapa.locator('.leaflet-marker-icon[title="Ecoponto Capoeiras"]').click();
  const popup = page.locator(".leaflet-popup");
  await expect(popup).toContainText("Ecoponto Capoeiras");
  await expect(popup.getByRole("link", { name: "Como chegar" })).toHaveAttribute("href", /-27\.5970218/);
  expect(erros).toEqual([]);
});

test("o filtro de material também vale para o mapa", async ({ page }) => {
  await page.route("**/tile.openstreetmap.org/**", (r) => r.fulfill({ status: 204, body: "" }));
  await simularSupabase(page);
  await page.goto("/pontos?material=oleo-cozinha");
  await page.getByRole("tab", { name: "Mapa" }).click();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
});
