-- Pontos oficiais iniciais: ecopontos da Comcap com posição verificada.
-- Fonte: https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php (consultada em 11/2026).
-- Coordenadas conferidas no OpenStreetMap.

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

-- Pontos pesquisados em 11/2026 na Grande Florianópolis (prefeituras, Comcap, Green Eletron,
-- ABREE, Reciclus, ReÓleo/ACIF e LogMed). Entraram só os locais com posição conferida:
-- número da casa no OpenStreetMap, o próprio estabelecimento no mapa ou o link de mapa
-- da página oficial. Outros 31 locais ficaram pendentes no painel admin para ajustar o pino.
insert into public.pontos_coleta
  (nome, endereco, latitude, longitude, materiais, horario, telefone, fonte, status, verificado_em)
select v.nome, v.endereco, v.latitude, v.longitude, v.materiais, v.horario, v.telefone, v.fonte, 'aprovado', '2026-11-24'
from (values
  ('Ecoponto Itacorubi','Rodovia Admar Gonzaga, 72 – Itacorubi, Florianópolis',-27.5776350,-48.5124500,array['baterias','celulares-eletronicos','espelhos-vidros-especiais','lampada-fluorescente','metais','oleo-cozinha','papel-papelao','pilhas','plasticos','vidro-inteiro']::text[],'Todos os dias: 7h–19h','(48) 3261-4816','https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php'),
  ('Ecoponto Morro das Pedras','Rua Francisco Vieira, 198 – Morro das Pedras, Florianópolis',-27.7062190,-48.5052210,array['baterias','celulares-eletronicos','espelhos-vidros-especiais','metais','oleo-cozinha','papel-papelao','pilhas','plasticos','vidro-inteiro']::text[],'Todos os dias: 7h–12h e 13h–18h30','(48) 3338-4506','https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php'),
  ('Ecoponto Monte Cristo','Rua Professor Joaquim Nabuco, 2948 – Monte Cristo, Florianópolis',-27.5901156,-48.6037853,array['baterias','celulares-eletronicos','espelhos-vidros-especiais','metais','oleo-cozinha','papel-papelao','pilhas','plasticos','vidro-inteiro']::text[],'Todos os dias: 7h–19h',null,'https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php'),
  ('Ecoponto Costeira','Avenida Jorge Lacerda, 1374 – Costeira do Pirajubaé, Florianópolis',-27.6264099,-48.5258186,array['baterias','celulares-eletronicos','espelhos-vidros-especiais','metais','oleo-cozinha','papel-papelao','pilhas','plasticos','vidro-inteiro']::text[],'Todos os dias: 7h–12h e 13h–19h',null,'https://www.pmf.sc.gov.br/sistemas/comcap/ecopontos.php'),
  ('PEV de vidro – Av. Hercílio Luz','Avenida Hercílio Luz, 1395 – Centro, Florianópolis',-27.5923978,-48.5438796,array['cacos-vidro','espelhos-vidros-especiais','vidro-inteiro']::text[],'Contêiner na rua (acesso livre)',null,'https://www.pmf.sc.gov.br/entidades/residuos/index.php?cms=entrega+seletiva+de+vidro&menu=4&submenuid=150'),
  ('PEV de vidro – Rua Visconde de Ouro Preto','Rua Visconde de Ouro Preto, 403 – Centro, Florianópolis',-27.5935856,-48.5474815,array['cacos-vidro','espelhos-vidros-especiais','vidro-inteiro']::text[],'Contêiner na rua (acesso livre)',null,'https://www.pmf.sc.gov.br/entidades/residuos/index.php?cms=entrega+seletiva+de+vidro&menu=4&submenuid=150'),
  ('PEV de vidro – Rio Tavares','Rodovia Doutor Antônio Luiz Moura Gonzaga, 1525 – Rio Tavares, Florianópolis',-27.6456301,-48.4770707,array['cacos-vidro','espelhos-vidros-especiais','vidro-inteiro']::text[],'Contêiner na rua (acesso livre)',null,'https://www.pmf.sc.gov.br/entidades/residuos/index.php?cms=entrega+seletiva+de+vidro&menu=4&submenuid=150'),
  ('PEV de vidro – Estreito','Rua Souza Dutra, 145 – Estreito, Florianópolis',-27.5868415,-48.5790814,array['cacos-vidro','espelhos-vidros-especiais','vidro-inteiro']::text[],'Contêiner na rua (acesso livre)',null,'https://www.pmf.sc.gov.br/entidades/residuos/index.php?cms=entrega+seletiva+de+vidro&menu=4&submenuid=150'),
  ('Ecoponto Beira-Mar de São José','Avenida Beira-Mar de São José – próximo à Olaria Beiramar, São José',-27.6027591,-48.6137631,array['metais','papel-papelao','plasticos','vidro-inteiro']::text[],'Entrega 24h; atendimento seg. a sáb.: 10h40–13h e 14h–19h',null,'https://saojose.sc.gov.br/sao-jose-intensifica-combate-ao-descarte-irregular-de-lixo/98607/'),
  ('PEV Potecas','Rua João José Martins, 3001 – Potecas, São José',-27.5651756,-48.6586562,array['metais','papel-papelao','plasticos']::text[],'Seg. a sáb.: 8h–16h20',null,'https://saojose.sc.gov.br/sao-jose-intensifica-combate-ao-descarte-irregular-de-lixo/98607/'),
  ('Supermercados Angeloni – Centro','Rua Esteves Júnior, 307 – Centro, Florianópolis',-27.5923528,-48.5531578,array['baterias','cabos','celulares-eletronicos','pilhas']::text[],'Todos os dias: 9h–20h',null,'https://greeneletron.org.br/onde-descartar/lista-pev/?cidade=Florian%C3%B3polis&estado=SC'),
  ('Supermercados Angeloni – Agronômica','Avenida Irineu Bornhausen, 5288 – Agronômica, Florianópolis',-27.5750951,-48.5273151,array['baterias','cabos','celulares-eletronicos','lampada-fluorescente','pilhas']::text[],'Todos os dias: 9h–20h',null,'https://greeneletron.org.br/onde-descartar/lista-pev/?cidade=Florian%C3%B3polis&estado=SC'),
  ('Supermercados Angeloni – Santa Mônica','Rua Niberto Haase, 75 – Santa Mônica, Florianópolis',-27.5916756,-48.5132913,array['baterias','cabos','celulares-eletronicos','pilhas']::text[],'Todos os dias: 9h–20h',null,'https://greeneletron.org.br/onde-descartar/lista-pev/?cidade=Florian%C3%B3polis&estado=SC'),
  ('Supermercados Angeloni – Jardim Atlântico','Avenida Marinheiro Max Schramm, 3450 – Jardim Atlântico, Florianópolis',-27.5755381,-48.5952045,array['baterias','cabos','celulares-eletronicos','lampada-fluorescente','pilhas']::text[],'Todos os dias: 9h–20h',null,'https://greeneletron.org.br/onde-descartar/lista-pev/?cidade=Florian%C3%B3polis&estado=SC'),
  ('Loja Vivo – Beiramar Shopping','Rua Bocaiúva, 2468 – Centro, Florianópolis',-27.5847787,-48.5450486,array['baterias','celulares-eletronicos','pilhas']::text[],null,null,'https://abree.org.br/pontos-de-recebimento'),
  ('Casas Bahia – São José','Avenida Presidente Kennedy, 600 – Campinas, São José',-27.6015006,-48.6112372,array['baterias','cabos','celulares-eletronicos','pilhas']::text[],'Seg. a sex.: 9h–19h; sáb.: 9h–17h',null,'https://greeneletron.org.br/onde-descartar/lista-pev/?cidade=S%C3%A3o%20Jos%C3%A9&estado=SC'),
  ('Loja Vivo – Shopping Itaguaçu','Rua Gerôncio Thives, 1079 – Barreiros, São José',-27.5854438,-48.6142096,array['baterias','celulares-eletronicos','pilhas']::text[],null,null,'https://abree.org.br/pontos-de-recebimento'),
  ('Loja Vivo – Shopping ViaCatarina','Avenida Atílio Pedro Pagani, 270 – Pagani, Palhoça',-27.6419163,-48.6715763,array['baterias','celulares-eletronicos','pilhas']::text[],null,null,'https://abree.org.br/pontos-de-recebimento'),
  ('Agência dos Correios – Águas Mornas','Avenida Coronel Antônio Lehmkuhl, 584 – Centro, Águas Mornas',-27.6990339,-48.8172219,array['celulares-eletronicos']::text[],'Antes de ir, gere o código de entrega no site da ABREE (abree.org.br).',null,'https://abree.org.br/pontos-de-recebimento'),
  ('Posto Onix Floresta – PEV ReÓleo','Rua Paulino Pedro Hermes, 588 – Floresta, São José',-27.5832683,-48.6166052,array['oleo-cozinha']::text[],null,null,'https://reoleoacif.org.br/pontos-de-entrega-voluntarios-do-reoleo-pev/'),
  ('Posto Galo Pagani – PEV ReÓleo','Avenida Atílio Pedro Pagani, 271 – Passa Vinte, Palhoça',-27.6412192,-48.6792495,array['oleo-cozinha']::text[],null,null,'https://reoleoacif.org.br/pontos-de-entrega-voluntarios-do-reoleo-pev/'),
  ('Sul do Rio Loja 03 – PEV ReÓleo','Avenida Bom Jesus de Nazaré, 444 – Aririu, Palhoça',-27.6821483,-48.7097872,array['oleo-cozinha']::text[],null,null,'https://reoleoacif.org.br/pontos-de-entrega-voluntarios-do-reoleo-pev/'),
  ('Prefeitura de Antônio Carlos – coletor Reciclus','Praça Anchieta, 10 – Centro, Antônio Carlos',-27.5179576,-48.7671469,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Supermercados Imperatriz Loja 01 – coletor Reciclus','Rua Major Joaquim de Campos, 6037 – Centro, Santo Amaro da Imperatriz',-27.6918717,-48.7784701,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Hiper Koch Loja 13 – coletor Reciclus','Avenida Governador Ivo de Figueiredo Campos, 60 – Rio Caveiras, Biguaçu',-27.5071846,-48.6519896,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Supermercados Imperatriz Biguaçu – coletor Reciclus','Rua João Coan, 390 – Universitário, Biguaçu',-27.5005150,-48.6562916,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Atacadão Biguaçu – coletor Reciclus','Rua Alexandre Sérgio Godinho, 853 – Mar das Pedras, Biguaçu',-27.5241669,-48.6353833,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Balaroti São José – coletor Reciclus','Avenida Leoberto Leal, 249 – Barreiros, São José',-27.5669578,-48.6133534,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Giassi Loja 7 – coletor Reciclus','Avenida Irineu Bornhausen, 425 – Campinas, São José',-27.5918711,-48.6103693,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Supermercados Imperatriz Loja 06 – coletor Reciclus','Rua Arnoldo Pedro Meira, 547 – Ipiranga, São José',-27.5620401,-48.6189927,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Giassi Loja 10 – coletor Reciclus','Avenida Atílio Pedro Pagani, 170 – Passa Vinte, Palhoça',-27.6421600,-48.6703000,array['lampada-fluorescente']::text[],null,null,'https://reciclus.org.br/lista-pontos-entrega/?jsf=jet-engine:pontos-entrega-lista&tax=estado:33'),
  ('Centro de Saúde Centro','Av. Rio Branco, 90 – Centro, Florianópolis',-27.5927687,-48.5572972,array['agulhas-seringas']::text[],null,'(48) 3952-0127','https://www.pmf.sc.gov.br/sistemas/comcap/infos.php'),
  ('Centro de Saúde Córrego Grande','Rua João Pio Duarte da Silva, 1415 – Córrego Grande, Florianópolis',-27.6008558,-48.5036740,array['agulhas-seringas']::text[],null,'(48) 3226-9406','https://www.pmf.sc.gov.br/sistemas/comcap/infos.php'),
  ('Centro de Saúde Lagoa da Conceição','Rua João Pacheco da Costa, 255 – Lagoa da Conceição, Florianópolis',-27.5995806,-48.4704623,array['agulhas-seringas']::text[],null,'(48) 3232-0639','https://www.pmf.sc.gov.br/sistemas/comcap/infos.php'),
  ('Centro de Saúde Estreito','Rua Aracy Vaz Callado, 742 – Estreito, Florianópolis',-27.5854613,-48.5827550,array['agulhas-seringas']::text[],null,'(48) 3244-1200','https://www.pmf.sc.gov.br/sistemas/comcap/infos.php'),
  ('Centro de Saúde Ingleses','Travessa dos Imigrantes, 135 – Ingleses do Rio Vermelho, Florianópolis',-27.4399268,-48.3988804,array['agulhas-seringas']::text[],null,'(48) 3269-2100','https://www.pmf.sc.gov.br/sistemas/comcap/infos.php'),
  ('Pague Menos – Santa Mônica','Avenida Madre Benvenuta, 1084 – Santa Mônica, Florianópolis',-27.5906454,-48.5106414,array['medicamentos-vencidos']::text[],null,null,'https://www.logmed.org.br/onde-descartar'),
  ('Drogasil/Droga Raia – Trindade','Rua Lauro Linhares, 1040 – Trindade, Florianópolis',-27.5884109,-48.5235769,array['medicamentos-vencidos']::text[],null,null,'https://www.logmed.org.br/onde-descartar'),
  ('Drogasil/Droga Raia – Coqueiros','Rua Desembargador Pedro Silva, 2450 – Coqueiros, Florianópolis',-27.6135097,-48.5861846,array['medicamentos-vencidos']::text[],null,null,'https://www.logmed.org.br/onde-descartar'),
  ('Pague Menos – Kobrasol','Avenida Lédio João Martins, 549 – Kobrasol, São José',-27.5964772,-48.6142479,array['medicamentos-vencidos']::text[],null,null,'https://www.logmed.org.br/onde-descartar'),
  ('Farmácias Nissei – Campinas','Rua Presidente Kennedy, 656 – Campinas, São José',-27.6007497,-48.6125293,array['medicamentos-vencidos']::text[],null,null,'https://www.logmed.org.br/onde-descartar')
) as v(nome, endereco, latitude, longitude, materiais, horario, telefone, fonte)
where not exists (select 1 from public.pontos_coleta p where p.nome = v.nome);

-- Dicas ambientais: todas com fonte conferida em 25/11/2026. Idempotente (não repete pelo título).
insert into public.dicas (tema, tipo, titulo, texto, fonte_titulo, fonte_url, criado_em)
select v.tema, v.tipo, v.titulo, v.texto, v.fonte_titulo, v.fonte_url, now() + (v.ordem * interval '1 second')
from (values
  (1, 'Reduzir', 'Atitude prática', 'Leve sua própria sacola',
   'Quando for às compras, leve sua sacola retornável e recuse as sacolas plásticas. Recusar o que não é necessário é um dos 7 Rs do consumo sustentável.',
   'Idec (2019). Conheça e pratique os 7 Rs do consumo sustentável',
   'https://idec.org.br/consultas/dicas-e-direitos/pratique-os-7-rs-repense-respeite-responsabilize-se-recuse-reduza-reaproveite-e-recicle'),
  (2, 'Reduzir', 'Atitude prática', 'Garrafa reutilizável',
   'Garrafas descartáveis de água e refrigerante estão entre os maiores causadores de lixo plástico. Use uma garrafa reutilizável: onde a água é própria para beber, é só enchê-la.',
   'ONU Brasil (2019), reproduzido pelo IHU-Unisinos. A FAO listou cinco maneiras de reduzir o uso de plásticos no dia a dia',
   'https://ihu.unisinos.br/categorias/590360-a-fao-listou-cinco-maneiras-de-reduzir-o-uso-de-plasticos-no-dia-a-dia'),
  (3, 'Reutilizar', 'Atitude prática', 'Potes ganham nova vida',
   'Troque plásticos de uso único por opções reutilizáveis, como sacos de pano e recipientes de vidro para guardar alimentos.',
   'ONU Brasil (2019), reproduzido pelo IHU-Unisinos. A FAO listou cinco maneiras de reduzir o uso de plásticos no dia a dia',
   'https://ihu.unisinos.br/categorias/590360-a-fao-listou-cinco-maneiras-de-reduzir-o-uso-de-plasticos-no-dia-a-dia'),
  (4, 'Consumo consciente', 'Atitude prática', 'Pense antes de comprar',
   'Antes de comprar, pergunte: preciso mesmo deste produto? Ele é durável? Dá para consertar, reutilizar ou reciclar depois?',
   'Folha de S.Paulo (2019), reproduzido pelo Idec. Saiba como se tornar consumidor consciente em passos simples',
   'https://idec.org.br/idec-na-imprensa/saiba-como-se-tornar-consumidor-consciente-em-passos-simples'),
  (5, 'Consumo consciente', 'Você sabia?', 'Consertar também é sustentável',
   'A bateria é a peça que mais falha nos celulares. Trocar a peça em vez do aparelho prolonga o uso do celular e evita lixo eletrônico, o tipo de resíduo que mais cresce no planeta.',
   'O Globo (2023), via Folha de Pernambuco. Por que a vida média de um celular é de apenas 3 anos, mas deveria ser de 25',
   'https://www.folhape.com.br/economia/por-que-a-vida-media-de-um-celular-e-de-apenas-3-anos-mas-deveria-ser/295788/'),
  (6, 'Reciclagem', 'Erros comuns', 'Recicláveis vão limpos para a coleta',
   'Em Florianópolis, os recicláveis devem ir limpos para a coleta seletiva: esvazie as embalagens e tire os restos de comida. Amasse e desmonte as embalagens e use sacos claros ou transparentes.',
   'Prefeitura de Florianópolis – SMMA. A coleta de resíduos domiciliares',
   'https://www.pmf.sc.gov.br/servicos/index.php?pagina=servpagina&id=260'),
  (7, 'Reciclagem', 'Atitude prática', 'Separe secos, vidro e rejeitos',
   'Separe plástico, metal e papel dos restos de comida e dos rejeitos. Em Florianópolis, o vidro vai separado dos outros recicláveis: entregue nos PEVs de vidro, nos ecopontos ou na coleta só de vidro do seu bairro.',
   'Prefeitura de Florianópolis – SMMA. A coleta de resíduos domiciliares',
   'https://www.pmf.sc.gov.br/servicos/index.php?pagina=servpagina&id=260'),
  (8, 'Resíduos especiais', 'Você sabia?', 'Nem tudo vai para o lixo comum',
   'Pilhas e baterias, lâmpadas fluorescentes e eletroeletrônicos têm um sistema próprio de devolução previsto em lei, a logística reversa. Use a busca para ver onde entregar.',
   'Brasil. Lei nº 12.305/2010 (Política Nacional de Resíduos Sólidos), art. 33',
   'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12305.htm'),
  (9, 'Impactos ambientais', 'Erros comuns', 'Óleo na pia polui a água',
   'Não jogue óleo de cozinha na pia: ele entope a rede de esgoto e polui rios e o mar. Espere esfriar, guarde em garrafa PET limpa e seca e leve a um ecoponto ou a um ponto do ReÓleo.',
   'Tribunal de Justiça de Santa Catarina – Gestão Socioambiental. Descarte de óleo de cozinha',
   'https://www.tjsc.jus.br/web/gestao-socioambiental/descarte-de-oleo-de-cozinha'),
  (10, 'Segurança para famílias', 'Atitude prática', 'Resíduos perigosos fora do alcance',
   'Até a hora de entregar no ponto de coleta, guarde remédios, produtos de limpeza e pesticidas em armário alto e trancado, fora do alcance das crianças.',
   'Sociedade Brasileira de Pediatria (2025). Dicas de prevenção da intoxicação',
   'https://www.sbp.com.br/pediatria-para-familias/seguranca-e-prevencao/dicas-de-prevencao-da-intoxicacao'),
  (11, 'Coleta e limpeza pública', 'Atitude prática', 'Respeite os dias e horários da coleta',
   'A limpeza da cidade é responsabilidade de todos: moradores, prefeitura e empresas. Confira os dias e horários da coleta no seu bairro e só coloque o lixo na rua perto da hora em que o caminhão passa. Lixo exposto antes do tempo atrai animais e se espalha pela rua.',
   'Lucena et al. (2025). Impactos do descarte inadequado de resíduos sólidos nos centros urbanos e do Brasil sobre a saúde pública e o meio ambiente. Epitaya E-books, v. 1, n. 115, p. 32-36',
   'https://portal.epitaya.com.br/index.php/ebooks/article/view/1581')
) as v(ordem, tema, tipo, titulo, texto, fonte_titulo, fonte_url)
where not exists (select 1 from public.dicas d where d.titulo = v.titulo);
