# 🦉 ITXStudie

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white"/>
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"/>
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge"/>
</p>

> Um **study tracker fullstack** pessoal — pensado para registrar, organizar e visualizar sessões de estudo com ciclos Study/Break customizáveis.

---

## ✨ Funcionalidades

- 📂 **Categorias & Tópicos** — Organize suas matérias em categorias e subdivida em tópicos específicos
- ⏱️ **Timer de Sessão** — Inicie e pare sessões de estudo vinculadas a qualquer tópico
- 🔄 **Study Circles** — Ciclos cronometrados (tipo Pomodoro) totalmente customizáveis: defina quantas fases quiser, alterne Study/Break com durações livres
- 🎡 **CycleWheel** — Visualização animada do progresso dentro de um ciclo
- 📊 **Histórico** — Registro persistente de todas as sessões com data, duração e tópico *(em desenvolvimento)*
- 📈 **Analytics** — Dashboard de horas por matéria *(planejado)*

---

## 🏗️ Arquitetura

```
ITXStudie/
├── backend/    → NestJS + Prisma ORM + PostgreSQL  (porta 3001)
└── frontend/   → Next.js 16 (App Router) + Zustand (porta 3000)
```

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, TypeScript, Zustand |
| Backend | NestJS, TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL 16 |
| HTTP Client | Axios |
| Container DB | Podman (ou Docker) |

---

## 🚀 Setup Local

### Pré-requisitos

- [Node.js](https://nodejs.org) v20+
- [Podman](https://podman.io) ou Docker
- npm

### 1. Clone o repositório

```bash
git clone https://github.com/ITX-Duda/ITXStudie.git
cd ITXStudie
```

### 2. Suba o banco de dados PostgreSQL

```bash
# Com Podman
podman run -d \
  --name itxstudie-postgres \
  -e POSTGRES_USER=itxstudie \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=itxstudie_db \
  -p 5432:5432 \
  postgres:16-alpine

# Ou com Docker
docker run -d \
  --name itxstudie-postgres \
  -e POSTGRES_USER=itxstudie \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=itxstudie_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Configure o backend

```bash
cd backend

# Copie o arquivo de variáveis e ajuste se necessário
cp ../.env.example .env
# → Edite DATABASE_URL se suas credenciais forem diferentes

npm install
npx prisma migrate deploy   # aplica as migrations
npm run start:dev           # servidor na porta 3001
```

### 4. Configure o frontend

```bash
cd ../frontend

# Crie o arquivo de ambiente local
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local

npm install
npm run dev                 # app na porta 3000
```

### 5. Acesse

Abra [http://localhost:3000](http://localhost:3000) no browser.

---

## 📡 API — Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check do servidor |
| POST | `/sessions/start` | Inicia uma sessão |
| PATCH | `/sessions/:id/stop` | Para uma sessão |
| GET | `/sessions/user/:userId` | Lista sessões do usuário |
| POST | `/categories` | Cria categoria |
| GET | `/categories/user/:userId` | Lista categorias |
| POST | `/topics` | Cria tópico |
| GET | `/topics/user/:userId` | Lista tópicos |
| POST | `/circles` | Cria um Study Circle |
| GET | `/circles/user/:userId` | Lista circles do usuário |
| GET | `/circles/:id` | Detalhe de um circle |
| DELETE | `/circles/:id` | Remove um circle |
| POST | `/circles/:id/run` | Inicia execução de um circle |
| GET | `/circles/runs/:runId` | Estado atual do run |
| PATCH | `/circles/runs/:runId/next` | Avança para a próxima fase |
| PATCH | `/circles/runs/:runId/abandon` | Abandona o run |

---

## 🗺️ Roadmap

### ✅ Fase 1 — Alpha (concluída)
- [x] Arquitetura fullstack (NestJS + Next.js + Prisma)
- [x] Schema completo: User, Session, Category, Topic, StudyCircle, CirclePhase, CircleRun
- [x] Todos os endpoints da API
- [x] Study Circles com CycleWheel animado
- [x] Timer por fase com avanço automático

### 🔧 Fase 2 — Auth & Qualidade
- [ ] Autenticação JWT (signup/login)
- [ ] Proteção de rotas no frontend
- [ ] Páginas de Categorias e Tópicos com CRUD completo
- [ ] Histórico de sessões na dashboard
- [ ] Responsividade mobile

### 📱 Fase 3 — PWA & Multi-dispositivo
- [ ] Progressive Web App (instalável no celular/tablet)
- [ ] Acesso remoto via Tailscale (sem custo de hospedagem)
- [ ] Notificações de fim de fase

### 📊 Fase 4 — Analytics & ML
- [ ] Dashboard de horas por matéria (Recharts)
- [ ] Export de dados (CSV/JSON)
- [ ] Modelo de recomendação de horários (FastAPI + Python)

---

## 📁 Estrutura de Pastas

```
ITXStudie/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         ← modelos do banco
│   │   └── migrations/
│   └── src/
│       ├── categories/           ← módulo de categorias
│       ├── circles/              ← módulo de Study Circles
│       ├── sessions/             ← módulo de sessões
│       ├── topics/               ← módulo de tópicos
│       └── prisma/               ← serviço Prisma singleton
├── frontend/
│   └── src/
│       ├── app/                  ← rotas (App Router)
│       │   ├── circles/          ← lista e execução de circles
│       │   └── page.tsx          ← dashboard principal
│       ├── components/
│       │   ├── circles/          ← CircleBuilder, CircleCard, CircleRunner, CycleWheel
│       │   └── timer/            ← componente de timer avulso
│       ├── lib/
│       │   └── api.ts            ← cliente Axios centralizado
│       └── store/                ← Zustand stores (user, session, circle)
├── scripts/
│   └── seed-cronograma.js        ← seed de dados de exemplo
└── .env.example                  ← template de variáveis de ambiente
```

---

## 📝 Licença

Projeto pessoal desenvolvido como jornada de aprendizado em arquitetura fullstack.

---

*Desenvolvido por Duda — como estudo de software, produtividade e código.*
