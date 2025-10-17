# Documentação: A História do Nosso Projeto

Esta é a jornada que percorremos juntos para chegar à arquitetura final.

---

## Fase 1: Concepção e Prototipagem Rápida

**Objetivo Inicial:** Criar uma interface web para visualizar a contagem de vergalhões de um modelo de IA.

**Decisões:**

- **Tecnologias:** React com TypeScript para o frontend (`ianorth-web`) e Tailwind CSS para estilização.
- **Abordagem:** "Frontend-first", com dados simulados (mock data) para agilizar o desenvolvimento, desacoplado do backend.
- **Primeira Versão:** Componentes `VideoFeed` (GIF como placeholder) e `AnalysisPanel` (simulação com `useEffect` e `setInterval`).

---

## Fase 2: Refinamento de Design e Experiência do Usuário

**Objetivo:** Alinhar a aparência da aplicação com a identidade visual da IANorth.

**Decisões:**

- **Inspiração:** Portfólio da IANorth, com paleta escura, profissional e acentos em azul.
- **Tokens de Design:** Padronização no `tailwind.config.js` com nomes semânticos (ex: `bg-background-primary`).
- **Dark/Light Mode:** Alternância de temas com `ThemeProvider` e `darkMode: 'class'` do Tailwind.

---

## Fase 3: Arquitetura do Backend e Escalabilidade

**Objetivo:** Backend robusto (`ianorth-api`) para processar vídeo em tempo real e escalar para múltiplas câmeras.

**Decisões:**

- **De Script a Serviço:** `ModeloYolo.py` transformado em API com FastAPI (suporte a WebSockets).
- **Conexão com Câmeras:** Protocolo RTSP com OpenCV.
- **Escalabilidade:** Arquitetura de microsserviços:
  - **Workers:** Um por câmera, responsável pela inferência.
  - **Fila de Mensagens (Redis):** Desacoplamento dos Workers.
  - **Gateway:** API FastAPI que comunica com o frontend via WebSockets.
- **Banco de Dados:** PostgreSQL (produção) e SQLite (desenvolvimento), com SQLAlchemy como ORM.

---

## Fase 4: Containerização e Implantação (DevOps)

**Objetivo:** Ambiente de desenvolvimento e produção consistente e profissional.

**Decisões:**

- **Containerização:** Docker para todos os serviços do backend.
- **Orquestração:** Docker Compose para gerenciar contêineres (`db`, `redis`, `gateway`, `workers`).
- **Ambientes Separados:**
  - **Desenvolvimento (MacBook):** `docker-compose.override.yml`, SQLite, Dockerfile ARM64 (M1).
  - **Produção (Windows):** `docker-compose.yml`, PostgreSQL, Dockerfile com imagem da ultralytics (suporte à GPU NVIDIA).
- **Gerenciamento do Servidor:** Acesso via SSH com `git pull` e `docker compose up`.

---

# Checklist Completo do Projeto

Este é o roteiro de tarefas para você e sua equipe. Pode ser usado para criar Issues no GitHub ou em qualquer ferramenta de gerenciamento.

## Configuração e Ambiente (Ambas as Equipes)

- [ ] Configurar a organização e os repositórios no GitHub (`ianorth-api`, `ianorth-web`)
- [ ] Implementar os arquivos `.gitignore` completos
- [ ] Adicionar documentação inicial (README, Guia de Branches, Documento de Requisitos)
- [ ] Backend: Configurar ambiente local com Docker e `docker-compose.override.yml`
- [ ] Frontend: Configurar ambiente local com Node.js, Vite e dependências do `package.json`

## Backend (`ianorth-api`) - Sua Responsabilidade

- [x] Criar estrutura base seguindo Arquitetura Limpa
- [x] Configurar `docker-compose.yml` com `db`, `redis`, `gateway`, `worker`
- [x] Criar `Dockerfile.gateway` e `Dockerfile.worker`
- [x] Implementar `healthcheck` no `docker-compose.yml`
- [ ] Implementar `inference_worker.py` (conexão com câmera, modelo `ver70.pt`, publicação no Redis)
- [ ] Lógica do banco de dados com SQLAlchemy:
  - [ ] Criar modelo `Lote` em `app/models/lote_model.py`
  - [ ] Garantir criação de tabelas no `main.py`
  - [ ] CRUD em `app/crud/lote_crud.py`
  - [ ] Integração do CRUD no `inference_worker.py`
  - [ ] Endpoint REST no Gateway: `GET /api/v1/lotes/historico`
- [ ] Configurar servidor de produção (Windows com GPU)
- [ ] Realizar primeiro deploy via SSH (`git pull`, `docker compose up -d`)

## Frontend (`ianorth-web`) - Para Delegar

- [ ] (Issue #1) Configurar projeto com Vite, React, TS, Tailwind CSS
- [ ] (Issue #1) Implementar `ThemeProvider` para modo dark/light
- [ ] (Issue #2) Construir `DashboardPage` com cabeçalho e botão `ThemeToggle`
- [ ] (Issue #3) Criar serviço `cameraService.ts` (`GET /api/v1/cameras`)
- [ ] (Issue #3) Implementar `CameraSelector.tsx` com botões dinâmicos
- [ ] (Issue #4) Criar hook `useCameraWebSocket.ts`
- [ ] (Issue #4) Implementar `AnalysisPanel.tsx` com dados em tempo real
- [ ] Criar componente `VideoFeed.tsx` (GIF placeholder)
- [ ] Página/seção "Histórico de Lotes" com dados do backend
- [ ] Build de produção (`npm run build`) e entrega da pasta `dist` para hospedagem no IIS


