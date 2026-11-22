import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pontos de coleta" };

export default function PontosPage() {
  return (
    <section>
      <h1 className="text-3xl font-extrabold text-primary-deep">Pontos de coleta</h1>
      <p className="mt-2 text-muted">Em construção.</p>
    </section>
  );
}
