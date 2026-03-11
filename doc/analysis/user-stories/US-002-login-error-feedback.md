# US-002 - Login Error Feedback

## User Story

As a user (ADMIN or PROJECT_MANAGER),
I want to receive a clear error message when my credentials are invalid,
So that I know my login attempt has failed without exposing sensitive information.

## Related Use Case

[UC-01 - Authentication](../use-cases/UC-01-authentication.md)

## Acceptance Criteria

- Given I am on the login page
  - When I enter an invalid username or password and submit the form
  - Then a generic error message is displayed: *"Invalid username or password"*
  - And no session is created
  - And I remain on the login page

- Given I am on the login page
  - When a login attempt fails
  - Then the error message does not reveal whether the username or the password is incorrect

## Notes

- The error message must be generic to avoid user enumeration attacks.
- The password field is cleared after a failed attempt.
