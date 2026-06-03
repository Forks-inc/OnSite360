# Roles Module

Defines user roles and their associated permissions, forming the basis of role-based access control (RBAC).

## Base Route

`/v1/roles`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/` | Create a role |
| GET    | `/` | List roles |
| GET    | `/:id` | Get a role |
| PATCH  | `/:id` | Update a role |
| DELETE | `/:id` | Delete a role |

## Key Files

- `roles.controller.ts` / `roles.service.ts`
- `dto/` — `create-role.dto.ts`, `update-role.dto.ts`
- `entities/role.entity.ts`

## Related Models

`Role`, `Permission`, `RolePermission`, `User`. Permissions are attached via the `RolePermission` junction table. See [permissions](../permissions/README.md).
