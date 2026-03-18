# UC-02 - User Management — Generation Prompt

## Context

This prompt is used to generate all the code and resources required to implement UC-02 (User Management) in the hlrattor application.

### Stack

- **Backend**: Java 21, Spring Boot 3+, Spring Security (session-based, BCrypt 12), Spring Data JPA, Flyway, PostgreSQL 17+
- **Frontend**: Angular 19+, Angular Material, standalone components, lazy-loaded feature modules
- **Architecture**: Monorepo — backend serves the built frontend as static assets on port 8090 (production)

### Key Constraints

- Never use deprecated or legacy APIs.
- Spring Security config must be structured so that switching to OAuth2/Keycloak only requires adding the resource server starter and swapping the `SecurityFilterChain` bean — no other changes.
- Passwords must be hashed with BCrypt strength 12.
- User management actions must be audited (who performed the action + timestamp).
- All user management endpoints must be secured: only ADMIN can perform create/edit/disable, and users can only change their own password.
- Disabling a user must prevent further authentication and invalidate existing sessions.
- **A user can hold multiple roles simultaneously.** Roles are stored in a dedicated join table `app_user_roles`.

---

## What to Generate

### 1. Backend

#### Entity

- `AppUser` entity with fields: `id` (UUID), `username` (unique), `password` (hashed), `enabled` (boolean).
- Roles stored as `@ElementCollection(fetch = EAGER)` in join table `app_user_roles (user_id, role)`.
- `roles` field type: `Set<Role>` (enum: `ADMIN`, `PROJECT_MANAGER`).
- Helper method: `boolean hasRole(Role role)`.

#### Repository

- `AppUserRepository` extending `JpaRepository`.
- Method: `Optional<AppUser> findByUsername(String username)`.

#### User Management API

Endpoints under `/api/users`:

- `GET /api/users` (ADMIN only): list all users. Response includes `roles: List<String>`.
- `POST /api/users` (ADMIN only): create a new user.
  - Request body: `{ username, password, roles: List<String>, enabled? }`
  - Validate username uniqueness, at least one role provided.
  - Hash password (BCrypt 12). Audit creation.
- `PUT /api/users/{id}` (ADMIN only): update `roles` and/or `enabled` flag.
  - Validate at least one role provided.
  - Prevent self-disable. Audit update.
- `POST /api/users/{id}/disable` (ADMIN only): set `enabled=false`, invalidate sessions. Audit.
- `POST /api/users/me/password` (authenticated): change own password.
  - Body: `{ currentPassword, newPassword, confirmPassword }`.

#### DTOs

```java
// UserDtos.java
record UserResponse(UUID id, String username, List<String> roles, boolean enabled) {}
record CreateUserRequest(String username, String password, List<String> roles, Boolean enabled) {}
record UpdateUserRequest(List<String> roles, Boolean enabled) {}
record ChangePasswordRequest(String currentPassword, String newPassword, String confirmPassword) {}

// AuthDtos.java
record UserResponse(String username, List<String> roles) {}
```

#### Security

- `AppUserDetailsService`: maps all roles in `app_user_roles` to Spring Security `GrantedAuthority` as `ROLE_<ROLE_NAME>`.
- `SecurityFilterChain`: protect `/api/users/**` with `hasRole("ADMIN")`; protect `/api/users/me/password` with `isAuthenticated()`.

#### Auth Controller

- `POST /api/auth/login` and `GET /api/auth/me`: return `{ username, roles: List<String> }`.

#### Flyway Migration

- File: `V2__UC-02-user-management.sql`
- SQL header comment: `-- Use case: UC-02`
- Creates `user_audit` table.
- Creates `app_user_roles (user_id UUID FK, role VARCHAR(50))` join table with composite PK.
- Migrates existing `role` column data from `app_user` into `app_user_roles`.
- Drops `role` column from `app_user`.

```sql
-- Use case: UC-02

CREATE TABLE IF NOT EXISTS user_audit (
    id           UUID         PRIMARY KEY,
    action       TEXT         NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    target_user  VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    details      TEXT
);

CREATE TABLE app_user_roles (
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

INSERT INTO app_user_roles (user_id, role)
SELECT id, role FROM app_user;

ALTER TABLE app_user DROP COLUMN role;
```

---

### 2. Frontend

#### User Management Feature

Lazy-loaded at `/admin/users` (ADMIN only via `adminGuard`).

##### User List Page

- Table columns: `username`, `roles` (chips), `status`, `actions`.
- Actions: Edit, Disable.

##### Create/Edit Form

- Fields: `username` (readonly on edit), `password` (create only), `roles` (**multi-select**, at least one required), `enabled` (toggle).
- Form is invalid if `roles` is empty.

#### Auth Service

```typescript
export interface CurrentUser {
  username: string;
  roles: string[];
}
// Method: hasRole(role: string): boolean
```

#### User Service DTOs

```typescript
interface UserManagementDto { id: string; username: string; roles: string[]; enabled: boolean; }
interface CreateUserDto { username: string; password: string; roles: string[]; enabled?: boolean; }
interface UpdateUserDto { roles?: string[]; enabled?: boolean; }
```

#### Admin Guard

```typescript
// Uses authService.hasRole('ADMIN') instead of role === 'ADMIN'
```

#### Home Component

- Displays all roles as individual badges in a flex row.

---

## Expected File Structure

```
backend/
├── src/main/java/.../
│   ├── entity/AppUser.java
│   ├── repository/AppUserRepository.java
│   ├── dto/UserDtos.java
│   ├── dto/AuthDtos.java
│   ├── controller/AuthController.java
│   ├── controller/UserManagementController.java
│   ├── service/UserManagementService.java
│   └── security/
│       ├── SecurityConfig.java
│       └── AppUserDetailsService.java
└── src/main/resources/
    └── db/migration/V2__UC-02-user-management.sql

frontend/
└── src/app/
    ├── core/
    │   ├── services/auth.service.ts
    │   ├── services/user.service.ts
    │   └── guards/admin.guard.ts
    └── features/
        ├── home/home.component.ts
        └── users/
            ├── user-list/user-list.component.ts
            └── change-password/change-password.component.ts
```

---

## Validation Checklist

- [ ] ADMIN can list, create, edit, and disable users.
- [ ] A user can be assigned multiple roles simultaneously.
- [ ] Form submission is blocked if no role is selected.
- [ ] Spring Security authorities reflect all assigned roles.
- [ ] `hasRole('ADMIN')` guard uses `roles` array, not a single `role` field.
- [ ] Disabling a user prevents future logins and invalidates current sessions.
- [ ] ADMIN cannot disable their own account.
- [ ] Users can change their own password with current-password validation.
- [ ] All user management endpoints return correct HTTP status codes (200/400/401/403).
- [ ] API responses do not leak sensitive information (e.g., hashed passwords).
- [ ] Frontend guards prevent unauthorized access.
- [ ] Flyway V2 migrates `role` column to `app_user_roles` join table cleanly.