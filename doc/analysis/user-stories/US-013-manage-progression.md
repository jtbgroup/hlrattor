# US-013 - Manage Project Progression

## User Story

As an ADMIN or as the PROJECT_MANAGER assigned to a project,
I want to record the progression of a project at a given date,
So that the completion history is tracked over time and can be used in reports.

## Related Use Case

[UC-03 - Project Management](../use-cases/UC-03-project-management.md)

## Acceptance Criteria

- Given I am on the project detail page and the project is editable
  - When I navigate to the Progression section
  - Then I see the current progression value (most recent entry) and the full progression history

- Given I click "Add progression"
  - When I enter a valid percentage (0–100) and a progression date and submit
  - Then a new progression entry is saved
  - And the current progression is updated to this new value

- Given I submit a progression value outside the 0–100 range
  - Then the validation prevents submission
  - And a field-level error is displayed

- Given I submit without entering a progression date
  - Then the validation prevents submission
  - And a field-level error is displayed

- Given the project is in CLOSED or CANCELED status
  - When I attempt to add a progression entry
  - Then the modification is rejected

## Notes

- The progression value is an integer percentage (0–100 inclusive).
- The progression history is append-only; entries are never deleted.
- The current progression is always the most recent entry by progression date.
- Both ADMIN and the assigned PROJECT_MANAGER can record progressions.
- The progression date is a business date entered manually by the user, distinct from the system timestamp of recording.
