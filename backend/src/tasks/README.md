# Tasks Module

Manages tasks and their comment threads for OnSite360 projects, plus per-user task statistics.

## Base Route

`/v1/tasks`

## Endpoints

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/` | Create a task |
| GET    | `/` | List tasks (filterable) |
| GET    | `/my-tasks` | Tasks assigned to the current user |
| GET    | `/project/:projectId/summary` | Task summary for a project |
| GET    | `/stats/user` | Task statistics for a user |
| GET    | `/:id` | Get a task |
| PATCH  | `/:id` | Update a task |
| DELETE | `/:id` | Delete a task |

### Comments
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/comments` | Add a comment to a task |
| GET    | `/:taskId/comments` | List comments for a task |
| PATCH  | `/comments/:commentId` | Edit your comment |
| DELETE | `/comments/:commentId` | Delete your comment |

## Key Files

- `tasks.controller.ts` / `tasks.service.ts`
- `dto/` — `create-task.dto.ts`, `update-task.dto.ts`, `create-comment.dto.ts`, `update-comment.dto.ts`
- `entities/` — `task.entity.ts`, `comment.entity.ts`

## Related Models

`Task`, `Comment`, `User`, `Project`.
