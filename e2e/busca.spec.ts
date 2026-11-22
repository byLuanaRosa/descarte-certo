import { expect, test } from "@playwright/test";

test("buscar 'lampada' na página inicial encontra lâmpadas", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "O que você quer descartar?" }).fill("lampada");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/\/buscar\?q=lampada/);
  await expect(page.getByText(/resultado\(s\) para “lampada”/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Lâmpada fluorescente/ })).toBeVisible();
});

test("filtro por categoria mostra só a categoria", async ({ page }) => {
  await page.goto("/buscar?categoria=medicamentos");
  await expect(page.getByRole("link", { name: /Medicamentos vencidos/ })).toBeVisible();
  await expect(page.locator('a[href="/material/pilhas"]')).toHaveCount(0);
});

test("termo inexistente mostra 'Nenhum resultado'", async ({ page }) => {
  await page.goto("/buscar?q=xyzabc");
  await expect(page.getByText(/Nenhum resultado/)).toBeVisible();
});

test("ficha do material mostra riscos antes do destino e a fonte", async ({ page }) => {
  await page.goto("/material/lampada-fluorescente");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lâmpada fluorescente");
  const riscos = page.getByRole("heading", { name: /Riscos associados/ });
  const destino = page.getByRole("heading", { name: "Destino correto" });
  await expect(riscos).toBeVisible();
  const yRiscos = (await riscos.boundingBox())!.y;
  const yDestino = (await destino.boundingBox())!.y;
  expect(yRiscos).toBeLessThan(yDestino);
  await expect(page.getByRole("link", { name: /Reciclus/ })).toBeVisible();
});

test("material inexistente responde 404", async ({ page }) => {
  const resposta = await page.goto("/material/nao-existe");
  expect(resposta?.status()).toBe(404);
});
