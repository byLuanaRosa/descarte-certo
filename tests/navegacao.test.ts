import { describe, expect, it } from "vitest";
import { estaAtivo, itensMenu } from "@/lib/navegacao";

describe("estaAtivo", () => {
  it("marca a página inicial só na raiz", () => {
    expect(estaAtivo("/", "/")).toBe(true);
    expect(estaAtivo("/", "/buscar")).toBe(false);
  });

  it("marca subpáginas da seção", () => {
    expect(estaAtivo("/pontos", "/pontos")).toBe(true);
    expect(estaAtivo("/pontos", "/pontos/sugerir")).toBe(true);
    expect(estaAtivo("/pontos", "/pontosx")).toBe(false);
  });

  it("tem os cinco itens do menu inferior", () => {
    expect(itensMenu.map((i) => i.href)).toEqual(["/", "/buscar", "/pontos", "/dicas", "/kids"]);
  });
});
