# Auth Module

Handles authentication and authorization for OnSite360. Issues JWT access and refresh tokens, registers users, and guards protected routes.

## Base Route

`/v1/auth`

## Endpoints

| Method | Path        | Description                          | Public |
|--------|-------------|--------------------------------------|--------|
| POST   | `/login`    | Authenticate and receive tokens      | Yes    |
| POST   | `/register` | Register a new user                  | Yes    |
| POST   | `/refresh`  | Exchange a refresh token for a new access token | Yes |

## How It Works

- Passwords are hashed with **bcrypt** (`BCRYPT_SALT_ROUNDS`).
- Access tokens are signed JWTs (`JWT_SECRET`, `JWT_EXPIRATION`).
- `AuthGuard` validates the `Authorization: Bearer <token>` header on protected routes.
- Routes annotated with the `@Public()` decorator bypass the guard.

## Key Files

- `auth.controller.ts` — login, register, refresh endpoints.
- `auth.service.ts` — credential validation and token issuance.
- `auth.guard.ts` — global JWT guard.
- `public.decorator.ts` — marks routes as public.
- `dto/` — `sign-in.dto.ts`, `register.dto.ts`, `refresh-token.dto.ts`.

## Configuration

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRATION` | Access token lifetime (e.g. `1h`) |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor |

## Related

See [roles](../roles/README.md) and [permissions](../permissions/README.md) for authorization rules.
