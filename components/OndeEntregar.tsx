"use client";

import Link from "next/link";
import { CardPonto } from "@/components/CardPonto";
import { usePontos } from "@/components/usePontos";
import { filtrarEOrdenar } from "@/lib/pontos";

/** Seção "Onde entregar" da ficha do material: pontos aprovados que recebem o material. */
export function OndeEntregar({ materialId }: { materialId: string }) {
  const estado = usePontos();
  const pontos = estado.situacao === "pronto" ? filtrarEOrdenar(estado.pontos, materialId, null) : [];

  return (
    <section aria-labelledby="onde-entregar" className="space-y-3">
      <h2 id="onde-entregar" className="text-2xl font-bold">
        Onde entregar na Grande Florianópolis
      </h2>
      <div aria-live="polite">
        {estado.situacao === "carregando" && <p>Carregando pontos de coleta…</p>}
        {estado.situacao === "erro" && <p className="rounded-lg bg-danger-soft px-4 py-3">{estado.mensagem}</p>}
        {estado.situacao === "pronto" && pontos.length === 0 && (
          <p className="rounded-lg border border-border bg-card px-4 py-3">
            Ainda não temos ponto cadastrado que receba este material. Siga o destino indicado acima.
          </p>
        )}
      </div>
      {pontos.length > 0 && (
        <ul className="grid gap-4">
          {pontos.slice(0, 3).map((p) => (
            <li key={p.id}>
              <CardPonto ponto={p} />
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`/pontos?material=${materialId}`}
        className="inline-block rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground"
      >
        📍 Ver todos os pontos e o mais perto de você
      </Link>
    </section>
  );
}
