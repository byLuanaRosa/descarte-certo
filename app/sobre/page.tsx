import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sobre o Descarte Certo" };

export default function SobrePage() {
  return (
    <section>
      <h1 className="text-3xl font-extrabold text-primary-deep">Sobre o Descarte Certo</h1>
      <p className="mt-2 text-muted">Em construção.</p>
    </section>
  );
}
