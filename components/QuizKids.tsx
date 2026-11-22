"use client";

import { useEffect, useReducer, useRef } from "react";
import type { PerguntaQuiz } from "@/lib/conteudo";
import { estadoInicial, mensagemFinal, reduzirQuiz, type AcaoQuiz, type EstadoQuiz } from "@/lib/quiz";

export function QuizKids({ perguntas }: { perguntas: PerguntaQuiz[] }) {
  const interagiu = useRef(false);
  const [estado, despacharAcao] = useReducer(
    (e: EstadoQuiz, a: AcaoQuiz) => reduzirQuiz(perguntas, e, a),
    estadoInicial,
  );
  const despachar = (acao: AcaoQuiz) => {
    interagiu.current = true;
    despacharAcao(acao);
  };
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const proximaRef = useRef<HTMLButtonElement>(null);

  // Leva o foco para o lugar certo ao mudar de pergunta ou ao responder (teclado e leitor de tela).
  // Na primeira carga da página o foco não é movido.
  useEffect(() => {
    if (interagiu.current && estado.escolha === null) tituloRef.current?.focus();
  }, [estado.indice, estado.terminou, estado.escolha]);
  useEffect(() => {
    if (estado.escolha !== null) proximaRef.current?.focus();
  }, [estado.escolha]);

  if (estado.terminou) {
    return (
      <section className="rounded-[var(--radius-card)] bg-card p-8 text-center shadow-sm">
        <p aria-hidden className="text-6xl">
          🏆
        </p>
        <h2 ref={tituloRef} tabIndex={-1} className="mt-3 text-3xl font-bold">
          Você fez {estado.acertos} de {perguntas.length} pontos!
        </h2>
        <p className="mt-2 text-lg">{mensagemFinal(estado.acertos, perguntas.length)}</p>
        <button
          type="button"
          onClick={() => despachar({ tipo: "reiniciar" })}
          className="mt-6 rounded-full bg-primary px-6 py-3 text-lg font-bold text-primary-foreground"
        >
          Jogar de novo
        </button>
      </section>
    );
  }

  const pergunta = perguntas[estado.indice];
  const respondeu = estado.escolha !== null;
  const acertou = estado.escolha === pergunta.correta;

  return (
    <section aria-label="Quiz" className="space-y-4">
      <div className="flex items-center justify-between font-semibold">
        <p>
          Pergunta {estado.indice + 1} de {perguntas.length} · ⭐ {estado.acertos} acerto(s)
        </p>
        <button type="button" onClick={() => despachar({ tipo: "reiniciar" })} className="text-sm underline">
          Reiniciar
        </button>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Progresso do quiz"
        aria-valuemin={0}
        aria-valuemax={perguntas.length}
        aria-valuenow={estado.indice + (respondeu ? 1 : 0)}
      >
        <div
          className="h-full bg-primary"
          style={{ width: `${((estado.indice + (respondeu ? 1 : 0)) / perguntas.length) * 100}%` }}
        />
      </div>

      <div className="rounded-[var(--radius-card)] bg-card p-6 text-center shadow-sm">
        <p aria-hidden className="text-6xl">
          {pergunta.emoji}
        </p>
        <h2 ref={tituloRef} tabIndex={-1} className="mt-2 text-2xl font-bold">
          {pergunta.item}
        </h2>
        <p className="text-muted">{pergunta.descricao}</p>
        <p className="mt-2 text-lg font-semibold">{pergunta.pergunta}</p>
      </div>

      <ul aria-label="Alternativas" className="grid gap-3 sm:grid-cols-3">
        {pergunta.alternativas.map((alt, i) => {
          const escolhida = estado.escolha === i;
          const ehCorreta = i === pergunta.correta;
          const estilo = !respondeu
            ? "border-transparent hover:border-primary"
            : ehCorreta
              ? "border-primary"
              : escolhida
                ? "border-danger"
                : "border-transparent opacity-60";
          return (
            <li key={alt.texto}>
              <button
                type="button"
                disabled={respondeu}
                aria-pressed={escolhida}
                onClick={() => despachar({ tipo: "responder", alternativa: i })}
                className={`flex h-full w-full flex-col items-center gap-2 rounded-[var(--radius-card)] border-4 bg-card p-5 text-lg font-bold shadow-sm ${estilo}`}
              >
                <span aria-hidden className="text-4xl">
                  {alt.emoji}
                </span>
                {alt.texto}
                {respondeu && ehCorreta && <span className="text-sm text-primary">✓ Resposta correta</span>}
                {respondeu && escolhida && !ehCorreta && <span className="text-sm text-danger">✗ Não é essa</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite">
        {respondeu && (
          <div className={`rounded-[var(--radius-card)] p-5 ${acertou ? "bg-secondary" : "bg-warning-soft text-warning-foreground"}`}>
            <p className="text-xl font-bold">{acertou ? "Muito bem! 🎉" : "Quase! Vamos aprender 💡"}</p>
            <p className="mt-1">{pergunta.explicacao}</p>
            <button
              ref={proximaRef}
              type="button"
              onClick={() => despachar({ tipo: "proxima" })}
              className="mt-4 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              {estado.indice === perguntas.length - 1 ? "Ver resultado" : "Próxima pergunta"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
