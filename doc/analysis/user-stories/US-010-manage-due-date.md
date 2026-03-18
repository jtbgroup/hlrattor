# US-010 - Manage Project Due Date

## User Story

As an ADMIN or as the PROJECT_MANAGER assigned to a project,
I want to set or update the project's due date,
So that delivery commitments are tracked and their history is preserved.

## Related Use Case

[UC-03 - Project Management](../use-cases/UC-03-project-management.md)

## Acceptance Criteria

- Given I am on the project detail page and the project is editable
  - When I set or change the due date and save
  - Then a new due date history entry is created with the new date, my identity, and the system timestamp

- Given I view the project detail page
  - Then I can see the full due date history: each entry shows the due date, the author, and the system timestamp of the change

- Given the project is in CLOSED or CANCELED status
  - When I attempt to change the due date
  - Then the modification is rejected

## Notes

- The current due date is the most recent entry in the due date history.
- The history is never deleted; it provides a full audit trail of all delivery date changes.
