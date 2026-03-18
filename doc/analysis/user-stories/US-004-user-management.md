# US-004 - User Management (Admin)

## User Story

As an ADMIN,
I want to create, edit, and disable users and assign them one or more roles,
So that I can manage access to the application with fine-grained permissions.

## Related Use Case

[UC-02 - User Management](../use-cases/UC-02-user-management.md)

## Acceptance Criteria

- Given I am logged in as an ADMIN
  - When I navigate to the User Management page
  - Then I see a list of users with their username, roles (as chips), and status (enabled/disabled)

- Given I am on the User Management page
  - When I create a new user with a unique username, at least one role, and a password
  - Then the user is added to the list and can log in

- Given I am on the User Management page
  - When I create a new user without selecting any role
  - Then the form is invalid and submission is blocked

- Given I am on the User Management page
  - When I edit a user and assign multiple roles (e.g. ADMIN + PROJECT_MANAGER)
  - Then the user receives all selected roles and can access resources protected by any of those roles

- Given I am on the User Management page
  - When I edit a user and remove all roles
  - Then the form is invalid and submission is blocked

- Given I am on the User Management page
  - When I edit a user's enabled flag or roles and save
  - Then the changes are persisted and reflected in the list

- Given I am on the User Management page
  - When I disable a user
  - Then the user is marked as disabled and can no longer log in

- Given I am an ADMIN
  - When I attempt to disable my own account
  - Then the system prevents it and displays an appropriate message

## Notes

- The system validates username uniqueness and enforces password rules on creation.
- Disabling a user invalidates any active session for that user.
- Roles are stored in a join table `app_user_roles`; each user can have zero or more roles.
- The roles select in the form is a **multi-select** (`mat-select multiple`).
- Each role is displayed as a styled chip in the user list table.