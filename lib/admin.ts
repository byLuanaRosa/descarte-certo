import type { Session } from "@supabase/supabase-js";
import type { Ponto } from "@/lib/pontos";
import { obterSupabase } from "@/lib/supabase";

/**
 * Funções da área administrativa (RF04, RN01).
 * A tela de login é só interface: quem garante que apenas administradores
 * aprovam ou rejeitam são as regras RLS do banco (supabase/schema.sql).
 */

export async function sessaoAtual(): Promise<Session | null> {
  const { data } = await obterSupabase().auth.getSession();
  return data.session;
}

export async function entrar(email: string, senha: string): Promise<{ erro: string | null }> {
  try {
    const { error } = await obterSupabase().auth.signInWithPassword({ email: email.trim(), password: senha });
    if (!error) return { erro: null };
    return { erro: error.status === 400 ? "E-mail ou senha inválidos." : "Não foi possível entrar agora. Tente de novo." };
  } catch {
    return { erro: "Sem conexão com o servidor. Tente de novo." };
  }
}

export async function sair(): Promise<void> {
  await obterSupabase().auth.signOut();
}

/** Confere se o usuário logado está na tabela de administradores. */
export async function ehAdministrador(userId: string): Promise<boolean> {
  const { data, error } = await obterSupabase().from("administradores").select("user_id").eq("user_id", userId);
  if (error) throw error; // falha de rede/banco é diferente de "não é administrador"
  return (data ?? []).length > 0;
}

const COLUNAS =
  "id, nome, endereco, latitude, longitude, materiais, horario, telefone, fonte, status, criado_em, verificado_em";

export type StatusPonto = Ponto["status"];

/** Lista pontos de um status (o administrador vê todos; até 100 por vez). */
export async function listarPorStatus(status: StatusPonto): Promise<Ponto[]> {
  const { data, error } = await obterSupabase()
    .from("pontos_coleta")
    .select(COLUNAS)
    .eq("status", status)
    .order(status === "pendente" ? "criado_em" : "nome", { ascending: true })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as Ponto[];
}

export async function listarPendentes(): Promise<Ponto[]> {
  return listarPorStatus("pendente");
}

export type DadosEdicao = {
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  materiais: string[];
  horario: string | null;
  telefone: string | null;
  fonte: string | null;
};

/** Salva a edição de um ponto. Retorna false se o banco não alterou nada (sem permissão). */
export async function atualizarPonto(id: string, dados: DadosEdicao): Promise<boolean> {
  const { data, error } = await obterSupabase().from("pontos_coleta").update(dados).eq("id", id).select("id");
  return !error && (data ?? []).length === 1;
}

/** Exclui um ponto de vez. Retorna false se o banco não apagou nada (sem permissão). */
export async function excluirPonto(id: string): Promise<boolean> {
  const { data, error } = await obterSupabase().from("pontos_coleta").delete().eq("id", id).select("id");
  return !error && (data ?? []).length === 1;
}

export type Decisao = "aprovado" | "rejeitado";

/** Aprova ou rejeita um ponto pendente. Retorna false se o banco não alterou nada (sem permissão). */
export async function decidir(id: string, decisao: Decisao): Promise<boolean> {
  const { data, error } = await obterSupabase()
    .from("pontos_coleta")
    .update({ status: decisao, verificado_em: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pendente")
    .select("id");
  return !error && (data ?? []).length === 1;
}
