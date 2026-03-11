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

---

## What to Generate

### 1. Backend

#### Entity & Repository

- Ensure `AppUser` entity (existing from UC-01) includes:
  - `enabled` boolean flag (true by default)
  - Optional fields: `firstName`, `lastName`, `email` (if not already present)

- `AppUserRepository` already exists; add methods if needed (e.g., `Optional<AppUser> findByUsername(String username)`).

#### User Management API

Create a controller and service to expose the following endpoints under `/api/users`:

- `GET /api/users` (ADMIN only): list all users.
- `POST /api/users` (ADMIN only): create a new user.
  - Request body: `{ username, password, role, enabled }` (password required, role required, enabled optional)
  - Validate username uniqueness.
  - Hash password (BCrypt 12).
  - Audit creation (who, when).

- `PUT /api/users/{id}` (ADMIN only): update user metadata (role, enabled flag, name/email).
  - Do not allow updating password via this endpoint.
  - Prevent disabling the currently logged-in admin (self-disable) if it would lock out all admins.
  - Audit update.

- `POST /api/users/{id}/disable` (ADMIN only): disable a user (set enabled=false and invalidate active sessions).
  - Ensure a user cannot disable themself (or at least not the last remaining ADMIN).
  - Audit action.

- `POST /api/users/me/password` (authenticated user): change own password.
  - Request body: `{ currentPassword, newPassword, confirmPassword }`.
  - Validate current password matches.
  - Validate new password rules and confirmation.
  - Hash password (BCrypt 12) and persist.
  - Optionally require re-login.

#### Service Layer

- Add a `UserManagementService` (or enhance existing service) to encapsulate business rules:
  - Username uniqueness check.
  - Role validation.
  - Self-disable prevention logic.
  - Session invalidation upon disable.

#### Security

- Extend existing security configuration to:
  - Protect `/api/users/**` endpoints, allowing only ADMIN.
  - Protect `/api/users/me/password` for authenticated users.
  - Return proper HTTP status codes (401/403).

#### Flyway Migration

- Add a new migration file: `V2__UC-02-user-management.sql`.
- Include header comment: `-- Use case: UC-02`.
- If the `app_user` table already exists, update it to ensure it contains `enabled` and any added fields (e.g., `first_name`, `last_name`, `email`).

---

### 2. Frontend

#### User Management Feature Module

Create a lazy-loaded feature module at route `/users`.

##### User List Page

- Displays a table of users with columns: username, role, status (enabled/disabled), actions.
- Actions: Edit, Disable.
- Only visible to ADMIN.

##### Create/Edit User Dialogs

- Provide a dialog/form to create or edit a user.
- Fields: username, role (select), enabled (toggle), password (create only).
- Frontend validation: required fields, password rules, password confirmation.

##### Disable User

- Prompt confirmation before disabling.
- On success, refresh user list.

#### Change Password Page

Create a page (route `/me/change-password`) for authenticated users to change their password.

- Form fields: current password, new password, confirm new password.
- Validate matching and password rules.
- Call backend endpoint and show feedback.

#### Services & Store

- Extend `AuthService` (or create `UserService`) with methods:
  - `getUsers()` - calls `GET /api/users`.
  - `createUser(payload)` - calls `POST /api/users`.
  - `updateUser(id, payload)` - calls `PUT /api/users/{id}`.
  - `disableUser(id)` - calls `POST /api/users/{id}/disable`.
  - `changePassword(payload)` - calls `POST /api/users/me/password`.

#### Authorization

- Ensure only ADMIN users can access `/users` routes.
- Use the same `authGuard` to protect these routes and the change-password page.

---

## Expected File Structure

```
backend/
├── src/main/java/.../
│   ├── controller/UserManagementController.java
│   ├── dto/UserDto.java
│   ├── dto/ChangePasswordDto.java
│   ├── service/UserManagementService.java
│   └── security/...
└── src/main/resources/
    └── db/migration/V2__UC-02-user-management.sql

frontend/
└── src/
    ├── app/
    │   ├── features/
    │   │   └── users/
    │   │       ├── users.module.ts
    │   │       ├── users.routes.ts
    │   │       ├── user-list/
    │   │       │   ├── user-list.component.ts
    │   │       │   ├── user-list.component.html
    │   │       │   └── user-list.component.scss
    │   │       ├── user-form/
    │   │       │   ├── user-form.component.ts
    │   │       │   ├── user-form.component.html
    │   │       │   └── user-form.component.scss
    │   │       └── change-password/
    │   │           ├── change-password.component.ts
    │   │           ├── change-password.component.html
    │   │           └── change-password.component.scss
    │   └── core/
    │       └── services/user.service.ts
    └── environments/
        └── environment.ts
```

---

## Validation Checklist

- [ ] ADMIN can list, create, edit, and disable users.
- [ ] Disabling a user prevents future logins and invalidates current sessions.
- [ ] ADMIN cannot disable themself (or last ADMIN account).
- [ ] Users can change their own password with current-password validation.
- [ ] All user management endpoints return the correct HTTP status codes (401/403/400/200).
- [ ] API responses do not leak sensitive information (e.g., hashed passwords).
- [ ] Frontend guards prevent unauthorized access.
