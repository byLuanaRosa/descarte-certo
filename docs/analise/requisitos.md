# Requisitos do Projeto

Requisitos do **MVP** do Descarte Certo. Eles são um recorte do [mockup](../../mockup/README.md), com as funcionalidades principais.

## Requisitos Funcionais
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF01 | Buscar informações sobre descarte de diversos tipos de resíduos | Busca por nome ou categoria mostra os riscos do descarte incorreto e um passo a passo simples para descarte, com destino e fonte. |
| RF02 | Mostrar pontos de coleta de acordo com a localização do usuário em mapa e lista | Pontos aprovados filtrados por material e ordenados pela distância, em lista ou mapa, com botão "Como chegar" que abre o app de mapas. |
| RF03 | Mostrar dicas para diminuir o lixo e o impacto ambiental do consumo | Página com dicas separadas por tema. |
| RF04 | Cadastro comunitário de pontos de coleta com formulário e verificação | O formulário localiza o endereço no mapa e salva o ponto como "pendente"; o administrador faz login, aprova ou rejeita. |
| RF05 | Quiz educativo sobre reciclagem e descarte correto | Quiz Kids com dois níveis (até 10 anos e a partir de 10 anos), ilustrações 2D coloridas livres de direitos autorais, brilhos, sons e palmas ao acertar e avanço automático; ao errar, animação, dica e repetição da pergunta até acertar; aviso de segurança para crianças. |

## Requisitos Não Funcionais
| ID | Requisito | Como verificar |
|---|---|---|
| RNF01 | O sistema deve ser uma aplicação web (Next.js, publicada na Vercel). | Site acessível pela URL pública da Vercel. |
| RNF02 | O sistema deve ser intuitivo, simples, humanizado e cativante. | Teste com 5 pessoas: pelo menos 4 encontram onde descartar um material em até 1 minuto, sem ajuda. |
| RNF03 | O sistema deve seguir os princípios de UI/UX. | Checklist das 10 heurísticas de Nielsen aplicado às telas do MVP. |
| RNF04 | O sistema deve possuir tema claro e escuro. | Tema claro por padrão; switch no canto superior direito alterna para o escuro e a escolha fica salva no aparelho. |
| RNF05 | O sistema deve permitir a instalação estilo PWA. | O Lighthouse indica o site como instalável (manifest e ícones). |
| RNF06 | O sistema deve possuir opções de acessibilidade para pessoas com deficiência. | Lighthouse Acessibilidade ≥ 90; contraste ≥ 4,5:1; uso completo pelo teclado; imagens com texto alternativo. |
| RNF07 | O sistema deve ser responsivo (desktop, tablet, mobile). | Sem rolagem horizontal entre 320 px e 1920 px de largura. |

## Regras de Negócio
| ID | Regra |
|---|---|
| RN01 | Todo ponto de coleta criado por usuários não admins deve ser verificado antes de ser adicionado no sistema. |
| RN02 | O usuário não precisa de cadastro para usar o sistema; só o administrador faz login. Não existe cadastro público de contas. |
| RN03 | A localização do usuário é opcional e não é armazenada. |
| RN04 | Todo ponto sugerido deve ter posição no mapa, definida por quem sugere (endereço localizado automaticamente ou pino marcado no mapa). O administrador não digita coordenadas. |
| RN05 | Toda orientação sobre resíduos deve citar uma fonte oficial e ser revisada pela orientadora de sustentabilidade antes de ser publicada. |
| RN06 | O formulário de sugestão não pede dados pessoais de quem sugere. |

## Fora do MVP
Funcionalidades que existem no mockup, mas ficam para depois:
- identificação do resíduo por foto (IA);
- favoritos de dicas;
- restante da área Kids (jogo, desafios, curiosidades, escolas); o MVP terá só o quiz Kids;
- botão de aumentar fonte (no MVP, a fonte segue o zoom do navegador);
- funcionamento offline do PWA;
- edição de materiais e dicas pelo admin (no MVP, esse conteúdo fica em arquivos no código).
