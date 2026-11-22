"use client";

import Link from "next/link";
import type { Map as MapaLeafletTipo } from "leaflet";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { Mapa } from "@/components/Mapa";
import { categorias, materiais } from "@/lib/conteudo";
import { buscarEndereco } from "@/lib/geocodificar";
import type { Coordenadas } from "@/lib/pontos";
import { obterSupabase, supabaseConfigurado } from "@/lib/supabase";
import { validarSugestao, type ErrosSugestao } from "@/lib/validacao";

type Envio = { situacao: "editando" } | { situacao: "enviando" } | { situacao: "enviado" } | { situacao: "falhou"; mensagem: string };

const campo = "w-full rounded-xl border border-border bg-background px-4 py-3";

function Erro({ id, texto }: { id: string; texto?: string }) {
  return texto ? (
    <p id={id} className="mt-1 text-sm font-semibold text-danger">
      {texto}
    </p>
  ) : null;
}

export function FormSugestao() {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [horario, setHorario] = useState("");
  const [telefone, setTelefone] = useState("");
  const [armadilha, setArmadilha] = useState(""); // honeypot: pessoas não veem este campo
  const [posicao, setPosicao] = useState<Coordenadas | null>(null);
  const [foco, setFoco] = useState<Coordenadas | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [erros, setErros] = useState<ErrosSugestao>({});
  const [envio, setEnvio] = useState<Envio>({ situacao: "editando" });
  const mapaRef = useRef<MapaLeafletTipo | null>(null);
  const guardarMapa = useCallback((m: MapaLeafletTipo) => {
    mapaRef.current = m;
  }, []);

  /** Alternativa pelo teclado: o mapa se move com as setas e o pino vai para o centro. */
  function marcarNoCentro() {
    const c = mapaRef.current?.getCenter();
    if (c) marcar({ latitude: c.lat, longitude: c.lng }, "Pino colocado no centro do mapa.");
  }

  function marcar(c: Coordenadas, mensagem: string | null = null) {
    setPosicao(c);
    setFoco(c);
    setAviso(mensagem);
    setErros((e) => ({ ...e, posicao: undefined }));
  }

  async function localizarEndereco() {
    if (endereco.trim().length < 5) {
      setErros((e) => ({ ...e, endereco: "Digite o endereço antes de localizar." }));
      return;
    }
    setLocalizando(true);
    setAviso(null);
    try {
      const c = await buscarEndereco(`${endereco}, Santa Catarina`);
      if (c) marcar(c, "Confira o pino. Se não estiver no lugar exato, arraste-o ou toque no local certo do mapa.");
      else setAviso("Não encontramos esse endereço. Toque no mapa para marcar o local.");
    } catch {
      setAviso("A busca de endereço está indisponível agora. Toque no mapa para marcar o local.");
    } finally {
      setLocalizando(false);
    }
  }

  function estouAqui() {
    if (!("geolocation" in navigator)) {
      setAviso("Seu navegador não permite usar a localização. Toque no mapa para marcar o local.");
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocalizando(false);
        marcar({ latitude: p.coords.latitude, longitude: p.coords.longitude }, "Pino colocado na sua posição atual. Ajuste se precisar.");
      },
      () => {
        setLocalizando(false);
        setAviso("Não foi possível usar sua localização. Toque no mapa para marcar o local.");
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  }

  function alternarMaterial(id: string) {
    setSelecionados((lista) => (lista.includes(id) ? lista.filter((m) => m !== id) : [...lista, id]));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (armadilha) {
      // Provavelmente um robô: finge sucesso e não grava nada.
      setEnvio({ situacao: "enviado" });
      return;
    }
    const resultado = validarSugestao({ nome, endereco, materiais: selecionados, horario, telefone, posicao });
    if (!resultado.ok) {
      setErros(resultado.erros);
      const primeiro = Object.keys(resultado.erros)[0];
      document.getElementById(`campo-${primeiro}`)?.focus();
      return;
    }
    if (!supabaseConfigurado()) {
      setEnvio({ situacao: "falhou", mensagem: "O banco de dados não está configurado neste ambiente." });
      return;
    }
    setEnvio({ situacao: "enviando" });
    // Sem .select(): o público não pode ler pontos pendentes (RLS).
    const { error } = await obterSupabase().from("pontos_coleta").insert(resultado.valor);
    setEnvio(
      error
        ? { situacao: "falhou", mensagem: "Não foi possível enviar agora. Confira os dados e tente de novo." }
        : { situacao: "enviado" },
    );
  }

  if (envio.situacao === "enviado") {
    return (
      <div role="status" className="rounded-[var(--radius-card)] bg-secondary p-8 text-center">
        <p aria-hidden className="text-5xl">
          🌱
        </p>
        <h2 className="mt-2 text-2xl font-bold">Obrigado! Seu ponto será verificado.</h2>
        <p className="mt-2">A equipe confere as informações antes de publicar. Isso evita indicar locais errados.</p>
        <Link href="/pontos" className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
          Voltar aos pontos de coleta
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="campo-nome" className="mb-1 block font-semibold">
            Nome do local *
          </label>
          <input
            id="campo-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={120}
            placeholder="Ex.: Farmácia Central"
            aria-invalid={Boolean(erros.nome)}
            aria-describedby="erro-nome"
            className={campo}
          />
          <Erro id="erro-nome" texto={erros.nome} />
        </div>
        <div>
          <label htmlFor="campo-telefone" className="mb-1 block font-semibold">
            Telefone do local (opcional)
          </label>
          <input
            id="campo-telefone"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            maxLength={20}
            placeholder="(48) 3333-4444"
            aria-invalid={Boolean(erros.telefone)}
            aria-describedby="erro-telefone"
            className={campo}
          />
          <Erro id="erro-telefone" texto={erros.telefone} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="campo-horario" className="mb-1 block font-semibold">
            Horário de funcionamento (opcional)
          </label>
          <input
            id="campo-horario"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            maxLength={200}
            placeholder="Ex.: Seg. a sex.: 8h–18h"
            className={campo}
          />
          <Erro id="erro-horario" texto={erros.horario} />
        </div>
      </div>

      <fieldset aria-describedby="erro-materiais">
        <legend id="campo-materiais" tabIndex={-1} className="mb-2 font-semibold">
          Materiais que o local recebe *
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
                      onChange={() => alternarMaterial(m.id)}
                      className="h-5 w-5 accent-[var(--primary)]"
                    />
                    {m.nome}
                  </label>
                ))}
            </div>
          ))}
        </div>
        <Erro id="erro-materiais" texto={erros.materiais} />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-semibold">Onde fica *</legend>
        <div>
          <label htmlFor="campo-endereco" className="mb-1 block">
            Endereço
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="campo-endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              maxLength={200}
              placeholder="Rua, número – bairro, cidade"
              aria-invalid={Boolean(erros.endereco)}
              aria-describedby="erro-endereco"
              className={campo}
            />
            <button
              type="button"
              onClick={localizarEndereco}
              disabled={localizando}
              className="shrink-0 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60"
            >
              {localizando ? "Localizando…" : "🔎 Localizar no mapa"}
            </button>
            <button
              type="button"
              onClick={estouAqui}
              disabled={localizando}
              className="shrink-0 rounded-full border-2 border-primary px-5 py-3 font-bold text-primary disabled:opacity-60"
            >
              📍 Estou aqui
            </button>
          </div>
          <Erro id="erro-endereco" texto={erros.endereco} />
        </div>

        <p className="text-sm text-muted">
          Também dá para tocar no mapa para marcar o local e arrastar o pino vermelho. Pelo teclado: selecione o mapa,
          mova com as setas e use “Marcar no centro do mapa”. A posição marcada será publicada junto com o ponto.
        </p>
        <div aria-live="polite">
          {aviso && <p className="rounded-lg bg-warning-soft px-4 py-2 text-warning-foreground">{aviso}</p>}
          {posicao && (
            <p className="mt-1 text-sm">
              Local marcado: {posicao.latitude.toFixed(5)}, {posicao.longitude.toFixed(5)}
            </p>
          )}
        </div>
        <div id="campo-posicao" tabIndex={-1}>
          <Mapa
            rotulo="Mapa para marcar o local do ponto"
            altura="22rem"
            foco={foco}
            aoPronto={guardarMapa}
            pino={{ posicao, aoMudar: (c) => marcar(c) }}
          />
        </div>
        <button type="button" onClick={marcarNoCentro} className="rounded-full border border-border px-5 py-2 font-semibold">
          ⌖ Marcar no centro do mapa
        </button>
        <Erro id="erro-posicao" texto={erros.posicao} />
      </fieldset>

      {/* Campo invisível contra robôs de spam (honeypot). */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="site">Não preencha este campo</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} />
      </div>

      {envio.situacao === "falhou" && (
        <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3">
          {envio.mensagem}
        </p>
      )}

      <p className="text-sm text-muted">
        Não pedimos seus dados pessoais. O ponto só aparece no site depois de verificado pela equipe.
      </p>
      <button
        type="submit"
        disabled={envio.situacao === "enviando"}
        className="w-full rounded-full bg-primary px-6 py-4 text-lg font-bold text-primary-foreground disabled:opacity-60 sm:w-auto"
      >
        {envio.situacao === "enviando" ? "Enviando…" : "Enviar sugestão"}
      </button>
    </form>
  );
}
