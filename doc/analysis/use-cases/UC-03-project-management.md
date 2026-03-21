# UC-03 - Project Management

## Summary

Allows an ADMIN to create and manage projects. A project has a unique reference, a name, a Sciforma imputation code, two optional PORD references (BIA and Project phases), a status with full history, a project manager (with history), a due date (with history), a set of budget lines whose sum constitutes the total budget, and a progression history tracking the completion percentage over time.

## Actors

- ADMIN
- PROJECT_MANAGER (assigned to the project)

## Preconditions

- The actor is authenticated.
- For project creation: the actor is ADMIN.
- For editing: the actor is ADMIN, or is the PROJECT_MANAGER currently assigned to the project.
- At least one user with role PROJECT_MANAGER exists in the system.

## Main Flow — Create Project

1. The ADMIN navigates to the Project Management area and clicks "Create project".
2. The ADMIN fills in the required fields: `name`, `reference` (unique), `sciformaCode`, and selects a `projectManager` from the list of users with role PROJECT_MANAGER.
3. The ADMIN optionally fills in: `pordBia`, `pordProject`, initial status and its date.
4. The backend validates the input (reference uniqueness, valid project manager role).
5. The backend persists the project with:
   - An initial status history entry (status + manual date + author).
   - An initial project manager history entry (projectManager + start date + author).
6. The system confirms creation and displays the project detail page.

## Main Flow — Edit Project

1. An authorized actor (ADMIN or assigned PROJECT_MANAGER) navigates to the project detail page.
2. The actor edits one or more allowed fields.
3. The backend validates and persists the changes.
4. The system confirms the update.

### Editable fields by role

| Field | ADMIN | PROJECT_MANAGER (assigned) |
|---|---|---|
| Name | ✅ | ❌ |
| Reference | ✅ | ❌ |
| Sciforma code | ✅ | ✅ |
| PORD BIA | ✅ | ✅ |
| PORD Project | ✅ | ✅ |
| Project manager | ✅ | ❌ |
| Status | ✅ | ✅ |
| Due date | ✅ | ✅ |
| Budget lines | ✅ | ✅ |
| Progression | ✅ | ✅ |

## Main Flow — Change Project Manager

1. The ADMIN selects a new project manager from the list of users with role PROJECT_MANAGER.
2. The backend closes the current project manager history entry (sets end date) and creates a new one.
3. The system reflects the new project manager and preserves the full history.

## Main Flow — Change Status

1. An authorized actor selects a new status and enters a manual date for the transition.
2. The backend creates a new status history entry (status, manual date, author, timestamp).
3. The current status is derived from the most recent history entry.
4. If the project is `CLOSED` or `CANCELED`, it becomes editable again once a new active status (`DRAFT`, `BIA`, `PROJECT`) is recorded.

## Main Flow — Change Due Date

1. An authorized actor sets a new due date.
2. The backend creates a new due date history entry (date, changed by, changed at timestamp).
3. The current due date is derived from the most recent history entry.

## Main Flow — Manage Budget Lines

1. An authorized actor adds, edits, or removes a budget line on the project.
2. Each budget line contains: `type`, `amount`, and `date`.
3. Budget line types: `ENGAGEMENT_INITIAL`, `COMMANDE_COMPLEMENTAIRE`, `TRANSFERT`.
4. The total budget is always computed as the sum of all budget lines.
5. The system confirms the change and refreshes the total budget display.

## Main Flow — Record Progression

1. An authorized actor navigates to the Progression section of the project detail page.
2. The actor enters a progression value (integer percentage, 0–100) and a progression date.
3. The backend validates the input and creates a new `ProjectProgression` entry.
4. The system confirms the entry and displays the updated progression history.
5. The current progression is derived from the most recent entry by date.

## Alternative Flow — Reference Already Exists (Create)

1. The ADMIN tries to create a project with a reference that already exists.
2. The backend rejects the request.
3. The system displays: *"Project reference already exists"*.

## Alternative Flow — Read-Only Project (CLOSED / CANCELED)

1. An actor tries to edit a project in `CLOSED` or `CANCELED` status.
2. The backend rejects any modification other than a status change to an active status.
3. The system displays: *"This project is closed or canceled. Change its status to edit it."*

## Alternative Flow — Invalid Project Manager Selection

1. The ADMIN tries to assign a user without the PROJECT_MANAGER role as project manager.
2. The backend rejects the request.
3. The system displays: *"The selected user is not a project manager"*.

## Alternative Flow — Invalid Progression Value

1. An actor submits a progression value outside the 0–100 range.
2. The backend rejects the request with a validation error.
3. The system displays a field-level error message.

## Postconditions

- **Create project**: Project exists in the database with initial status and project manager history entries.
- **Change project manager**: New project manager is active; full history is preserved.
- **Change status**: New status is active; full history with manual dates is preserved.
- **Change due date**: New due date is active; full history is preserved.
- **Budget lines**: Total budget reflects the sum of all lines.
- **Progression**: New progression entry is recorded; full history is preserved.

## Non-functional Requirements

- All write operations are audited (who performed the action and when).
- The total budget is always computed server-side; never stored as a denormalized value (or kept in sync if cached).
- Only users with role PROJECT_MANAGER are selectable as project manager.
- Authorization is enforced server-side on every endpoint.
- A project in `CLOSED` or `CANCELED` status is read-only except for a status transition back to an active status.
- Progression values must be between 0 and 100 inclusive (validated server-side).
