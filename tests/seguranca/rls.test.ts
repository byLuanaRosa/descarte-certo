/**
 * Testes de segurança contra o Supabase real, usando só a chave pública (anon).
 * Não gravam nada no banco: todas as escritas testadas devem ser bloqueadas.
 * São pulados se as variáveis do Supabase não estiverem definidas.
 */
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe.skipIf(!url || !chave)("RLS de pontos_coleta (usuário sem login)", () => {
  const supabase = createClient(url ?? "http://x", chave ?? "x", { auth: { persistSession: false } });

  const pontoValido = {
    nome: "Teste de segurança",
    endereco: "Rua de teste, 123",
    latitude: -27.59,
    longitude: -48.55,
    materiais: ["pilhas"],
  };

  it("lê pontos e recebe só aprovados", async () => {
    const { data, error } = await supabase.from("pontos_coleta").select("status");
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.every((p) => p.status === "aprovado")).toBe(true);
  });

  it("não enxerga pendentes nem rejeitados", async () => {
    const { data, error } = await supabase.from("pontos_coleta").select("id").neq("status", "aprovado");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("não consegue inserir um ponto já aprovado", async () => {
    const { error } = await supabase.from("pontos_coleta").insert({ ...pontoValido, status: "aprovado" });
    expect(error).not.toBeNull();
  });

  it("não consegue inserir já com data de verificação", async () => {
    const { error } = await supabase
      .from("pontos_coleta")
      .insert({ ...pontoValido, verificado_em: new Date().toISOString() });
    expect(error).not.toBeNull();
  });

  it("não consegue aprovar nem alterar pontos", async () => {
    const { data, error } = await supabase
      .from("pontos_coleta")
      .update({ status: "rejeitado" })
      .eq("status", "aprovado")
      .select("id");
    // Ou a permissão é negada, ou nenhuma linha é alterada.
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it("não consegue apagar pontos", async () => {
    const { data, error } = await supabase.from("pontos_coleta").delete().eq("status", "aprovado").select("id");
    expect(error !== null || (data ?? []).length === 0).toBe(true);
    const { data: depois } = await supabase.from("pontos_coleta").select("id");
    expect(depois!.length).toBeGreaterThan(0);
  });

  it("não consegue ler a lista de administradores", async () => {
    const { data, error } = await supabase.from("administradores").select("user_id");
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it("o banco recusa ponto fora de Santa Catarina", async () => {
    const { error } = await supabase.from("pontos_coleta").insert({ ...pontoValido, latitude: 10, longitude: 10 });
    expect(error).not.toBeNull();
  });

  it("o banco recusa material que não existe", async () => {
    const { error } = await supabase.from("pontos_coleta").insert({ ...pontoValido, materiais: ["plutonio"] });
    expect(error).not.toBeNull();
  });
});
