# US-011 - Manage Budget Lines

## User Story

As an ADMIN or as the PROJECT_MANAGER assigned to a project,
I want to add, edit, or remove budget lines on a project,
So that the financial history of the project is accurately maintained.

## Related Use Case

[UC-03 - Project Management](../use-cases/UC-03-project-management.md)

## Acceptance Criteria

- Given I am on the project detail page and the project is editable
  - When I add a new budget line with a type, an amount, and a date
  - Then the budget line is saved
  - And the project's total budget is updated accordingly

- Given I view the budget section of a project
  - Then I see all budget lines with their type, amount, and date
  - And the total budget is displayed as the sum of all lines

- Given I edit an existing budget line
  - Then the changes are persisted and the total budget is recalculated

- Given I delete a budget line
  - When I confirm the deletion
  - Then the line is removed and the total budget is recalculated

- Given I submit a budget line with a missing required field (type, amount, or date)
  - Then the validation prevents submission
  - And a field-level error is displayed

- Given the project is in CLOSED or CANCELED status
  - When I attempt to add, edit, or delete a budget line
  - Then the modification is rejected

## Notes

- Budget line types: ENGAGEMENT_INITIAL, COMMANDE_COMPLEMENTAIRE, TRANSFERT.
- The total budget is always computed as the sum of all budget lines (server-side).
- Both ADMIN and the assigned PROJECT_MANAGER can manage budget lines.
