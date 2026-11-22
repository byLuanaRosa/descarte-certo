import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dicas ambientais" };

export default function DicasPage() {
  return (
    <section>
      <h1 className="text-3xl font-extrabold text-primary-deep">Dicas ambientais</h1>
      <p className="mt-2 text-muted">Em construção.</p>
    </section>
  );
}
