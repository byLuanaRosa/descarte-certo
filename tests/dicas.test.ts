import { describe, expect, it } from "vitest";
import { validarDica } from "@/lib/dicas";

const valida = {
  tema: "Reciclagem",
  tipo: "Atitude prática",
  titulo: "Separe secos e úmidos",
  texto: "Recicláveis secos num lado, restos de comida no outro.",
  fonte_titulo: "Comcap – Prefeitura de Florianópolis",
  fonte_url: "https://www.pmf.sc.gov.br/comcap",
};

describe("validarDica", () => {
  it("aceita uma dica completa e tira espaços das pontas", () => {
    const { dados, erros } = validarDica({ ...valida, titulo: "  Separe secos e úmidos  " });
    expect(erros).toEqual([]);
    expect(dados?.titulo).toBe("Separe secos e úmidos");
  });

  it("exige fonte e link", () => {
    const { dados, erros } = validarDica({ ...valida, fonte_titulo: "", fonte_url: "" });
    expect(dados).toBeNull();
    expect(erros.join(" ")).toMatch(/Fonte/);
    expect(erros.join(" ")).toMatch(/Link da fonte/);
  });

  it("recusa link sem https", () => {
    expect(validarDica({ ...valida, fonte_url: "http://www.pmf.sc.gov.br/comcap" }).dados).toBeNull();
    expect(validarDica({ ...valida, fonte_url: "javascript:alert(1)" }).dados).toBeNull();
  });

  it("recusa tipo fora da lista", () => {
    const { erros } = validarDica({ ...valida, tipo: "Curiosidade" });
    expect(erros).toContain("Tipo: escolha uma das opções.");
  });

  it("recusa texto curto demais ou longo demais", () => {
    expect(validarDica({ ...valida, texto: "curto" }).dados).toBeNull();
    expect(validarDica({ ...valida, texto: "a".repeat(401) }).dados).toBeNull();
  });
});
