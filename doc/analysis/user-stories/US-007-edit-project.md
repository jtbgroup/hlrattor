# US-007 - Edit Project

## User Story

As an ADMIN or as the PROJECT_MANAGER assigned to a project,
I want to edit the project's information,
So that the project data stays accurate and up to date.

## Related Use Case

[UC-03 - Project Management](../use-cases/UC-03-project-management.md)

## Acceptance Criteria

- Given I am logged in as ADMIN
  - When I navigate to the project detail page
  - Then I can edit all fields: name, reference, imputation code, PORD BIA, PORD Project, project manager, status, due date, and budget lines

- Given I am logged in as the PROJECT_MANAGER assigned to this project
  - When I navigate to the project detail page
  - Then I can edit: imputation code, PORD BIA, PORD Project, status, due date, and budget lines
  - And the name, reference, and project manager fields are read-only

- Given I am a PROJECT_MANAGER not assigned to this project
  - When I navigate to the project detail page
  - Then I can only view the project (read-only)

- Given the project is in CLOSED or CANCELED status
  - When any actor attempts to edit a field other than the status
  - Then the modification is rejected
  - And the message *"This project is closed or canceled. Change its status to edit it."* is displayed

## Notes

- Authorization is enforced server-side on every endpoint.
- Fields visible but not editable should be displayed as read-only in the UI.
