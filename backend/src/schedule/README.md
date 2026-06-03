# Schedule Module

Manages time-based project data: project phases, calendar events, daily logs, and the daily activities recorded against those logs.

## Base Route

`/v1/schedule`

## Endpoints

### Project Phases
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/project-phases` | Create a phase |
| GET    | `/project-phases` | List phases |
| GET    | `/project-phases/:id` | Get a phase |
| PATCH  | `/project-phases/:id` | Update a phase |
| DELETE | `/project-phases/:id` | Delete a phase |

### Events
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/events` | Create an event |
| GET    | `/events` | List events |
| GET    | `/events/:id` | Get an event |
| PATCH  | `/events/:id` | Update an event |
| DELETE | `/events/:id` | Delete an event |

### Daily Logs
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/daily-logs` | Create a daily log |
| GET    | `/daily-logs` | List daily logs |
| GET    | `/daily-logs/by-date` | Daily logs filtered by date |
| GET    | `/daily-logs/:id` | Get a daily log |
| PATCH  | `/daily-logs/:id` | Update a daily log |
| DELETE | `/daily-logs/:id` | Delete a daily log |

### Daily Activities
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/daily-activities` | Create an activity |
| GET    | `/daily-activities` | List activities |
| GET    | `/daily-activities/:id` | Get an activity |
| PATCH  | `/daily-activities/:id` | Update an activity |
| DELETE | `/daily-activities/:id` | Delete an activity |

## Key Files

- `schedule.controller.ts` / `schedule.service.ts`
- `dto/` — `create-schedule.dto.ts`, `update-schedule.dto.ts`
- `entities/schedule.entity.ts`

## Related Models

`ProjectPhase`, `ScheduleEvent`, `DailyLog`, `DailyActivity`, `Project`, `User`.
