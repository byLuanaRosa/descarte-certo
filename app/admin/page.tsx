import type { Metadata } from "next";
import { PainelAdmin } from "@/components/PainelAdmin";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-extrabold text-primary-deep">Administração</h1>
        <p className="mt-2 text-muted">Verificação dos pontos de coleta e gestão das dicas ambientais.</p>
      </header>
      <PainelAdmin />
    </div>
  );
}
