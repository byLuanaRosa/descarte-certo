-- Teste manual das regras de administrador (RLS). Rode no SQL Editor do Supabase.
-- Tudo acontece dentro de uma transação desfeita no final (rollback): nada fica gravado.
-- Resultado esperado:
--   comum ve pendentes = 0 | comum aprova (linhas) = 0 | comum le administradores = 0
--   admin ve pendentes = (quantidade de pendentes) | admin le a si mesmo = 1 | admin aprova = (quantidade de pendentes)

begin;
insert into auth.users (id, email, aud, role) values
  ('11111111-1111-1111-1111-111111111111', 'admin-teste@exemplo.invalid', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'comum-teste@exemplo.invalid', 'authenticated', 'authenticated');
insert into public.administradores (user_id) values ('11111111-1111-1111-1111-111111111111');

create temp table resultado (caso text, valor text) on commit drop;
grant all on resultado to authenticated;

-- Usuário logado que NÃO é administrador
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
insert into resultado select 'comum ve pendentes', count(*)::text from public.pontos_coleta where status = 'pendente';
with u as (update public.pontos_coleta set status = 'aprovado' where status = 'pendente' returning 1)
insert into resultado select 'comum aprova (linhas)', count(*)::text from u;
insert into resultado select 'comum le administradores', count(*)::text from public.administradores;

-- Administrador
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
insert into resultado select 'admin ve pendentes', count(*)::text from public.pontos_coleta where status = 'pendente';
insert into resultado select 'admin le a si mesmo', count(*)::text from public.administradores;
with u as (update public.pontos_coleta set status = 'aprovado', verificado_em = now() where status = 'pendente' returning 1)
insert into resultado select 'admin aprova (linhas)', count(*)::text from u;

reset role;
select * from resultado;
rollback;
