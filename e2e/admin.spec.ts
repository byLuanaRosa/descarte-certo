import { expect, test, type Page } from "@playwright/test";

const USUARIO_ID = "11111111-1111-1111-1111-111111111111";

const pendentes = [
  {
    id: "p1",
    nome: "Farmácia Central",
    endereco: "Rua Felipe Schmidt, 100 – Centro",
    latitude: -27.5969,
    longitude: -48.5495,
    materiais: ["medicamentos-vencidos"],
    horario: "8h–20h",
    telefone: null,
    fonte: null,
    status: "pendente",
    criado_em: "2026-11-22T10:00:00Z",
    verificado_em: null,
  },
  {
    id: "p2",
    nome: "Loja do Bairro",
    endereco: "Rua Lauro Linhares, 500 – Trindade",
    latitude: -27.589,
    longitude: -48.519,
    materiais: ["pilhas"],
    horario: null,
    telefone: null,
    fonte: null,
    status: "pendente",
    criado_em: "2026-11-22T11:00:00Z",
    verificado_em: null,
  },
];

/** Simula o Supabase Auth e a API REST para a área administrativa. */
async function simularAdmin(page: Page, opcoes: { ehAdmin: boolean; senhaCerta?: string }) {
  const atualizacoes: { url: string; corpo: unknown }[] = [];
  const exclusoes: string[] = [];
  const emailsUsados: string[] = [];
  await page.route("**/tile.openstreetmap.org/**", (r) => r.fulfill({ status: 204, body: "" }));
  await page.route("**/auth/v1/token**", async (route) => {
    const corpo = route.request().postDataJSON() as { email?: string; password?: string };
    emailsUsados.push(corpo.email ?? "");
    if (corpo.password !== (opcoes.senhaCerta ?? "senha-certa")) {
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        json: { error: "invalid_grant", error_description: "Invalid login credentials", code: "invalid_credentials" },
      });
    }
    const agora = Math.floor(Date.now() / 1000);
    return route.fulfill({
      contentType: "application/json",
      json: {
        access_token: "token-de-teste",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: agora + 3600,
        refresh_token: "refresh-de-teste",
        user: { id: USUARIO_ID, aud: "authenticated", role: "authenticated", email: "admin@exemplo.org" },
      },
    });
  });
  await page.route("**/auth/v1/logout**", (r) => r.fulfill({ status: 204, body: "" }));
  await page.route("**/rest/v1/administradores**", (r) =>
    r.fulfill({ contentType: "application/json", json: opcoes.ehAdmin ? [{ user_id: USUARIO_ID }] : [] }),
  );
  await page.route("**/rest/v1/pontos_coleta**", async (route) => {
    const req = route.request();
    if (req.method() === "PATCH") {
      atualizacoes.push({ url: req.url(), corpo: req.postDataJSON() });
      const id = new URL(req.url()).searchParams.get("id")?.replace("eq.", "");
      return route.fulfill({ contentType: "application/json", json: [{ id }] });
    }
    if (req.method() === "DELETE") {
      exclusoes.push(req.url());
      const id = new URL(req.url()).searchParams.get("id")?.replace("eq.", "");
      return route.fulfill({ contentType: "application/json", json: [{ id }] });
    }
    const status = new URL(req.url()).searchParams.get("status")?.replace("eq.", "") ?? "pendente";
    return route.fulfill({
      contentType: "application/json",
      json: pendentes.map((p) => ({ ...p, status })),
    });
  });
  return { atualizacoes, exclusoes, emailsUsados };
}

async function login(page: Page, senha = "senha-certa") {
  await page.goto("/admin");
  await page.getByLabel("Usuário").fill("teste");
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("sem login, mostra só o formulário de login", async ({ page }) => {
  await simularAdmin(page, { ehAdmin: true });
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.getByText(/Pontos pendentes/)).toHaveCount(0);
});

test("senha errada mostra mensagem de erro", async ({ page }) => {
  await simularAdmin(page, { ehAdmin: true });
  await login(page, "errada");
  await expect(page.getByRole("alert").filter({ hasText: "Usuário ou senha" })).toHaveText("Usuário ou senha inválidos.");
});

test("conta que não é administradora não vê o painel", async ({ page }) => {
  await simularAdmin(page, { ehAdmin: false });
  await login(page);
  await expect(page.getByText("Esta conta não tem permissão de administrador.")).toBeVisible();
});

test("administrador vê pendentes, aprova e rejeita", async ({ page }) => {
  const { atualizacoes } = await simularAdmin(page, { ehAdmin: true });
  await login(page);
  await expect(page.getByRole("heading", { name: "Pontos pendentes (2)" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Mapa do ponto selecionado" })).toBeVisible();

  await page.getByRole("button", { name: "Aprovar Farmácia Central" }).click();
  await expect(page.getByText("“Farmácia Central” foi aprovado e já aparece no site.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pontos pendentes (1)" })).toBeVisible();
  expect(atualizacoes[0].url).toContain("id=eq.p1");
  expect(atualizacoes[0].corpo).toMatchObject({ status: "aprovado" });
  expect((atualizacoes[0].corpo as { verificado_em: string }).verificado_em).toBeTruthy();

  await page.getByRole("button", { name: "Rejeitar Loja do Bairro" }).click();
  await expect(page.getByText("Nenhuma sugestão aguardando verificação. 🎉")).toBeVisible();
  expect(atualizacoes[1].corpo).toMatchObject({ status: "rejeitado" });

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("administrador edita um ponto publicado", async ({ page }) => {
  const { atualizacoes } = await simularAdmin(page, { ehAdmin: true });
  await login(page);
  await page.getByRole("tab", { name: "Publicados" }).click();
  await expect(page.getByRole("heading", { name: "Pontos publicados (2)" })).toBeVisible();

  await page.getByRole("button", { name: "Editar Farmácia Central" }).click();
  const form = page.getByRole("form", { name: "Editar Farmácia Central" });
  await form.getByLabel("Nome do local *").fill("Farmácia Central do Centro");
  await form.getByLabel("Horário").fill("Todos os dias: 8h–22h");
  await form.getByLabel("Pilhas", { exact: true }).check();
  await form.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("“Farmácia Central do Centro” foi atualizado.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Farmácia Central do Centro" })).toBeVisible();
  expect(atualizacoes[0].url).toContain("id=eq.p1");
  expect(atualizacoes[0].corpo).toMatchObject({
    nome: "Farmácia Central do Centro",
    horario: "Todos os dias: 8h–22h",
    materiais: ["medicamentos-vencidos", "pilhas"],
  });
});

test("a edição valida os campos antes de salvar", async ({ page }) => {
  const { atualizacoes } = await simularAdmin(page, { ehAdmin: true });
  await login(page);
  await page.getByRole("button", { name: "Editar Farmácia Central" }).click();
  const form = page.getByRole("form", { name: "Editar Farmácia Central" });
  await form.getByLabel("Nome do local *").fill("");
  await form.getByLabel("Fonte (link oficial)").fill("site sem http");
  await form.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(form.getByText(/Informe o nome do local/)).toBeVisible();
  await expect(form.getByText(/Use um link que comece com http/)).toBeVisible();
  expect(atualizacoes).toHaveLength(0);
  await form.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("form")).toHaveCount(0);
});

test("administrador exclui um ponto depois de confirmar", async ({ page }) => {
  const { exclusoes } = await simularAdmin(page, { ehAdmin: true });
  await login(page);
  await page.getByRole("tab", { name: "Publicados" }).click();

  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "Excluir Loja do Bairro" }).click();
  expect(exclusoes).toHaveLength(0);

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Excluir Loja do Bairro" }).click();
  await expect(page.getByText("“Loja do Bairro” foi excluído.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pontos publicados (1)" })).toBeVisible();
  expect(exclusoes[0]).toContain("id=eq.p2");
});

test("o login usa nome de usuário (convertido no e-mail interno)", async ({ page }) => {
  const { emailsUsados } = await simularAdmin(page, { ehAdmin: true });
  await page.goto("/admin");
  await expect(page.getByLabel("E-mail")).toHaveCount(0);
  await page.getByLabel("Usuário").fill("  Teste ");
  await page.getByLabel("Senha").fill("senha-certa");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: /Pontos pendentes/ })).toBeVisible();
  expect(emailsUsados[0]).toBe("teste@admin.descarte-certo.app");
});
