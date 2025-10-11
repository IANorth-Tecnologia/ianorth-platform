# Guia de Versionamento e Padrão de Branches

Este documento descreve o modelo de branches (branching model) e o fluxo de trabalho Git que devemos seguir em todos os projetos da organização. O objetivo é manter nosso histórico de commits organizado, facilitar a colaboração e garantir que a branch `main` esteja sempre estável.

## A Branch Principal: `main`

A branch `main` é a nossa fonte da verdade. Ela representa o código estável e pronto para produção.

- **NUNCA** envie commits diretamente para a `main`.
- Todo o código na `main` deve ter passado por um Pull Request e pela aprovação de pelo menos um outro membro da equipe.
- A `main` deve estar sempre em um estado "buildável", ou seja, sem quebrar a aplicação.

## Padrão de Nomenclatura das Branches

Todo trabalho novo deve ser feito em uma branch separada, criada a partir da `main`. Usamos prefixos para categorizar o propósito de cada branch.

### **`feature/...`**
Usada para desenvolver novas funcionalidades para a aplicação.

- **Exemplo**: `feature/tela-de-login`
- **Exemplo**: `feature/integracao-api-contagem`

### **`fix/...`**
Usada para corrigir bugs em funcionalidades existentes.

- **Exemplo**: `fix/ajuste-layout-mobile-dashboard`
- **Exemplo**: `fix/contador-nao-reinicia`

### **`chore/...`**
Usada para tarefas que não adicionam funcionalidades nem corrigem bugs, mas são necessárias para o projeto.
- **Exemplos**: Atualizar dependências, refatorar código, ajustar configurações de build, melhorar a documentação.
- **Exemplo**: `chore/atualizar-react-para-versao-18`
- **Exemplo**: `chore/adicionar-documentacao-do-componente-video`

## Fluxo de Trabalho Passo a Passo

Siga este ciclo para toda e qualquer tarefa.

**1. Sincronize sua `main` local**
Antes de iniciar qualquer trabalho, garanta que sua branch `main` local está idêntica à do repositório remoto.

```bash
git checkout main
git pull origin main
```

**2. Crie sua nova branch**
Crie sua branch a partir da `main`, seguindo o padrão de nomenclatura.

```bash
# Exemplo para uma nova funcionalidade
git checkout -b feature/nome-da-sua-feature

# Exemplo para uma correção
git checkout -b fix/descricao-do-bug
```

**3. Desenvolva e faça commits**
Trabalhe na sua branch. Faça commits pequenos, atômicos e com mensagens claras.

* **Escreva boas mensagens de commit**: Use o presente do imperativo (ex: "Adiciona" em vez de "Adicionado" ou "Adicionando").
* **Exemplo**: `git commit -m "feat: Adiciona componente de botão primário"`
* **Exemplo**: `git commit -m "fix: Corrige alinhamento do ícone no header"`

**4. Envie sua branch para o GitHub**
Quando estiver pronto para compartilhar seu trabalho ou abrir um Pull Request, envie sua branch para o repositório remoto.

```bash
git push -u origin feature/nome-da-sua-feature
```

**5. Abra um Pull Request (PR)**
No GitHub, abra um Pull Request da sua branch para a `main`.

- Escreva um título e uma descrição claros.
- Vincule a Issue que este PR resolve (ex: "Closes #12").
- Marque um ou mais colegas de equipe como revisores (`reviewers`).

**6. Participe da Revisão de Código (Code Review)**
Seu código será revisado. Esteja aberto a feedbacks e faça os ajustes necessários, enviando novos commits para a sua branch. O PR será atualizado automaticamente.

**7. Merge e Limpeza**
Após a aprovação, seu PR será "mergeado" na `main`. Depois do merge, sua branch de trabalho deve ser deletada para manter o repositório limpo.
