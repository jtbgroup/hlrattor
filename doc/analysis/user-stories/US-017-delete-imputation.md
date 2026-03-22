# US-017 - Delete Imputation

## User Story

As an ADMIN,
I want to delete an imputation,
So that I can remove an incorrect entry.

## Related Use Case

[UC-04 - Imputation Management](../use-cases/UC-04-imputations.md)

## Acceptance Criteria

- Given I am logged in as ADMIN and on the Imputations screen
  - When I click "Supprimer" on an imputation
  - Then a confirmation dialog is shown: *"Êtes-vous sûr de vouloir supprimer cette imputation ?"*
  - With buttons: *"Annuler"* and *"Supprimer"*

- Given I confirm the deletion
  - Then the imputation is permanently removed
  - And the global list is refreshed

- Given I cancel the confirmation dialog
  - Then no change is made

## Notes

- Deletion is permanent (hard delete); there is no soft-delete for imputations.
- Only ADMIN can delete imputations.
