# Security Policy

## Supported Versions

The latest release on the `main` branch receives security updates.

| Version | Supported |
|---------|-----------|
| main    | ✅        |

## Reporting a Vulnerability

Please report security vulnerabilities responsibly:

- **Do not** open a public issue for security problems.
- Email the maintainers with a description, reproduction steps, and potential impact.
- You will receive an acknowledgment, and we will work with you on a fix and disclosure timeline.

## Security Practices

OnSite360 follows these baseline practices:

- **Authentication** — JWT Bearer tokens with bcrypt-hashed passwords.
- **HTTP hardening** — Helmet security headers on all responses.
- **Input validation** — global `ValidationPipe` with `class-validator` DTOs.
- **CORS** — configurable allowed origins (tighten from `*` in production).
- **Secrets** — never commit `.env` files; use environment variables.

## Hardening Checklist for Production

- [ ] Restrict CORS `origin` to known frontends.
- [ ] Use strong, rotated `JWT_SECRET` values.
- [ ] Serve over HTTPS behind a reverse proxy.
- [ ] Run database with least-privilege credentials.
- [ ] Keep dependencies patched (`npm audit`).
