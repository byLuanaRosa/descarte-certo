"use client";

import { useSyncExternalStore } from "react";
import { aplicarTema, assinarTema, temaAtual, type Tema } from "@/lib/tema";

/** Botão do canto superior direito que alterna entre modo claro e escuro (RNF04). */
export function BotaoTema() {
  const tema = useSyncExternalStore<Tema>(assinarTema, temaAtual, () => "claro");
  const escuro = tema === "escuro";
  return (
    <button
      type="button"
      onClick={() => aplicarTema(escuro ? "claro" : "escuro")}
      aria-pressed={escuro}
      aria-label="Modo escuro"
      title={escuro ? "Mudar para o modo claro" : "Mudar para o modo escuro"}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xl shadow-sm hover:border-primary"
    >
      <span aria-hidden>{escuro ? "☀️" : "🌙"}</span>
    </button>
  );
}
