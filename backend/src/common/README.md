# Common Module

Shared, cross-cutting utilities used across the backend.

## Contents

- `http-exception.filter.ts` — global exception filter that normalizes error responses into a consistent JSON shape. Registered in `main.ts` via `app.useGlobalFilters()`.

## Usage

Add reusable filters, interceptors, guards, pipes, and decorators here when they are not specific to a single feature module.
