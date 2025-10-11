# Documento de Requisitos de Software: IANorth - Plataforma de Análise por Visão Computacional

**Versão:** 1.0  
**Data:** 06 de Outubro de 2025

## 1. Introdução

### 1.1. Propósito do Documento
Este documento define os requisitos funcionais e não funcionais para a primeira versão da Plataforma de Análise por Visão Computacional da IANorth. Ele servirá como guia para a equipe de desenvolvimento, garantindo que o produto final atenda aos objetivos de negócio e aos padrões técnicos estabelecidos.

### 1.2. Visão Geral do Projeto
O projeto consiste no desenvolvimento de um sistema completo para monitoramento e análise em tempo real de processos industriais através de câmeras IP. A primeira aplicação será a contagem de vergalhões em lotes. O sistema será composto por um backend de Inteligência Artificial (ianorth-api) e um frontend de visualização web (ianorth-web), implantados em um servidor local com suporte a GPU.

### 1.3. Escopo
A versão 1.0 do projeto focará em:

- Implementar a contagem de vergalhões para múltiplas câmeras.
- Fornecer uma interface de operador para visualização em tempo real e seleção de câmera.
- Armazenar um registro histórico de todos os lotes contados.
- Estabelecer uma arquitetura escalável e robusta usando Docker.

Funcionalidades como relatórios avançados, painéis de BI e um sistema de alerta complexo estão fora do escopo da v1.0, mas a arquitetura deve permitir sua implementação futura.

## 2. Descrição Geral

### 2.1. Perspectiva do Produto
Esta plataforma é um produto estratégico para a IANorth, posicionando a empresa como uma provedora de soluções de Indústria 4.0. Ela automatiza processos de contagem e monitoramento que hoje são manuais, reduzindo erros, aumentando a eficiência e gerando dados valiosos para a otimização de processos.

### 2.2. Funções Principais
- Monitoramento de vídeo ao vivo de múltiplas fontes.
- Contagem de objetos em tempo real com IA.
- Seleção dinâmica da fonte de vídeo para visualização.
- Registro automático de eventos de produção (lotes concluídos).
- Interface web para operadores.

### 2.3. Características dos Usuários
- **Operador de Pátio/Linha de Produção:** Usuário principal que irá monitorar a contagem e o status dos lotes através do dashboard.
- **Supervisor de Produção:** Usuário que poderá, futuramente, consultar o histórico de lotes para análise de produtividade.
- **Administrador do Sistema:** Responsável por configurar câmeras e manter o sistema.

## 3. Requisitos Funcionais (RF)

### RF-01: Visualização de Câmeras
O sistema deve ser capaz de exibir o stream de vídeo de uma câmera IP selecionada em tempo real na interface web.

### RF-02: Seleção Dinâmica de Câmeras
- A interface web (ianorth-web) deve exibir uma lista de todas as câmeras disponíveis para monitoramento.
- O operador deve poder selecionar uma câmera da lista para torná-la a fonte de vídeo e dados principal no dashboard.

### RF-03: Exibição de Dados em Tempo Real
- Para a câmera selecionada, o dashboard deve exibir a contagem atual de objetos (vergalhões) fornecida pelo modelo de IA.
- A exibição deve ser atualizada em tempo real (baixa latência).
- O dashboard deve exibir a meta de contagem para o lote (ex: 350) e o progresso atual.

### RF-04: Persistência de Dados de Lotes
O sistema deve detectar o início e o fim da contagem de um lote.  
Ao final da contagem de um lote, o backend (ianorth-api) deve registrar as seguintes informações no banco de dados:

- ID único do Lote.
- ID da Câmera que realizou a contagem.
- Data e hora de início da contagem.
- Data e hora de conclusão da contagem.
- Contagem final de objetos.
- Status (ex: "Concluído").

### RF-05: Exposição de API de Câmeras
O backend deve fornecer um endpoint REST (`GET /api/v1/cameras`) que retorna uma lista de todas as câmeras configuradas no sistema, para que o frontend possa construir a interface de seleção.

## 4. Requisitos Não Funcionais (RNF)

### RNF-01: Desempenho
- O processamento da IA deve utilizar a aceleração por GPU disponível no servidor para garantir a análise em tempo real.
- A latência entre um evento ocorrer na câmera e ser exibido no frontend deve ser minimizada.

### RNF-02: Escalabilidade
- A arquitetura deve suportar o monitoramento de múltiplas câmeras simultaneamente.
- A adição de novas câmeras ao sistema não deve exigir alterações no código-fonte, apenas na configuração e na orquestração dos serviços (Docker Compose).

### RNF-03: Tecnologia (Stack)
- **Backend (ianorth-api):** Python 3.9+, FastAPI, SQLAlchemy, OpenCV, Ultralytics.
- **Frontend (ianorth-web):** React 18+, TypeScript, Tailwind CSS.
- **Banco de Dados:** PostgreSQL (Produção), SQLite (Desenvolvimento).
- **Comunicação em Tempo Real:** WebSockets.
- **Fila de Mensagens:** Redis (para comunicação interna entre workers e gateway).

### RNF-04: Implantação (Deployment)
- Todos os serviços de backend (API, Workers, DB, Redis) devem ser containerizados com Docker.
- A orquestração dos serviços será feita com Docker Compose.
- O ambiente de implantação primário é um servidor local (self-hosted) com sistema operacional Windows e GPU NVIDIA.

### RNF-05: Versionamento de Código
- O código-fonte de ambos os projetos (backend e frontend) será versionado usando Git e hospedado em uma organização no GitHub.
- A equipe seguirá o modelo de Feature Branch Workflow com Pull Requests para revisão de código.

### RNF-06: Manutenibilidade
- O código do backend seguirá os princípios da Arquitetura Limpa, separando as camadas de API, serviços (lógica de negócio) e dados.
- O código do frontend seguirá uma arquitetura baseada em componentes, com separação de páginas, componentes reutilizáveis e hooks.

### RNF-07: Portabilidade (Consideração Futura)
A arquitetura deve ser modular o suficiente para permitir a criação de uma versão offline no futuro (usando Electron), reaproveitando a maior parte do código do frontend e da lógica de IA.

## 5. Arquitetura do Sistema (Online)
O sistema seguirá uma arquitetura de microsserviços para o backend:

[Câmeras] ---> [Workers de Inferência (Docker, 1 por câmera)] ---> [Redis (Fila)] ---> [Gateway API (Docker/FastAPI)] <--> [ianorth-web (React)]

## 6. Glossário
- **Worker:** Um contêiner Docker responsável por processar o stream de uma única câmera com o modelo de IA.
- **Gateway:** Um contêiner Docker com FastAPI responsável por gerenciar as conexões com o frontend e distribuir os dados recebidos dos workers.
- **Lote:** Um conjunto de objetos (vergalhões) cuja contagem é o objetivo principal do sistema.
- **Self-Hosting:** Implantação e gerenciamento da aplicação no servidor próprio da empresa, em vez de um provedor de nuvem.

