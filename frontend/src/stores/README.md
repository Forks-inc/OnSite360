# Stores

Global client state managed with [Zustand](https://github.com/pmndrs/zustand).

## Stores

| Store | Responsibility |
|-------|----------------|
| `useAuthStore` | Current session: JWT token, user, login/logout actions. Consumed by the Axios instance and route guards. |
| `useSystemStore` | App/UI state such as theme, sidebar, and global flags. |

## Conventions

- Keep server data in React Query; use stores only for client/UI state.
- Persist auth state as needed and clear it on logout/401.
