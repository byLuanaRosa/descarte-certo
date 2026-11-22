import type { Metadata } from "next";
import Link from "next/link";
import { FormSugestao } from "@/components/FormSugestao";

export const metadata: Metadata = {
  title: "Sugerir ponto de coleta",
  description: "Indique um local que recebe resíduos. A equipe verifica antes de publicar.",
};

export default function SugerirPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/pontos" className="font-semibold text-primary">
        ← Voltar aos pontos de coleta
      </Link>
      <header>
        <h1 className="text-4xl font-extrabold text-primary-deep">Sugerir ponto de coleta</h1>
        <p className="mt-2 text-muted">
          Conhece um local que recebe pilhas, óleo, remédios ou outros resíduos? Conte para a gente. Os campos com *
          são obrigatórios.
        </p>
      </header>
      <FormSugestao />
    </div>
  );
}
