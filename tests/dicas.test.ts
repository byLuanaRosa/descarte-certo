import { describe, expect, it } from "vitest";
import { dicas } from "@/lib/conteudo";

describe("dicas", () => {
  it("não repete ids", () => {
    const ids = dicas.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda fonte informada tem título e link https", () => {
    for (const d of dicas.filter((d) => d.fonte)) {
      expect(d.fonte?.titulo.length).toBeGreaterThan(0);
      expect(d.fonte?.url).toMatch(/^https:\/\//);
    }
  });

  it("a dica dos horários da coleta cita a fonte", () => {
    const dica = dicas.find((d) => d.id === "horario-coleta");
    expect(dica?.fonte?.url).toContain("epitaya.com.br");
  });
});
