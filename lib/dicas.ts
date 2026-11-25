import { obterSupabase, supabaseConfigurado } from "@/lib/supabase";

/** Dica ambiental guardada no banco (tabela public.dicas). Toda dica tem fonte. */
export type Dica = {
  id: string;
  tema: string;
  tipo: TipoDica;
  titulo: string;
  texto: string;
  fonte_titulo: string;
  fonte_url: string;
};

export const TIPOS_DICA = ["Atitude prática", "Você sabia?", "Erros comuns"] as const;
export type TipoDica = (typeof TIPOS_DICA)[number];

export type DadosDica = Omit<Dica, "id">;

/** Mesmos limites das regras do banco (supabase/schema.sql). */
export const LIMITES_DICA = {
  tema: [2, 40],
  titulo: [3, 80],
  texto: [10, 400],
  fonte_titulo: [3, 300],
  fonte_url: [12, 500],
} as const;

const NOMES: Record<keyof typeof LIMITES_DICA, string> = {
  tema: "Tema",
  titulo: "Título",
  texto: "Texto",
  fonte_titulo: "Fonte",
  fonte_url: "Link da fonte",
};

/** Limpa os campos e confere as regras. Devolve os dados prontos ou a lista de erros. */
export function validarDica(bruto: Record<keyof DadosDica, string>): { dados: DadosDica | null; erros: string[] } {
  const limpo = {
    tema: bruto.tema.trim(),
    tipo: bruto.tipo.trim(),
    titulo: bruto.titulo.trim(),
    texto: bruto.texto.trim(),
    fonte_titulo: bruto.fonte_titulo.trim(),
    fonte_url: bruto.fonte_url.trim(),
  };
  const erros: string[] = [];
  for (const campo of Object.keys(LIMITES_DICA) as (keyof typeof LIMITES_DICA)[]) {
    const [min, max] = LIMITES_DICA[campo];
    const n = limpo[campo].length;
    if (n < min || n > max) erros.push(`${NOMES[campo]}: use de ${min} a ${max} caracteres.`);
  }
  if (!(TIPOS_DICA as readonly string[]).includes(limpo.tipo)) erros.push("Tipo: escolha uma das opções.");
  if (limpo.fonte_url && !/^https:\/\/[^\s]+\.[^\s]+$/.test(limpo.fonte_url))
    erros.push("Link da fonte: informe um endereço completo começando com https://");
  if (erros.length > 0) return { dados: null, erros };
  return { dados: { ...limpo, tipo: limpo.tipo as TipoDica }, erros };
}

const COLUNAS = "id, tema, tipo, titulo, texto, fonte_titulo, fonte_url";

/** Lê as dicas para a página pública. Devolve null se o banco não estiver configurado ou não responder. */
export async function carregarDicasPublicas(): Promise<Dica[] | null> {
  if (!supabaseConfigurado()) return null;
  try {
    const { data, error } = await obterSupabase().from("dicas").select(COLUNAS).order("criado_em", { ascending: true });
    if (error) return null;
    return (data ?? []) as Dica[];
  } catch {
    return null;
  }
}

/* Funções do painel admin (navegador, com a sessão do administrador). A permissão real é do RLS. */

export async function listarDicas(): Promise<Dica[]> {
  const { data, error } = await obterSupabase().from("dicas").select(COLUNAS).order("criado_em", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Dica[];
}

/** Cria uma dica. Retorna a dica criada ou null se o banco recusar. */
export async function criarDica(dados: DadosDica): Promise<Dica | null> {
  const { data, error } = await obterSupabase().from("dicas").insert(dados).select(COLUNAS);
  if (error || !data || data.length !== 1) return null;
  return data[0] as Dica;
}

/** Salva a edição. Retorna false se o banco não alterou nada (sem permissão). */
export async function atualizarDica(id: string, dados: DadosDica): Promise<boolean> {
  const { data, error } = await obterSupabase()
    .from("dicas")
    .update({ ...dados, atualizado_em: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  return !error && (data ?? []).length === 1;
}

/** Exclui de vez. Retorna false se o banco não apagou nada (sem permissão). */
export async function excluirDica(id: string): Promise<boolean> {
  const { data, error } = await obterSupabase().from("dicas").delete().eq("id", id).select("id");
  return !error && (data ?? []).length === 1;
}
