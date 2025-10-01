# Guia de Gerenciamento de Projetos na Organização

Este guia explica como usamos as ferramentas do GitHub (Issues, Projects, Pull Requests) para organizar, rastrear e executar nosso trabalho de forma transparente e eficiente.

## O Ponto de Partida: A GitHub Issue

**Nenhum código é escrito sem uma Issue correspondente.**

Toda tarefa, seja uma nova feature, um bug, uma melhoria ou uma dívida técnica, deve começar como uma **Issue**.

### Por que usar Issues?
- **Centralização**: A Issue é a "fonte da verdade" para uma tarefa. Toda a discussão, requisitos, dúvidas e decisões ficam documentados nela.
- **Rastreabilidade**: Sabemos exatamente por que cada linha de código foi escrita, conectando o commit ao Pull Request e à Issue original.
- **Planejamento**: Permite que a liderança do projeto priorize tarefas e as organize em sprints ou em um backlog.

### Como criar uma boa Issue:
1.  **Título Claro e Conciso**: Ex: "Criar componente de Card para o Dashboard".
2.  **Descrição Detalhada**:
    - **Contexto**: Qual o objetivo da tarefa? Por que ela é necessária?
    - **Critérios de Aceite**: Como saberemos que a tarefa foi concluída com sucesso? (Ex: "O card deve exibir um título, um ícone e um valor numérico").
    - **Anexos**: Inclua mockups, screenshots ou links relevantes.
3.  **Labels (Etiquetas)**: Use labels para categorizar a Issue (ex: `bug`, `feature`, `documentation`, `high-priority`).
4.  **Assignees (Responsáveis)**: Atribua a Issue a você mesmo ou a quem for responsável pela tarefa.
5.  **Project**: Adicione a Issue ao nosso quadro de projetos (Kanban board) para que todos possam ver seu status.

## O Ciclo de Vida de uma Tarefa

Nosso fluxo de trabalho conecta as ferramentas do GitHub em um ciclo lógico e rastreável.

**1. Planejamento (Backlog)**
- Uma nova tarefa é criada como uma **Issue** e adicionada ao quadro do **GitHub Projects** na coluna `Backlog` ou `To Do`.

**2. Início do Desenvolvimento (Em Andamento)**
- O desenvolvedor responsável atribui a Issue a si mesmo.
- No quadro de projetos, o card da Issue é movido para a coluna `In Progress`.
- O desenvolvedor **cria uma branch diretamente a partir da Issue** (o GitHub oferece um botão para isso), o que cria um vínculo automático e um nome de branch padronizado.

**3. Revisão (Em Revisão)**
- Ao final do desenvolvimento, o desenvolvedor abre um **Pull Request (PR)**.
- Na descrição do PR, ele usa uma palavra-chave para vincular a Issue (ex: `Closes #25`, `Fixes #25`).
- **Benefício**: Quando o PR for mergeado, a Issue será fechada automaticamente.
- O revisor é marcado no PR.
- No quadro de projetos, automações podem mover o card da Issue para a coluna `In Review`.

**4. Conclusão (Concluído)**
- Após a aprovação e o merge do PR, o código vai para a branch `main`.
- A Issue é fechada automaticamente (devido à palavra-chave no PR).
- O card no quadro de projetos é movido para a coluna `Done`.

Seguindo este fluxo, garantimos que todos na equipe tenham visibilidade total sobre o andamento do projeto, o histórico de cada decisão é preservado e nosso processo de desenvolvimento se torna mais organizado e previsível.
