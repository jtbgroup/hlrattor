# UC-01 - Authentication — Generation Prompt

## Context

This prompt is used to generate all the code and resources required to implement UC-01 (Authentication) in the hlrattor application.

### Stack

- **Backend**: Java 21, Spring Boot 3+, Spring Security (session-based, BCrypt 12), Spring Data JPA, Flyway, PostgreSQL 17+
- **Frontend**: Angular 19+, Angular Material, standalone components, lazy-loaded feature modules
- **Architecture**: Monorepo — backend serves the built frontend as static assets on port 8090 (production)

### Key Constraints

- Never use deprecated or legacy APIs.
- Spring Security config must be structured so that switching to OAuth2/Keycloak only requires adding the resource server starter and swapping the `SecurityFilterChain` bean — no other changes.
- Session-based authentication only (no "remember me").
- BCrypt strength: 12.
- Generic error messages to prevent user enumeration.

---

## What to Generate

### 1. Backend

#### Entity & Repository

- `AppUser` JPA entity with fields: `id` (UUID), `username` (unique), `password` (hashed), `role` (enum: `ADMIN`, `PROJECT_MANAGER`), `enabled` (boolean).
- `AppUserRepository` extending `JpaRepository`.

#### Security Configuration

- `UserDetailsService` implementation loading users from the database by username.
- `SecurityFilterChain` bean configured for session-based authentication:
  - Permit `/api/auth/**` endpoints.
  - Protect all other `/api/**` endpoints.
  - Configure login endpoint: `POST /api/auth/login`.
  - Configure logout endpoint: `POST /api/auth/logout` (invalidates session).
  - Disable CSRF for API (stateless REST calls from Angular).
  - Return proper HTTP status codes (401 on unauthorized, 403 on forbidden).
- `PasswordEncoder` bean using BCrypt with strength 12.
- Structure the config so that the entire Spring Security setup can be replaced by OAuth2/Keycloak by only swapping the `SecurityFilterChain` bean.

#### Auth Controller

- `POST /api/auth/login`: accepts `{ username, password }`, returns `{ username, role }` on success, 401 on failure.
- `POST /api/auth/logout`: invalidates the session, returns 200.
- `GET /api/auth/me`: returns the currently authenticated user `{ username, role }`, 401 if not authenticated.

#### Flyway Migration

- File: `V1__UC-01-authentication.sql`
- SQL header comment: `-- Use case: UC-01`
- Creates the `app_user` table with columns: `id`, `username`, `password`, `role`, `enabled`.
- Inserts one default ADMIN user (username: `admin`, password: BCrypt-hashed value of `admin123`).

---

### 2. Frontend

#### Auth Feature Module

- Lazy-loaded feature module at route `/login`.
- Standalone `LoginComponent` using Angular Material:
  - `MatFormField`, `MatInput` for username and password fields.
  - `MatButton` for the submit button.
  - Reactive form with required validation on both fields.
  - Displays a generic error message on failed login.
  - On success, navigates to the home page (`/`).

#### Auth Service

- `AuthService` with methods:
  - `login(username, password)`: calls `POST /api/auth/login`.
  - `logout()`: calls `POST /api/auth/logout`, clears local state, navigates to `/login`.
  - `me()`: calls `GET /api/auth/me` to restore session on app reload.
  - `currentUser$`: observable exposing the current user (username, role) or null.

#### Auth Guard

- `authGuard` functional guard protecting all routes except `/login`.
- Redirects unauthenticated users to `/login`.

#### HTTP Interceptor

- Intercepts 401 responses globally and redirects to `/login`.

#### Logout Button

- A logout button/menu item in the main navigation bar calling `AuthService.logout()`.

---

### 3. Resources & Configuration

- `application.yml`: configure session management (server-side), datasource, JPA, Flyway.
- Angular `environment.ts`: define `apiBaseUrl`.
- Angular `app.routes.ts`: define root routing with lazy-loaded `/login` route and auth guard on protected routes.

---

## Expected File Structure

```
backend/
├── src/main/java/.../
│   ├── entity/AppUser.java
│   ├── repository/AppUserRepository.java
│   ├── security/
│   │   ├── SecurityConfig.java
│   │   └── AppUserDetailsService.java
│   └── controller/AuthController.java
└── src/main/resources/
    ├── application.yml
    └── db/migration/V1__UC-01-authentication.sql

frontend/
└── src/
    ├── app/
    │   ├── app.routes.ts
    │   ├── core/
    │   │   ├── services/auth.service.ts
    │   │   ├── guards/auth.guard.ts
    │   │   └── interceptors/auth.interceptor.ts
    │   └── features/
    │       └── auth/
    │           └── login/
    │               ├── login.component.ts
    │               ├── login.component.html
    │               └── login.component.scss
    └── environments/
        └── environment.ts
```

---

## Validation Checklist

- [ ] Login with valid credentials redirects to home page.
- [ ] Login with invalid credentials shows generic error message.
- [ ] Empty form fields are blocked by frontend validation.
- [ ] Logout invalidates the session server-side and redirects to login page.
- [ ] Accessing a protected route without a session redirects to login page.
- [ ] `GET /api/auth/me` returns 401 when not authenticated.
- [ ] Flyway migration runs cleanly on a fresh database.
- [ ] Default admin user can log in with `admin` / `admin123`.
