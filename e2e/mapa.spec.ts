import { expect, test } from "@playwright/test";
import { simularSupabase } from "./supabase-simulado";

test.beforeEach(async ({ page }) => {
  // Não depende do servidor de mapas: os quadros do mapa voltam vazios.
  await page.route("**/tile.openstreetmap.org/**", (r) => r.fulfill({ status: 204, body: "" }));
  await simularSupabase(page);
});

test("o mapa fica acima da lista, sem abas, com popup e Como chegar", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await page.goto("/pontos");

  await expect(page.getByRole("tab")).toHaveCount(0);
  const mapa = page.getByRole("region", { name: "Mapa dos pontos de coleta" });
  const lista = page.getByRole("list", { name: "Lista de pontos de coleta" });
  await expect(mapa).toBeVisible();
  await expect(lista).toBeVisible();
  expect((await mapa.boundingBox())!.y).toBeLessThan((await lista.boundingBox())!.y);
  await expect(mapa.locator(".leaflet-marker-icon")).toHaveCount(3);

  await mapa.locator('.leaflet-marker-icon[title="Ecoponto Capoeiras"]').click();
  const popup = page.locator(".leaflet-popup");
  await expect(popup).toContainText("Ecoponto Capoeiras");
  await expect(popup.getByRole("link", { name: "Como chegar" })).toHaveAttribute("href", /-27\.5970218/);
  expect(erros).toEqual([]);
});

test("o filtro de material também vale para o mapa", async ({ page }) => {
  await page.goto("/pontos?material=oleo-cozinha");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
});

test("a busca filtra a lista e o mapa pelo nome ou bairro", async ({ page }) => {
  await page.goto("/pontos");
  await page.getByLabel("Buscar ponto").fill("capoeiras");
  await expect(page.getByText("1 ponto(s) encontrado(s).")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ecoponto Capoeiras" })).toBeVisible();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
  await page.getByLabel("Buscar ponto").fill("xyzabc");
  await expect(page.getByText(/Nenhum ponto encontrado com esse nome ou endereço/)).toBeVisible();
});

test("os materiais aceitos aparecem em lista, em ordem alfabética", async ({ page }) => {
  await page.goto("/pontos");
  const card = page.getByRole("article").filter({ hasText: "Ecoponto Canasvieiras" });
  await card.getByText(/Materiais aceitos/).click();
  await expect(card.locator("details li")).toHaveText(["Óleo de cozinha usado", "Papel e papelão", "Pilhas"]);
});
