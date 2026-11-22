import { expect, test } from "@playwright/test";

test("dicas filtram por tema e trazem a dica de não lavar embalagens", async ({ page }) => {
  await page.goto("/dicas");
  await expect(page.getByText(/10 dica\(s\) encontrada\(s\)/)).toBeVisible();
  await expect(page.getByText(/Não precisa lavar! Um guardanapo usado/)).toBeVisible();
  await page.getByRole("navigation", { name: "Filtrar por tema" }).getByRole("link", { name: "Reduzir" }).click();
  await expect(page).toHaveURL(/tema=Reduzir/);
  await expect(page.getByText(/2 dica\(s\) encontrada\(s\)/)).toBeVisible();
});

test.describe("quiz Kids", () => {
  test("mostra aviso, dois níveis e imagens nas perguntas", async ({ page }) => {
    await page.goto("/kids");
    await expect(page.getByRole("note")).toContainText("CHAME UM ADULTO");
    await expect(page.getByRole("radio", { name: /Até 10 anos/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("img", { name: "Caixa de papelão" })).toBeVisible();
    await page.getByRole("radio", { name: /A partir de 10 anos/ }).click();
    await expect(page.getByRole("img", { name: "Garrafa de óleo de cozinha" })).toBeVisible();
  });

  test("errou: anima, dá dica e repete a mesma pergunta até acertar", async ({ page }) => {
    await page.goto("/kids");
    const alternativas = page.getByRole("list", { name: "Alternativas" });
    await alternativas.getByRole("button", { name: /Plástico/ }).click();
    await expect(page.getByText("Ops! Tente de novo")).toBeVisible();
    await expect(page.getByText(/Dica:/)).toBeVisible();
    // volta sozinho para a mesma pergunta, com a alternativa errada desativada
    await expect(page.getByText("Ops! Tente de novo")).toBeHidden({ timeout: 5000 });
    await expect(page.getByText("Pergunta 1 de 8")).toBeVisible();
    await expect(alternativas.getByRole("button", { name: /Plástico/ })).toBeDisabled();

    await alternativas.getByRole("button", { name: /Papel/ }).click();
    await expect(page.getByText("Acertou!", { exact: true })).toBeVisible();
    // avança sozinho depois da comemoração
    await expect(page.getByText("Pergunta 2 de 8")).toBeVisible({ timeout: 6000 });
    await expect(page.getByText("⭐ 0")).toBeVisible(); // errou antes: não ganha estrela
  });

  test("completa o nível e pode jogar de novo", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/kids");
    const respostas = ["Papel", "Lixeira de reciclar", "Plástico", "Dar para um adulto levar", "Não tocar e chamar um adulto", "Usar de novo", "Papel", "Um adulto leva à farmácia"];
    for (const [i, resposta] of respostas.entries()) {
      await expect(page.getByText(`Pergunta ${i + 1} de 8`)).toBeVisible({ timeout: 6000 });
      await page.getByRole("list", { name: "Alternativas" }).getByRole("button", { name: resposta, exact: false }).first().click();
      await expect(page.getByText("Acertou!", { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "Você completou o quiz!" })).toBeVisible({ timeout: 6000 });
    await expect(page.getByText("Acertou de primeira 8 de 8 perguntas.")).toBeVisible();
    await page.getByRole("button", { name: "Jogar de novo" }).click();
    await expect(page.getByText("Pergunta 1 de 8")).toBeVisible();
  });

  test("o som pode ser desligado e a escolha fica salva", async ({ page }) => {
    await page.goto("/kids");
    const som = page.getByRole("button", { name: "Som" });
    await expect(som).toHaveAttribute("aria-pressed", "true");
    await som.click();
    await expect(som).toHaveAttribute("aria-pressed", "false");
    await page.reload();
    await expect(page.getByRole("button", { name: "Som" })).toHaveAttribute("aria-pressed", "false");
  });
});
