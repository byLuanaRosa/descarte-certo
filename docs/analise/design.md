# Design

O visual segue o [mockup](../../mockup/README.md) feito no Lovable.

## Telas do MVP
| Tela | Rota | Requisito | Referência no mockup |
|---|---|---|---|
| Início (busca e categorias) | `/` | RF01 | `01`, `12` |
| Buscar | `/buscar` | RF01 | `02`, `13` |
| Material | `/material/[id]` | RF01 | `04`, `14` |
| Pontos de coleta (lista e mapa) | `/pontos` | RF02 | `06`, `15`, `16` |
| Sugerir ponto | `/pontos/sugerir` | RF04 | — (não existe no mockup) |
| Dicas | `/dicas` | RF03 | `07`, `17` |
| Quiz Kids | `/kids` | RF05 | `08`, `18`, `19` |
| Admin (login e pendentes) | `/admin` | RF04 | `10` (no MVP, login por e-mail e senha) |
| Sobre (créditos e aviso) | `/sobre` | — | `09`, `20` |

**Navegação:** menu no topo no computador e barra fixa embaixo no celular (Início, Buscar, Pontos, Dicas, Kids).

**Sugerir ponto:** formulário curto com mapa pequeno. O botão "Localizar no mapa" posiciona o pino pelo endereço; o usuário pode arrastá-lo ou usar "Estou aqui".

**Admin:** tela de login simples e lista de pontos pendentes, cada um com os dados, o pino no mapa e os botões Aprovar e Rejeitar.

**Sobre:** equipe, orientadores, fontes usadas e o aviso de que é um projeto acadêmico e que o usuário deve confirmar horários antes de ir.

**Quiz Kids:** mantém o visual lúdico do mockup (fundo azul-claro, mascote, alternativas com ícones grandes) e o aviso "Não toque, não recolha e chame um adulto".

## Identidade visual
| Elemento | Valor |
|---|---|
| Cor principal | Verde `#2f7a4b` |
| Cor de fundo | `#fbfdfa` (claro) / `#14201a` (escuro) |
| Alerta de risco | Amarelo `#fdf1c9` |
| Perigo | Vermelho `#b42318` |
| Fonte dos títulos | Baloo 2 (Google Fonts) |
| Fonte do texto | Nunito Sans (Google Fonts) |
| Cantos | Arredondados (16 px) |
| Ícones | Lucide |

O verde é a cor da marca. O amarelo e o vermelho ficam reservados para avisos de risco e perigo.

## Boas práticas de UI/UX e acessibilidade
- Busca em destaque na página inicial: o usuário chega à resposta em até 3 cliques.
- Na página do material, os riscos aparecem antes de onde entregar.
- Linguagem simples e acolhedora.
- Cada ponto mostra "verificado em mm/aaaa" e o aviso "confirme o horário antes de ir".
- Tema claro e escuro, seguindo a preferência do aparelho (RNF04).
- Contraste mínimo de 4,5:1, navegação por teclado, textos alternativos nas imagens e textos que aumentam com o zoom do navegador; meta de Lighthouse Acessibilidade ≥ 90 (RNF06).
- Layout responsivo a partir de 320 px de largura (RNF07).
