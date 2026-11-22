-- Descarte Certo – esquema do banco (Supabase / PostgreSQL)
-- Aplique uma vez no SQL Editor do Supabase (ou via migração).
-- Só os pontos de coleta e a lista de administradores ficam no banco.

-- 1. Administradores --------------------------------------------------------
-- Só quem está nesta tabela pode ver pendentes, aprovar, rejeitar e apagar.
-- Assim, mesmo que alguém consiga criar uma conta, não ganha acesso.
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);

alter table public.administradores enable row level security;

-- Cada administrador só consegue ler a própria linha (usado pela tela /admin).
drop policy if exists "admin le a si mesmo" on public.administradores;
create policy "admin le a si mesmo" on public.administradores
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.administradores from anon;
grant select on public.administradores to authenticated;

-- Função auxiliar num schema privado (não fica exposta pela API do Supabase).
create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to authenticated;

create or replace function privado.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.administradores a where a.user_id = (select auth.uid()));
$$;

revoke all on function privado.eh_admin() from public;
grant execute on function privado.eh_admin() to authenticated;

-- 2. Pontos de coleta -------------------------------------------------------
create table if not exists public.pontos_coleta (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 3 and 120),
  endereco text not null check (char_length(btrim(endereco)) between 5 and 200),
  -- RN04: todo ponto tem posição. Limites aproximados de Santa Catarina.
  latitude double precision not null check (latitude between -29.5 and -25.9),
  longitude double precision not null check (longitude between -54.0 and -48.3),
  -- ids iguais aos de data/materiais.json (conferido por teste automático)
  materiais text[] not null check (
    cardinality(materiais) between 1 and 30
    and materiais <@ array[
      'papel-papelao', 'plasticos', 'metais', 'vidro-inteiro', 'cacos-vidro',
      'espelhos-vidros-especiais', 'lampada-fluorescente', 'lampada-led',
      'lampada-incandescente', 'pilhas', 'baterias', 'celulares-eletronicos',
      'cabos', 'oleo-cozinha', 'tinta-vazia', 'tinta-sobra',
      'medicamentos-vencidos', 'agulhas-seringas', 'canetas-injetaveis'
    ]::text[]
  ),
  horario text check (horario is null or char_length(horario) <= 200),
  telefone text check (telefone is null or char_length(telefone) <= 30),
  fonte text check (fonte is null or (char_length(fonte) <= 300 and fonte ~ '^https?://')),
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  criado_em timestamptz not null default now(),
  verificado_em timestamptz
);

create index if not exists pontos_coleta_status_idx on public.pontos_coleta (status);

alter table public.pontos_coleta enable row level security;

-- Público (sem login): lê só aprovados.
drop policy if exists "publico le aprovados" on public.pontos_coleta;
create policy "publico le aprovados" on public.pontos_coleta
  for select to anon, authenticated using (status = 'aprovado');

-- Público: sugere ponto, que entra sempre como pendente (RN01).
drop policy if exists "publico sugere pendente" on public.pontos_coleta;
create policy "publico sugere pendente" on public.pontos_coleta
  for insert to anon, authenticated
  with check (status = 'pendente' and verificado_em is null);

-- Administradores: leem tudo, aprovam, rejeitam e apagam.
drop policy if exists "admin le tudo" on public.pontos_coleta;
create policy "admin le tudo" on public.pontos_coleta
  for select to authenticated using ((select privado.eh_admin()));

drop policy if exists "admin atualiza" on public.pontos_coleta;
create policy "admin atualiza" on public.pontos_coleta
  for update to authenticated
  using ((select privado.eh_admin()))
  with check ((select privado.eh_admin()));

drop policy if exists "admin apaga" on public.pontos_coleta;
create policy "admin apaga" on public.pontos_coleta
  for delete to authenticated using ((select privado.eh_admin()));

-- Permissões de tabela (o RLS acima filtra as linhas).
revoke all on public.pontos_coleta from anon, authenticated;
grant select on public.pontos_coleta to anon, authenticated;
grant insert (nome, endereco, latitude, longitude, materiais, horario, telefone)
  on public.pontos_coleta to anon, authenticated;
grant update (status, verificado_em, nome, endereco, latitude, longitude, materiais, horario, telefone, fonte)
  on public.pontos_coleta to authenticated;
grant delete on public.pontos_coleta to authenticated;

-- Limite contra abuso do formulário público: no máximo 30 sugestões por hora
-- e 300 pendentes na fila de verificação.
create or replace function privado.limitar_sugestoes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'pendente' then
    if (select count(*) from public.pontos_coleta
        where status = 'pendente' and criado_em > now() - interval '1 hour') >= 30 then
      raise exception 'Muitas sugestões recebidas na última hora. Tente mais tarde.' using errcode = 'P0001';
    end if;
    if (select count(*) from public.pontos_coleta where status = 'pendente') >= 300 then
      raise exception 'Fila de verificação cheia. Tente mais tarde.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function privado.limitar_sugestoes() from public;

drop trigger if exists limitar_sugestoes on public.pontos_coleta;
create trigger limitar_sugestoes
  before insert on public.pontos_coleta
  for each row execute function privado.limitar_sugestoes();

-- 3. Criar o primeiro administrador -----------------------------------------
-- a) No painel: Authentication → Users → Add user (e-mail e senha).
-- b) Depois rode, trocando o e-mail:
-- insert into public.administradores (user_id)
--   select id from auth.users where email = 'email-do-admin@exemplo.com';
