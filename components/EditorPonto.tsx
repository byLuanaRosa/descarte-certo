"use client";

import { useState, type FormEvent } from "react";
import { Mapa } from "@/components/Mapa";
import { SeletorMateriais } from "@/components/SeletorMateriais";
import type { DadosEdicao } from "@/lib/admin";
import type { Coordenadas, Ponto } from "@/lib/pontos";
import { validarFonte, validarSugestao, type ErrosSugestao } from "@/lib/validacao";

const campo = "w-full rounded-xl border border-border bg-background px-4 py-3";

type Props = {
  ponto: Ponto;
  aoSalvar: (dados: DadosEdicao) => Promise<boolean>;
  aoCancelar: () => void;
};

/** Formulário do administrador para editar um ponto de coleta. */
export function EditorPonto({ ponto, aoSalvar, aoCancelar }: Props) {
  const [nome, setNome] = useState(ponto.nome);
  const [endereco, setEndereco] = useState(ponto.endereco);
  const [horario, setHorario] = useState(ponto.horario ?? "");
  const [telefone, setTelefone] = useState(ponto.telefone ?? "");
  const [fonte, setFonte] = useState(ponto.fonte ?? "");
  const [selecionados, setSelecionados] = useState<string[]>(ponto.materiais);
  const [posicao, setPosicao] = useState<Coordenadas>({ latitude: ponto.latitude, longitude: ponto.longitude });
  const [erros, setErros] = useState<ErrosSugestao & { fonte?: string }>({});
  const [salvando, setSalvando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);

  function alternar(id: string) {
    setSelecionados((l) => (l.includes(id) ? l.filter((m) => m !== id) : [...l, id]));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    const r = validarSugestao({ nome, endereco, materiais: selecionados, horario, telefone, posicao });
    const f = validarFonte(fonte);
    if (!r.ok || !f.ok) {
      setErros({ ...(r.ok ? {} : r.erros), ...(f.ok ? {} : { fonte: f.erro }) });
      return;
    }
    setErros({});
    setSalvando(true);
    const ok = await aoSalvar({ ...r.valor, fonte: f.valor });
    setSalvando(false);
    if (!ok) setFalha("Não foi possível salvar. Tente de novo.");
  }

  const erro = (id: string, texto?: string) =>
    texto ? (
      <p id={id} className="mt-1 text-sm font-semibold text-danger">
        {texto}
      </p>
    ) : null;

  return (
    <form onSubmit={salvar} noValidate aria-label={`Editar ${ponto.nome}`} className="space-y-4 rounded-[var(--radius-card)] border-2 border-primary bg-card p-4">
      <h3 className="text-lg font-bold">Editar ponto</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="ed-nome" className="mb-1 block font-semibold">
            Nome do local *
          </label>
          <input id="ed-nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} className={campo} />
          {erro("ed-nome-erro", erros.nome)}
        </div>
        <div>
          <label htmlFor="ed-endereco" className="mb-1 block font-semibold">
            Endereço *
          </label>
          <input id="ed-endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} maxLength={200} className={campo} />
          {erro("ed-endereco-erro", erros.endereco)}
        </div>
        <div>
          <label htmlFor="ed-horario" className="mb-1 block font-semibold">
            Horário
          </label>
          <input id="ed-horario" value={horario} onChange={(e) => setHorario(e.target.value)} maxLength={200} className={campo} />
        </div>
        <div>
          <label htmlFor="ed-telefone" className="mb-1 block font-semibold">
            Telefone do local
          </label>
          <input id="ed-telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={20} className={campo} />
          {erro("ed-telefone-erro", erros.telefone)}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="ed-fonte" className="mb-1 block font-semibold">
            Fonte (link oficial)
          </label>
          <input id="ed-fonte" type="url" value={fonte} onChange={(e) => setFonte(e.target.value)} maxLength={300} placeholder="https://" className={campo} />
          {erro("ed-fonte-erro", erros.fonte)}
        </div>
      </div>

      <SeletorMateriais
        selecionados={selecionados}
        aoAlternar={alternar}
        erro={erros.materiais}
        legenda="Materiais aceitos *"
        idLegenda="ed-materiais"
      />

      <div>
        <p className="mb-1 font-semibold">Local no mapa (toque ou arraste o pino para ajustar)</p>
        <Mapa
          rotulo="Mapa para ajustar o local do ponto"
          altura="18rem"
          pino={{ posicao, aoMudar: setPosicao }}
        />
        <p className="mt-1 text-sm">
          Local: {posicao.latitude.toFixed(5)}, {posicao.longitude.toFixed(5)}
        </p>
        {erro("ed-posicao-erro", erros.posicao)}
      </div>

      {falha && (
        <p role="alert" className="rounded-lg bg-danger-soft px-4 py-2">
          {falha}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={salvando} className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground disabled:opacity-60">
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
        <button type="button" onClick={aoCancelar} className="rounded-full border border-border px-5 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}
