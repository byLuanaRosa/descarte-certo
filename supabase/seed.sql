-- Pontos oficiais iniciais: ecopontos da Comcap com posição verificada.
-- Fonte: https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php (consultada em 11/2026).
-- Coordenadas conferidas no OpenStreetMap. Ecopontos sem posição precisa
-- (Coloninha, Costeira, Itacorubi, Monte Cristo, Morro das Pedras) ficam de fora
-- até alguém marcar o local exato pelo formulário "Sugerir ponto".

insert into public.pontos_coleta
  (nome, endereco, latitude, longitude, materiais, horario, telefone, fonte, status, verificado_em)
select v.nome, v.endereco, v.latitude, v.longitude, v.materiais, v.horario, v.telefone, v.fonte, 'aprovado', '2026-11-22'
from (values
  ('Ecoponto Canasvieiras',
   'Rua Desembargador Maurílio Coimbra, próximo ao campo da Amocan – Canasvieiras, Florianópolis',
   -27.432405, -48.4556214,
   array['papel-papelao','plasticos','metais','vidro-inteiro','celulares-eletronicos','oleo-cozinha','pilhas','baterias'],
   'Seg. a sex.: 7h30–12h e 13h–17h30; sáb.: 7h30–11h30',
   '(48) 3266-1445',
   'https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php'),
  ('Ecoponto Capoeiras',
   'Terminal de Capoeiras, Rua Professor Egídio Ferreira, s/n – Capoeiras, Florianópolis',
   -27.5970218, -48.6028838,
   array['papel-papelao','plasticos','metais','vidro-inteiro','celulares-eletronicos','oleo-cozinha','pilhas','baterias'],
   'Todos os dias: 7h–12h e 13h–19h',
   null,
   'https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php'),
  ('Ecoponto Ingleses',
   'Rua Via Local Insular, s/n, atrás da subestação da CELESC – Ingleses, Florianópolis',
   -27.4334996, -48.4085363,
   array['papel-papelao','plasticos','metais','vidro-inteiro','celulares-eletronicos','oleo-cozinha','pilhas','baterias'],
   'Todos os dias: 7h–12h e 13h–19h',
   null,
   'https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php'),
  ('Ecoponto Rio Vermelho',
   'Rua Cândido Pereira dos Anjos, s/n, próximo ao Canto das Corujas – Rio Vermelho, Florianópolis',
   -27.4784054, -48.4124205,
   array['papel-papelao','plasticos','metais','vidro-inteiro','celulares-eletronicos','oleo-cozinha','pilhas','baterias'],
   'Todos os dias: 7h–12h e 13h–19h',
   null,
   'https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php')
) as v(nome, endereco, latitude, longitude, materiais, horario, telefone, fonte)
where not exists (select 1 from public.pontos_coleta p where p.nome = v.nome);
