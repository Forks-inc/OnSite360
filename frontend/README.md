# OnSite360 Frontend

The OnSite360 web client: an installable PWA built with **React 19**, **Vite**, and **TypeScript**. It consumes the [OnSite360 API](../backend/README.md) and provides the project management, scheduling, document, communication, and field-reporting interfaces.

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4** + **DaisyUI** for styling
- **Zustand** for client state, **React Query** for server state
- **React Router 7** for routing
- **Axios** API client with auth interceptors
- **Chart.js**, **Frappe Gantt**, **Leaflet**, **React Big Calendar** for data visualization
- **vite-plugin-pwa** for offline/installable support

## Getting Started

```bash
cp .env.example .env     # set VITE_API_URL
npm install
npm run dev              # http://localhost:5173
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Configuration

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:3000/v1`) |

## Project Structure

See [src/README.md](src/README.md) for a breakdown of the source tree.
