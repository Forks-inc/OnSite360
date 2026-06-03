# Prisma Module

Wraps the Prisma Client as an injectable NestJS service, providing database access to all feature modules.

## Contents

- `prisma.service.ts` — extends `PrismaClient`, manages connection lifecycle (`onModuleInit` / `onModuleDestroy`).
- `prisma.module.ts` — exports `PrismaService` for dependency injection.

## Usage

Inject `PrismaService` into any service:

```ts
constructor(private readonly prisma: PrismaService) {}
```

## Schema & Migrations

The data model lives in `backend/prisma/schema.prisma`.

```bash
npx prisma generate            # regenerate the client
npx prisma migrate dev --name <change>   # create & apply a migration
npm run seed                   # populate baseline data
```

See [docs/prisma.md](../../../docs/prisma.md) for the full data model reference.
