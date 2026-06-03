# API Layer

Centralized HTTP client for the backend.

## Contents

- `axiosInstance.ts` — a preconfigured Axios instance that:
  - sets the base URL from `VITE_API_URL`,
  - attaches the `Authorization: Bearer <token>` header from the auth store,
  - centralizes error handling (e.g. redirect on 401).

## Usage

Import the instance in hooks rather than calling Axios directly:

```ts
import api from "../api/axiosInstance";
const { data } = await api.get("/projects");
```
