# US-006 - Create Project

## User Story

As an ADMIN,
I want to create a new project,
So that it can be tracked and managed in the application.

## Related Use Case

[UC-03 - Project Management](../use-cases/UC-03-project-management.md)

## Acceptance Criteria

- Given I am logged in as ADMIN
  - When I navigate to the Project Management page and click "Create project"
  - Then a form is displayed with the required fields: name, reference, Sciforma code, project manager, initial status, and status date

- Given I fill in all required fields with valid data and submit
  - Then the project is created
  - And an initial status history entry is recorded with the provided date and my identity
  - And an initial project manager history entry is recorded
  - And I am redirected to the project detail page

- Given I enter a project reference that already exists
  - Then the creation is rejected
  - And the message *"Project reference already exists"* is displayed

- Given I leave a required field empty
  - Then the form validation prevents submission
  - And a field-level error is displayed

- Given I try to assign a user who does not have the PROJECT_MANAGER role
  - Then that user is not available in the project manager selection list

## Notes

- Only users with role PROJECT_MANAGER are selectable as project manager.
- The reference must be unique across all projects.
- The initial status and its manual date are required at creation.
