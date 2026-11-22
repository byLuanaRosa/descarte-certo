"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import type { NivelQuiz, PerguntaQuiz } from "@/lib/conteudo";
import {
  estadoInicial,
  estrelas,
  mensagemFinal,
  reduzirQuiz,
  TEMPO_ACERTO_MS,
  TEMPO_ERRO_MS,
  type AcaoQuiz,
  type EstadoQuiz,
} from "@/lib/quiz";
import { tocarAcerto, tocarErro } from "@/lib/sons";

const CHAVE_SOM = "descarte-certo:som";
const CORES_BRILHO = ["#ffd43b", "#ff922b", "#51cf66", "#4dabf7", "#f783ac", "#cc5de8"];

/** Brilhinhos que explodem do centro da tela quando a criança acerta. */
function Brilhos() {
  const [pecas] = useState(() =>
    Array.from({ length: 28 }, (_, i) => {
      const angulo = (i / 28) * Math.PI * 2;
      const distancia = 140 + Math.random() * 160;
      return {
        x: Math.cos(angulo) * distancia,
        y: Math.sin(angulo) * distancia,
        cor: CORES_BRILHO[i % CORES_BRILHO.length],
        tamanho: 12 + Math.random() * 16,
        atraso: Math.random() * 0.15,
      };
    }),
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pecas.map((p, i) => (
        <span
          key={i}
          className="brilho absolute left-1/2 top-1/2"
          style={
            {
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
              width: p.tamanho,
              height: p.tamanho,
              background: p.cor,
              animationDelay: `${p.atraso}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Pergunta({
  pergunta,
  estado,
  despachar,
}: {
  pergunta: PerguntaQuiz;
  estado: EstadoQuiz;
  despachar: (a: AcaoQuiz) => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] bg-card p-5 text-center shadow-sm sm:flex-row sm:text-left">
        <Image
          src={pergunta.imagem}
          alt={pergunta.alt}
          width={220}
          height={160}
          className="h-40 w-56 rounded-2xl object-cover"
          priority
        />
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{pergunta.item}</h2>
          <p className="mt-2 text-xl font-semibold">{pergunta.pergunta}</p>
        </div>
      </div>

      <ul aria-label="Alternativas" className="grid gap-3 sm:grid-cols-3">
        {pergunta.alternativas.map((alt, i) => {
          const tentada = estado.tentadas.includes(i);
          const certaAgora = estado.resultado === "acertou" && i === pergunta.correta;
          return (
            <li key={alt.texto}>
              <button
                type="button"
                disabled={tentada || estado.resultado !== null}
                onClick={() => despachar({ tipo: "responder", alternativa: i })}
                className={`flex h-full w-full flex-col items-center gap-2 rounded-[var(--radius-card)] border-4 bg-card p-3 text-lg font-bold shadow-sm transition-transform enabled:hover:scale-[1.03] enabled:hover:border-primary ${
                  certaAgora ? "border-primary" : tentada ? "border-transparent opacity-40" : "border-transparent"
                }`}
              >
                <Image src={alt.imagem} alt="" width={200} height={130} className="h-28 w-full rounded-xl object-cover" />
                <span>{alt.texto}</span>
                {tentada && <span className="text-sm font-semibold text-muted">Já tentou</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function QuizKids({ niveis }: { niveis: NivelQuiz[] }) {
  const [nivelId, setNivelId] = useState(niveis[0].id);
  const nivel = niveis.find((n) => n.id === nivelId) ?? niveis[0];
  const perguntas = nivel.perguntas;
  const [estado, despacharAcao] = useReducer(
    (e: EstadoQuiz, a: AcaoQuiz) => reduzirQuiz(perguntas, e, a),
    estadoInicial,
  );
  const [somLigado, setSomLigado] = useState(true);
  const somRef = useRef(true);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_SOM) !== "desligado";
      somRef.current = salvo;
      // Sincroniza com a preferência salva no aparelho depois de montar (evita erro de hidratação).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSomLigado(salvo);
    } catch {
      // sem armazenamento: som ligado
    }
  }, []);

  function alternarSom() {
    const novo = !somLigado;
    somRef.current = novo;
    setSomLigado(novo);
    try {
      localStorage.setItem(CHAVE_SOM, novo ? "ligado" : "desligado");
    } catch {
      // ignora
    }
  }

  function despachar(acao: AcaoQuiz) {
    interagiu.current = true;
    despacharAcao(acao);
  }

  // Som e avanço automático depois de acertar ou errar.
  useEffect(() => {
    if (estado.resultado === null) return;
    if (somRef.current) (estado.resultado === "acertou" ? tocarAcerto : tocarErro)();
    const timer = window.setTimeout(
      () => despacharAcao({ tipo: estado.resultado === "acertou" ? "proxima" : "tentarDeNovo" }),
      estado.resultado === "acertou" ? TEMPO_ACERTO_MS : TEMPO_ERRO_MS,
    );
    return () => window.clearTimeout(timer);
  }, [estado.resultado, estado.indice]);

  // Leva o foco para a nova pergunta (teclado e leitor de tela), mas não na primeira carga.
  useEffect(() => {
    if (interagiu.current && estado.resultado === null) tituloRef.current?.focus();
  }, [estado.indice, estado.terminou, estado.resultado]);

  function trocarNivel(id: string) {
    setNivelId(id);
    interagiu.current = false;
    despacharAcao({ tipo: "reiniciar" });
  }

  const pergunta = perguntas[estado.indice];
  const progresso = estado.indice + (estado.resultado === "acertou" ? 1 : 0);

  return (
    <section aria-label="Quiz" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Nível do quiz" className="flex flex-wrap gap-2">
          {niveis.map((n) => (
            <button
              key={n.id}
              type="button"
              role="radio"
              aria-checked={n.id === nivelId}
              onClick={() => trocarNivel(n.id)}
              className={`rounded-full border-2 px-5 py-2 text-left font-bold ${
                n.id === nivelId ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              {n.nome}
              <span className="block text-xs font-semibold">{n.descricao}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={alternarSom}
          aria-pressed={somLigado}
          className="rounded-full border border-border bg-card px-4 py-2 font-semibold"
        >
          <span aria-hidden>{somLigado ? "🔊 " : "🔇 "}</span>Som
        </button>
      </div>

      {estado.terminou ? (
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-card p-8 text-center shadow-sm">
          <Brilhos />
          <p className="text-5xl" aria-label={`${estrelas(estado.acertosDePrimeira, perguntas.length)} de 3 estrelas`}>
            {"⭐".repeat(estrelas(estado.acertosDePrimeira, perguntas.length))}
          </p>
          <h2 ref={tituloRef} tabIndex={-1} className="mt-3 text-3xl font-bold">
            Você completou o quiz!
          </h2>
          <p className="mt-2 text-lg">
            Acertou de primeira {estado.acertosDePrimeira} de {perguntas.length} perguntas.
          </p>
          <p className="mt-1 text-lg">{mensagemFinal(estado.acertosDePrimeira, perguntas.length)}</p>
          <button
            type="button"
            onClick={() => despachar({ tipo: "reiniciar" })}
            className="mt-6 rounded-full bg-primary px-6 py-3 text-lg font-bold text-primary-foreground"
          >
            Jogar de novo
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between font-semibold">
            <p>
              Pergunta {estado.indice + 1} de {perguntas.length} · ⭐ {estado.acertosDePrimeira}
            </p>
            <button type="button" onClick={() => despachar({ tipo: "reiniciar" })} className="text-sm underline">
              Recomeçar
            </button>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-label="Progresso do quiz"
            aria-valuemin={0}
            aria-valuemax={perguntas.length}
            aria-valuenow={progresso}
          >
            <div className="h-full bg-primary transition-all" style={{ width: `${(progresso / perguntas.length) * 100}%` }} />
          </div>
          <h2 ref={tituloRef} tabIndex={-1} className="sr-only">
            Pergunta {estado.indice + 1}: {pergunta.pergunta}
          </h2>

          <div className="relative">
            <div className={`space-y-4 ${estado.resultado === "errou" ? "tremer" : ""}`}>
              <Pergunta key={`${nivelId}-${pergunta.id}`} pergunta={pergunta} estado={estado} despachar={despachar} />
            </div>

            <div aria-live="assertive" aria-atomic="true">
              {estado.resultado === "acertou" && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-[2px]">
                  <Brilhos />
                  <div role="status" className="aparecer relative rounded-[var(--radius-card)] bg-secondary px-8 py-6 text-center shadow-lg">
                    <p aria-hidden className="palmas text-6xl">
                      👏
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-primary-deep">Acertou!</p>
                    <p className="mt-1 max-w-sm text-lg">{pergunta.explicacao}</p>
                  </div>
                </div>
              )}
              {estado.resultado === "errou" && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-background/60 p-4">
                  <div role="status" className="aparecer rounded-[var(--radius-card)] bg-warning-soft px-8 py-6 text-center text-warning-foreground shadow-lg">
                    <p aria-hidden className="balancar text-6xl">
                      🤔
                    </p>
                    <p className="mt-2 text-3xl font-extrabold">Ops! Tente de novo</p>
                    <p className="mt-1 max-w-sm text-lg">Dica: {pergunta.dica}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
