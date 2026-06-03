# Projects Module

The core domain module. Manages construction projects and everything attached to them: user assignments, crew members, issues, attendance, expenses, dashboards, and statistics.

## Base Route

`/v1/projects`

## Endpoints

### Projects
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/` | Create a project |
| GET    | `/` | List projects |
| GET    | `/dashboard` | Aggregate dashboard across projects |
| GET    | `/my-projects` | Projects for the current user |
| GET    | `/:id` | Get a project |
| GET    | `/:id/dashboard` | Per-project dashboard |
| GET    | `/:id/statistics` | Per-project statistics |
| PATCH  | `/:id` | Update a project |
| DELETE | `/:id` | Delete a project |

### Project Users
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/:id/users` | Assign a user to a project |
| GET    | `/:id/users` | List assigned users |
| PUT    | `/:id/users/:userId` | Update an assignment |
| DELETE | `/:id/users/:userId` | Remove an assignment |
| GET    | `/users/:userId/projects` | Projects for a given user |

### Crew Members
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/crew-members` | Create a crew member |
| GET    | `/crew-members` | List crew members |
| GET    | `/crew-members/:crewMemberId` | Get a crew member |
| PATCH  | `/crew-members/:crewMemberId` | Update a crew member |
| DELETE | `/crew-members/:crewMemberId` | Delete a crew member |
| GET    | `/:id/crew-members` | Crew on a project |
| POST   | `/:id/crew-members/:crewMemberId` | Assign crew to a project |
| DELETE | `/:id/crew-members/:crewMemberId` | Unassign crew |

### Issues
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/issues` | List all issues |
| POST   | `/:id/issues` | Report an issue on a project |
| GET    | `/:id/issues` | List project issues |
| GET    | `/:id/issues/:issueId` | Get an issue |
| PATCH  | `/:id/issues/:issueId` | Update an issue |
| DELETE | `/:id/issues/:issueId` | Delete an issue |

### Attendance
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/:id/attendance` | Create attendance for a date |
| POST   | `/:id/attendance/:date/mark` | Mark attendance records |
| GET    | `/:id/attendance` | List attendance |
| GET    | `/:id/attendance/:date` | Attendance for a date |
| PATCH  | `/:id/attendance/:date` | Update attendance |
| DELETE | `/:id/attendance/:date` | Delete attendance |

### Expenses
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/:id/expenses` | Add an expense |
| GET    | `/:id/expenses` | List expenses |
| GET    | `/:id/expenses/:expenseId` | Get an expense |
| PATCH  | `/:id/expenses/:expenseId` | Update an expense |
| DELETE | `/:id/expenses/:expenseId` | Delete an expense |

## Key Files

- `projects.controller.ts` / `projects.service.ts`
- `dto/` — project, crew member, issue, attendance, expense, and assignment DTOs
- `entities/` — `project.entity.ts`, `issue.entity.ts`

## Related Models

`Project`, `UserProject`, `CrewMember`, `CrewAssignment`, `Issue`, `ProjectAttendance`, `AttendanceRecord`, `Expense`.
