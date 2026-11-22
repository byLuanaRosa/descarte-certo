import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { creditosImagens, niveisQuiz } from "@/lib/conteudo";
import { estadoInicial, estrelas, mensagemFinal, reduzirQuiz, type EstadoQuiz } from "@/lib/quiz";

const p = niveisQuiz[0].perguntas;
const errada = (i: number) => (p[i].correta + 1) % p[i].alternativas.length;

describe("reduzirQuiz", () => {
  it("acerto de primeira conta estrela e mostra comemoração", () => {
    const e = reduzirQuiz(p, estadoInicial, { tipo: "responder", alternativa: p[0].correta });
    expect(e.resultado).toBe("acertou");
    expect(e.acertosDePrimeira).toBe(1);
  });

  it("erro repete a mesma pergunta e desativa a alternativa errada", () => {
    let e = reduzirQuiz(p, estadoInicial, { tipo: "responder", alternativa: errada(0) });
    expect(e.resultado).toBe("errou");
    expect(e.tentadas).toEqual([errada(0)]);
    e = reduzirQuiz(p, e, { tipo: "tentarDeNovo" });
    expect(e).toMatchObject({ indice: 0, resultado: null });
    // a mesma alternativa errada não pode ser escolhida de novo
    expect(reduzirQuiz(p, e, { tipo: "responder", alternativa: errada(0) })).toBe(e);
  });

  it("acertar depois de errar avança, mas não conta estrela", () => {
    let e = reduzirQuiz(p, estadoInicial, { tipo: "responder", alternativa: errada(0) });
    e = reduzirQuiz(p, e, { tipo: "tentarDeNovo" });
    e = reduzirQuiz(p, e, { tipo: "responder", alternativa: p[0].correta });
    expect(e.acertosDePrimeira).toBe(0);
    e = reduzirQuiz(p, e, { tipo: "proxima" });
    expect(e).toMatchObject({ indice: 1, tentadas: [], resultado: null });
  });

  it("não avança sem acertar e ignora cliques durante a animação", () => {
    expect(reduzirQuiz(p, estadoInicial, { tipo: "proxima" })).toBe(estadoInicial);
    const comemorando = reduzirQuiz(p, estadoInicial, { tipo: "responder", alternativa: p[0].correta });
    expect(reduzirQuiz(p, comemorando, { tipo: "responder", alternativa: errada(0) })).toBe(comemorando);
  });

  it("termina depois da última pergunta e reinicia", () => {
    let e: EstadoQuiz = estadoInicial;
    for (const pergunta of p) {
      e = reduzirQuiz(p, e, { tipo: "responder", alternativa: pergunta.correta });
      e = reduzirQuiz(p, e, { tipo: "proxima" });
    }
    expect(e.terminou).toBe(true);
    expect(e.acertosDePrimeira).toBe(p.length);
    expect(reduzirQuiz(p, e, { tipo: "reiniciar" })).toEqual(estadoInicial);
  });
});

describe("conteúdo do quiz", () => {
  it("tem dois níveis: até 10 anos e a partir de 10 anos", () => {
    expect(niveisQuiz.map((n) => n.nome)).toEqual(["Até 10 anos", "A partir de 10 anos"]);
  });

  it("cada pergunta tem 3 alternativas, resposta válida, dica e imagens que existem", () => {
    const arquivos = new Set(creditosImagens.map((c) => c.arquivo));
    for (const nivel of niveisQuiz) {
      expect(nivel.perguntas.length, nivel.id).toBeGreaterThanOrEqual(6);
      for (const q of nivel.perguntas) {
        expect(q.alternativas.length, q.id).toBe(3);
        expect(q.correta, q.id).toBeGreaterThanOrEqual(0);
        expect(q.correta, q.id).toBeLessThan(3);
        expect(q.dica.length, q.id).toBeGreaterThan(5);
        for (const img of [q.imagem, ...q.alternativas.map((a) => a.imagem)]) {
          expect(existsSync(join(__dirname, "..", "public", img)), img).toBe(true);
          expect(arquivos.has(img), `crédito de ${img}`).toBe(true);
        }
      }
    }
  });

  it("todas as imagens são de domínio público ou CC0", () => {
    for (const c of creditosImagens) expect(["CC0", "PDM"], c.arquivo).toContain(c.licenca);
  });

  it("o nível de até 10 anos usa perguntas mais curtas", () => {
    const media = (n: number) =>
      niveisQuiz[n].perguntas.reduce((s, q) => s + q.pergunta.length, 0) / niveisQuiz[n].perguntas.length;
    expect(media(0)).toBeLessThan(media(1));
  });
});

describe("estrelas e mensagem final", () => {
  it("dá de 1 a 3 estrelas pelos acertos de primeira", () => {
    expect(estrelas(8, 8)).toBe(3);
    expect(estrelas(5, 8)).toBe(2);
    expect(estrelas(1, 8)).toBe(1);
    expect(mensagemFinal(8, 8)).toMatch(/guardião/);
  });
});
