# Documents Module

Handles upload, storage, classification, and retrieval of project documents. Files are stored on disk and served statically; metadata is persisted via Prisma.

## Base Route

`/v1/documents`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/upload` | Upload a document (multipart/form-data) |
| GET    | `/` | List documents |
| GET    | `/project/:projectId` | Documents for a project |
| GET    | `/user/:userId` | Documents uploaded by a user |
| GET    | `/:id` | Get document metadata |
| PATCH  | `/:id` | Update document metadata |
| DELETE | `/:id` | Delete a document |

## How It Works

- Uploads use **Multer**; binaries are written to the `uploads/` directory.
- The `ServeStaticModule` exposes stored files over HTTP.
- Each record links a file to a project and the uploading user.

## Key Files

- `documents.controller.ts` / `documents.service.ts`
- `dto/` — `create-document.dto.ts`, `update-document.dto.ts`
- `entities/document.entity.ts`

## Related Models

`Document`, `Project`, `User`, `RFI`.
