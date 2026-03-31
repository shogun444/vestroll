# VestRoll Backend Architecture

This document outlines the architectural patterns and best practices for the VestRoll backend, built with Next.js App Router and Drizzle ORM.

## Layered Architecture

The backend follows a strict **Service-Layer Architecture** to ensure separation of concerns and maintainability.

### 1. Route Handlers (`src/app/api/v1/*`)
- **Responsibility**: Entry points for the API. They handle HTTP concerns (status codes, cookies, headers).
- **Pattern**: Every route MUST be wrapped in the `withHandler` Higher-Order Function (HOF).
- **Logic**: Route handlers should be "thin". They should only validate input and call the appropriate service.

### 2. Service Layer (`src/server/services/*`)
- **Responsibility**: Core business logic.
- **Pattern**: Implemented as static classes.
- **Error Handling**: Services should throw specific `AppError` subclasses (e.g., `ConflictError`, `NotFoundError`). They should NOT return custom error objects.

### 3. Data Access Layer (`src/server/db/*`)
- **Responsibility**: Database schema and low-level queries.
- **Pattern**: Shared `db` instance using Drizzle ORM.
- **Transactions**: For multi-step database operations, services should accept an optional `tx` (Drizzle transaction) parameter.

### 4. Validation Layer (`src/server/validations/*`)
- **Responsibility**: Type-safe input validation.
- **Pattern**: Centralized Zod schemas. Schemas are passed to `withHandler` for automatic validation.

---

## Standardized Route Pattern (`withHandler`)

The `withHandler` HOF is the standardized way to define API routes. It provides:
1. **Automatic Error Handling**: Maps all `AppError` types to RFC 7807 (Problem Details).
2. **Unified Response Format**: Ensures every response follows the standard success/error envelope.
3. **Zod Validation**: Automatically parses and validates request bodies if a schema is provided.
4. **Metadata Extraction**: Injects client IP and User-Agent into the handler context.

### Example Usage:

```typescript
export const POST = withHandler(
  { schema: MyZodSchema },
  async (req, { body, metadata }) => {
    const result = await MyService.doSomething(body, metadata);
    return ApiResponse.success(result, "Action completed successfully");
  }
);
```

---

## Error Handling Standards

We use the **RFC 7807 (Problem Details for HTTP APIs)** standard for all error responses.

| Error Class | HTTP Status | Use Case |
|-------------|-------------|----------|
| `ValidationError` | 400 | Invalid request body or parameters |
| `UnauthorizedError` | 401 | Missing or invalid authentication |
| `ForbiddenError` | 403 | Authenticated but insufficient permissions |
| `NotFoundError` | 404 | Resource does not exist |
| `ConflictError` | 409 | Resource already exists (e.g., duplicate email) |
| `AppError` | Variable | Base class for all handled application errors |

---

## Security Best Practices
- **Cookies**: Sensitive tokens (like `refreshToken`) must be stored in `httpOnly`, `secure`, `sameSite: "strict"` cookies.
- **Validation**: Never trust client input. Always use Zod schemas for every incoming request.
- **Logging**: All unhandled 500 errors are logged with their request instance path for easier debugging.

---

# VestRoll Frontend Architecture

The frontend is a **Next.js 15 Client-Side Application** that interacts with the backend via a standardized API client.

## Layered Architecture

### 1. App Router (`src/app`)
- **Responsibility**: Routing, layouts, and page-level metadata.
- **Pattern**: Uses **Route Groups** (e.g., `(auth)`, `(dashboard)`) to decouple user roles and layout needs.

### 2. Component Organization (`src/components`)
Components are organized into three primary categories:
- **`ui/`**: Atomic primitive components (Button, Input, Checkbox).
- **`shared/`**: Reusable complex components that aren't specific to a single business feature.
- **`features/`**: High-level components containing business logic and feature-specific state.

### 3. API Layer (`src/lib/api`)
- **Responsibility**: Defining interfaces and services for backend communication.
- **Pattern**: All services MUST use the centralized `apiClient` in `src/lib/api-client.ts`.
- **Logic**: No business logic should reside in the API services; they should only act as typed wrappers for the API.

### 4. Global State (`src/lib/store.ts`)
- **Responsibility**: Managing global UI state (modals, toasts, theme).
- **Pattern**: Redux Toolkit for slices and global store configuration.

---

## Standardized API Client (`apiClient`)

The `apiClient` is a unified wrapper around the `fetch` API. It provides:
1. **Automatic Error Normalization**: Converts RFC 7807 problem details from the backend into a standardized `RequestError` on the frontend.
2. **Type Safety**: Supports generic types for all HTTP methods (`get<T>`, `post<T>`, etc.).
3. **Envelope Unwrapping**: Automatically unwraps the backend's `{ data: T }` success envelope.

### Example Usage:

```typescript
// Define service
export class MyService {
  static async getData() {
    return apiClient.get<MyDataType>("/api/v1/resource");
  }
}

// In component or hook
try {
  const data = await MyService.getData();
} catch (error) {
  if (error instanceof RequestError) {
    // Handle normalized error
    toast.error(error.message);
  }
}
```

---

## Hooks & Interactivity

- **Custom Hooks (`src/hooks`)**: Standardize logic for authentication (`useAuth`), modal control (`useModal`), and complex UI patterns.
- **Interactivity**: Favor **Controlled Components** with local state for forms, but sync with Redux or URL search params for shared state.
