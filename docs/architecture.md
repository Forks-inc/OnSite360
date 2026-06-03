# System Architecture

OnSite360 is a three-tier construction management system: a PWA web client, a modular REST API, and a relational database, with an optional AI service.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript (PWA), Tailwind/DaisyUI, Zustand, React Query |
| Backend | NestJS 11 + TypeScript, Prisma ORM, Swagger/OpenAPI |
| Database | PostgreSQL |
| AI service | Ollama-compatible LLM (text generation + embeddings) |
| Runtime | Docker + Docker Compose |

> Note: `typeorm` is present as a dependency, but the active data layer is **Prisma** (`PrismaModule` / `PrismaService`), with the schema in `backend/prisma/schema.prisma`.

## High-Level Diagram

```
┌─────────────────────┐        HTTPS / REST (/v1)        ┌──────────────────────────┐
│   React PWA (Vite)   │  ───────────────────────────▶   │      NestJS API          │
│  Zustand + RQuery    │  ◀───────────────────────────   │  (modular controllers)   │
└─────────────────────┘            JSON / JWT             └───────────┬──────────────┘
                                                                      │ Prisma Client
                                                          ┌───────────▼──────────────┐
                                                          │       PostgreSQL          │
                                                          └──────────────────────────┘
                                                                      ▲
                                          axios (HTTP)                │
                                  ┌───────────────────────┐          │
                                  │  LLM service (Ollama) │◀─────────┘ (copilot module)
                                  └───────────────────────┘
```

## Backend Modules

The API is organized into feature modules, each with its own controller, service, DTOs, and entities:

`auth`, `users`, `projects`, `tasks`, `documents`, `communication`, `schedule`, `roles`, `permissions`, `notifications`, `copilot`, plus shared `common` and `prisma` infrastructure.

Each module has a README under `backend/src/<module>/README.md`.

## Cross-Cutting Concerns

- **API versioning** — URI-based, default `v1` (`/v1/...`).
- **Security** — Helmet headers, global `ValidationPipe`, JWT Bearer auth via `AuthGuard`, bcrypt password hashing.
- **Error handling** — global `HttpExceptionFilter` for consistent responses.
- **Static files** — uploaded documents served via `ServeStaticModule`.
- **API docs** — Swagger UI at `/debug`.
- **CORS** — configurable allowed origins (currently permissive for testing; restrict in production).

## Request Flow

1. The client authenticates at `/v1/auth/login` and stores the JWT (auth store).
2. The Axios instance attaches the token to subsequent requests.
3. `AuthGuard` validates the token (unless the route is `@Public()`).
4. Controllers validate input via DTOs and delegate to services.
5. Services use `PrismaService` to read/write PostgreSQL and return JSON.

## Data Model

See [prisma.md](prisma.md) for the full entity reference. Core entities include `User`, `Role`, `Permission`, `Project`, `Task`, `Document`, `Thread`, `Message`, `RFI`, `Schedule*`, `CrewMember`, `Issue`, `Expense`, and `Notification`.
