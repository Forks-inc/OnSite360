# Pages

Route-level views composed from hooks and components. Routing and access guards are defined in `App.tsx`.

## Views

| Page | Purpose |
|------|---------|
| `Login` | Authentication |
| `Home`, `Dashboard` | Landing and overview |
| `Project`, `projectManagement`, `ProjectOversight` | Project views |
| `TaskManagement` | Tasks and comments |
| `ScheduleManagement` | Phases, events, calendar |
| `DailyLogsManagement` | Field daily logs |
| `DocumentManagement` | Documents and RFIs |
| `Communication` | Threads and messaging |
| `Construction`, `WorkforceManagement`, `EmployeeManagement` | Field & crew |
| `IssueReporting`, `RiskManagement` | Issues and risk |
| `Copilot` | AI assistant |
| `Notifications` | User notifications |
| `UserManagement`, `RoleManagement`, `PermissionManagement` | Admin/RBAC |
| `DashboardReports`, `DashboardSettings`, `SystemLogs`, `Integrations` | Admin tooling |
| `AccessDenied`, `NotFound` | Error states |

## Conventions

- Keep data fetching in hooks; pages orchestrate layout and interactions.
- Wrap protected pages with `ProtectedRoute` / `PermissionRoute`.
