"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BotaoTema } from "@/components/BotaoTema";
import { estaAtivo, itensMenu } from "@/lib/navegacao";

export function Header() {
  const caminho = usePathname();
  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Descarte Certo, página inicial">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground"
          >
            ♻
          </span>
          <span className="font-display text-lg font-bold leading-5 text-primary-deep">
            Descarte
            <br />
            Certo
          </span>
        </Link>
        <nav aria-label="Menu principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {[...itensMenu, { href: "/sobre", rotulo: "Sobre", icone: "ℹ️" }].map((item) => {
              const ativo = estaAtivo(item.href, caminho);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={ativo ? "page" : undefined}
                    className={`rounded-full px-3 py-2 text-base transition-colors ${
                      ativo ? "bg-primary font-bold text-primary-foreground" : "hover:bg-secondary"
                    }`}
                  >
                    {item.rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sobre" className="rounded-full border border-border px-3 py-2 text-sm lg:hidden">
            <span aria-hidden>ℹ️ </span>Sobre
          </Link>
          <BotaoTema />
        </div>
      </div>
    </header>
  );
}
