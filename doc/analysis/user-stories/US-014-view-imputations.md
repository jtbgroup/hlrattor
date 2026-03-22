# US-014 - View Global Imputation List

## User Story

As an authenticated user (ADMIN or PROJECT_MANAGER),
I want to view the global list of all imputations,
So that I can monitor personnel consumption across all projects.

## Related Use Case

[UC-04 - Imputation Management](../use-cases/UC-04-imputations.md)

## Acceptance Criteria

- Given I am authenticated
  - When I navigate to the Imputations screen (`/imputations`)
  - Then I see the full list of all imputations with columns: date, code d'imputation, tâche, personne, montant (€)
  - And the list is sorted by imputation date descending by default

- Given the list is displayed
  - Then I can filter imputations by: code d'imputation, personne, plage de dates, tâche

- Given there are no imputations in the system
  - Then a message indicates: *"Aucune imputation enregistrée."*

- Given I am ADMIN
  - Then I see "Ajouter une imputation", "Modifier", and "Supprimer" actions

- Given I am PROJECT_MANAGER
  - Then I see the list in read-only mode (no add/edit/delete actions)

## Notes

- The list is global: all imputations from all projects are shown together.
- No filtering by project is required in v1 (the imputation code implicitly identifies the project).
- The total amount across all visible imputations should be displayed as a footer.
