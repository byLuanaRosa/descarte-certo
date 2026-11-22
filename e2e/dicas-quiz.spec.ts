import { expect, test } from "@playwright/test";

test("dicas filtram por tema", async ({ page }) => {
  await page.goto("/dicas");
  await expect(page.getByText(/10 dica\(s\) encontrada\(s\)/)).toBeVisible();
  await page.getByRole("navigation", { name: "Filtrar por tema" }).getByRole("link", { name: "Reduzir" }).click();
  await expect(page).toHaveURL(/tema=Reduzir/);
  await expect(page.getByText(/2 dica\(s\) encontrada\(s\)/)).toBeVisible();
});

test("quiz Kids mostra aviso, responde, avança e termina", async ({ page }) => {
  await page.goto("/kids");
  await expect(page.getByRole("note")).toContainText("CHAME UM ADULTO");
  await expect(page.getByText("Pergunta 1 de 8")).toBeVisible();

  // Pergunta 1: a resposta certa é "Papel"
  await page.getByRole("button", { name: /Papel/ }).click();
  await expect(page.getByText("✓ Resposta correta")).toBeVisible();
  await expect(page.getByText(/1 acerto/)).toBeVisible();
  await page.getByRole("button", { name: "Próxima pergunta" }).click();
  await expect(page.getByText("Pergunta 2 de 8")).toBeVisible();

  // Responde o resto com a primeira alternativa, só para chegar ao fim
  for (let i = 2; i <= 8; i++) {
    await page.getByRole("list", { name: "Alternativas" }).getByRole("button").first().click();
    await page.getByRole("button", { name: i === 8 ? "Ver resultado" : "Próxima pergunta" }).click();
  }
  await expect(page.getByRole("heading", { name: /Você fez \d de 8 pontos/ })).toBeVisible();
  await page.getByRole("button", { name: "Jogar de novo" }).click();
  await expect(page.getByText("Pergunta 1 de 8")).toBeVisible();
});

test("quiz funciona só com teclado", async ({ page, isMobile }) => {
  test.skip(isMobile, "teclado só no desktop");
  await page.goto("/kids");
  const papel = page.getByRole("button", { name: /Papel/ });
  await papel.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Próxima pergunta" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Pergunta 2 de 8")).toBeVisible();
});
