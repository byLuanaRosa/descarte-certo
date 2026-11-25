"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  atualizarDica,
  criarDica,
  excluirDica,
  LIMITES_DICA,
  listarDicas,
  TIPOS_DICA,
  validarDica,
  type DadosDica,
  type Dica,
} from "@/lib/dicas";

const campo = "w-full rounded-xl border border-border bg-background px-4 py-3";

/** Lista, cria, edita e exclui as dicas ambientais (painel /admin). */
export function GerenciarDicas() {
  const [dicas, setDicas] = useState<Dica[] | null>(null);
  const [erroCarga, setErroCarga] = useState(false);
  // "nova" = formulário de criação aberto; um id = editando aquela dica
  const [editando, setEditando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    listarDicas()
      .then(setDicas)
      .catch(() => setErroCarga(true));
  }, []);

  if (erroCarga) return <p className="rounded-lg bg-danger-soft px-4 py-3">Não foi possível carregar as dicas. Recarregue a página.</p>;
  if (dicas === null) return <p>Carregando dicas…</p>;

  const temas = Array.from(new Set(dicas.map((d) => d.tema)));

  async function salvarNova(dados: DadosDica): Promise<boolean> {
    const criada = await criarDica(dados);
    if (!criada) return false;
    setDicas((lista) => [...(lista ?? []), criada]);
    setEditando(null);
    setMensagem(`A dica “${criada.titulo}” foi publicada.`);
    return true;
  }

  async function salvarEdicao(dica: Dica, dados: DadosDica): Promise<boolean> {
    const ok = await atualizarDica(dica.id, dados);
    if (!ok) return false;
    setDicas((lista) => (lista ?? []).map((d) => (d.id === dica.id ? { ...d, ...dados } : d)));
    setEditando(null);
    setMensagem(`A dica “${dados.titulo}” foi atualizada.`);
    return true;
  }

  async function excluir(dica: Dica) {
    if (!window.confirm(`Excluir a dica “${dica.titulo}” de vez? Essa ação não pode ser desfeita.`)) return;
    setOcupado(true);
    const ok = await excluirDica(dica.id);
    setOcupado(false);
    if (!ok) {
      setMensagem(`Não foi possível excluir “${dica.titulo}”. Tente de novo.`);
      return;
    }
    setDicas((lista) => (lista ?? []).filter((d) => d.id !== dica.id));
    setEditando(null);
    setMensagem(`A dica “${dica.titulo}” foi excluída.`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Dicas publicadas ({dicas.length})</h2>
        {editando !== "nova" && (
          <button
            type="button"
            onClick={() => {
              setEditando("nova");
              setMensagem(null);
            }}
            className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground"
          >
            + Nova dica
          </button>
        )}
      </div>
      <p className="text-sm text-muted">
        Toda dica precisa de uma fonte confiável (órgão público, universidade, artigo ou veículo de imprensa). As
        mudanças aparecem no site na hora.
      </p>
      <div aria-live="polite">{mensagem && <p className="rounded-lg bg-secondary px-4 py-3">{mensagem}</p>}</div>

      {editando === "nova" && (
        <FormDica titulo="Nova dica" temas={temas} aoSalvar={salvarNova} aoCancelar={() => setEditando(null)} />
      )}

      {dicas.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-4 py-3">Nenhuma dica cadastrada.</p>
      ) : (
        <ul aria-label="Dicas publicadas" className="grid gap-4 lg:grid-cols-2">
          {dicas.map((d) => (
            <li key={d.id}>
              {editando === d.id ? (
                <FormDica
                  titulo={`Editar “${d.titulo}”`}
                  inicial={d}
                  temas={temas}
                  aoSalvar={(dados) => salvarEdicao(d, dados)}
                  aoCancelar={() => setEditando(null)}
                />
              ) : (
                <article className="h-full rounded-[var(--radius-card)] border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-primary">
                    {d.tema} · {d.tipo}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{d.titulo}</h3>
                  <p className="mt-1">{d.texto}</p>
                  <p className="mt-2 text-sm text-muted">
                    Fonte:{" "}
                    <a href={d.fonte_url} target="_blank" rel="noreferrer" className="text-primary underline">
                      {d.fonte_titulo}
                    </a>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => {
                        setEditando(d.id);
                        setMensagem(null);
                      }}
                      aria-label={`Editar ${d.titulo}`}
                      className="rounded-full border border-border px-4 py-2 font-semibold"
                    >
                      ✎ Editar
                    </button>
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => excluir(d)}
                      aria-label={`Excluir ${d.titulo}`}
                      className="rounded-full border border-border px-4 py-2 font-semibold text-danger"
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type PropsForm = {
  titulo: string;
  inicial?: Dica;
  temas: string[];
  aoSalvar: (dados: DadosDica) => Promise<boolean>;
  aoCancelar: () => void;
};

function FormDica({ titulo, inicial, temas, aoSalvar, aoCancelar }: PropsForm) {
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [texto, setTexto] = useState(inicial?.texto ?? "");
  const prefixo = inicial?.id ?? "nova";

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ler = (nome: string) => String(f.get(nome) ?? "");
    const { dados, erros: lista } = validarDica({
      tema: ler("tema"),
      tipo: ler("tipo"),
      titulo: ler("titulo"),
      texto: ler("texto"),
      fonte_titulo: ler("fonte_titulo"),
      fonte_url: ler("fonte_url"),
    });
    if (!dados) {
      setErros(lista);
      return;
    }
    setErros([]);
    setSalvando(true);
    const ok = await aoSalvar(dados);
    setSalvando(false);
    if (!ok) setErros(["Não foi possível salvar. Confira sua conexão e se você ainda está logado."]);
  }

  const id = (nome: string) => `${prefixo}-${nome}`;

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={titulo}
      className="space-y-3 rounded-[var(--radius-card)] border-2 border-primary bg-card p-4"
    >
      <h3 className="text-lg font-bold">{titulo}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={id("tema")} className="mb-1 block font-semibold">
            Tema
          </label>
          <input
            id={id("tema")}
            name="tema"
            list={id("temas")}
            defaultValue={inicial?.tema}
            maxLength={LIMITES_DICA.tema[1]}
            required
            className={campo}
          />
          <datalist id={id("temas")}>
            {temas.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor={id("tipo")} className="mb-1 block font-semibold">
            Tipo
          </label>
          <select id={id("tipo")} name="tipo" defaultValue={inicial?.tipo ?? TIPOS_DICA[0]} className={campo}>
            {TIPOS_DICA.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={id("titulo")} className="mb-1 block font-semibold">
          Título
        </label>
        <input
          id={id("titulo")}
          name="titulo"
          defaultValue={inicial?.titulo}
          maxLength={LIMITES_DICA.titulo[1]}
          required
          className={campo}
        />
      </div>
      <div>
        <label htmlFor={id("texto")} className="mb-1 block font-semibold">
          Texto
        </label>
        <textarea
          id={id("texto")}
          name="texto"
          rows={4}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={LIMITES_DICA.texto[1]}
          required
          aria-describedby={id("contador")}
          className={campo}
        />
        <p id={id("contador")} className="text-right text-xs text-muted">
          {texto.trim().length}/{LIMITES_DICA.texto[1]}
        </p>
      </div>
      <div>
        <label htmlFor={id("fonte_titulo")} className="mb-1 block font-semibold">
          Fonte (como aparece no site)
        </label>
        <input
          id={id("fonte_titulo")}
          name="fonte_titulo"
          defaultValue={inicial?.fonte_titulo}
          maxLength={LIMITES_DICA.fonte_titulo[1]}
          placeholder="Ex.: Comcap – Prefeitura de Florianópolis. Coleta seletiva"
          required
          className={campo}
        />
      </div>
      <div>
        <label htmlFor={id("fonte_url")} className="mb-1 block font-semibold">
          Link da fonte
        </label>
        <input
          id={id("fonte_url")}
          name="fonte_url"
          type="url"
          inputMode="url"
          defaultValue={inicial?.fonte_url}
          maxLength={LIMITES_DICA.fonte_url[1]}
          placeholder="https://"
          required
          className={campo}
        />
      </div>
      {erros.length > 0 && (
        <ul role="alert" className="list-disc space-y-1 pl-5 font-semibold text-danger">
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground disabled:opacity-60"
        >
          {salvando ? "Salvando…" : inicial ? "Salvar alterações" : "Publicar dica"}
        </button>
        <button type="button" onClick={aoCancelar} className="rounded-full border border-border px-5 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}
