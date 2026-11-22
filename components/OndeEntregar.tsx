import Link from "next/link";

export function OndeEntregar({ materialId }: { materialId: string }) {
  return (
    <section aria-labelledby="onde-entregar" className="space-y-3">
      <h2 id="onde-entregar" className="text-2xl font-bold">
        Onde entregar na Grande Florianópolis
      </h2>
      <Link
        href={`/pontos?material=${materialId}`}
        className="inline-block rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground"
      >
        📍 Ver pontos de coleta
      </Link>
    </section>
  );
}
