import { describe, expect, it, vi } from "vitest";
import { buscarEndereco, montarUrlBusca } from "@/lib/geocodificar";
import { dentroDeSantaCatarina, validarSugestao, type DadosSugestao } from "@/lib/validacao";

const valido: DadosSugestao = {
  nome: "  Farmácia   Central ",
  endereco: "Rua Felipe Schmidt, 100 - Centro",
  materiais: ["medicamentos-vencidos", "pilhas"],
  horario: "Seg. a sáb.: 8h–20h",
  telefone: "(48) 3333-4444",
  posicao: { latitude: -27.5969, longitude: -48.5495 },
};

describe("validarSugestao", () => {
  it("aceita dados válidos e normaliza espaços", () => {
    const r = validarSugestao(valido);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.valor.nome).toBe("Farmácia Central");
      expect(r.valor.latitude).toBe(-27.5969);
      expect(r.valor).not.toHaveProperty("status"); // o status é sempre definido pelo banco
    }
  });

  it("bloqueia envio sem posição no mapa (RN04)", () => {
    const r = validarSugestao({ ...valido, posicao: null });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.posicao).toMatch(/Marque o local no mapa/);
  });

  it("exige nome, endereço e pelo menos um material", () => {
    const r = validarSugestao({ ...valido, nome: "a", endereco: "", materiais: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.erros).sort()).toEqual(["endereco", "materiais", "nome"]);
  });

  it("descarta materiais desconhecidos e repetidos", () => {
    const r = validarSugestao({ ...valido, materiais: ["pilhas", "pilhas", "plutonio"] });
    expect(r.ok && r.valor.materiais).toEqual(["pilhas"]);
  });

  it("telefone é opcional, mas precisa ser válido se informado", () => {
    expect(validarSugestao({ ...valido, telefone: "" }).ok).toBe(true);
    const r = validarSugestao({ ...valido, telefone: "liga pra mim" });
    expect(!r.ok && r.erros.telefone).toBeTruthy();
  });

  it("recusa posição fora de Santa Catarina", () => {
    const r = validarSugestao({ ...valido, posicao: { latitude: -23.55, longitude: -46.63 } });
    expect(!r.ok && r.erros.posicao).toMatch(/Santa Catarina/);
  });
});

describe("dentroDeSantaCatarina", () => {
  it("Florianópolis está dentro; São Paulo não", () => {
    expect(dentroDeSantaCatarina({ latitude: -27.59, longitude: -48.55 })).toBe(true);
    expect(dentroDeSantaCatarina({ latitude: -23.55, longitude: -46.63 })).toBe(false);
  });
});

describe("buscarEndereco (Nominatim)", () => {
  it("monta a URL com Brasil e a área da Grande Florianópolis", () => {
    const url = new URL(montarUrlBusca("Rua Felipe Schmidt, 100"));
    expect(url.hostname).toBe("nominatim.openstreetmap.org");
    expect(url.searchParams.get("countrycodes")).toBe("br");
    expect(url.searchParams.get("viewbox")).toBeTruthy();
    expect(url.searchParams.get("limit")).toBe("1");
  });

  it("converte a resposta em coordenadas", async () => {
    const buscar = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ lat: "-27.59", lon: "-48.55" }])));
    await expect(buscarEndereco("x", buscar)).resolves.toEqual({ latitude: -27.59, longitude: -48.55 });
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it("retorna null quando não encontra", async () => {
    const buscar = vi.fn().mockResolvedValue(new Response("[]"));
    await expect(buscarEndereco("x", buscar)).resolves.toBeNull();
  });

  it("lança erro se o serviço falhar", async () => {
    const buscar = vi.fn().mockResolvedValue(new Response("", { status: 503 }));
    await expect(buscarEndereco("x", buscar)).rejects.toThrow();
  });
});
