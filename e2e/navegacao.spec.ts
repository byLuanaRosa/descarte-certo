import { expect, test } from "@playwright/test";

const paginas = [
  { caminho: "/", titulo: /Descarte Certo/ },
  { caminho: "/buscar", titulo: /Buscar material/ },
  { caminho: "/pontos", titulo: /Pontos de coleta/ },
  { caminho: "/dicas", titulo: /Dicas ambientais/ },
  { caminho: "/kids", titulo: /Descarte Certo Kids/ },
  { caminho: "/sobre", titulo: /Sobre o Descarte Certo/ },
];

for (const { caminho, titulo } of paginas) {
  test(`a página ${caminho} abre sem rolagem horizontal`, async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (e) => erros.push(e.message));
    await page.goto(caminho);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(titulo);
    const largura = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(largura).toBeLessThanOrEqual(0);
    expect(erros).toEqual([]);
  });
}

test("o menu leva às páginas", async ({ page, isMobile }) => {
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: isMobile ? "Menu inferior" : "Menu principal" });
  await menu.getByRole("link", { name: "Dicas" }).click();
  await expect(page).toHaveURL(/\/dicas$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Dicas/);
});

test("tema claro é o padrão e o switch alterna e lembra a escolha", async ({ page, isMobile }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-tema", "claro");
  const botao = page.getByRole("switch", { name: "Modo escuro" });
  await expect(botao).toHaveAttribute("aria-checked", "false");
  const rotulo = page.getByRole("banner").getByText(/^Modo (claro|escuro)$/);
  if (!isMobile) await expect(rotulo).toHaveText("Modo claro");
  await botao.click();
  await expect(html).toHaveAttribute("data-tema", "escuro");
  if (!isMobile) await expect(rotulo).toHaveText("Modo escuro");
  await page.goto("/sobre");
  await expect(html).toHaveAttribute("data-tema", "escuro");
  await expect(page.getByRole("switch", { name: "Modo escuro" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("switch", { name: "Modo escuro" }).click();
  await expect(html).toHaveAttribute("data-tema", "claro");
});

test("o menu mostra 'Pontos de coleta'", async ({ page, isMobile }) => {
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: isMobile ? "Menu inferior" : "Menu principal" });
  await expect(menu.getByRole("link", { name: /Pontos de coleta/ })).toBeVisible();
});
