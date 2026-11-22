import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { materiais } from "@/lib/conteudo";

const ler = (arquivo: string) => readFileSync(join(__dirname, "..", "supabase", arquivo), "utf-8");
const idsJson = materiais.map((m) => m.id).sort();

describe("supabase/schema.sql", () => {
  const schema = ler("schema.sql");

  it("a lista de materiais permitidos é igual à do materiais.json", () => {
    const bloco = schema.match(/materiais <@ array\[([\s\S]*?)\]::text\[\]/);
    expect(bloco).not.toBeNull();
    const idsSql = [...bloco![1].matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]).sort();
    expect(idsSql).toEqual(idsJson);
  });

  it("ativa RLS nas duas tabelas", () => {
    expect(schema).toMatch(/alter table public\.pontos_coleta enable row level security/);
    expect(schema).toMatch(/alter table public\.administradores enable row level security/);
  });

  it("o público só insere como pendente e não escolhe o status", () => {
    expect(schema).toMatch(/with check \(status = 'pendente' and verificado_em is null\)/);
    const grantInsert = schema.match(/grant insert \(([^)]*)\)/);
    expect(grantInsert![1]).not.toMatch(/status|verificado_em/);
  });
});

describe("supabase/seed.sql", () => {
  it("só usa materiais que existem no materiais.json", () => {
    const seed = ler("seed.sql");
    const usados = [...seed.matchAll(/array\[([^\]]*)\]/g)].flatMap((m) =>
      [...m[1].matchAll(/'([a-z0-9-]+)'/g)].map((x) => x[1]),
    );
    expect(usados.length).toBeGreaterThan(0);
    for (const id of usados) expect(idsJson, id).toContain(id);
  });
});
