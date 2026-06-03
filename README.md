# OnSite360

OnSite360 is a construction management platform that brings projects, crews, schedules, documents, communication, and field reporting into a single system. It pairs a **NestJS + Prisma + PostgreSQL** API with a **React + Vite (PWA)** web client and an optional on-device **AI copilot** powered by Ollama.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Project management** — projects, phases, dashboards, statistics, and per-project user assignments.
- **Task tracking** — tasks, comments, per-user task stats, and project summaries.
- **Scheduling** — project phases, calendar events, daily logs, and daily activities.
- **Field reporting** — issues/risk reporting, attendance, crew members, expenses.
- **Document management** — upload, classify, and serve project documents and RFIs.
- **Communication** — threads, messages (with attachments), and RFIs.
- **Access control** — JWT auth with roles and granular permissions.
- **Notifications** — in-app notifications for users.
- **AI copilot** — text generation and embeddings via a local LLM service.
- **PWA web client** — installable, offline-aware React frontend.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, DaisyUI, Zustand, React Query, React Router |
| Backend | NestJS 11, TypeScript, Prisma ORM, Swagger (OpenAPI) |
| Database | PostgreSQL |
| Auth | JWT (Bearer), bcrypt, Helmet |
| AI | Ollama-compatible LLM service (text + embeddings) |
| Tooling | Docker, Docker Compose, ESLint, Prettier, Jest |

## Architecture

The frontend is a single-page PWA that talks to the backend over a versioned REST API (`/v1`). The backend is a modular NestJS application using Prisma as the data layer over PostgreSQL. See [docs/architecture.md](docs/architecture.md) for diagrams and detail.

## Repository Layout

```
OnSite360/
├── backend/      # NestJS API (Prisma, PostgreSQL)
├── frontend/     # React + Vite PWA
├── docs/         # Project documentation
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended for PostgreSQL)
- An Ollama-compatible LLM service (optional, for the copilot)

### 1. Clone

```bash
git clone https://github.com/yourusername/OnSite360.git
cd OnSite360
```

### 2. Start the database

```bash
docker-compose up -d postgres
```

### 3. Backend

```bash
cd backend
cp .env.example .env        # then edit values
npm install
npx prisma generate
npx prisma migrate dev      # apply schema
npm run seed                # optional: baseline data
npm run start:dev
```

The API runs at `http://localhost:3000` (Swagger UI at `/debug`).

### 4. Frontend

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL
npm install
npm run dev
```

The web client runs at `http://localhost:5173`.

### Run everything with Docker

```bash
docker-compose up --build
```

## Configuration

Environment variables are documented in [docs/configuration.md](docs/configuration.md). Templates live in `.env.example`, `backend/.env.example`, and `frontend/.env.example`.

After seeding, an admin user is available: `admin@onsite360.com`.

## API Documentation

Interactive Swagger/OpenAPI docs are served at `http://localhost:3000/debug` when the backend is running. A high-level reference is in [docs/api.md](docs/api.md).

## Documentation

| Document | Description |
|----------|-------------|
| [docs/architecture.md](docs/architecture.md) | System architecture overview |
| [docs/api.md](docs/api.md) | REST API reference |
| [docs/prisma.md](docs/prisma.md) | Data model and Prisma usage |
| [docs/communication-api.md](docs/communication-api.md) | Communication module API |
| [docs/configuration.md](docs/configuration.md) | Environment variables |
| [docs/deployment.md](docs/deployment.md) | Deployment guide |
| [docs/best_practices.md](docs/best_practices.md) | Coding conventions |
| [docs/Development Environment Setup Guide.md](docs/Development%20Environment%20Setup%20Guide.md) | Full dev setup |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Report vulnerabilities per [SECURITY.md](SECURITY.md).

## License

Proprietary. See [LICENSE.md](LICENSE.md).
