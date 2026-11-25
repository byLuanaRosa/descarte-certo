import categoriasJson from "@/data/categorias.json";
import dicasJson from "@/data/dicas.json";
import materiaisJson from "@/data/materiais.json";
import creditosJson from "@/data/creditos-imagens.json";
import quizJson from "@/data/quiz.json";

export type Categoria = { id: string; nome: string; icone: string };

export type Material = {
  id: string;
  nome: string;
  sinonimos: string[];
  categoria: string;
  riscos: string[];
  passos: string[];
  destino: string;
  fonte: { titulo: string; url: string };
  revisado_em: string;
};

export type Dica = {
  id: string;
  tema: string;
  tipo: string;
  titulo: string;
  texto: string;
  /** De onde veio a informação, quando a dica se apoia numa publicação. */
  fonte?: { titulo: string; url: string };
};

export type ImagemQuiz = { texto: string; imagem: string; alt: string };

export type PerguntaQuiz = {
  id: string;
  imagem: string;
  alt: string;
  item: string;
  pergunta: string;
  alternativas: ImagemQuiz[];
  correta: number;
  explicacao: string;
  /** Mostrada quando a criança erra, antes de tentar de novo. */
  dica: string;
};

export type NivelQuiz = { id: string; nome: string; descricao: string; perguntas: PerguntaQuiz[] };

export type CreditoImagem = {
  arquivo: string;
  titulo: string;
  autor: string | null;
  licenca: string;
  fonte: string;
  pagina: string | null;
};

export const categorias: Categoria[] = categoriasJson;
export const materiais: Material[] = materiaisJson;
export const dicas: Dica[] = dicasJson;
export const niveisQuiz: NivelQuiz[] = quizJson;
export const creditosImagens: CreditoImagem[] = creditosJson;

export function buscarMaterialPorId(id: string): Material | undefined {
  return materiais.find((m) => m.id === id);
}

export function buscarCategoriaPorId(id: string): Categoria | undefined {
  return categorias.find((c) => c.id === id);
}

/** Converte "2026-11" em "11/2026". */
export function formatarMesAno(valor: string): string {
  const [ano, mes] = valor.split("-");
  return mes && ano ? `${mes}/${ano}` : valor;
}

/** Nomes dos materiais em ordem alfabética (ids desconhecidos aparecem como estão). */
export function nomesDosMateriais(ids: string[]): string[] {
  return ids
    .map((id) => buscarMaterialPorId(id)?.nome ?? id)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}
