# UC-02 - User Management

## Summary

Allows an administrative user to manage application users: create new users, edit existing users, and disable (soft delete) users. Each user can also change their password.

## Actors

- ADMIN
- (Authenticated) USER

## Preconditions

- The ADMIN is authenticated.
- There is at least one existing ADMIN in the system.
- Users are stored in the database with a username, hashed password (BCrypt 12), role, and an enabled/disabled flag.

## Main Flow

1. The ADMIN navigates to the User Management area.
2. The system displays a list of existing users (username, role, status).

### Main Flow — Create User
1. The ADMIN clicks "Create user".
2. The ADMIN provides required information: `username`, `role`, and a temporary `password`.
3. The backend validates the input (username uniqueness, role validity, password rules).
4. The backend stores the user with the password hashed (BCrypt 12) and `enabled=true`.
5. The system confirms creation and updates the user list.

### Main Flow — Edit User
1. The ADMIN selects a user and clicks "Edit".
2. The ADMIN updates allowed fields (e.g., `role`, `enabled` flag, display name).
3. The backend validates the update.
4. The backend saves changes.
5. The system confirms the update and refreshes the user list.

### Main Flow — Disable User
1. The ADMIN selects a user and clicks "Disable".
2. The backend sets `enabled=false` (soft delete).
3. Active sessions for that user are invalidated.
4. The system confirms the user is disabled and removes them from any active user lists if appropriate.

### Main Flow — Change Own Password (User)
1. An authenticated user navigates to their profile or "Change password" page.
2. The user enters the current password, new password, and password confirmation.
3. The backend validates that the current password is correct and that the new password meets password rules.
4. The backend hashes the new password (BCrypt 12) and updates the user record.
5. The system confirms the password change and may optionally require re-login.

## Alternative Flow — User Already Exists (Create)

1. The ADMIN tries to create a user with a username that already exists.
2. The backend rejects the request with a validation error.
3. The system displays a message: *"Username already taken"*.

## Alternative Flow — Invalid Input (Create/Edit/Change Password)

1. The user submits invalid or incomplete data (blank fields, weak password, invalid role).
2. The backend rejects the request with validation errors.
3. The system displays appropriate field-level error messages.

## Alternative Flow — Disable Self (Admin)

1. An ADMIN attempts to disable their own account.
2. The backend rejects the request to prevent the last admin from locking themselves out.
3. The system displays a message: *"You cannot disable your own account"*.

## Postconditions

- **Create user**: New user exists in the database with `enabled=true` and a hashed password.
- **Edit user**: User data is updated.
- **Disable user**: User is marked as disabled and cannot authenticate; existing sessions are invalidated.
- **Change password**: User can authenticate with the new password.

## Non-functional Requirements

- Passwords are hashed using BCrypt with strength 12.
- Changing authentication method (e.g., OAuth2/Keycloak) must not require changes to business logic: only the security configuration and authentication provider layer.
- All user management operations must be audited (who performed the action and when) for traceability.
- The backend must enforce authorization checks (only ADMIN can manage users; users can only change their own password).
- The UI must prevent users from accessing user management pages unless authorized.
