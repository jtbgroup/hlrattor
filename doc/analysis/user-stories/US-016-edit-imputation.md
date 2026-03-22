# US-016 - Edit Imputation

## User Story

As an ADMIN,
I want to edit an existing imputation,
So that I can correct a data entry error.

## Related Use Case

[UC-04 - Imputation Management](../use-cases/UC-04-imputations.md)

## Acceptance Criteria

- Given I am logged in as ADMIN and on the Imputations screen
  - When I click "Modifier" on an imputation
  - Then a pre-filled form is displayed with the current values

- Given I submit the modified form with valid data
  - Then the changes are persisted
  - And the global list is refreshed

- Given I change the imputation code
  - Then the project link is re-resolved server-side against the new code

- Given I submit with a missing required field or a negative amount
  - Then the validation prevents submission
  - And a field-level error is displayed

## Notes

- Validation rules are identical to those for adding an imputation (US-015).
- Only ADMIN can edit imputations.
