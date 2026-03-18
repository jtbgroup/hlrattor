# US-008 - Manage Project Status

## User Story

As an ADMIN or as the PROJECT_MANAGER assigned to a project,
I want to change the project's status and record the transition date manually,
So that the project lifecycle is accurately tracked.

## Related Use Case

[UC-03 - Project Management](../use-cases/UC-03-project-management.md)

## Acceptance Criteria

- Given I am on the project detail page and the project is editable
  - When I select a new status and enter a manual transition date and submit
  - Then a new status history entry is created with the selected status, the manual date, and my identity
  - And the project's current status is updated to the new status

- Given I view the project detail page
  - Then I can see the full status history: each entry shows the status, the manual date, the author, and the system timestamp

- Given the project is in CLOSED or CANCELED status
  - When I change the status to an active status (DRAFT, BIA, or PROJECT)
  - Then the project becomes editable again

- Given I submit without entering a manual transition date
  - Then the form validation prevents submission
  - And a field-level error is displayed

## Notes

- Valid statuses: DRAFT, BIA, PROJECT, CANCELED, CLOSED.
- Status transitions are not constrained (any status can follow any other).
- The manual date is the business date of the transition and is distinct from the system timestamp.
- The current status is always the most recent entry in the history.
