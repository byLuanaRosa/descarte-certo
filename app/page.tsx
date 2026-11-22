import Link from "next/link";
import { CampoBusca } from "@/components/CampoBusca";
import { GradeCategorias } from "@/components/GradeCategorias";

const atalhos = [
  { href: "/buscar", titulo: "Buscar material", icone: "🔎", destaque: false },
  { href: "/pontos", titulo: "Pontos de coleta", icone: "📍", destaque: true },
  { href: "/dicas", titulo: "Dicas ambientais", icone: "🌱", destaque: false },
  { href: "/kids", titulo: "Descarte Certo Kids", icone: "🙂", destaque: false },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="-mx-4 rounded-b-3xl bg-gradient-to-b from-secondary to-background px-4 pb-10 pt-6">
        <p className="font-semibold text-primary">Olá! Boas-vindas ao</p>
        <h1 className="text-5xl font-extrabold text-primary-deep sm:text-6xl">Descarte Certo</h1>
        <p className="mb-6 mt-3 max-w-xl text-lg text-muted">
          Digite abaixo o nome do material que deseja descartar para receber a orientação de descarte.
        </p>
        <CampoBusca />
      </section>

      <section aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" className="mb-4 text-2xl font-bold">
          Categorias
        </h2>
        <GradeCategorias />
      </section>

      <section aria-label="Atalhos">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {atalhos.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className={`flex items-center justify-between gap-3 rounded-[var(--radius-card)] border p-5 text-lg font-bold shadow-sm ${
                  a.destaque
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                <span>
                  <span aria-hidden className="mr-3">
                    {a.icone}
                  </span>
                  {a.titulo}
                </span>
                <span aria-hidden>›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--radius-card)] bg-secondary p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-primary-deep">Pequenas atitudes</p>
        <h2 className="text-2xl font-bold text-primary-deep">Segurança antes da localização</h2>
        <p className="mt-2 max-w-2xl">
          Primeiro identifique o material e sua condição. Só depois procure onde entregar: um local que recebe
          medicamentos, por exemplo, não necessariamente recebe agulhas.
        </p>
      </section>
    </div>
  );
}
