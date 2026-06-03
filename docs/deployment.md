# Deployment Guide

This guide covers deploying OnSite360 with Docker and to common cloud targets.

## 1. Docker Compose (single host)

The repository ships a `docker-compose.yml` defining PostgreSQL and the application services.

```bash
# from the repository root
cp .env.example .env          # set POSTGRES_* and DATABASE_URL
docker-compose up -d --build
```

To run only the database (and run apps locally):

```bash
docker-compose up -d postgres
```

Stop everything:

```bash
docker-compose down
```

## 2. Backend

The backend is a standard NestJS app and ships a `Dockerfile`.

```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy      # apply migrations in production
npm run build
node dist/main                 # or: npm run start:prod
```

The API listens on port **3000**. A `vercel.json` is included for serverless deployment on Vercel.

### Pre-flight checklist

- [ ] `DATABASE_URL` points to the production database.
- [ ] `JWT_SECRET` is strong and unique.
- [ ] CORS `origin` in `src/main.ts` is restricted to your frontend domain(s).
- [ ] Run `npx prisma migrate deploy` before starting.
- [ ] (Optional) Seed baseline data: `npm run seed`.

## 3. Frontend

The frontend is a static Vite/PWA build and ships a `Dockerfile`.

```bash
cd frontend
npm ci
# set VITE_API_URL to the public API URL at build time
npm run build                  # outputs to dist/
```

Serve `dist/` from any static host (Nginx, Vercel, Netlify, S3+CloudFront). Because Vite inlines `VITE_*` variables at build time, rebuild when the API URL changes.

## 4. Database

- Use a managed PostgreSQL instance in production.
- Apply schema changes with `npx prisma migrate deploy`.
- Back up regularly and use least-privilege credentials.

## 5. AI Copilot (optional)

The copilot proxies to an Ollama-compatible service. Run Ollama (or a compatible endpoint) reachable at `LLM_SERVICE_URL`, and pull the configured models (`llama3`, `nomic-embed-text`). The copilot is optional and the rest of the app functions without it.

## Health & Observability

- Swagger UI: `https://<api-host>/debug`
- Logs: standard NestJS logger to stdout (capture via your platform).
