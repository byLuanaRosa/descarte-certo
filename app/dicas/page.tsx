import type { Metadata } from "next";
import Link from "next/link";
import { dicas } from "@/lib/conteudo";

export const metadata: Metadata = { title: "Dicas ambientais" };

const temas = Array.from(new Set(dicas.map((d) => d.tema)));

export default async function DicasPage({ searchParams }: PageProps<"/dicas">) {
  const { tema: temaBruto } = await searchParams;
  const tema = typeof temaBruto === "string" && temas.includes(temaBruto) ? temaBruto : "";
  const lista = tema ? dicas.filter((d) => d.tema === tema) : dicas;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-extrabold text-primary-deep">Dicas ambientais</h1>
        <p className="mt-2 text-muted">Escolhas conscientes para o dia a dia.</p>
      </header>

      <nav aria-label="Filtrar por tema">
        <ul className="flex flex-wrap gap-2">
          {["", ...temas].map((t) => {
            const ativo = t === tema;
            return (
              <li key={t || "todas"}>
                <Link
                  href={t ? { pathname: "/dicas", query: { tema: t } } : "/dicas"}
                  aria-current={ativo ? "true" : undefined}
                  className={`inline-block rounded-full border px-4 py-2 text-sm ${
                    ativo ? "border-primary bg-primary font-bold text-primary-foreground" : "border-border bg-card"
                  }`}
                >
                  {t || "Todas"}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="text-muted" aria-live="polite">
        {lista.length} dica(s) encontrada(s)
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((d) => (
          <li key={d.id}>
            <article className="h-full rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold text-primary">{d.tema}</p>
              <h2 className="mt-1 text-xl font-bold">{d.titulo}</h2>
              <p className="mt-2">{d.texto}</p>
              {d.fonte && (
                <p className="mt-3 text-xs text-muted">
                  <span className="font-semibold text-foreground">Fonte: </span>
                  <a href={d.fonte.url} target="_blank" rel="noreferrer" className="text-primary underline">
                    {d.fonte.titulo}
                  </a>
                </p>
              )}
              <p className="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{d.tipo}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
