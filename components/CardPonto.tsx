import { nomesDosMateriais } from "@/lib/conteudo";
import { formatarDistancia, formatarVerificacao, linkComoChegar, type PontoComDistancia } from "@/lib/pontos";

export function CardPonto({ ponto }: { ponto: PontoComDistancia }) {
  const verificado = formatarVerificacao(ponto.verificado_em);
  return (
    <article className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-xl font-bold">{ponto.nome}</h3>
        {ponto.distanciaKm !== null && (
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
            {formatarDistancia(ponto.distanciaKm)}
          </span>
        )}
      </div>
      <p className="mt-1 text-muted">📍 {ponto.endereco}</p>
      {ponto.horario && (
        <p className="mt-2">
          <span className="font-semibold">Horário: </span>
          {ponto.horario}
        </p>
      )}
      {ponto.telefone && (
        <p>
          <span className="font-semibold">Telefone: </span>
          {ponto.telefone}
        </p>
      )}
      <details className="mt-2">
        <summary className="cursor-pointer font-semibold text-primary">Materiais aceitos ({ponto.materiais.length})</summary>
        <ul className="mt-1 list-disc space-y-0.5 pl-6 text-sm">
          {nomesDosMateriais(ponto.materiais).map((nome) => (
            <li key={nome}>{nome}</li>
          ))}
        </ul>
      </details>
      <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
        {verificado ? `Verificado em ${verificado}. ` : ""}Confirme o horário e o material antes de ir.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={linkComoChegar(ponto)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Como chegar a ${ponto.nome} (abre o mapa em nova aba)`}
          className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground"
        >
          🧭 Como chegar
        </a>
        {ponto.fonte && (
          <a
            href={ponto.fonte}
            target="_blank"
            rel="noreferrer"
            aria-label={`Fonte das informações de ${ponto.nome} (nova aba)`}
            className="rounded-full border border-border px-5 py-2"
          >
            Fonte
          </a>
        )}
      </div>
    </article>
  );
}
