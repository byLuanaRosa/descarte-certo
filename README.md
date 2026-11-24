# Projeto Descarte Certo - IFSC
**Site:** <https://descarte-certo-ifsc.vercel.app>

## Sobre o Projeto
O **Descarte Certo** é uma aplicação web que orienta a população da Grande Florianópolis sobre **como** e **onde** descartar corretamente cada tipo de resíduo, como pilhas, lâmpadas, eletrônicos, medicamentos e óleo de cozinha.

O MVP permite:
- buscar como descartar um material (19 materiais em 9 categorias, com fonte oficial);
- encontrar pontos de coleta próximos, em lista e mapa;
- ler dicas para reduzir o lixo;
- sugerir novos pontos de coleta, que são verificados antes de publicados;
- responder ao quiz educativo da área Kids.

**ODS relacionados:** 12 (Consumo e Produção Responsáveis), 3, 4 e 11.

**Equipe:** Luana Rosa e Jedson Torquato.
**Orientação:** Julio Feller Golin (Departamento Acadêmico de Eletrônica),  Maurilia de Almeida Bastos (Departamento Acadêmico de Construção Civil).
**Instituição:** IFSC Câmpus Florianópolis, Engenharia Eletrônica, 2026. Projeto acadêmico, sem fins lucrativos.

**Tecnologias:** Next.js 16, TypeScript, Tailwind CSS v4, Supabase, Leaflet/OpenStreetMap, Vercel, Vitest, Playwright e GitHub Actions.

> As orientações sobre resíduos citam fontes oficiais e devem ser revisadas pela orientadora de sustentabilidade. Confirme horários e materiais aceitos com o ponto de coleta antes de ir.

## Referências
- [Documentações de Análise](./docs/analise/): [requisitos](./docs/analise/requisitos.md), [casos de uso](./docs/analise/casos-de-uso.md) e [design](./docs/analise/design.md)
- [Documentações de Projeto e Arquitetura](./docs/projeto/): [diagramas](./docs/projeto/diagramas.md) e [planejamento em fases](./docs/projeto/planejamento.md)
- [Mockup](./mockup/README.md): protótipo no Lovable, em <https://descarte-certo-ifsc.lovable.app/>

### Estrutura do código
```
app/              páginas (Next.js App Router)
components/       componentes de tela (mapa, quiz, formulário, admin…)
data/             conteúdo fixo em JSON (materiais, categorias, dicas, quiz)
lib/              regras do sistema (busca, distância, validação, Supabase…)
supabase/         schema.sql, seed.sql e teste das regras de admin
tests/            testes unitários (Vitest) e tests/seguranca (RLS no banco real)
e2e/              testes de ponta a ponta e de acessibilidade (Playwright + axe)
.github/workflows CI (GitHub Actions)
```

## Como Rodar
Requisitos: Node.js 20.9 ou superior.

1. Instale as dependências:
```bash
npm install
```
2. Copie `.env.example` para `.env.local` e preencha com os dados do Supabase (Project Settings → API):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```
   Use só a chave pública (anon/publishable). A chave `service_role` nunca deve ir para o código nem para a Vercel.
3. Rode em modo de desenvolvimento e acesse <http://localhost:3000>:
```bash
npm run dev
```

### Testes
| Comando | O que faz |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação de tipos do TypeScript |
| `npm test` | Testes unitários (Vitest) |
| `npm run build` | Build de produção |
| `npm run test:e2e` | Testes de ponta a ponta e de acessibilidade, no desktop e no celular (Playwright; rode o build antes). Na primeira vez: `npx playwright install chromium` |
| `npm run test:seguranca` | Testa as regras RLS no Supabase real com a chave pública, sem gravar nada |

A CI (`.github/workflows/ci.yml`) roda todos eles a cada push na `main` e em cada Pull Request.

## Banco de dados (Supabase)
O projeto já está criado na conta da Luana (`descarte-certo`, região São Paulo), com a tabela, as regras de segurança e 45 pontos de coleta verificados na Grande Florianópolis. Para recriar em outro projeto, rode no SQL Editor `supabase/schema.sql` e depois `supabase/seed.sql`.

**Criar o administrador:** o login do site usa **nome de usuário e senha**. Por baixo, o nome de usuário vira um e-mail interno `usuario@admin.descarte-certo.app` no Supabase Auth (ex.: usuário `teste` → `teste@admin.descarte-certo.app`).
1. No painel do Supabase: Authentication → Users → Add user → Create new user. Em e-mail, use `nome-de-usuario@admin.descarte-certo.app`; defina a senha (mínimo 6 caracteres) e marque **Auto Confirm User**.
2. No SQL Editor, rode (trocando o nome de usuário):
```sql
insert into public.administradores (user_id)
  select id from auth.users where email = 'teste@admin.descarte-certo.app';
```
3. Em Authentication → Sign In / Providers, desative "Allow new users to sign up" (RN02). Mesmo com o cadastro ligado, quem não está na tabela `administradores` não consegue aprovar nada.
4. Depois de desligar o cadastro, crie no GitHub a variável `VERIFICAR_CADASTRO_DESLIGADO` com valor `1` (Settings → Secrets and variables → Actions → Variables). A CI passa a testar que ninguém consegue criar conta pelo site.

O formulário público aceita no máximo 30 sugestões por hora e 300 na fila de verificação (proteção contra spam, no próprio banco).

## Deploy (Vercel)
O site está publicado em <https://descarte-certo-ifsc.vercel.app> (projeto `descarte-certo` na conta da Luana). O repositório está conectado à Vercel: cada `git push` na `main` publica uma nova versão automaticamente, e cada Pull Request ganha uma URL de preview. Também dá para publicar pela linha de comando com `vercel deploy --prod`.

Para configurar do zero:
1. Em vercel.com, importe o repositório `byLuanaRosa/descarte-certo` (framework: Next.js, sem mudar os comandos).
2. Em Settings → Environment Variables, cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para **Production e Preview**.
3. Faça o deploy. Com o repositório conectado (Settings → Git, ou `vercel git connect`), a Vercel publica a cada `git push` na `main` e cria uma URL de preview para cada Pull Request.
   Atenção ao colar os valores das variáveis: no PowerShell, use `printf` pelo Git Bash ou o painel da Vercel, pois o PowerShell pode inserir um caractere invisível (BOM) no início do valor.
4. No GitHub (Settings → Secrets and variables → Actions), cadastre as mesmas duas variáveis para a CI rodar o teste de segurança contra o banco real.
