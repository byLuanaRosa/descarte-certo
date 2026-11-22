import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <section className="mx-auto max-w-xl space-y-4 py-10 text-center">
      <p aria-hidden className="text-6xl">
        🔎
      </p>
      <h1 className="text-3xl font-extrabold text-primary-deep">Página não encontrada</h1>
      <p className="text-muted">O endereço pode estar errado ou a página mudou de lugar.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground">
          Ir para o início
        </Link>
        <Link href="/buscar" className="rounded-full border border-border px-5 py-3 font-semibold">
          Buscar material
        </Link>
      </div>
    </section>
  );
}
