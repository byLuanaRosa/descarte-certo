"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CardPonto } from "@/components/CardPonto";
import { usePontos } from "@/components/usePontos";
import { materiais } from "@/lib/conteudo";
import { filtrarEOrdenar, type Coordenadas } from "@/lib/pontos";

type Localizacao =
  | { situacao: "inativa" }
  | { situacao: "buscando" }
  | { situacao: "ok"; coordenadas: Coordenadas }
  | { situacao: "negada"; mensagem: string };

export function ExplorarPontos({ materialInicial }: { materialInicial: string }) {
  const estado = usePontos();
  const [material, setMaterial] = useState(materialInicial);
  const [local, setLocal] = useState<Localizacao>({ situacao: "inativa" });

  const origem = local.situacao === "ok" ? local.coordenadas : null;
  const lista = useMemo(
    () => (estado.situacao === "pronto" ? filtrarEOrdenar(estado.pontos, material, origem) : []),
    [estado, material, origem],
  );

  function usarMinhaLocalizacao() {
    if (!("geolocation" in navigator)) {
      setLocal({ situacao: "negada", mensagem: "Seu navegador não permite usar a localização." });
      return;
    }
    setLocal({ situacao: "buscando" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocal({ situacao: "ok", coordenadas: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } }),
      () =>
        setLocal({
          situacao: "negada",
          mensagem: "Não foi possível usar sua localização. Mostrando todos os pontos.",
        }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="material" className="mb-1 block font-semibold">
            Material
          </label>
          <select
            id="material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3"
          >
            <option value="">Todos os materiais</option>
            {materiais.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={usarMinhaLocalizacao}
          disabled={local.situacao === "buscando"}
          className="rounded-full border-2 border-primary px-5 py-3 font-bold text-primary disabled:opacity-60"
        >
          {local.situacao === "buscando" ? "Localizando…" : local.situacao === "ok" ? "📍 Usando sua localização" : "📍 Usar minha localização"}
        </button>
      </div>

      <p className="text-sm text-muted">
        Sua localização é opcional, usada só neste aparelho para ordenar a lista, e não é salva.
      </p>

      <div aria-live="polite" className="space-y-4">
        {local.situacao === "negada" && (
          <p className="rounded-lg bg-warning-soft px-4 py-3 text-warning-foreground">{local.mensagem}</p>
        )}

        {estado.situacao === "carregando" && <p>Carregando pontos de coleta…</p>}
        {estado.situacao === "erro" && (
          <p className="rounded-lg bg-danger-soft px-4 py-3">{estado.mensagem}</p>
        )}
        {estado.situacao === "pronto" && (
          <>
            <p className="font-semibold">
              {lista.length} ponto(s) encontrado(s){origem ? ", do mais perto ao mais longe" : ""}.
            </p>
            {lista.length === 0 && (
              <p className="rounded-lg border border-border bg-card px-4 py-3">
                Ainda não temos ponto cadastrado para este material. Veja na ficha do material qual é o destino
                correto ou{" "}
                <Link href="/pontos/sugerir" className="font-semibold text-primary underline">
                  sugira um ponto
                </Link>
                .
              </p>
            )}
            <ul className="grid gap-4 md:grid-cols-2">
              {lista.map((p) => (
                <li key={p.id}>
                  <CardPonto ponto={p} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
