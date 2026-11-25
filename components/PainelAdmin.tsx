"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { EditorPonto } from "@/components/EditorPonto";
import { GerenciarDicas } from "@/components/GerenciarDicas";
import { Mapa } from "@/components/Mapa";
import {
  atualizarPonto,
  decidir,
  ehAdministrador,
  entrar,
  excluirPonto,
  listarPorStatus,
  sair,
  sessaoAtual,
  type DadosEdicao,
  type Decisao,
  type StatusPonto,
} from "@/lib/admin";
import { buscarMaterialPorId } from "@/lib/conteudo";
import type { Ponto } from "@/lib/pontos";
import { supabaseConfigurado } from "@/lib/supabase";

type Tela =
  | { tipo: "carregando" }
  | { tipo: "login"; erro: string | null; enviando: boolean }
  | { tipo: "sem-permissao" }
  | { tipo: "painel" }
  | { tipo: "indisponivel" };

const campo = "w-full rounded-xl border border-border bg-background px-4 py-3";

export function PainelAdmin() {
  const [tela, setTela] = useState<Tela>(() =>
    supabaseConfigurado() ? { tipo: "carregando" } : { tipo: "indisponivel" },
  );
  const [secao, setSecao] = useState<"pontos" | "dicas">("pontos");
  const [aba, setAba] = useState<StatusPonto>("pendente");
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregarPainel = useCallback(async (userId: string) => {
    let admin: boolean;
    try {
      admin = await ehAdministrador(userId);
    } catch {
      setTela({ tipo: "login", erro: "Não foi possível verificar sua permissão. Tente de novo.", enviando: false });
      return;
    }
    if (!admin) {
      setTela({ tipo: "sem-permissao" });
      return;
    }
    try {
      const lista = await listarPorStatus("pendente");
      setAba("pendente");
      setPontos(lista);
      setSelecionado(lista[0]?.id ?? null);
      setTela({ tipo: "painel" });
    } catch {
      setMensagem("Não foi possível carregar os pendentes.");
      setTela({ tipo: "painel" });
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado()) return;
    sessaoAtual()
      .then((s) => (s ? carregarPainel(s.user.id) : setTela({ tipo: "login", erro: null, enviando: false })))
      .catch(() => setTela({ tipo: "login", erro: null, enviando: false }));
  }, [carregarPainel]);

  async function fazerLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setTela({ tipo: "login", erro: null, enviando: true });
    const { erro } = await entrar(String(form.get("usuario") ?? ""), String(form.get("senha") ?? ""));
    if (erro) {
      setTela({ tipo: "login", erro, enviando: false });
      return;
    }
    const s = await sessaoAtual().catch(() => null);
    if (s) await carregarPainel(s.user.id);
    else setTela({ tipo: "login", erro: "Não foi possível iniciar a sessão. Tente de novo.", enviando: false });
  }

  async function fazerLogout() {
    await sair();
    setPontos([]);
    setEditando(null);
    setTela({ tipo: "login", erro: null, enviando: false });
  }

  async function trocarAba(status: StatusPonto) {
    setAba(status);
    setEditando(null);
    setMensagem(null);
    setOcupado(true);
    try {
      const lista = await listarPorStatus(status);
      setPontos(lista);
      setSelecionado(lista[0]?.id ?? null);
    } catch {
      setPontos([]);
      setMensagem("Não foi possível carregar a lista. Tente de novo.");
    } finally {
      setOcupado(false);
    }
  }

  function tirarDaLista(id: string) {
    const resto = pontos.filter((p) => p.id !== id);
    setPontos(resto);
    if (selecionado === id) setSelecionado(resto[0]?.id ?? null);
  }

  async function aplicar(ponto: Ponto, decisao: Decisao) {
    setOcupado(true);
    const ok = await decidir(ponto.id, decisao);
    setOcupado(false);
    if (!ok) {
      setMensagem(`Não foi possível ${decisao === "aprovado" ? "aprovar" : "rejeitar"} “${ponto.nome}”. Tente de novo.`);
      return;
    }
    setMensagem(decisao === "aprovado" ? `“${ponto.nome}” foi aprovado e já aparece no site.` : `“${ponto.nome}” foi rejeitado.`);
    tirarDaLista(ponto.id);
  }

  async function salvarEdicao(ponto: Ponto, dados: DadosEdicao): Promise<boolean> {
    const ok = await atualizarPonto(ponto.id, dados);
    if (ok) {
      setPontos((lista) => lista.map((p) => (p.id === ponto.id ? { ...p, ...dados } : p)));
      setEditando(null);
      setMensagem(`“${dados.nome}” foi atualizado.`);
    }
    return ok;
  }

  async function excluir(ponto: Ponto) {
    if (!window.confirm(`Excluir “${ponto.nome}” de vez? Essa ação não pode ser desfeita.`)) return;
    setOcupado(true);
    const ok = await excluirPonto(ponto.id);
    setOcupado(false);
    if (!ok) {
      setMensagem(`Não foi possível excluir “${ponto.nome}”. Tente de novo.`);
      return;
    }
    setMensagem(`“${ponto.nome}” foi excluído.`);
    setEditando(null);
    tirarDaLista(ponto.id);
  }

  if (tela.tipo === "indisponivel")
    return <p className="rounded-lg bg-danger-soft px-4 py-3">O banco de dados não está configurado neste ambiente.</p>;

  if (tela.tipo === "carregando") return <p>Carregando…</p>;

  if (tela.tipo === "login")
    return (
      <form onSubmit={fazerLogin} className="mx-auto max-w-md space-y-4 rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Entrar</h2>
        <div>
          <label htmlFor="usuario" className="mb-1 block font-semibold">
            Usuário
          </label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="senha" className="mb-1 block font-semibold">
            Senha
          </label>
          <input id="senha" name="senha" type="password" required autoComplete="current-password" className={campo} />
        </div>
        {tela.erro && (
          <p role="alert" className="font-semibold text-danger">
            {tela.erro}
          </p>
        )}
        <button
          type="submit"
          disabled={tela.enviando}
          className="w-full rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-60"
        >
          {tela.enviando ? "Entrando…" : "Entrar"}
        </button>
        <p className="text-sm text-muted">Acesso só para a equipe responsável pela verificação dos pontos.</p>
      </form>
    );

  if (tela.tipo === "sem-permissao")
    return (
      <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-card p-6">
        <p className="font-semibold">Esta conta não tem permissão de administrador.</p>
        <button type="button" onClick={fazerLogout} className="rounded-full border border-border px-5 py-2">
          Sair
        </button>
      </div>
    );

  const atual = pontos.find((p) => p.id === selecionado) ?? null;
  const abas: { status: StatusPonto; rotulo: string; titulo: string }[] = [
    { status: "pendente", rotulo: "Pendentes", titulo: "Pontos pendentes" },
    { status: "aprovado", rotulo: "Publicados", titulo: "Pontos publicados" },
    { status: "rejeitado", rotulo: "Rejeitados", titulo: "Pontos rejeitados" },
  ];
  const abaAtual = abas.find((a) => a.status === aba) ?? abas[0];

  const secoes = [
    { id: "pontos", rotulo: "📍 Pontos de coleta" },
    { id: "dicas", rotulo: "🌱 Dicas" },
  ] as const;

  const menuSecoes = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <nav aria-label="Áreas do painel" className="flex flex-wrap gap-2">
        {secoes.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-current={secao === s.id ? "page" : undefined}
            onClick={() => {
              setSecao(s.id);
              setMensagem(null);
              setEditando(null);
            }}
            className={`rounded-xl border-2 px-4 py-2 font-bold ${
              secao === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
            }`}
          >
            {s.rotulo}
          </button>
        ))}
      </nav>
      <button type="button" onClick={fazerLogout} className="rounded-full border border-border px-5 py-2">
        Sair
      </button>
    </div>
  );

  if (secao === "dicas")
    return (
      <div className="space-y-5">
        {menuSecoes}
        <GerenciarDicas />
      </div>
    );

  return (
    <div className="space-y-5">
      {menuSecoes}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Situação dos pontos" className="inline-flex flex-wrap rounded-full border border-border bg-card p-1">
          {abas.map((a) => (
            <button
              key={a.status}
              type="button"
              role="tab"
              aria-selected={aba === a.status}
              onClick={() => trocarAba(a.status)}
              className={`rounded-full px-4 py-2 font-semibold ${aba === a.status ? "bg-primary text-primary-foreground" : ""}`}
            >
              {a.rotulo}
            </button>
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-bold">
        {abaAtual.titulo} ({pontos.length}
        {pontos.length === 100 ? "+" : ""})
      </h2>
      <div aria-live="polite">
        {mensagem && <p className="rounded-lg bg-secondary px-4 py-3">{mensagem}</p>}
      </div>
      {pontos.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-4 py-3">
          {aba === "pendente" ? "Nenhuma sugestão aguardando verificação. 🎉" : "Nenhum ponto nesta lista."}
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <ul aria-label={abaAtual.titulo} className="space-y-3">
            {pontos.map((p) => (
              <li key={p.id}>
                {editando === p.id ? (
                  <EditorPonto ponto={p} aoSalvar={(d) => salvarEdicao(p, d)} aoCancelar={() => setEditando(null)} />
                ) : (
                  <article
                    className={`rounded-[var(--radius-card)] border-2 bg-card p-4 ${p.id === selecionado ? "border-primary" : "border-border"}`}
                  >
                    <h3 className="text-lg font-bold">{p.nome}</h3>
                    <p className="text-muted">{p.endereco}</p>
                    <p className="mt-1 text-sm">
                      <span className="font-semibold">Materiais: </span>
                      {p.materiais.map((id) => buscarMaterialPorId(id)?.nome ?? id).join(", ")}
                    </p>
                    {p.horario && <p className="text-sm">Horário: {p.horario}</p>}
                    {p.telefone && <p className="text-sm">Telefone: {p.telefone}</p>}
                    <p className="text-sm text-muted">Enviado em {new Date(p.criado_em).toLocaleDateString("pt-BR")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelecionado(p.id)}
                        aria-pressed={p.id === selecionado}
                        className="rounded-full border border-border px-4 py-2"
                      >
                        Ver no mapa
                      </button>
                      {aba === "pendente" && (
                        <>
                          <button
                            type="button"
                            disabled={ocupado}
                            onClick={() => aplicar(p, "aprovado")}
                            aria-label={`Aprovar ${p.nome}`}
                            className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-60"
                          >
                            ✓ Aprovar
                          </button>
                          <button
                            type="button"
                            disabled={ocupado}
                            onClick={() => aplicar(p, "rejeitado")}
                            aria-label={`Rejeitar ${p.nome}`}
                            className="rounded-full border-2 border-danger px-4 py-2 font-bold text-danger disabled:opacity-60"
                          >
                            ✗ Rejeitar
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => {
                          setEditando(p.id);
                          setSelecionado(p.id);
                        }}
                        aria-label={`Editar ${p.nome}`}
                        className="rounded-full border border-border px-4 py-2 font-semibold"
                      >
                        ✎ Editar
                      </button>
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => excluir(p)}
                        aria-label={`Excluir ${p.nome}`}
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
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Mapa
              rotulo="Mapa do ponto selecionado"
              altura="24rem"
              foco={atual}
              marcadores={pontos.map((p) => ({ id: p.id, latitude: p.latitude, longitude: p.longitude, titulo: p.nome }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
