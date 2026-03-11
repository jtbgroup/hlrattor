# US-001 - Login

## User Story

As a user (ADMIN or PROJECT_MANAGER),
I want to log in with my username and password,
So that I can access the application.

## Related Use Case

[UC-01 - Authentication](../use-cases/UC-01-authentication.md)

## Acceptance Criteria

- Given I am on the login page
  - When I enter a valid username and password and submit the form
  - Then I am redirected to the home page
  - And my session is active

- Given I am on the login page
  - When I leave the username or password field empty and submit the form
  - Then the form validation prevents submission
  - And an appropriate field-level error is displayed

## Notes

- The login form contains two fields: `username` and `password`.
- No "remember me" option.
- After successful login, all users land on the same home page regardless of role.
