"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Mapa } from "@/components/Mapa";
import { decidir, ehAdministrador, entrar, listarPendentes, sair, sessaoAtual, type Decisao } from "@/lib/admin";
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
  const [pendentes, setPendentes] = useState<Ponto[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
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
      const lista = await listarPendentes();
      setPendentes(lista);
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
    const { erro } = await entrar(String(form.get("email") ?? ""), String(form.get("senha") ?? ""));
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
    setPendentes([]);
    setTela({ tipo: "login", erro: null, enviando: false });
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
    setPendentes((lista) => {
      const resto = lista.filter((p) => p.id !== ponto.id);
      setSelecionado(resto[0]?.id ?? null);
      return resto;
    });
  }

  if (tela.tipo === "indisponivel")
    return <p className="rounded-lg bg-danger-soft px-4 py-3">O banco de dados não está configurado neste ambiente.</p>;

  if (tela.tipo === "carregando") return <p>Carregando…</p>;

  if (tela.tipo === "login")
    return (
      <form onSubmit={fazerLogin} className="mx-auto max-w-md space-y-4 rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Entrar</h2>
        <div>
          <label htmlFor="email" className="mb-1 block font-semibold">
            E-mail
          </label>
          <input id="email" name="email" type="email" required autoComplete="username" className={campo} />
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

  const atual = pendentes.find((p) => p.id === selecionado) ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Pontos pendentes ({pendentes.length}{pendentes.length === 100 ? "+" : ""})</h2>
        <button type="button" onClick={fazerLogout} className="rounded-full border border-border px-5 py-2">
          Sair
        </button>
      </div>
      <div aria-live="polite">
        {mensagem && <p className="rounded-lg bg-secondary px-4 py-3">{mensagem}</p>}
      </div>
      {pendentes.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-4 py-3">Nenhuma sugestão aguardando verificação. 🎉</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <ul aria-label="Sugestões pendentes" className="space-y-3">
            {pendentes.map((p) => (
              <li key={p.id}>
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
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Mapa
              rotulo="Mapa do ponto selecionado"
              altura="24rem"
              foco={atual}
              marcadores={pendentes.map((p) => ({ id: p.id, latitude: p.latitude, longitude: p.longitude, titulo: p.nome }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
