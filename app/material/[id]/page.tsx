import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OndeEntregar } from "@/components/OndeEntregar";
import { buscarCategoriaPorId, buscarMaterialPorId, formatarMesAno, materiais } from "@/lib/conteudo";

export const dynamicParams = false;

export function generateStaticParams() {
  return materiais.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/material/[id]">): Promise<Metadata> {
  const { id } = await params;
  const material = buscarMaterialPorId(id);
  return material
    ? { title: `${material.nome}: como descartar`, description: material.destino }
    : { title: "Material não encontrado" };
}

export default async function MaterialPage({ params }: PageProps<"/material/[id]">) {
  const { id } = await params;
  const material = buscarMaterialPorId(id);
  if (!material) notFound();
  const categoria = buscarCategoriaPorId(material.categoria);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/buscar" className="font-semibold text-primary">
        ← Voltar para a busca
      </Link>

      <header className="flex items-center gap-4">
        <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-3xl">
          {categoria?.icone}
        </span>
        <div>
          <p className="text-primary">{categoria?.nome}</p>
          <h1 className="text-4xl font-extrabold">{material.nome}</h1>
        </div>
      </header>

      {material.riscos.length > 0 && (
        <section
          aria-labelledby="riscos"
          className="rounded-[var(--radius-card)] border-2 border-warning-border bg-warning-soft p-5 text-warning-foreground"
        >
          <h2 id="riscos" className="text-xl font-bold">
            ⚠️ Riscos associados
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {material.riscos.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="cuidados" className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm">
        <h2 id="cuidados" className="text-xl font-bold">
          Cuidados antes de descartar
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          {material.cuidados.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <h2 className="mt-5 text-xl font-bold">Destino correto</h2>
        <p className="mt-1">{material.destino}</p>

        <div className="mt-5 border-t border-border pt-4 text-sm text-muted">
          <p>
            <span className="font-semibold text-foreground">Fonte: </span>
            <a href={material.fonte.url} target="_blank" rel="noreferrer" className="text-primary underline">
              {material.fonte.titulo}
            </a>
          </p>
          <p>
            Revisado em {formatarMesAno(material.revisado_em)}. Conteúdo em revisão pela orientação do projeto.
          </p>
        </div>
      </section>

      <OndeEntregar materialId={material.id} />
    </article>
  );
}
