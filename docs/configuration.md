# Configuration

OnSite360 is configured through environment variables. Templates are provided as `.env.example` files; copy them to `.env` and fill in values. Never commit real `.env` files.

## Root (`.env`)

Used by Docker Compose for the PostgreSQL service.

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `user` |
| `POSTGRES_PASSWORD` | Database password | `pass` |
| `POSTGRES_DB` | Database name | `onsite360` |
| `DATABASE_URL` | Full connection string | `postgresql://user:pass@localhost:5432/onsite360` |

## Backend (`backend/.env`)

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret used to sign JWTs | `your_secure_secret_key_here` |
| `JWT_EXPIRATION` | Access token lifetime | `1h` |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor | `10` |
| `LLM_SERVICE_URL` | Ollama-compatible API base URL | `http://localhost:11434/api` |
| `LLM_MODEL_NAME` | Text generation model | `llama3` |
| `EMBEDDING_MODEL_NAME` | Embedding model | `nomic-embed-text` |
| `MAIL_IMAP_HOST` | IMAP host for inbound email sync | `imap.example.com` |
| `MAIL_IMAP_PORT` | IMAP port | `993` |
| `MAIL_IMAP_SECURE` | Use TLS for IMAP | `true` |
| `MAIL_SMTP_HOST` | SMTP host for outbound email | `smtp.example.com` |
| `MAIL_SMTP_PORT` | SMTP port | `465` |
| `MAIL_SMTP_SECURE` | Use TLS for SMTP | `true` |
| `MAIL_USERNAME` | Mailbox username | `pm@example.com` |
| `MAIL_PASSWORD` | Mailbox password or app password | — |
| `MAIL_FROM` | Default sender address | `pm@example.com` |
| `MAIL_SYNC_ENABLED` | Enables scheduled inbox sync when implemented by runtime | `false` |
| `MAIL_SYNC_INTERVAL_SECONDS` | Inbox sync interval | `300` |

## Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:3000/v1` |

## Notes

- The backend reads variables via `@nestjs/config`.
- Vite only exposes variables prefixed with `VITE_` to the client.
- For production, set strong secrets, a non-permissive CORS origin (in `backend/src/main.ts`), and a managed PostgreSQL `DATABASE_URL`.
