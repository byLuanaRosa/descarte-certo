import { describe, expect, it } from "vitest";
import {
  distanciaKm,
  filtrarEOrdenar,
  formatarDistancia,
  formatarVerificacao,
  linkComoChegar,
  type Ponto,
} from "@/lib/pontos";

function ponto(nome: string, latitude: number, longitude: number, materiais: string[]): Ponto {
  return {
    id: nome,
    nome,
    endereco: "Rua X",
    latitude,
    longitude,
    materiais,
    horario: null,
    telefone: null,
    fonte: null,
    status: "aprovado",
    criado_em: "2026-11-22T00:00:00Z",
    verificado_em: "2026-11-22T00:00:00Z",
  };
}

const canasvieiras = ponto("Canasvieiras", -27.432405, -48.4556214, ["pilhas", "oleo-cozinha"]);
const capoeiras = ponto("Capoeiras", -27.5970218, -48.6028838, ["pilhas"]);
const ingleses = ponto("Ingleses", -27.4334996, -48.4085363, ["oleo-cozinha"]);
const todos = [canasvieiras, capoeiras, ingleses];

describe("distanciaKm", () => {
  it("é zero para o mesmo ponto", () => {
    expect(distanciaKm(capoeiras, capoeiras)).toBe(0);
  });

  it("calcula Canasvieiras–Capoeiras perto de 23 km em linha reta", () => {
    const d = distanciaKm(canasvieiras, capoeiras);
    expect(d).toBeGreaterThan(22);
    expect(d).toBeLessThan(25);
  });

  it("é simétrica", () => {
    expect(distanciaKm(canasvieiras, ingleses)).toBeCloseTo(distanciaKm(ingleses, canasvieiras), 10);
  });
});

describe("filtrarEOrdenar", () => {
  it("filtra pelo material", () => {
    expect(filtrarEOrdenar(todos, "pilhas", null).map((p) => p.nome)).toEqual(["Canasvieiras", "Capoeiras"]);
  });

  it("sem localização mantém a ordem e não calcula distância", () => {
    const r = filtrarEOrdenar(todos, "", null);
    expect(r.map((p) => p.nome)).toEqual(["Canasvieiras", "Capoeiras", "Ingleses"]);
    expect(r.every((p) => p.distanciaKm === null)).toBe(true);
  });

  it("com localização no Estreito, Capoeiras vem primeiro", () => {
    const estreito = { latitude: -27.592, longitude: -48.59 };
    expect(filtrarEOrdenar(todos, "", estreito)[0].nome).toBe("Capoeiras");
  });

  it("com localização nos Ingleses, Ingleses vem primeiro", () => {
    const pertoIngleses = { latitude: -27.436, longitude: -48.395 };
    expect(filtrarEOrdenar(todos, "", pertoIngleses).map((p) => p.nome)).toEqual([
      "Ingleses",
      "Canasvieiras",
      "Capoeiras",
    ]);
  });
});

describe("formatação", () => {
  it("formata distância em metros e km", () => {
    expect(formatarDistancia(0.35)).toBe("350 m");
    expect(formatarDistancia(12.34)).toBe("12,3 km");
  });

  it("formata a data de verificação", () => {
    expect(formatarVerificacao("2026-11-22T10:00:00Z")).toBe("11/2026");
    expect(formatarVerificacao(null)).toBeNull();
  });

  it("monta o link do Google Maps com o destino", () => {
    expect(linkComoChegar(capoeiras)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=-27.5970218,-48.6028838",
    );
  });
});
