# US-004 - User Management (Admin)

## User Story

As an ADMIN,
I want to create, edit, and disable users,
So that I can manage access to the application.

## Related Use Case

[UC-02 - User Management](../use-cases/UC-02-user-management.md)

## Acceptance Criteria

- Given I am logged in as an ADMIN
  - When I navigate to the User Management page
  - Then I see a list of users with their username, role, and status (enabled/disabled)

- Given I am on the User Management page
  - When I create a new user with a unique username, role, and password
  - Then the user is added to the list and can log in

- Given I am on the User Management page
  - When I edit a user's role or status and save
  - Then the changes are persisted and reflected in the list

- Given I am on the User Management page
  - When I disable a user
  - Then the user is marked as disabled and can no longer log in

- Given I am an ADMIN
  - When I attempt to disable my own account
  - Then the system prevents it and displays an appropriate message

## Notes

- The system should validate username uniqueness and enforce password rules on creation.
- Disabling a user should invalidate any active session for that user.
