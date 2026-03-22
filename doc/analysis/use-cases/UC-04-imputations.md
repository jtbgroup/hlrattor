# UC-04 - Imputation Management

## Summary

Allows an ADMIN to record, edit, and delete personnel consumption entries (imputations) through a dedicated screen showing a global list of all imputations across all projects. Each imputation represents work performed by an external person on a task, identified by an imputation code that matches a project's Sciforma code. All authenticated users (ADMIN and PROJECT_MANAGER) can view the full list. In the first version, entries are created manually. A future evolution will support automatic import from an external system (Sciforma).

## Actors

- ADMIN (read + write)
- PROJECT_MANAGER (read only)

## Preconditions

- The actor is authenticated.
- For write operations: the actor is ADMIN.

## Main Flow — View Imputation List

1. The actor navigates to the dedicated Imputations screen (`/imputations`).
2. The system displays the global list of all imputations, sorted by imputation date descending.
3. The actor can filter by imputation code, person, date range, or task.

## Main Flow — Add Imputation (ADMIN, Manual)

1. The ADMIN clicks "Ajouter une imputation".
2. A form is displayed with: imputation date, imputation code, task, person, amount (€).
3. The ADMIN fills in all required fields and submits.
4. The backend validates the input.
5. The imputation is persisted. The link to the project is resolved server-side: if the imputation code matches a project's Sciforma code, the FK is set automatically.
6. The system confirms the addition and refreshes the global list.

## Main Flow — Edit Imputation (ADMIN)

1. The ADMIN clicks "Modifier" on an existing imputation.
2. A pre-filled form is displayed.
3. The ADMIN updates one or more fields and submits.
4. The backend validates and persists the changes. The project link is re-resolved if the imputation code changed.
5. The list is refreshed.

## Main Flow — Delete Imputation (ADMIN)

1. The ADMIN clicks "Supprimer" on an existing imputation.
2. A confirmation dialog is shown.
3. The ADMIN confirms.
4. The backend hard-deletes the imputation.
5. The list is refreshed.

## Alternative Flow — Invalid Data

1. The ADMIN submits the form with a missing required field or a negative amount.
2. The backend rejects the request with a validation error.
3. The system displays a field-level error message.

## Alternative Flow — No Matching Project

1. The ADMIN enters an imputation code that does not match any project's Sciforma code.
2. The imputation is saved with a null project FK — no error is raised.
3. The imputation remains unlinked until a project with a matching Sciforma code is created.

## Future Evolution — Automatic Import (Out of Scope for v1)

- Automatic import of imputations from Sciforma (via file or API) is planned for a future version.
- The data model is designed to support this evolution without structural migration.
- The import mechanism (CSV/Excel file upload, Sciforma API call, or webhook) will be defined during v2 scoping.
- Duplicate detection strategy (by date + code + person + task) will need to be defined at that stage.

## Postconditions

- **Add**: The imputation is persisted and visible in the global list.
- **Edit**: The imputation is updated; the project link is re-resolved if needed.
- **Delete**: The imputation is removed from the list.

## Data Model

### ProjectImputation

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| project | Project | FK, **nullable** — resolved server-side from imputationCode vs sciformaCode |
| imputationDate | LocalDate | Required |
| imputationCode | String | Required, free entry, matched against project Sciforma codes |
| task | String | Required, free text |
| person | String | Required, free text (external person, not an AppUser) |
| amount | BigDecimal | Required, ≥ 0 |
| recordedBy | AppUser | FK, audit |
| recordedAt | Instant | System timestamp, audit |

## Non-functional Requirements

- Only ADMIN can create, edit, and delete imputations.
- All authenticated users (ADMIN and PROJECT_MANAGER) can read the global list.
- The project FK is resolved transparently server-side — the user never selects a project explicitly.
- The total of imputations is always computed server-side.
- All write operations are audited (recordedBy, recordedAt).
