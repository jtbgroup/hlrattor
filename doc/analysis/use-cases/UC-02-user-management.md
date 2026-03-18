# UC-02 - User Management

## Summary

Allows an administrative user to manage application users: create new users, edit existing users, and disable (soft delete) users. Each user can be assigned one or more roles. Each user can also change their own password.

## Actors

- ADMIN
- (Authenticated) USER

## Preconditions

- The ADMIN is authenticated.
- There is at least one existing ADMIN in the system.
- Users are stored in the database with a username, hashed password (BCrypt 12), a set of roles, and an enabled/disabled flag.

## Main Flow

1. The ADMIN navigates to the User Management area.
2. The system displays a list of existing users (username, roles, status).

### Main Flow — Create User
1. The ADMIN clicks "Create user".
2. The ADMIN provides required information: `username`, one or more `roles`, and a temporary `password`.
3. The backend validates the input (username uniqueness, role validity, password rules).
4. The backend stores the user with the password hashed (BCrypt 12) and `enabled=true`.
5. The system confirms creation and updates the user list.

### Main Flow — Edit User
1. The ADMIN selects a user and clicks "Edit".
2. The ADMIN updates allowed fields: `roles` (multi-select), `enabled` flag.
3. The backend validates the update (at least one role required).
4. The backend saves changes.
5. The system confirms the update and refreshes the user list.

### Main Flow — Disable User
1. The ADMIN selects a user and clicks "Disable".
2. The backend sets `enabled=false` (soft delete).
3. Active sessions for that user are invalidated.
4. The system confirms the user is disabled.

### Main Flow — Change Own Password (User)
1. An authenticated user navigates to the "Change password" page.
2. The user enters the current password, new password, and password confirmation.
3. The backend validates that the current password is correct and that the new passwords match.
4. The backend hashes the new password (BCrypt 12) and updates the user record.
5. The system confirms the password change.

## Alternative Flow — User Already Exists (Create)

1. The ADMIN tries to create a user with a username that already exists.
2. The backend rejects the request with a validation error.
3. The system displays a message: *"Username already taken"*.

## Alternative Flow — No Role Selected (Create/Edit)

1. The ADMIN submits the form without selecting at least one role.
2. The frontend blocks submission with a validation error.
3. The system displays a message: *"At least one role must be selected"*.

## Alternative Flow — Invalid Input (Create/Edit/Change Password)

1. The user submits invalid or incomplete data (blank fields, weak password, invalid role).
2. The backend rejects the request with validation errors.
3. The system displays appropriate field-level error messages.

## Alternative Flow — Disable Self (Admin)

1. An ADMIN attempts to disable their own account.
2. The backend rejects the request to prevent the last admin from locking themselves out.
3. The system displays a message: *"You cannot disable your own account"*.

## Postconditions

- **Create user**: New user exists in the database with `enabled=true`, a hashed password, and at least one role stored in `app_user_roles`.
- **Edit user**: User roles and/or enabled flag are updated.
- **Disable user**: User is marked as disabled and cannot authenticate; existing sessions are invalidated.
- **Change password**: User can authenticate with the new password.

## Data Model

User roles are stored in a dedicated join table `app_user_roles (user_id, role)`, allowing a single user to hold multiple roles simultaneously. The `app_user` table no longer contains a `role` column.

## Non-functional Requirements

- Passwords are hashed using BCrypt with strength 12.
- Changing authentication method (e.g., OAuth2/Keycloak) must not require changes to business logic: only the security configuration and authentication provider layer.
- All user management operations must be audited (who performed the action and when) for traceability.
- The backend must enforce authorization checks (only ADMIN can manage users; users can only change their own password).
- The UI must prevent users from accessing user management pages unless authorized.
- Spring Security authorities are derived from all roles in `app_user_roles`; a user with both `ADMIN` and `PROJECT_MANAGER` receives both `ROLE_ADMIN` and `ROLE_PROJECT_MANAGER` authorities. 