import { describe, expect, it } from "vitest";
import { buscarMateriais, normalizar } from "@/lib/busca";
import { categorias, materiais } from "@/lib/conteudo";

const ids = (lista: { id: string }[]) => lista.map((m) => m.id);

describe("normalizar", () => {
  it("remove acentos e maiúsculas", () => {
    expect(normalizar("  Lâmpada  FLUORESCENTE ")).toBe("lampada fluorescente");
    expect(normalizar("Óleo de cozinha")).toBe("oleo de cozinha");
  });
});

describe("buscarMateriais", () => {
  it("encontra lâmpadas sem acento", () => {
    const resultado = ids(buscarMateriais(materiais, "lampada"));
    expect(resultado).toEqual(
      expect.arrayContaining(["lampada-fluorescente", "lampada-led", "lampada-incandescente"]),
    );
  });

  it("encontra pelo sinônimo", () => {
    expect(ids(buscarMateriais(materiais, "remedio"))).toContain("medicamentos-vencidos");
    expect(ids(buscarMateriais(materiais, "insulina"))).toContain("agulhas-seringas");
  });

  it("ignora plural", () => {
    expect(ids(buscarMateriais(materiais, "pilha"))).toContain("pilhas");
    expect(ids(buscarMateriais(materiais, "latas"))).toContain("metais");
  });

  it("exige todas as palavras", () => {
    expect(ids(buscarMateriais(materiais, "lampada led"))).toEqual(["lampada-led"]);
  });

  it("retorna vazio para termo inexistente", () => {
    expect(buscarMateriais(materiais, "xyzabc")).toEqual([]);
  });

  it("sem termo, retorna todos da categoria", () => {
    const resultado = buscarMateriais(materiais, "", "lampadas");
    expect(resultado.length).toBe(3);
    expect(resultado.every((m) => m.categoria === "lampadas")).toBe(true);
  });

  it("combina termo e categoria", () => {
    expect(ids(buscarMateriais(materiais, "bateria", "pilhas"))).toContain("baterias");
    expect(buscarMateriais(materiais, "bateria", "reciclaveis")).toEqual([]);
  });
});

describe("conteúdo", () => {
  it("todo material tem categoria válida, fonte e destino (RN05)", () => {
    const idsCategorias = new Set(categorias.map((c) => c.id));
    for (const m of materiais) {
      expect(idsCategorias.has(m.categoria), m.id).toBe(true);
      expect(m.fonte.url, m.id).toMatch(/^https:\/\//);
      expect(m.destino.length, m.id).toBeGreaterThan(10);
      expect(m.cuidados.length, m.id).toBeGreaterThan(0);
    }
  });

  it("ids de materiais são únicos", () => {
    expect(new Set(ids(materiais)).size).toBe(materiais.length);
  });

  it("toda categoria tem pelo menos um material", () => {
    for (const c of categorias) {
      expect(materiais.some((m) => m.categoria === c.id), c.id).toBe(true);
    }
  });
});
