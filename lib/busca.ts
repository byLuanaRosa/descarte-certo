import type { Material } from "@/lib/conteudo";

/** Remove acentos, deixa em minúsculas e junta espaços repetidos. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove o "s" final de palavras longas, para que "pilha" encontre "pilhas" e vice-versa. */
function singular(palavra: string): string {
  return palavra.length > 3 && palavra.endsWith("s") ? palavra.slice(0, -1) : palavra;
}

function textoPesquisavel(material: Material): string {
  return normalizar([material.nome, ...material.sinonimos].join(" "));
}

/**
 * Busca materiais pelo nome e pelos sinônimos (RF01).
 * Todas as palavras digitadas precisam aparecer (ignorando acentos, maiúsculas e plural).
 * Os resultados cujo nome começa com o termo aparecem primeiro.
 */
export function buscarMateriais(lista: Material[], termo: string, categoria?: string): Material[] {
  const filtrados = categoria ? lista.filter((m) => m.categoria === categoria) : lista;
  const palavras = normalizar(termo).split(" ").filter(Boolean).map(singular);
  if (palavras.length === 0) return filtrados;

  const comPontos = filtrados
    .map((material) => {
      const palavrasTexto = textoPesquisavel(material).split(" ").map(singular);
      const encontrou = palavras.every((p) => palavrasTexto.some((t) => t.startsWith(p)));
      const nome = normalizar(material.nome);
      const pontos = nome.startsWith(normalizar(termo)) ? 2 : nome.includes(palavras[0]) ? 1 : 0;
      return { material, encontrou, pontos };
    })
    .filter((r) => r.encontrou);

  return comPontos
    .sort((a, b) => b.pontos - a.pontos || a.material.nome.localeCompare(b.material.nome, "pt-BR"))
    .map((r) => r.material);
}
