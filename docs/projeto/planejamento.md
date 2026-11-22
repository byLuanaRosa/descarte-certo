# Plano de implementação do Descarte Certo (MVP)

## Contexto
A documentação do MVP está pronta em `byLuanaRosa/descarte-certo`:
- requisitos RF01–RF05, RNF01–RNF07 e RN01–RN06;
- casos de uso UC01–UC06;
- arquitetura em `docs/projeto/diagramas.md`.

Ainda não há código. Pontos combinados:
- O sistema será feito inteiro pelo Claude, em **Next.js + TypeScript**.
- A **CI** roda no GitHub Actions e o **deploy (CD)** é feito pela integração Git da Vercel.
- A **entrega é amanhã**.

O objetivo é um sistema simples que funcione. Ele é entregue em fases, cada uma testada automaticamente e com uma URL de preview para a Luana validar.

O plano foi revisado por um advisor (agente revisor independente), e os ajustes dele já estão incorporados: RLS completo na Fase 3, insert sem `.select()`, pontos buscados no navegador, login só no cliente, cuidados com o Leaflet, testes de segurança e linha de corte.

## O que a Luana precisa fazer (não posso fazer por ela)
1. **Supabase na conta da Luana.** A integração desta sessão está ligada à organização "NicolasArthur". Há dois caminhos:
   - Reconectar a integração entrando com a conta da Luana. Aí eu crio o projeto e aplico tabela, RLS e dados iniciais.
   - Plano B: a Luana cria o projeto em supabase.com, me envia a URL e a chave pública (anon), e cola no SQL Editor os arquivos que eu gerar.
2. **Conta do admin.** No painel do Supabase, em Authentication → Users → Add user, a Luana cria o e-mail e a senha do admin. Eu não crio senhas.
3. **Vercel.** Importar o repositório em vercel.com e cadastrar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em Production **e** Preview.
4. **GitHub.** Em Settings → Secrets, salvar as mesmas duas variáveis (para o teste de segurança da CI). Proteger a branch `main` exigindo a CI verde.
5. **Conteúdo.** Mostrar o conteúdo dos materiais e do quiz à orientadora assim que possível (RN05). Até lá, o site mostra "conteúdo em revisão".

## Fluxo de cada fase
1. Eu crio a branch `fase-N-...`, implemento e rodo localmente `lint`, `typecheck`, `test` e `build`.
2. Push e Pull Request. O GitHub Actions roda a CI e a Vercel gera a URL de preview.
3. A Luana valida pelo checklist da fase, de preferência no celular.
4. Merge na `main`, e a Vercel publica em produção.

Para caber no prazo, as fases são validadas em **4 blocos**: **A** (0–2, sem banco), **B** (3–4), **C** (5–6) e **D** (7). Um bloco não espera o anterior ser validado para começar, mas o merge segue a ordem.

## CI (`.github/workflows/ci.yml`, em push e PR)
Passos, nesta ordem:
1. `npm ci`
2. `npm run lint` (ESLint)
3. `npm run typecheck` (`tsc --noEmit`)
4. `npm test` (Vitest)
5. `npm run build`
6. `npm run test:e2e`: Playwright (Chromium) com testes rápidos de fumaça no build de produção, confirmando que cada página abre, que a busca encontra "lampada" e que o quiz avança.

Há também o job **`seguranca`**: testes com a anon key contra o Supabase real. Ele só roda quando os secrets existem e não grava nada no banco. Ele confere que:
- a lista de pendentes volta vazia;
- inserir com `status='aprovado'` falha;
- `update` altera 0 linhas;
- `auth.signUp` falha.

## Fases

### Fase 0 – Base e CI (RNF01, RNF04, RNF07)
- Next.js (versão estável atual, Node 20+), TypeScript strict, Tailwind v4 (tokens via `@theme` em `globals.css`), ESLint, Vitest, Playwright e workflow de CI.
- Layout:
  - `Header` com o menu no desktop e `BottomNav` no celular;
  - `Footer` com o aviso de projeto acadêmico;
  - fontes Baloo 2 e Nunito Sans via `next/font`;
  - cores do `design.md`;
  - tema escuro por `prefers-color-scheme`.
- Páginas iniciais: `/`, `/buscar`, `/pontos`, `/dicas`, `/kids`, `/sobre`.
- **Validação:** CI verde; a preview abre no PC e no celular; o tema escuro acompanha o aparelho; não há rolagem horizontal em 320 px.

### Fase 1 – Buscar material (RF01, RN05)
- `data/categorias.json` e `data/materiais.json`, com cerca de 15 materiais das categorias do mockup. Cada material tem `id`, `nome`, `sinonimos`, `categoria`, `riscos`, `cuidados`, `destino`, `fonte` e `revisado_em`. As fontes são oficiais, como Green Eletron, Comcap/Prefeitura, Reciclus e o decreto de logística reversa de medicamentos.
- `lib/busca.ts`: ignora acentos e maiúsculas e procura em nome e sinônimos, com filtro por categoria. Tem testes Vitest.
- Páginas estáticas:
  - Início: busca e cards de categoria;
  - `/buscar?q=&categoria=`;
  - `/material/[id]`, com os riscos em destaque antes dos cuidados, do destino e da fonte.
- **Validação:** "lampada" encontra 3 ou mais materiais; o filtro por categoria funciona; um termo inexistente mostra "Nenhum resultado" e as categorias.

### Fase 2 – Dicas e Quiz Kids (RF03, RF05)
- `data/dicas.json`, com 10 dicas em temas, e `data/quiz.json`, com 8 perguntas (emoji, alternativas, resposta e explicação).
- `/dicas`: filtro por tema.
- `/kids`, no visual do mockup:
  - aviso "Não toque, não recolha, chame um adulto";
  - quiz com resposta certa ou errada na hora, explicação, pontuação final e botão de reiniciar;
  - a lógica fica em `lib/quiz.ts`, com testes.
- **Validação:** completar o quiz no celular; o teclado funciona do começo ao fim.

### Fase 3 – Pontos em lista + banco completo (RF02, RN01, RN03)
- `supabase/schema.sql`, completo desde já:
  - tabela `pontos_coleta` com `latitude` e `longitude` **not null** e `check` limitando à região de SC;
  - `materiais text[]`, `fonte`, `status`, `verificado_em` e `criado_em`;
  - constraints de tamanho.
- RLS:
  - anon pode fazer `select` só onde `status='aprovado'`;
  - anon pode fazer `insert` com `with check (status='pendente' and verificado_em is null)`;
  - authenticated pode fazer `select`, `update` e `delete`.
- Desligar o cadastro público no Supabase Auth.
- `supabase/seed.sql`: ecopontos da Comcap com coordenadas conferidas no mapa (entram só os que eu conseguir localizar com segurança), `status='aprovado'` e `fonte`.
- `lib/supabase.ts`: cliente `@supabase/supabase-js` com a anon key.
- `lib/distancia.ts`: fórmula de Haversine, com testes. Outro teste confere se os ids de materiais do seed existem no `materiais.json`.
- `/pontos` e a seção "Onde entregar" da ficha buscam os pontos **no navegador** (`'use client'`), para que um ponto aprovado apareça sem novo build.
- Também entram:
  - filtro por material;
  - botão "Usar minha localização", que ordena os pontos por distância sem enviar a posição ao servidor (RN03);
  - botão "Como chegar", que abre o Google Maps;
  - "verificado em mm/aaaa" e o aviso "confirme o horário antes de ir".
- Mensagem amigável se o banco estiver fora do ar ou pausado.
- **Validação:**
  - o job `seguranca` fica verde;
  - a localização ordena a lista corretamente, testando pela URL de preview (a geolocalização exige HTTPS);
  - negar a localização mostra todos os pontos;
  - na aba Rede do navegador, nenhuma requisição leva a posição do usuário.

### Fase 4 – Mapa (RF02)
- Componente único `components/Mapa.tsx`, com `react-leaflet`, OpenStreetMap e `dynamic(..., { ssr: false })`. Ele importa `leaflet/dist/leaflet.css` e usa um ícone próprio em `/public`, porque o ícone padrão do Leaflet quebra no bundler.
- Abas Lista e Mapa. O mapa só é montado quando a aba fica ativa, e cada marcador tem um popup com o botão "Como chegar".
- **Validação:** o mapa aparece no celular e no PC, sem erro no console, e os marcadores ficam nos lugares certos.

### Fase 5 – Sugerir ponto (RF04, RN04, RN06)
- `/pontos/sugerir`, com os campos:
  - nome do local, endereço, materiais (checkboxes) e horário;
  - "Telefone do local", opcional;
  - honeypot (campo invisível contra robôs).
- Posição do ponto:
  1. o botão "Localizar no mapa" busca o endereço no Nominatim, com `countrycodes=br` e a área da Grande Florianópolis, uma busca por clique e o botão desativado enquanto busca;
  2. o pino pode ser arrastado;
  3. dá para tocar no mapa para marcar o local;
  4. o botão "Estou aqui" usa o GPS.
- `lib/validacao.ts`, com testes. O envio usa `insert` **sem** `.select()`, porque o público não pode ler pendentes.
- **Validação:**
  - a sugestão aparece como pendente no painel e **não** aparece em `/pontos`;
  - um endereço inexistente permite marcar o local no mapa;
  - o envio sem pino é bloqueado.

### Fase 6 – Admin (RF04, RN01, RN02)
- `/admin` como componente cliente, usando só `@supabase/supabase-js`:
  - login por e-mail e senha;
  - lista de pendentes com os dados;
  - **um** mapa que centraliza no item selecionado;
  - botões Aprovar (`status='aprovado'` e `verificado_em=now()`), Rejeitar e Sair.
- A proteção real é o RLS. A tela de login é só a interface.
- **Validação:**
  - sem login, a página mostra só o formulário de login;
  - um login errado mostra a mensagem de erro;
  - um ponto aprovado aparece em `/pontos` na hora;
  - o job `seguranca` continua verde.

### Fase 7 – Acabamento (RNF02, RNF03, RNF05, RNF06)
- `app/manifest.ts` e ícones para o site ser instalável; `/sobre` com equipe, orientadores, fontes e aviso.
- Lighthouse em Acessibilidade ≥ 90, com o site instalável; revisão em 320 px.
- Atualizar `README.md` (como rodar, variáveis, CI e deploy) e `docs/projeto/diagramas.md` (busca dos pontos no navegador, insert sem select e CI).
- Salvar este plano em `docs/projeto/planejamento.md`.
- **Validação:** checklist de Nielsen resumido. O teste com 5 pessoas (RNF02) fica para a equipe fazer depois da entrega.

## Linha de corte (se faltar tempo, cortar nesta ordem)
1. O Nominatim e o "Estou aqui". A RN04 continua cumprida com toque e pino.
2. O mapa do admin, trocado por um link para o OSM.
3. Os testes Playwright; ficam só os testes Vitest e o build.
4. A Fase 4, o mapa público; fica a lista com "Como chegar".

**Nunca cortar:** RLS e seus testes, a Fase 6 (sem ela a RN01 não fecha) e os avisos de segurança dos resíduos.

## Arquivos principais
- `app/`: as páginas.
- `components/`: Header, BottomNav, Footer, CardMaterial, CardPonto, Mapa, Quiz e FormSugestao.
- `data/*.json`.
- `lib/`: `busca.ts`, `quiz.ts`, `distancia.ts`, `validacao.ts` e `supabase.ts`.
- `supabase/schema.sql` e `supabase/seed.sql`.
- `tests/`: unitários e `seguranca`.
- `e2e/`: Playwright.
- `.github/workflows/ci.yml`.
- `.env.example`.

## Verificação geral
- A CI fica verde em cada PR: lint, tipos, Vitest, build, Playwright e segurança.
- Cada fase é validada pelo checklist na URL de preview da Vercel.
- No fim, rodar o fluxo completo em produção, pelo celular:
  1. buscar um material;
  2. ver os pontos e abrir a rota;
  3. sugerir um ponto;
  4. aprovar o ponto no admin;
  5. ver o ponto aparecer no mapa.
