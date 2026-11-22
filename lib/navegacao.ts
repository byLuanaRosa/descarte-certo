export type ItemMenu = { href: string; rotulo: string; icone: string };

export const itensMenu: ItemMenu[] = [
  { href: "/", rotulo: "Início", icone: "🏠" },
  { href: "/buscar", rotulo: "Buscar", icone: "🔎" },
  { href: "/pontos", rotulo: "Pontos", icone: "📍" },
  { href: "/dicas", rotulo: "Dicas", icone: "🌱" },
  { href: "/kids", rotulo: "Kids", icone: "🙂" },
];

/** Indica se o item do menu corresponde à rota atual. */
export function estaAtivo(href: string, caminho: string): boolean {
  if (href === "/") return caminho === "/";
  return caminho === href || caminho.startsWith(`${href}/`);
}
