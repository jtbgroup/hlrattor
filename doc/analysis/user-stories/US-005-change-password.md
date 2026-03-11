# US-005 - Change Password

## User Story

As an authenticated user (ADMIN or PROJECT_MANAGER),
I want to change my password,
So that I can keep my account secure.

## Related Use Case

[UC-02 - User Management](../use-cases/UC-02-user-management.md)

## Acceptance Criteria

- Given I am authenticated
  - When I navigate to the Change Password page
  - Then I can enter my current password, a new password, and confirm the new password

- Given I submit the form with the correct current password and matching new password fields
  - Then my password is updated and I receive a confirmation

- Given I submit the form with an incorrect current password
  - Then the update is rejected and an error message is displayed

- Given I submit the form with new passwords that do not match or do not meet password rules
  - Then the update is rejected and field-level validation errors are displayed

## Notes

- The password change must validate the current password.
- The new password must be hashed using BCrypt 12.
- Depending on security policy, the system may require the user to re-login after changing password.
