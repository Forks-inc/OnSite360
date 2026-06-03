# Users Module

Manages user accounts, their project assignments, and personal notifications.

## Base Route

`/v1/users`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/` | Create a user |
| GET    | `/` | List users |
| GET    | `/:id` | Get a user |
| PATCH  | `/:id` | Update a user |
| DELETE | `/:id` | Delete a user |
| GET    | `/:id/projects` | List a user's projects |
| GET    | `/:id/notifications` | List a user's notifications |
| PATCH  | `/:id/notifications/:notificationId/read` | Mark a notification as read |

## Key Files

- `users.controller.ts` / `users.service.ts`
- `dto/` — `create-user.dto.ts`, `update-user.dto.ts`, `assign-project.dto.ts`
- `entities/user.entity.ts`

## Related Models

`User`, `Role`, `UserProject`, `Notification` (see [docs/prisma.md](../../../docs/prisma.md)).
