import { materiais } from "@/lib/conteudo";
import type { Coordenadas } from "@/lib/pontos";

export type DadosSugestao = {
  nome: string;
  endereco: string;
  materiais: string[];
  horario: string;
  telefone: string;
  posicao: Coordenadas | null;
};

export type SugestaoValida = {
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  materiais: string[];
  horario: string | null;
  telefone: string | null;
};

export type ErrosSugestao = Partial<Record<keyof DadosSugestao, string>>;

const idsMateriais = new Set(materiais.map((m) => m.id));

/** Limites aproximados de Santa Catarina (iguais aos do banco). */
export function dentroDeSantaCatarina(c: Coordenadas): boolean {
  return c.latitude >= -29.5 && c.latitude <= -25.9 && c.longitude >= -54 && c.longitude <= -48.3;
}

const limpar = (s: string) => s.replace(/\s+/g, " ").trim();

/** Valida o formulário "Sugerir ponto" com as mesmas regras do banco (RF04, RN04, RN06). */
export function validarSugestao(
  dados: DadosSugestao,
): { ok: true; valor: SugestaoValida } | { ok: false; erros: ErrosSugestao } {
  const erros: ErrosSugestao = {};
  const nome = limpar(dados.nome);
  const endereco = limpar(dados.endereco);
  const horario = limpar(dados.horario);
  const telefone = limpar(dados.telefone);
  const lista = Array.from(new Set(dados.materiais)).filter((m) => idsMateriais.has(m));

  if (nome.length < 3) erros.nome = "Informe o nome do local (pelo menos 3 letras).";
  else if (nome.length > 120) erros.nome = "Use no máximo 120 caracteres.";

  if (endereco.length < 5) erros.endereco = "Informe o endereço do local.";
  else if (endereco.length > 200) erros.endereco = "Use no máximo 200 caracteres.";

  if (lista.length === 0) erros.materiais = "Marque pelo menos um material aceito.";

  if (horario.length > 200) erros.horario = "Use no máximo 200 caracteres.";

  if (telefone && !/^[\d\s()+-]{8,20}$/.test(telefone)) erros.telefone = "Telefone inválido. Ex.: (48) 3333-4444";

  if (!dados.posicao) erros.posicao = "Marque o local no mapa: localize pelo endereço, toque no mapa ou use “Estou aqui”.";
  else if (!dentroDeSantaCatarina(dados.posicao)) erros.posicao = "O local precisa estar em Santa Catarina.";

  if (Object.keys(erros).length > 0) return { ok: false, erros };

  return {
    ok: true,
    valor: {
      nome,
      endereco,
      latitude: Number(dados.posicao!.latitude.toFixed(7)),
      longitude: Number(dados.posicao!.longitude.toFixed(7)),
      materiais: lista,
      horario: horario || null,
      telefone: telefone || null,
    },
  };
}

/** Fonte opcional do ponto (link oficial), usada na edição pelo administrador. */
export function validarFonte(fonte: string): { ok: true; valor: string | null } | { ok: false; erro: string } {
  const limpa = fonte.trim();
  if (!limpa) return { ok: true, valor: null };
  if (limpa.length > 300 || !/^https?:\/\/\S+$/.test(limpa)) return { ok: false, erro: "Use um link que comece com http:// ou https://." };
  return { ok: true, valor: limpa };
}
