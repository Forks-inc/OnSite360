# Hooks

Custom React hooks, primarily React Query wrappers around the API plus UI utilities.

## Data Hooks

| Hook | Domain |
|------|--------|
| `useProjects` | Projects, dashboards, assignments |
| `useTasks` | Tasks and comments |
| `useSchedule` | Phases, events, daily logs |
| `useDocuments` | Document upload and retrieval |
| `useCommunication` | Threads, messages, RFIs |
| `useUsers` | User management |
| `useRoles` | Roles |
| `usePermissions` | Permissions |
| `useCopilot` | AI copilot calls |

## Utility Hooks

| Hook | Purpose |
|------|---------|
| `useResponsive` | Breakpoint/viewport helpers |
| `useLoadingSpinner` | Manage spinner state/presets |
| `useTranslation` | i18n string lookup |

## Conventions

- One hook per domain; expose query and mutation functions.
- Use stable query keys for cache invalidation.
