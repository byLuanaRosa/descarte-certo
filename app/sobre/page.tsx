import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { creditosImagens } from "@/lib/conteudo";

export const metadata: Metadata = { title: "Sobre o Descarte Certo" };

const objetivos = [
  { titulo: "Informar", texto: "Disponibilizar orientações específicas e seguras para o descarte de cada material." },
  { titulo: "Facilitar", texto: "Divulgar locais que realmente recebem cada resíduo." },
  { titulo: "Conscientizar", texto: "Promover a redução e a prevenção de acidentes relacionados ao descarte incorreto de resíduos." },
];

const ods = [
  { numero: 12, nome: "Consumo e Produção Responsáveis", principal: true },
  { numero: 3, nome: "Saúde e Bem-Estar", principal: false },
  { numero: 4, nome: "Educação de Qualidade", principal: false },
  { numero: 11, nome: "Cidades e Comunidades Sustentáveis", principal: false },
];

const fontes = [
  { nome: "Comcap – Prefeitura de Florianópolis (ecopontos e coleta seletiva)", url: "https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php" },
  { nome: "Green Eletron – pilhas, baterias e eletroeletrônicos", url: "https://greeneletron.org.br/perguntas-frequentes/" },
  { nome: "Reciclus – lâmpadas", url: "https://reciclus.org.br/" },
  { nome: "Decreto nº 10.388/2020 – medicamentos", url: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/decreto/d10388.htm" },
  { nome: "OpenStreetMap – mapas e busca de endereços", url: "https://www.openstreetmap.org/copyright" },
];

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold text-primary-deep">Sobre o Descarte Certo</h1>
        <p className="mt-2 text-lg text-muted">O descarte de hoje define o futuro de amanhã.</p>
      </header>

      <section aria-labelledby="objetivos">
        <h2 id="objetivos" className="mb-3 text-2xl font-bold">
          Objetivos do projeto
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {objetivos.map((p) => (
            <li key={p.titulo} className="rounded-[var(--radius-card)] bg-secondary p-5">
              <h3 className="text-xl font-bold">{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="equipe" className="space-y-2">
        <h2 id="equipe" className="text-2xl font-bold">
          Equipe e origem acadêmica
        </h2>
        <p>
          Projeto desenvolvido em 2026 na disciplina de Engenharia e Sustentabilidade do Bacharelado em Engenharia
          Eletrônica do Instituto Federal de Santa Catarina (IFSC), Câmpus Florianópolis, como atividade de extensão.
        </p>
        <ul className="list-disc pl-6">
          <li>Integrantes: Luana Rosa e Jedson Torquato</li>
          <li>
            Orientação: Julio Feller Golin (Departamento Acadêmico de Eletrônica) e Maurilia de Almeida Bastos
            (Departamento Acadêmico de Construção Civil)
          </li>
        </ul>
        <p className="rounded-lg bg-warning-soft px-4 py-3 text-warning-foreground">
          Projeto acadêmico, sem fins lucrativos. Não é um serviço oficial do IFSC nem da Prefeitura. As informações
          seguem fontes oficiais, mas podem mudar: confirme horários e materiais aceitos com o ponto de coleta antes de
          ir.
        </p>
      </section>

      <section aria-labelledby="ods">
        <h2 id="ods" className="mb-3 text-2xl font-bold">
          Objetivos de Desenvolvimento Sustentável (ODS) relacionados ao projeto
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ods.map((o) => (
            <li key={o.numero} className="flex flex-col items-center gap-2 text-center">
              <Image
                src={`/ods/ods-${o.numero}.png`}
                alt={`ODS ${o.numero}: ${o.nome}`}
                width={200}
                height={200}
                className="w-full max-w-[200px] rounded-lg shadow-sm"
              />
              {o.principal && <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold">Principal</span>}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">
          Ícones oficiais dos ODS da ONU, obtidos na galeria do Governo do Paraná (sgdes.pr.gov.br).
        </p>
      </section>

      <section aria-labelledby="fontes">
        <h2 id="fontes" className="mb-3 text-2xl font-bold">
          Fontes
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          {fontes.map((f) => (
            <li key={f.url}>
              <a href={f.url} target="_blank" rel="noreferrer" className="text-primary underline">
                {f.nome}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="creditos">
        <details>
          <summary id="creditos" className="cursor-pointer text-xl font-bold">
            Créditos das imagens do Descarte Certo Kids
          </summary>
          <p className="mt-2 text-sm text-muted">
            Ilustrações 2D de domínio público ou CC0 (sem direitos autorais), encontradas pelo Openverse (rawpixel), e duas desenhadas pela própria equipe.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
            {creditosImagens.map((c) => (
              <li key={c.arquivo}>
                {c.pagina ? (
                  <a href={c.pagina} target="_blank" rel="noreferrer" className="text-primary underline">
                    {c.titulo}
                  </a>
                ) : (
                  c.titulo
                )}
                {c.autor ? ` – ${c.autor}` : ""} ({c.licenca}, {c.fonte})
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section aria-labelledby="privacidade" className="space-y-2">
        <h2 id="privacidade" className="text-2xl font-bold">
          Privacidade
        </h2>
        <p>
          Você usa o site sem cadastro. Sua localização é opcional, usada só no seu aparelho para ordenar os pontos e
          nunca é salva. Ao sugerir um ponto, não pedimos seus dados pessoais. Para encontrar um endereço no mapa, o
          texto digitado é enviado ao serviço Nominatim, do OpenStreetMap.
        </p>
        <p>
          Encontrou um erro?{" "}
          <Link href="/pontos/sugerir" className="font-semibold text-primary underline">
            Sugira um ponto
          </Link>{" "}
          ou fale com a equipe do projeto no IFSC.
        </p>
      </section>
    </div>
  );
}
