# US-018 - Import Imputations Automatically *(Future Evolution)*

## User Story

As an ADMIN,
I want to import imputations automatically from Sciforma,
So that I can avoid manual monthly data entry and improve data reliability.

## Related Use Case

[UC-04 - Imputation Management](../use-cases/UC-04-imputations.md)

## Notes

- This story is **out of scope for v1**. It is documented to frame the future evolution.
- The `ProjectImputation` data model is designed to support this evolution without structural migration:
  - The `imputationCode` field is already present and matched against `sciformaCode`.
  - The `project` FK is already nullable, covering the case where the code does not yet match any project.
  - The `person` field (free text) can directly receive the name extracted from the import source.
- The import mechanism (CSV/Excel file upload, Sciforma API call, or webhook) will be defined during v2 scoping.
- Duplicate detection strategy (by date + imputationCode + person + task) will need to be defined at that stage.
