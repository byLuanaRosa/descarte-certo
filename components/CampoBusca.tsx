type Props = { valorInicial?: string; categoria?: string };

/** Formulário de busca que funciona sem JavaScript (envia GET para /buscar). */
export function CampoBusca({ valorInicial = "", categoria }: Props) {
  return (
    <form action="/buscar" method="get" role="search" className="flex w-full max-w-2xl gap-2">
      <label htmlFor="busca" className="sr-only">
        O que você quer descartar?
      </label>
      <input
        id="busca"
        name="q"
        type="search"
        defaultValue={valorInicial}
        placeholder="Ex.: pilha, remédio, óleo"
        autoComplete="off"
        className="min-w-0 flex-1 rounded-full border border-border bg-card px-5 py-3 text-lg shadow-sm placeholder:text-muted"
      />
      {categoria ? <input type="hidden" name="categoria" value={categoria} /> : null}
      <button
        type="submit"
        className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:opacity-90"
      >
        Buscar
      </button>
    </form>
  );
}
