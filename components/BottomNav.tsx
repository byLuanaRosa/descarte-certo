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
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-background lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {itensMenu.map((item) => {
          const ativo = estaAtivo(item.href, caminho);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex h-full flex-col items-center gap-0.5 px-1 py-2 text-center text-xs leading-tight ${
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
