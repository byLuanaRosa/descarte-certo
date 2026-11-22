import type { PerguntaQuiz } from "@/lib/conteudo";

export type EstadoQuiz = {
  indice: number;
  acertos: number;
  /** Alternativa escolhida na pergunta atual (null enquanto não respondeu). */
  escolha: number | null;
  terminou: boolean;
};

export const estadoInicial: EstadoQuiz = { indice: 0, acertos: 0, escolha: null, terminou: false };

export type AcaoQuiz = { tipo: "responder"; alternativa: number } | { tipo: "proxima" } | { tipo: "reiniciar" };

/** Regras do quiz Kids (RF05), separadas da tela para poder testar. */
export function reduzirQuiz(perguntas: PerguntaQuiz[], estado: EstadoQuiz, acao: AcaoQuiz): EstadoQuiz {
  switch (acao.tipo) {
    case "responder": {
      if (estado.terminou || estado.escolha !== null) return estado;
      const acertou = perguntas[estado.indice]?.correta === acao.alternativa;
      return { ...estado, escolha: acao.alternativa, acertos: estado.acertos + (acertou ? 1 : 0) };
    }
    case "proxima": {
      if (estado.escolha === null) return estado;
      const ultima = estado.indice >= perguntas.length - 1;
      return ultima
        ? { ...estado, terminou: true }
        : { ...estado, indice: estado.indice + 1, escolha: null };
    }
    case "reiniciar":
      return estadoInicial;
  }
}

/** Mensagem final de acordo com a porcentagem de acertos. */
export function mensagemFinal(acertos: number, total: number): string {
  const taxa = total === 0 ? 0 : acertos / total;
  if (taxa === 1) return "Incrível! Você acertou tudo e já é guardião do planeta! 🌍";
  if (taxa >= 0.6) return "Muito bem! Você sabe bastante sobre descarte certo! 🌱";
  return "Bom começo! Jogue de novo para aprender ainda mais! 💪";
}
