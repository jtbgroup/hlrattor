# US-003 - Logout

## User Story

As an authenticated user (ADMIN or PROJECT_MANAGER),
I want to be able to log out of the application,
So that my session is invalidated and my account is protected.

## Related Use Case

[UC-01 - Authentication](../use-cases/UC-01-authentication.md)

## Acceptance Criteria

- Given I am authenticated and on any page of the application
  - When I click the "Logout" button
  - Then my session is invalidated server-side
  - And I am redirected to the login page

- Given my session has been invalidated
  - When I try to access a protected page directly (e.g. via URL)
  - Then I am redirected to the login page

## Notes

- The logout action must call the backend to properly invalidate the server-side session.
- Client-side state must also be cleared on logout.
