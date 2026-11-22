import { describe, expect, it } from "vitest";
import { perguntasQuiz } from "@/lib/conteudo";
import { estadoInicial, mensagemFinal, reduzirQuiz } from "@/lib/quiz";

const p = perguntasQuiz;

describe("reduzirQuiz", () => {
  it("conta acerto e bloqueia segunda resposta", () => {
    let e = reduzirQuiz(p, estadoInicial, { tipo: "responder", alternativa: p[0].correta });
    expect(e.acertos).toBe(1);
    e = reduzirQuiz(p, e, { tipo: "responder", alternativa: (p[0].correta + 1) % 3 });
    expect(e.acertos).toBe(1);
    expect(e.escolha).toBe(p[0].correta);
  });

  it("não conta erro", () => {
    const e = reduzirQuiz(p, estadoInicial, { tipo: "responder", alternativa: (p[0].correta + 1) % 3 });
    expect(e.acertos).toBe(0);
  });

  it("não avança sem responder", () => {
    expect(reduzirQuiz(p, estadoInicial, { tipo: "proxima" })).toBe(estadoInicial);
  });

  it("termina após a última pergunta e reinicia", () => {
    let e = estadoInicial;
    for (const pergunta of p) {
      e = reduzirQuiz(p, e, { tipo: "responder", alternativa: pergunta.correta });
      e = reduzirQuiz(p, e, { tipo: "proxima" });
    }
    expect(e.terminou).toBe(true);
    expect(e.acertos).toBe(p.length);
    expect(reduzirQuiz(p, e, { tipo: "reiniciar" })).toEqual(estadoInicial);
  });
});

describe("conteúdo do quiz", () => {
  it("toda pergunta tem 3 alternativas e resposta válida", () => {
    expect(p.length).toBeGreaterThanOrEqual(6);
    for (const q of p) {
      expect(q.alternativas.length, q.id).toBe(3);
      expect(q.correta, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correta, q.id).toBeLessThan(q.alternativas.length);
    }
  });
});

describe("mensagemFinal", () => {
  it("muda conforme os acertos", () => {
    expect(mensagemFinal(8, 8)).toMatch(/acertou tudo/);
    expect(mensagemFinal(5, 8)).toMatch(/Muito bem/);
    expect(mensagemFinal(1, 8)).toMatch(/Bom começo/);
  });
});
