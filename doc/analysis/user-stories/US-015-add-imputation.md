# US-015 - Add Imputation Manually

## User Story

As an ADMIN,
I want to manually add an imputation,
So that I can record the personnel consumption for a person and a task on a project.

## Related Use Case

[UC-04 - Imputation Management](../use-cases/UC-04-imputations.md)

## Acceptance Criteria

- Given I am logged in as ADMIN and on the Imputations screen
  - When I click "Ajouter une imputation"
  - Then a form is displayed with the following required fields:
    - Date d'imputation `*`
    - Code d'imputation `*` (free text entry)
    - Tâche `*` (free text)
    - Personne `*` (free text)
    - Montant (€) `*`

- Given I submit the form with all valid fields
  - Then the imputation is saved
  - And the global list is refreshed

- Given I leave a required field empty and submit
  - Then the validation prevents submission
  - And the message *"Ce champ est obligatoire."* is displayed on the relevant field

- Given I enter a negative amount and submit
  - Then the validation prevents submission
  - And the message *"Le montant doit être supérieur ou égal à zéro."* is displayed

- Given I enter an imputation code that matches a project's Sciforma code
  - Then the imputation is automatically linked to that project (transparent to the user)

- Given I enter an imputation code that does not match any project's Sciforma code
  - Then the imputation is saved without a project link (no error)

## Notes

- The user never selects a project explicitly; the link is resolved server-side from the imputation code.
- Only ADMIN can add imputations.
