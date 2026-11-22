import type { Coordenadas } from "@/lib/pontos";

/** Área da Grande Florianópolis usada para priorizar resultados (oeste, norte, leste, sul). */
const AREA_GRANDE_FLORIANOPOLIS = "-48.85,-27.30,-48.35,-27.85";

export function montarUrlBusca(endereco: string): string {
  const parametros = new URLSearchParams({
    q: endereco,
    format: "jsonv2",
    limit: "1",
    countrycodes: "br",
    viewbox: AREA_GRANDE_FLORIANOPOLIS,
    bounded: "0",
    "accept-language": "pt-BR",
  });
  return `https://nominatim.openstreetmap.org/search?${parametros.toString()}`;
}

/**
 * Converte o endereço em coordenadas usando o Nominatim (OpenStreetMap).
 * Faz uma única busca por clique, como pede a política de uso do serviço.
 * Retorna null se não encontrar.
 */
export async function buscarEndereco(endereco: string, buscar: typeof fetch = fetch): Promise<Coordenadas | null> {
  const resposta = await buscar(montarUrlBusca(endereco), { headers: { Accept: "application/json" } });
  if (!resposta.ok) throw new Error(`Nominatim respondeu ${resposta.status}`);
  const lista = (await resposta.json()) as { lat: string; lon: string }[];
  if (!Array.isArray(lista) || lista.length === 0) return null;
  const latitude = Number(lista[0].lat);
  const longitude = Number(lista[0].lon);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}
