# Components

Reusable, presentational UI building blocks shared across pages.

## Inventory

| Component | Purpose |
|-----------|---------|
| `AppLayout` | App shell wrapping nav and routed content |
| `SideBar`, `TopNav`, `HorizontalNav` | Navigation |
| `ProtectedRoute` | Gate routes behind authentication |
| `PermissionRoute` | Gate routes behind a permission |
| `NotAllowed` | Access-denied UI |
| `Button`, `TextInput`, `PasswordInput`, `TagsInput` | Form controls |
| `StatCard` | Dashboard metric card |
| `LoadingSpinner` | Async loading indicator |
| `Error` | Error display |
| `P5Background` | Animated background |

## Conventions

- Keep components presentational; fetch data in `hooks/` and pass props down.
- Style with Tailwind utility classes and DaisyUI components.
