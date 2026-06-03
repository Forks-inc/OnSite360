# Permissions Module

Manages granular permissions that are assigned to roles to control access to features and resources.

## Base Route

`/v1/permissions`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/` | Create a permission |
| GET    | `/` | List permissions |
| GET    | `/:id` | Get a permission |
| PATCH  | `/:id` | Update a permission |
| DELETE | `/:id` | Delete a permission |

## Key Files

- `permissions.controller.ts` / `permissions.service.ts`
- `dto/` — `create-permission.dto.ts`, `update-permission.dto.ts`
- `entities/permission.entity.ts`

## Related Models

`Permission`, `Role`, `RolePermission`. See [roles](../roles/README.md) and [auth](../auth/README.md).
