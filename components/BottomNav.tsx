"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { estaAtivo, itensMenu } from "@/lib/navegacao";

/** Barra de navegação fixa no rodapé, exibida só no celular. */
export function BottomNav() {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Menu inferior"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-background md:hidden"
    >
      <ul className="grid grid-cols-5">
        {itensMenu.map((item) => {
          const ativo = estaAtivo(item.href, caminho);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                  ativo ? "font-bold text-primary" : "text-muted"
                }`}
              >
                <span aria-hidden className="text-xl">
                  {item.icone}
                </span>
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
