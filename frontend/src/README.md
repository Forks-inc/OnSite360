# Frontend Source

Structure of the OnSite360 React client.

```
src/
├── api/         # Axios instance and HTTP configuration
├── assets/      # Static assets (images, icons)
├── components/  # Reusable UI components
├── hooks/       # Data-fetching and utility hooks
├── pages/       # Route-level views
├── stores/      # Zustand global state stores
├── styles/      # Global styles and Tailwind layers
├── types/       # Shared TypeScript types
├── utils/       # Helper utilities
├── App.tsx      # Root component and route definitions
└── main.tsx     # Application entry point
```

## Data Flow

1. **`api/axiosInstance.ts`** configures the base URL and attaches the JWT from the auth store.
2. **`hooks/`** wrap React Query around the API for each domain (projects, tasks, documents, etc.).
3. **`stores/`** hold client state (auth session, system/UI state) with Zustand.
4. **`pages/`** compose hooks and components into full views; routing and guards live in `App.tsx`.

## Folder Guides

- [api/README.md](api/README.md)
- [components/README.md](components/README.md)
- [hooks/README.md](hooks/README.md)
- [pages/README.md](pages/README.md)
- [stores/README.md](stores/README.md)
