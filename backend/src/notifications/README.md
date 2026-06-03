# Notifications Module

Creates and manages in-app notifications for users. This module exposes a service consumed by other modules rather than its own controller; notification read/list endpoints are surfaced through the [users module](../users/README.md).

## Public Surface

- `GET /v1/users/:id/notifications` — list a user's notifications.
- `PATCH /v1/users/:id/notifications/:notificationId/read` — mark as read.

## Key Files

- `notifications.module.ts`
- `notifications.service.ts` — create and query notifications; injected into other services to emit events (e.g. task assignment, new message).

## Related Models

`Notification`, `User`.
