# Communication Module

Provides messaging and RFI (Request For Information) workflows: discussion threads, messages with attachments, and RFI lifecycle management.

## Base Route

`/v1/communication`

## Endpoints

### Threads
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/threads` | Create a thread |
| GET    | `/threads` | List threads |
| GET    | `/threads/:id` | Get a thread |
| PATCH  | `/threads/:id` | Update a thread |
| POST   | `/threads/:id/users` | Add participants |
| DELETE | `/threads/:threadId/users/:userId` | Remove a participant |
| GET    | `/threads/:id/participants` | List participants |
| GET    | `/threads/:id/messages` | List thread messages |

### Messages
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/messages` | Send a message |
| POST   | `/messages/with-attachments` | Send a message with files |
| PATCH  | `/messages/:id` | Edit a message |
| DELETE | `/messages/:id` | Delete a message |

### RFIs
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/rfis` | Create an RFI |
| GET    | `/rfis` | List RFIs |
| GET    | `/rfis/:id` | Get an RFI |
| PATCH  | `/rfis/:id` | Update an RFI |
| DELETE | `/rfis/:id` | Delete an RFI |

## Key Files

- `communication.controller.ts` / `communication.service.ts`
- `dto/` — `create-communication.dto.ts`, `update-communication.dto.ts`
- `entities/communication.entity.ts`

## Related Models

`Thread`, `Message`, `RFI`, `User`. See the dedicated guide in [docs/communication-api.md](../../../docs/communication-api.md).
