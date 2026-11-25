# Casos de Uso

**Atores:** Usuário (qualquer visitante, sem cadastro) e Administrador (membro da equipe, com login).

## Template Caso de Uso
UC[XX] – [Nome do Caso de Uso]
- Ator(es): [Quem executa a ação]
- Objetivo: [O que o ator busca alcançar]
- Requisitos: [Requisito vinculado com a ação]
- Pré-condições: [Condição prévia, se houver]
- Fluxo principal: O [Ator] solicita [ação], informa [dados/campos obrigatórios], e o sistema [valida, salva/processa e exibe confirmação].
- Alternativos / Exceções: Se [condição de erro ou variação], o sistema [exibe mensagem de erro / segue caminho alternativo].
- Pós-condições: [Estado final do sistema ou dados]

---

UC01 – Buscar material
- Ator(es): Usuário
- Objetivo: Saber como descartar um resíduo.
- Requisitos: RF01
- Pré-condições: Nenhuma.
- Fluxo principal: O Usuário digita o nome do resíduo ou escolhe uma categoria, e o sistema lista os materiais encontrados. Ao escolher um material, o sistema mostra os riscos do descarte incorreto, o passo a passo para descarte (terminando em onde levar) e a fonte da informação.
- Alternativos / Exceções: Se nada for encontrado, o sistema exibe "Nenhum resultado" e sugere as categorias.
- Pós-condições: Orientação de descarte exibida.

UC02 – Ver pontos de coleta
- Ator(es): Usuário
- Objetivo: Encontrar um local que receba o resíduo.
- Requisitos: RF02, RN03
- Pré-condições: Nenhuma.
- Fluxo principal: O Usuário escolhe o material e permite o uso da localização, e o sistema mostra os pontos aprovados mais próximos em lista ou mapa, com endereço, horário e o botão "Como chegar", que abre o app de mapas do aparelho.
- Alternativos / Exceções: Se o Usuário negar a localização, o sistema mostra todos os pontos sem ordenar por distância.
- Pós-condições: Pontos exibidos; a localização não é salva.

UC03 – Ver dicas
- Ator(es): Usuário
- Objetivo: Aprender a reduzir o lixo.
- Requisitos: RF03
- Pré-condições: Nenhuma.
- Fluxo principal: O Usuário abre a página de dicas e filtra por tema, e o sistema exibe as dicas do tema escolhido, cada uma com a fonte.
- Manutenção: o Administrador cria, edita e exclui dicas no painel; toda dica exige fonte com link.
- Alternativos / Exceções: —
- Pós-condições: Dicas exibidas.

UC04 – Sugerir ponto de coleta
- Ator(es): Usuário
- Objetivo: Indicar um ponto de coleta que não está no sistema.
- Requisitos: RF04, RN01, RN04, RN06
- Pré-condições: Nenhuma.
- Fluxo principal: O Usuário abre o formulário, informa nome do local, endereço, materiais aceitos e horário, e aciona "Localizar no mapa". O sistema busca o endereço e mostra um pino no mapa; o Usuário confere e, se preciso, arrasta o pino para o lugar certo. Ao enviar, o sistema valida, salva o ponto como "pendente" com a posição do pino e exibe "Obrigado! Seu ponto será verificado".
- Alternativos / Exceções:
  - Se o endereço não for encontrado, o sistema pede que o Usuário toque no mapa para marcar o local.
  - Se o Usuário estiver no local, pode usar "Estou aqui" para marcar a posição pelo GPS do aparelho.
  - Se faltar um campo obrigatório ou o pino, o sistema destaca o que falta e não envia.
- Pós-condições: Ponto salvo como pendente, com latitude e longitude, sem aparecer para o público.

UC05 – Verificar ponto sugerido
- Ator(es): Administrador
- Objetivo: Publicar apenas pontos verdadeiros.
- Requisitos: RF04, RN01
- Pré-condições: Conta de administrador criada pela equipe no painel do Supabase e incluída na tabela de administradores; existe ponto pendente.
- Fluxo principal: O Administrador acessa /admin e entra com nome de usuário e senha. O sistema mostra a lista de pendentes, cada um com seus dados e o pino no mapa. O Administrador confere e aprova, e o sistema muda o status para "aprovado", registra a data da verificação e passa a exibir o ponto.
- Alternativos / Exceções:
  - Se o login falhar, o sistema exibe "Usuário ou senha inválidos".
  - Se os dados estiverem errados, o Administrador rejeita e o ponto não é publicado.
  - O Administrador pode editar os dados e a posição de qualquer ponto (pendente, publicado ou rejeitado) ou excluí-lo de vez, depois de confirmar.
- Pós-condições: Ponto aprovado (visível) ou rejeitado.

UC06 – Responder quiz Kids
- Ator(es): Usuário (crianças, acompanhadas por adulto ou professor)
- Objetivo: Aprender de forma lúdica a separar os materiais.
- Requisitos: RF05
- Pré-condições: Nenhuma.
- Fluxo principal: O Usuário abre a área Kids, vê o aviso de segurança e escolhe o nível (até 10 anos ou a partir de 10 anos). O sistema mostra uma pergunta com foto e três alternativas com foto. Ao acertar, o sistema mostra brilhos, toca uma musiquinha com palmas, explica a resposta e, depois de alguns segundos, passa sozinho para a próxima pergunta. No fim, mostra as estrelas pelos acertos de primeira.
- Alternativos / Exceções:
  - Se o Usuário errar, o sistema mostra uma animação e uma dica, desativa a alternativa errada e repete a mesma pergunta até ele acertar.
  - O Usuário pode desligar o som, trocar de nível ou recomeçar a qualquer momento.
- Pós-condições: Resultado exibido (não é salvo no servidor).
