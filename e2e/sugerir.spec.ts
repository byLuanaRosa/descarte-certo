import { expect, test, type Page } from "@playwright/test";
import { simularSupabase } from "./supabase-simulado";

async function prepararPagina(page: Page, enderecoEncontrado: boolean) {
  await page.route("**/tile.openstreetmap.org/**", (r) => r.fulfill({ status: 204, body: "" }));
  let buscasNominatim = 0;
  await page.route("**/nominatim.openstreetmap.org/**", (r) => {
    buscasNominatim++;
    return r.fulfill({
      contentType: "application/json",
      json: enderecoEncontrado ? [{ lat: "-27.5969", lon: "-48.5495" }] : [],
    });
  });
  const { inseridos } = await simularSupabase(page);
  await page.goto("/pontos/sugerir");
  return { inseridos, buscas: () => buscasNominatim };
}

async function preencherBasico(page: Page) {
  await page.getByLabel("Nome do local *").fill("Farmácia Central");
  await page.getByLabel("Medicamentos vencidos ou sem uso").check();
  await page.getByLabel("Endereço", { exact: true }).fill("Rua Felipe Schmidt, 100 - Centro, Florianópolis");
}

test("sugere ponto localizando o endereço e envia como pendente", async ({ page }) => {
  const { inseridos, buscas } = await prepararPagina(page, true);
  await preencherBasico(page);
  await page.getByRole("button", { name: /Localizar no mapa/ }).click();
  await expect(page.getByText(/Confira o pino/)).toBeVisible();
  await expect(page.getByText("Local marcado: -27.59690, -48.54950")).toBeVisible();
  expect(buscas()).toBe(1);

  await page.getByRole("button", { name: "Enviar sugestão" }).click();
  await expect(page.getByRole("heading", { name: /Seu ponto será verificado/ })).toBeVisible();
  expect(inseridos).toHaveLength(1);
  expect(inseridos[0]).toMatchObject({
    nome: "Farmácia Central",
    latitude: -27.5969,
    longitude: -48.5495,
    materiais: ["medicamentos-vencidos"],
  });
  expect(inseridos[0]).not.toHaveProperty("status");
});

test("endereço não encontrado: marca tocando no mapa", async ({ page }) => {
  const { inseridos } = await prepararPagina(page, false);
  await preencherBasico(page);
  await page.getByRole("button", { name: /Localizar no mapa/ }).click();
  await expect(page.getByText(/Não encontramos esse endereço/)).toBeVisible();

  await page.getByRole("region", { name: "Mapa para marcar o local do ponto" }).click();
  await expect(page.getByText(/Local marcado:/)).toBeVisible();
  await page.getByRole("button", { name: "Enviar sugestão" }).click();
  await expect(page.getByRole("heading", { name: /Seu ponto será verificado/ })).toBeVisible();
  expect(inseridos).toHaveLength(1);
});

test("não envia sem marcar o local nem sem material", async ({ page }) => {
  const { inseridos } = await prepararPagina(page, true);
  await page.getByLabel("Nome do local *").fill("Farmácia Central");
  await page.getByRole("button", { name: "Enviar sugestão" }).click();
  await expect(page.getByText("Marque pelo menos um material aceito.")).toBeVisible();
  await expect(page.getByText(/Marque o local no mapa/)).toBeVisible();
  expect(inseridos).toHaveLength(0);
});

test.describe("Estou aqui", () => {
  test.use({ geolocation: { latitude: -27.6, longitude: -48.52 }, permissions: ["geolocation"] });

  test("usa o GPS para colocar o pino", async ({ page }) => {
    await prepararPagina(page, true);
    await page.getByRole("button", { name: /Estou aqui/ }).click();
    await expect(page.getByText("Local marcado: -27.60000, -48.52000")).toBeVisible();
  });
});

test("robô que preenche o campo invisível não grava nada", async ({ page }) => {
  const { inseridos } = await prepararPagina(page, true);
  await preencherBasico(page);
  await page.locator("#site").fill("http://spam.example", { force: true });
  await page.getByRole("button", { name: "Enviar sugestão" }).click();
  await expect(page.getByRole("heading", { name: /Seu ponto será verificado/ })).toBeVisible();
  expect(inseridos).toHaveLength(0);
});
