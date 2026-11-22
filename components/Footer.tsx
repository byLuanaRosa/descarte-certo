import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-secondary/40 pb-28 lg:pb-8">
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-sm text-muted">
        <p className="font-semibold text-foreground">O descarte de hoje define o futuro de amanhã.</p>
        <p>
          Projeto acadêmico do Bacharelado em Engenharia Eletrônica, IFSC Câmpus Florianópolis, 2026. Não é um
          serviço oficial do IFSC. Confirme horários e materiais aceitos com o ponto de coleta antes de ir.{" "}
          <Link href="/sobre" className="font-semibold text-primary underline">
            Saiba mais
          </Link>
        </p>
        <p>
          <Link href="/admin" className="text-primary underline">
            Administração
          </Link>
        </p>
      </div>
    </footer>
  );
}
