# Contributing to OnSite360

Thanks for your interest in improving OnSite360. This guide covers how to set up your environment, our branching and commit conventions, and the pull request process.

## Getting Started

1. Fork and clone the repository.
2. Follow the [Quick Start](README.md#quick-start) to run the backend and frontend.
3. Create a feature branch from `main`.

## Branching Model

- `main` — stable, deployable.
- `feature/<short-description>` — new features.
- `fix/<short-description>` — bug fixes.
- `chore/<short-description>` — tooling, docs, refactors.

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

Example: `feat(projects): add expense tracking endpoint`

## Code Style

- TypeScript across backend and frontend.
- Run linters and formatters before committing:

```bash
# backend
cd backend && npm run lint && npm run format
# frontend
cd frontend && npm run lint
```

- Follow the conventions in [docs/best_practices.md](docs/best_practices.md).

## Backend Guidelines

- One feature per NestJS module (`controller`, `service`, `dto/`, `entities/`).
- Validate all input with `class-validator` DTOs.
- Document endpoints with Swagger decorators.
- Update the Prisma schema and create a migration for any data model change:

```bash
npx prisma migrate dev --name <change>
```

## Frontend Guidelines

- Functional components and hooks only.
- Use React Query for server state and Zustand for client state.
- Keep page components in `src/pages`, reusable UI in `src/components`.

## Testing

```bash
cd backend
npm run test       # unit
npm run test:e2e   # end-to-end
npm run test:cov   # coverage
```

Add or update tests for any behavior change.

## Pull Requests

1. Ensure lint, format, and tests pass.
2. Update relevant documentation (README, module README, or `docs/`).
3. Keep PRs focused and small where possible.
4. Fill in the PR description with context and screenshots for UI changes.
5. Request review and address feedback.

## Reporting Bugs

Open an issue with reproduction steps, expected vs. actual behavior, and environment details.
