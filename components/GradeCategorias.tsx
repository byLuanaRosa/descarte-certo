import Link from "next/link";
import { categorias } from "@/lib/conteudo";

export function GradeCategorias() {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
      {categorias.map((c) => (
        <li key={c.id}>
          <Link
            href={`/buscar?categoria=${c.id}`}
            className="flex h-full flex-col items-center gap-2 rounded-[var(--radius-card)] border border-border bg-card p-3 text-center text-sm shadow-sm hover:border-primary"
          >
            <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-2xl">
              {c.icone}
            </span>
            {c.nome}
          </Link>
        </li>
      ))}
    </ul>
  );
}
