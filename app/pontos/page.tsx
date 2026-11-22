import type { Metadata } from "next";
import Link from "next/link";
import { ExplorarPontos } from "@/components/ExplorarPontos";
import { buscarMaterialPorId } from "@/lib/conteudo";

export const metadata: Metadata = { title: "Pontos de coleta" };

export default async function PontosPage({ searchParams }: PageProps<"/pontos">) {
  const { material } = await searchParams;
  const materialInicial = typeof material === "string" && buscarMaterialPorId(material) ? material : "";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary-deep">Pontos de coleta</h1>
          <p className="mt-2 text-muted">Locais verificados na Grande Florianópolis.</p>
        </div>
        <Link href="/pontos/sugerir" className="rounded-full border border-border bg-card px-5 py-3 font-semibold">
          ➕ Sugerir ponto
        </Link>
      </header>
      <ExplorarPontos materialInicial={materialInicial} />
    </div>
  );
}
