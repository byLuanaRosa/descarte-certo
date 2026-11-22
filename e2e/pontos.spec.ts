import { expect, test } from "@playwright/test";
import { simularSupabase } from "./supabase-simulado";

test.describe("lista de pontos", () => {
  test("mostra os pontos aprovados e filtra por material", async ({ page }) => {
    await simularSupabase(page);
    await page.goto("/pontos");
    await expect(page.getByText("3 ponto(s) encontrado(s).")).toBeVisible();
    await page.getByLabel("Material").selectOption("oleo-cozinha");
    await expect(page.getByText("2 ponto(s) encontrado(s).")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ecoponto Capoeiras" })).toHaveCount(0);
  });

  test("o filtro vem da ficha do material pela URL", async ({ page }) => {
    await simularSupabase(page);
    await page.goto("/pontos?material=pilhas");
    await expect(page.getByLabel("Material")).toHaveValue("pilhas");
    await expect(page.getByText("2 ponto(s) encontrado(s).")).toBeVisible();
  });

  test("cada ponto tem 'Como chegar' com o destino e o aviso de confirmação", async ({ page }) => {
    await simularSupabase(page);
    await page.goto("/pontos");
    const link = page.getByRole("link", { name: /Como chegar a Ecoponto Capoeiras/ });
    await expect(link).toHaveAttribute("href", /destination=-27\.5970218,-48\.6028838/);
    await expect(page.getByText(/Verificado em 11\/2026/).first()).toBeVisible();
  });

  test("mostra mensagem amigável se o banco estiver fora do ar", async ({ page }) => {
    await simularSupabase(page, { falhar: true });
    await page.goto("/pontos");
    await expect(page.getByText(/Não foi possível carregar os pontos/)).toBeVisible();
  });

  test("a ficha do material lista os pontos que recebem o material", async ({ page }) => {
    await simularSupabase(page);
    await page.goto("/material/oleo-cozinha");
    await expect(page.getByRole("heading", { name: "Ecoponto Ingleses" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ecoponto Capoeiras" })).toHaveCount(0);
  });
});

test.describe("com localização permitida", () => {
  test.use({ geolocation: { latitude: -27.592, longitude: -48.59 }, permissions: ["geolocation"] });

  test("ordena do mais perto ao mais longe sem enviar a posição", async ({ page }) => {
    const urls: string[] = [];
    page.on("request", (r) => urls.push(r.url() + (r.postData() ?? "")));
    await simularSupabase(page);
    await page.goto("/pontos");
    await page.getByRole("button", { name: /Usar minha localização/ }).click();
    await expect(page.getByText(/do mais perto ao mais longe/)).toBeVisible();
    await expect(page.getByRole("heading", { level: 3 }).first()).toHaveText("Ecoponto Capoeiras");
    // RN03: nenhuma requisição leva a posição do usuário
    expect(urls.some((u) => u.includes("-27.592") || u.includes("-48.59,") || u.includes("-48.59&"))).toBe(false);
  });
});

test.describe("com localização negada", () => {
  test.use({ permissions: [] });

  test("avisa e mostra todos os pontos", async ({ page }) => {
    await simularSupabase(page);
    await page.goto("/pontos");
    await page.getByRole("button", { name: /Usar minha localização/ }).click();
    await expect(page.getByText(/Não foi possível usar sua localização/)).toBeVisible();
    await expect(page.getByText("3 ponto(s) encontrado(s).")).toBeVisible();
  });
});
