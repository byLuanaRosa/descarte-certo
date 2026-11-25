import type { Page, Route } from "@playwright/test";

/** Pontos usados nos testes de ponta a ponta (o Supabase é simulado, não precisa de internet). */
export const pontosSimulados = [
  {
    id: "1",
    nome: "Ecoponto Canasvieiras",
    endereco: "Rua Desembargador Maurílio Coimbra – Canasvieiras",
    latitude: -27.432405,
    longitude: -48.4556214,
    materiais: ["papel-papelao", "pilhas", "oleo-cozinha"],
    horario: "Seg. a sex.: 7h30–12h",
    telefone: "(48) 3266-1445",
    fonte: "https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php",
    status: "aprovado",
    criado_em: "2026-11-22T00:00:00Z",
    verificado_em: "2026-11-22T00:00:00Z",
  },
  {
    id: "2",
    nome: "Ecoponto Capoeiras",
    endereco: "Terminal de Capoeiras – Capoeiras",
    latitude: -27.5970218,
    longitude: -48.6028838,
    materiais: ["papel-papelao", "pilhas"],
    horario: "Todos os dias: 7h–19h",
    telefone: null,
    fonte: null,
    status: "aprovado",
    criado_em: "2026-11-22T00:00:00Z",
    verificado_em: "2026-11-22T00:00:00Z",
  },
  {
    id: "3",
    nome: "Ecoponto Ingleses",
    endereco: "Rua Via Local Insular – Ingleses",
    latitude: -27.4334996,
    longitude: -48.4085363,
    materiais: ["papel-papelao", "oleo-cozinha"],
    horario: null,
    telefone: null,
    fonte: null,
    status: "aprovado",
    criado_em: "2026-11-22T00:00:00Z",
    verificado_em: "2026-11-22T00:00:00Z",
  },
];

export type Inserido = Record<string, unknown>;

/**
 * Intercepta as chamadas à API REST do Supabase.
 * GET devolve os pontos simulados; POST guarda o corpo em `inseridos` e responde 201.
 */
export async function simularSupabase(page: Page, opcoes: { falhar?: boolean } = {}) {
  const inseridos: Inserido[] = [];
  await page.route("**/rest/v1/pontos_coleta**", async (route: Route) => {
    const req = route.request();
    if (opcoes.falhar) return route.fulfill({ status: 500, contentType: "application/json", json: { message: "indisponível" } });
    if (req.method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", json: pontosSimulados });
    }
    if (req.method() === "POST") {
      inseridos.push(req.postDataJSON() as Inserido);
      return route.fulfill({ status: 201, body: "" });
    }
    return route.fulfill({ status: 204, body: "" });
  });
  return { inseridos };
}

/** Dicas usadas nos testes de ponta a ponta. */
export const dicasSimuladas = [
  {
    id: "d1",
    tema: "Reduzir",
    tipo: "Atitude prática",
    titulo: "Leve sua própria sacola",
    texto: "Sacolas reutilizáveis evitam o uso de sacolas descartáveis.",
    fonte_titulo: "Fonte de teste A",
    fonte_url: "https://exemplo.org/a",
  },
  {
    id: "d2",
    tema: "Reciclagem",
    tipo: "Você sabia?",
    titulo: "Separe secos e úmidos",
    texto: "Recicláveis secos num lado, restos de comida no outro.",
    fonte_titulo: "Fonte de teste B",
    fonte_url: "https://exemplo.org/b",
  },
];

/** Intercepta a leitura pública das dicas (GET em /rest/v1/dicas). */
export async function simularDicas(page: Page, opcoes: { falhar?: boolean } = {}) {
  await page.route("**/rest/v1/dicas**", (route) =>
    opcoes.falhar
      ? route.fulfill({ status: 500, contentType: "application/json", json: { message: "indisponível" } })
      : route.fulfill({ status: 200, contentType: "application/json", json: dicasSimuladas }),
  );
}
