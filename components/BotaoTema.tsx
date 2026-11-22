"use client";

import { useSyncExternalStore } from "react";
import { aplicarTema, assinarTema, temaAtual, type Tema } from "@/lib/tema";

/** Switch do canto superior direito que alterna entre modo claro e escuro (RNF04). */
export function BotaoTema() {
  const tema = useSyncExternalStore<Tema>(assinarTema, temaAtual, () => "claro");
  const escuro = tema === "escuro";
  return (
    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold">
      <span className="hidden sm:inline">Modo escuro</span>
      <button
        type="button"
        role="switch"
        aria-checked={escuro}
        aria-label="Modo escuro"
        onClick={() => aplicarTema(escuro ? "claro" : "escuro")}
        className={`relative inline-flex h-7 w-12 items-center rounded-full border-2 transition-colors ${
          escuro ? "border-primary bg-primary" : "border-muted bg-muted"
        }`}
      >
        <span
          aria-hidden
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            escuro ? "translate-x-[22px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </label>
  );
}
