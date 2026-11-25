"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { carregarDicasPublicas, type Dica } from "@/lib/dicas";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "pronto"; dicas: Dica[] };

/**
 * Lista pública de dicas. Busca no navegador (como os pontos de coleta),
 * para que uma dica criada ou editada no painel apareça sem novo deploy.
 */
export function ListaDicas({ tema: temaPedido }: { tema: string }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });

  useEffect(() => {
    let ativo = true;
    carregarDicasPublicas().then((dicas) => {
      if (ativo) setEstado(dicas ? { tipo: "pronto", dicas } : { tipo: "erro" });
    });
    return () => {
      ativo = false;
    };
  }, []);

  if (estado.tipo === "carregando") return <p className="text-muted">Carregando dicas…</p>;
  if (estado.tipo === "erro")
    return (
      <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3">
        Não foi possível carregar as dicas agora. Tente de novo em alguns minutos.
      </p>
    );

  const { dicas } = estado;
  const temas = Array.from(new Set(dicas.map((d) => d.tema)));
  const tema = temas.includes(temaPedido) ? temaPedido : "";
  const lista = tema ? dicas.filter((d) => d.tema === tema) : dicas;

  return (
    <>
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
            <article className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold text-primary">{d.tema}</p>
              <h2 className="mt-1 text-xl font-bold">{d.titulo}</h2>
              <p className="mt-2">{d.texto}</p>
              <p className="mt-3 text-xs text-muted">
                <span className="font-semibold text-foreground">Fonte: </span>
                <a href={d.fonte_url} target="_blank" rel="noreferrer" className="text-primary underline">
                  {d.fonte_titulo}
                </a>
              </p>
              <p className="mt-auto self-start pt-3">
                <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{d.tipo}</span>
              </p>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
