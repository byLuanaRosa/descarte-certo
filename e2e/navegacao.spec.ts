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
