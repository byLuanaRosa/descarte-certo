# Projeto Descarte Certo - IFSC
## Sobre o Projeto
O **Descarte Certo** é uma aplicação web que orienta a população da Grande Florianópolis sobre **como** e **onde** descartar corretamente cada tipo de resíduo, como pilhas, lâmpadas, eletrônicos, medicamentos e óleo de cozinha.

O MVP permite:
- buscar como descartar um material;
- encontrar pontos de coleta próximos, em lista e mapa;
- ler dicas para reduzir o lixo;
- sugerir novos pontos de coleta, que são verificados antes de publicados;
- responder ao quiz educativo da área Kids.

**ODS relacionados:** 12 (Consumo e Produção Responsáveis), 3, 4 e 11.

**Equipe:** Luana Rosa e Jedson Torquato.
**Orientação:** [nome do professor] (Atividade de Extensão – Eletrônica) e [nome da professora] (Engenharia e Sustentabilidade).
**Instituição:** IFSC Câmpus Florianópolis, Engenharia Eletrônica, 2026. Projeto acadêmico, sem fins lucrativos.

**Tecnologias:** Next.js, Tailwind CSS, Vercel, Supabase e Leaflet/OpenStreetMap.

> As orientações sobre resíduos citam fontes oficiais e são revisadas pela orientadora de sustentabilidade. Confirme horários e materiais aceitos com o ponto de coleta antes de ir.

## Referências
- [Documentações de Análise](./docs/analise/): [requisitos](./docs/analise/requisitos.md), [casos de uso](./docs/analise/casos-de-uso.md) e [design](./docs/analise/design.md)
- [Documentações de Projeto e Arquitetura](./docs/projeto/): [diagramas](./docs/projeto/diagramas.md)
- [Mockup](./mockup/README.md): protótipo no Lovable, em <https://descarte-certo-ifsc.lovable.app/>

## Como Rodar
Requisitos: Node.js 20 ou superior.

1. Instale as dependências:
```bash
npm install
```
2. Crie o arquivo `.env.local` com as chaves do projeto no Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
   Use só a chave pública (anon). A chave `service_role` nunca deve ir para o código nem para a Vercel.
3. Rode em modo de desenvolvimento e acesse <http://localhost:3000>:
```bash
npm run dev
```

**Deploy:** a Vercel publica automaticamente a cada `git push` na branch `main`. As mesmas variáveis do `.env.local` devem ser cadastradas no painel da Vercel.
