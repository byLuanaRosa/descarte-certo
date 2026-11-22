import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { simularSupabase } from "./supabase-simulado";

// RNF06: nenhuma violação grave ou crítica das regras WCAG 2.1 A/AA nas páginas do MVP.
const paginas = ["/", "/buscar?q=lampada", "/material/pilhas", "/pontos", "/pontos/sugerir", "/dicas", "/kids", "/sobre", "/admin"];

for (const caminho of paginas) {
  for (const tema of ["light", "dark"] as const) {
    test(`acessibilidade de ${caminho} (tema ${tema === "light" ? "claro" : "escuro"})`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("descarte-certo:tema", t), tema === "dark" ? "escuro" : "claro");
      await page.route("**/tile.openstreetmap.org/**", (r) => r.fulfill({ status: 204, body: "" }));
      await simularSupabase(page);
      await page.goto(caminho);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const resultado = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .exclude(".leaflet-container") // mapa de terceiros; a lista é a alternativa acessível
        .analyze();
      const graves = resultado.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
      expect(graves).toEqual([]);
    });
  }
}

test("manifest do PWA tem nome, ícones e modo standalone", async ({ request }) => {
  const resposta = await request.get("/manifest.webmanifest");
  expect(resposta.ok()).toBe(true);
  const m = await resposta.json();
  expect(m.name).toBe("Descarte Certo");
  expect(m.display).toBe("standalone");
  expect(m.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  for (const icone of m.icons) expect((await request.get(icone.src)).ok()).toBe(true);
});

test("página inexistente mostra a página 404 amigável", async ({ page }) => {
  const r = await page.goto("/pagina-que-nao-existe");
  expect(r?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});

test("página Sobre mostra os ícones dos ODS relacionados", async ({ page }) => {
  await page.goto("/sobre");
  await expect(page.getByRole("heading", { name: "Objetivos de Desenvolvimento Sustentável (ODS) relacionados ao projeto" })).toBeVisible();
  for (const n of [12, 3, 4, 11]) await expect(page.getByRole("img", { name: new RegExp(`^ODS ${n}:`) })).toBeVisible();
});
