# Copilot Module

Provides AI-assisted text generation and embeddings backed by a local, Ollama-compatible LLM service. Used for in-app assistance and semantic features.

## Base Route

`/v1/copilot`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/generate` | Generate text from a prompt |

Additional DTOs exist for chat completion, embeddings, and search, supporting future endpoints.

## How It Works

- Requests are proxied to an external LLM service over HTTP (`axios`).
- Defaults: service URL `http://localhost:11434/api`, model `llama3`, embedding model `nomic-embed-text`.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_SERVICE_URL` | `http://localhost:11434/api` | Ollama-compatible API base URL |
| `LLM_MODEL_NAME` | `llama3` | Generation model |
| `EMBEDDING_MODEL_NAME` | `nomic-embed-text` | Embedding model |

## Key Files

- `copilot.controller.ts` / `copilot.service.ts`
- `dto/` — `text-generation.dto.ts`, `chat-completion.dto.ts`, `embedding.dto.ts`, `search.dto.ts`
- `types/ollama.types.ts`
