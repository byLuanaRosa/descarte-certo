import { categorias, materiais } from "@/lib/conteudo";

type Props = {
  selecionados: string[];
  aoAlternar: (id: string) => void;
  erro?: string;
  legenda?: string;
  idLegenda?: string;
};

/** Caixas de seleção dos materiais, agrupadas por categoria (sugestão e edição de pontos). */
export function SeletorMateriais({
  selecionados,
  aoAlternar,
  erro,
  legenda = "Materiais que o local recebe *",
  idLegenda = "campo-materiais",
}: Props) {
  return (
    <fieldset aria-describedby={`${idLegenda}-erro`}>
      <legend id={idLegenda} tabIndex={-1} className="mb-2 font-semibold">
        {legenda}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-3">
            <p className="mb-1 text-sm font-bold">
              <span aria-hidden>{c.icone} </span>
              {c.nome}
            </p>
            {materiais
              .filter((m) => m.categoria === c.id)
              .map((m) => (
                <label key={m.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(m.id)}
                    onChange={() => aoAlternar(m.id)}
                    className="h-5 w-5 accent-[var(--primary)]"
                  />
                  {m.nome}
                </label>
              ))}
          </div>
        ))}
      </div>
      {erro ? (
        <p id={`${idLegenda}-erro`} className="mt-1 text-sm font-semibold text-danger">
          {erro}
        </p>
      ) : null}
    </fieldset>
  );
}
