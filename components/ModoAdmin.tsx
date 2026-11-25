"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ehAdministrador, sair } from "@/lib/admin";
import { obterSupabase, supabaseConfigurado } from "@/lib/supabase";

/**
 * Modo administrador em todo o site.
 * A sessão do Supabase fica salva no navegador: o administrador continua no
 * modo admin ao navegar pelo site até clicar em "Sair do perfil de administrador".
 * Isto é só interface; quem protege os dados são as regras RLS do banco.
 */
export type EstadoAdmin = "verificando" | "admin" | "fora";

type Contexto = { estado: EstadoAdmin; sairDoAdmin: () => Promise<void>; reverificar: () => void };

const ContextoAdmin = createContext<Contexto>({
  estado: "fora",
  sairDoAdmin: async () => {},
  reverificar: () => {},
});

export function useModoAdmin(): Contexto {
  return useContext(ContextoAdmin);
}

export function ProvedorAdmin({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAdmin>(() => (supabaseConfigurado() ? "verificando" : "fora"));

  const verificar = useCallback(async () => {
    try {
      const { data } = await obterSupabase().auth.getSession();
      const sessao = data.session;
      if (!sessao) return setEstado("fora");
      setEstado((await ehAdministrador(sessao.user.id)) ? "admin" : "fora");
    } catch {
      setEstado("fora");
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado()) return;
    // Primeira verificação fora do corpo do efeito (evita render em cascata).
    const inicio = setTimeout(verificar, 0);
    const { data } = obterSupabase().auth.onAuthStateChange((evento) => {
      // Adiado com setTimeout: chamar o Supabase dentro deste callback pode travar a sessão.
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") setTimeout(verificar, 0);
    });
    return () => {
      clearTimeout(inicio);
      data.subscription.unsubscribe();
    };
  }, [verificar]);

  const sairDoAdmin = useCallback(async () => {
    await sair();
    setEstado("fora");
  }, []);

  return (
    <ContextoAdmin.Provider value={{ estado, sairDoAdmin, reverificar: () => void verificar() }}>
      {children}
    </ContextoAdmin.Provider>
  );
}

/** Faixa fixa no topo, visível em todas as páginas enquanto o administrador estiver logado. */
export function BarraAdmin() {
  const { estado, sairDoAdmin } = useModoAdmin();
  const caminho = usePathname();
  const [saindo, setSaindo] = useState(false);
  if (estado !== "admin") return null;

  return (
    <div role="region" aria-label="Modo administrador" className="bg-primary-deep text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
        <p className="font-bold">
          <span aria-hidden>🔒 </span>Você está no perfil de administrador
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {caminho !== "/admin" && (
            <Link href="/admin" className="rounded-full border border-current px-3 py-1 font-semibold">
              Painel do administrador
            </Link>
          )}
          <button
            type="button"
            disabled={saindo}
            onClick={async () => {
              setSaindo(true);
              await sairDoAdmin();
              setSaindo(false);
            }}
            className="rounded-full bg-background px-3 py-1 font-bold text-foreground disabled:opacity-60"
          >
            {saindo ? "Saindo…" : "Sair do perfil de administrador"}
          </button>
        </div>
      </div>
    </div>
  );
}
