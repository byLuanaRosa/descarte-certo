import type { Metadata } from "next";
import Link from "next/link";
import { CampoBusca } from "@/components/CampoBusca";
import { buscarMateriais } from "@/lib/busca";
import { buscarCategoriaPorId, categorias, materiais } from "@/lib/conteudo";

export const metadata: Metadata = { title: "Buscar material" };

function texto(valor: string | string[] | undefined): string {
  return (Array.isArray(valor) ? valor[0] : valor)?.slice(0, 80) ?? "";
}

export default async function BuscarPage({ searchParams }: PageProps<"/buscar">) {
  const parametros = await searchParams;
  const termo = texto(parametros.q).trim();
  const categoriaId = texto(parametros.categoria);
  const categoria = buscarCategoriaPorId(categoriaId);
  const resultados = buscarMateriais(materiais, termo, categoria?.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-extrabold text-primary-deep">Buscar material</h1>
        <p className="mb-4 mt-2 text-muted">Digite o nome do resíduo. Aceitamos sinônimos e palavras sem acento.</p>
        <CampoBusca valorInicial={termo} categoria={categoria?.id} />
      </header>

      <nav aria-label="Filtrar por categoria">
        <ul className="flex flex-wrap gap-2">
          {[{ id: "", nome: "Todas" }, ...categorias].map((c) => {
            const ativa = (categoria?.id ?? "") === c.id;
            const href = { pathname: "/buscar", query: { ...(termo ? { q: termo } : {}), ...(c.id ? { categoria: c.id } : {}) } };
            return (
              <li key={c.id || "todas"}>
                <Link
                  href={href}
                  aria-current={ativa ? "true" : undefined}
                  className={`inline-block rounded-full border px-4 py-2 text-sm ${
                    ativa ? "border-primary bg-primary font-bold text-primary-foreground" : "border-border bg-card"
                  }`}
                >
                  {c.nome}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section aria-live="polite">
        {resultados.length > 0 ? (
          <>
            <p className="mb-3 text-muted">
              {termo
                ? `${resultados.length} resultado(s) para “${termo}”`
                : categoria
                  ? `${resultados.length} material(is) em ${categoria.nome}`
                  : "Todos os materiais"}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/material/${m.id}`}
                    className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-sm hover:border-primary"
                  >
                    <span className="text-lg font-bold">{m.nome}</span>
                    <span className="text-sm text-muted">{buscarCategoriaPorId(m.categoria)?.nome}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
            <p className="text-lg font-bold">Nenhum resultado{termo ? ` para “${termo}”` : ""}.</p>
            <p className="mt-1 text-muted">
              Tente outra palavra ou escolha uma das categorias acima. Se o resíduo não estiver aqui, consulte o{" "}
              <a
                href="https://www.pmf.sc.gov.br/entidades/comcap/"
                className="font-semibold text-primary underline"
                target="_blank"
                rel="noreferrer"
              >
                site da Comcap
              </a>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
