import type { Metadata } from "next";
import { ListaDicas } from "@/components/ListaDicas";

export const metadata: Metadata = { title: "Dicas ambientais" };

export default async function DicasPage({ searchParams }: PageProps<"/dicas">) {
  const { tema } = await searchParams;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-extrabold text-primary-deep">Dicas ambientais</h1>
        <p className="mt-2 text-muted">Escolhas conscientes para o dia a dia, com a fonte de cada informação.</p>
      </header>
      <ListaDicas tema={typeof tema === "string" ? tema : ""} />
    </div>
  );
}
