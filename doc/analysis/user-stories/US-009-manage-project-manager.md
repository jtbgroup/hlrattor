# US-009 - Manage Project Manager

## User Story

As an ADMIN,
I want to assign or change the project manager of a project,
So that the current responsibility is clear and the full history of project managers is preserved.

## Related Use Case

[UC-03 - Project Management](../use-cases/UC-03-project-management.md)

## Acceptance Criteria

- Given I am logged in as ADMIN and I am on the project detail page
  - When I select a new project manager from the list and save
  - Then the previous project manager history entry is closed (an end date is recorded)
  - And a new project manager history entry is created with the selected user and the current date

- Given I open the project manager selection list
  - Then only users with the role PROJECT_MANAGER are available for selection

- Given I view the project detail page
  - Then I can see the full project manager history: each entry shows the project manager's username, the start date, and the end date (or "current" if still active)

- Given I try to assign a user without the PROJECT_MANAGER role (e.g., via direct API call)
  - Then the backend rejects the request with an appropriate error

## Notes

- Only ADMIN can change the project manager.
- The project manager history is append-only from a business perspective: the current entry is closed and a new one is opened.
- The selection list is filtered server-side to only include enabled users with role PROJECT_MANAGER.
