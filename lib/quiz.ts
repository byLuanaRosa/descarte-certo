import type { PerguntaQuiz } from "@/lib/conteudo";

/** Tempo da comemoração antes de ir para a próxima pergunta. */
export const TEMPO_ACERTO_MS = 2600;
/** Tempo da animação de erro antes de mostrar a mesma pergunta de novo. */
export const TEMPO_ERRO_MS = 2000;

export type EstadoQuiz = {
  indice: number;
  /** Perguntas acertadas na primeira tentativa. */
  acertosDePrimeira: number;
  /** Alternativas erradas já tentadas na pergunta atual (ficam desativadas). */
  tentadas: number[];
  /** Momento da animação: acertou (comemoração) ou errou (tente de novo). */
  resultado: "acertou" | "errou" | null;
  terminou: boolean;
};

export const estadoInicial: EstadoQuiz = {
  indice: 0,
  acertosDePrimeira: 0,
  tentadas: [],
  resultado: null,
  terminou: false,
};

export type AcaoQuiz =
  | { tipo: "responder"; alternativa: number }
  | { tipo: "tentarDeNovo" }
  | { tipo: "proxima" }
  | { tipo: "reiniciar" };

/**
 * Regras do quiz Kids (RF05), separadas da tela para poder testar.
 * Errou: a mesma pergunta volta até a criança acertar. Acertou: vai para a próxima.
 */
export function reduzirQuiz(perguntas: PerguntaQuiz[], estado: EstadoQuiz, acao: AcaoQuiz): EstadoQuiz {
  switch (acao.tipo) {
    case "responder": {
      if (estado.terminou || estado.resultado !== null || estado.tentadas.includes(acao.alternativa)) return estado;
      const pergunta = perguntas[estado.indice];
      if (!pergunta) return estado;
      if (pergunta.correta === acao.alternativa) {
        const dePrimeira = estado.tentadas.length === 0;
        return { ...estado, resultado: "acertou", acertosDePrimeira: estado.acertosDePrimeira + (dePrimeira ? 1 : 0) };
      }
      return { ...estado, resultado: "errou", tentadas: [...estado.tentadas, acao.alternativa] };
    }
    case "tentarDeNovo":
      return estado.resultado === "errou" ? { ...estado, resultado: null } : estado;
    case "proxima": {
      if (estado.resultado !== "acertou") return estado;
      const ultima = estado.indice >= perguntas.length - 1;
      return ultima
        ? { ...estado, resultado: null, terminou: true }
        : { ...estado, indice: estado.indice + 1, tentadas: [], resultado: null };
    }
    case "reiniciar":
      return estadoInicial;
  }
}

/** Quantas estrelas (de 1 a 3) a criança ganhou, pelos acertos de primeira. */
export function estrelas(acertosDePrimeira: number, total: number): number {
  const taxa = total === 0 ? 0 : acertosDePrimeira / total;
  return taxa >= 0.85 ? 3 : taxa >= 0.5 ? 2 : 1;
}

/** Mensagem final, sempre positiva: todas as perguntas foram acertadas no fim. */
export function mensagemFinal(acertosDePrimeira: number, total: number): string {
  const n = estrelas(acertosDePrimeira, total);
  if (n === 3) return "Incrível! Você é um guardião do planeta!";
  if (n === 2) return "Muito bem! Você sabe bastante sobre descarte certo!";
  return "Parabéns por chegar até o fim! Jogue de novo para aprender ainda mais!";
}
