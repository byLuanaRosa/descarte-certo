import { normalizar } from "@/lib/busca";
import { obterSupabase } from "@/lib/supabase";

export type Ponto = {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  materiais: string[];
  horario: string | null;
  telefone: string | null;
  fonte: string | null;
  status: "pendente" | "aprovado" | "rejeitado";
  criado_em: string;
  verificado_em: string | null;
};

export type Coordenadas = { latitude: number; longitude: number };

export const CENTRO_FLORIANOPOLIS: Coordenadas = { latitude: -27.5954, longitude: -48.548 };

const COLUNAS = "id, nome, endereco, latitude, longitude, materiais, horario, telefone, fonte, status, criado_em, verificado_em";

/** Pontos aprovados (o RLS garante que o público só recebe esses). */
export async function listarPontosAprovados(): Promise<Ponto[]> {
  const { data, error } = await obterSupabase()
    .from("pontos_coleta")
    .select(COLUNAS)
    .eq("status", "aprovado")
    .order("nome");
  if (error) throw error;
  return (data ?? []) as Ponto[];
}

/** Distância em km entre dois pontos (fórmula de Haversine). */
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatarDistancia(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
}

export type PontoComDistancia = Ponto & { distanciaKm: number | null };

/**
 * Filtra por material e pelo texto buscado (nome ou endereço) e, se houver posição do usuário,
 * ordena do mais perto ao mais longe (RF02).
 * A posição do usuário só é usada aqui, no navegador; nunca é enviada ao servidor (RN03).
 */
export function filtrarEOrdenar(
  pontos: Ponto[],
  material: string,
  origem: Coordenadas | null,
  termo = "",
): PontoComDistancia[] {
  const palavras = normalizar(termo).split(" ").filter(Boolean);
  const filtrados = pontos.filter((p) => {
    if (material && !p.materiais.includes(material)) return false;
    if (palavras.length === 0) return true;
    const texto = normalizar(`${p.nome} ${p.endereco}`);
    return palavras.every((palavra) => texto.includes(palavra));
  });
  const comDistancia = filtrados.map((p) => ({ ...p, distanciaKm: origem ? distanciaKm(origem, p) : null }));
  if (origem) comDistancia.sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0));
  return comDistancia;
}

/** Link "Como chegar" no Google Maps, com o destino preenchido. */
export function linkComoChegar(p: Coordenadas): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;
}

/** "2026-11-22T..." → "11/2026" */
export function formatarVerificacao(data: string | null): string | null {
  if (!data) return null;
  const [ano, mes] = data.slice(0, 7).split("-");
  return `${mes}/${ano}`;
}
