import categoriasJson from "@/data/categorias.json";
import dicasJson from "@/data/dicas.json";
import materiaisJson from "@/data/materiais.json";
import quizJson from "@/data/quiz.json";

export type Categoria = { id: string; nome: string; icone: string };

export type Material = {
  id: string;
  nome: string;
  sinonimos: string[];
  categoria: string;
  riscos: string[];
  cuidados: string[];
  destino: string;
  fonte: { titulo: string; url: string };
  revisado_em: string;
};

export type Dica = { id: string; tema: string; tipo: string; titulo: string; texto: string };

export type PerguntaQuiz = {
  id: string;
  emoji: string;
  item: string;
  descricao: string;
  pergunta: string;
  alternativas: { texto: string; emoji: string }[];
  correta: number;
  explicacao: string;
};

export const categorias: Categoria[] = categoriasJson;
export const materiais: Material[] = materiaisJson;
export const dicas: Dica[] = dicasJson;
export const perguntasQuiz: PerguntaQuiz[] = quizJson;

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
