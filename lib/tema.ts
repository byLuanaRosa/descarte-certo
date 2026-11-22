export type Tema = "claro" | "escuro";

export const CHAVE_TEMA = "descarte-certo:tema";

/**
 * Script executado antes da primeira pintura: aplica o tema salvo no aparelho
 * (claro por padrão), sem "piscar" a tela.
 */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CHAVE_TEMA}");if(t==="escuro"||t==="claro")document.documentElement.setAttribute("data-tema",t)}catch(e){}})()`;

export function temaAtual(): Tema {
  return document.documentElement.getAttribute("data-tema") === "escuro" ? "escuro" : "claro";
}

const ouvintes = new Set<() => void>();

export function aplicarTema(tema: Tema): void {
  document.documentElement.setAttribute("data-tema", tema);
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // Sem armazenamento (modo privado): o tema vale só nesta visita.
  }
  ouvintes.forEach((o) => o());
}

export function assinarTema(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}
