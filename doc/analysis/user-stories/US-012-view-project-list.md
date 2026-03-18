# US-012 - View Project List

## User Story

As an authenticated user (ADMIN or PROJECT_MANAGER),
I want to view the list of all projects,
So that I can quickly find and navigate to a project.

## Related Use Case

[UC-03 - Project Management](../use-cases/UC-03-project-management.md)

## Acceptance Criteria

- Given I am authenticated
  - When I navigate to the Project Management page
  - Then I see a list of all projects with the following columns: reference, name, current status, current project manager, current due date, total budget

- Given I am ADMIN
  - Then I see a "Create project" button

- Given I am a PROJECT_MANAGER
  - Then I do not see a "Create project" button

- Given I click on a project in the list
  - Then I am taken to the project detail page

## Notes

- All authenticated users can view the project list and project details.
- The list should support basic sorting and filtering (at minimum by status and project manager).
