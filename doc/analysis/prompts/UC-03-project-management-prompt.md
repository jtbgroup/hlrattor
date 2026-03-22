# UC-03 - Project Management — Generation Prompt

## Context

This prompt is used to generate all the code and resources required to implement UC-03 (Project Management) in the hlrattor application.

### Stack

- **Backend**: Java 21, Spring Boot 3+, Spring Security (session-based, BCrypt 12), Spring Data JPA, Flyway, PostgreSQL 17+
- **Frontend**: Angular 19+, Angular Material, standalone components, lazy-loaded feature modules
- **Architecture**: Monorepo — backend serves the built frontend as static assets on port 8090 (production)

### Key Constraints

- Never use deprecated or legacy APIs.
- Spring Security config must not be modified — only new endpoints need to be secured via the existing configuration pattern.
- All write operations must be audited (who performed the action + system timestamp).
- Authorization is enforced server-side on every endpoint.
- A project in `CLOSED` or `CANCELED` status is read-only, except for a status transition back to an active status.
- Total budget is always computed server-side as the sum of all budget lines.
- All form labels, field hints, error messages, and UI text must be in French.
- Required field indicators use a single asterisk `*` (never `**`).

---

## Data Model

### Project

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | Required |
| reference | String | Required, unique |
| imputationCode | String | Required |
| pordBia | String | Optional, free text |
| pordProject | String | Optional, free text |
| createdBy | AppUser | Audit |
| createdAt | Instant | Audit |

### ProjectStatusHistory

Tracks every status change. The current status is the most recent entry.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| project | Project | FK |
| status | Enum | DRAFT, BIA, PROJECT, CANCELED, CLOSED |
| businessDate | LocalDate | Manual date entered by the user |
| changedBy | AppUser | Who made the change |
| changedAt | Instant | System timestamp |

### ProjectManagerHistory

Tracks every project manager assignment. The current PM is the entry with no end date.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| project | Project | FK |
| projectManager | AppUser | FK, must have role PROJECT_MANAGER |
| startDate | LocalDate | When the assignment started |
| endDate | LocalDate | Null if currently active |
| assignedBy | AppUser | Who made the assignment |
| assignedAt | Instant | System timestamp |

### DueDateHistory

Tracks every due date change. The current due date is the most recent entry.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| project | Project | FK |
| dueDate | LocalDate | The due date value |
| changedBy | AppUser | Who made the change |
| changedAt | Instant | System timestamp |

### BudgetLine

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| project | Project | FK |
| type | Enum | ENGAGEMENT_INITIAL, COMMANDE_COMPLEMENTAIRE, TRANSFERT |
| amount | BigDecimal | Required |
| date | LocalDate | Required |
| createdBy | AppUser | Audit |
| createdAt | Instant | Audit |
| updatedBy | AppUser | Audit |
| updatedAt | Instant | Audit |

> ⚠️ `BudgetLine` has no `pordReference` field. This field has been intentionally removed from the model.

### ProjectProgression

Tracks every progression entry. The current progression is the most recent entry by `progressionDate`.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| project | Project | FK |
| value | Integer | Required, 0–100 inclusive |
| progressionDate | LocalDate | Business date entered by the user |
| recordedBy | AppUser | Who recorded the entry |
| recordedAt | Instant | System timestamp |

---

## What to Generate

### 1. Backend

#### Entities & Repositories

- `Project` entity with fields as described above.
- `ProjectStatusHistory` entity.
- `ProjectManagerHistory` entity.
- `DueDateHistory` entity.
- `BudgetLine` entity with `BudgetLineType` enum (`ENGAGEMENT_INITIAL`, `COMMANDE_COMPLEMENTAIRE`, `TRANSFERT`). No `pordReference` field.
- `ProjectProgression` entity with `value` (Integer, validated 0–100), `progressionDate` (LocalDate), `recordedBy` (AppUser FK), `recordedAt` (Instant).
- `ProjectStatus` enum: `DRAFT`, `BIA`, `PROJECT`, `CANCELED`, `CLOSED`.
- Repositories for all entities extending `JpaRepository`.

#### Project API

Create a controller and service exposing the following endpoints under `/api/projects`:

**Project CRUD**

- `GET /api/projects` (authenticated): list all projects with current status, current project manager, current due date, current progression, and total budget.
- `GET /api/projects/{id}` (authenticated): get full project detail including all history entries, budget lines, and progression history.
- `POST /api/projects` (ADMIN only): create a new project.
  - Body: `{ name, reference, imputationCode, pordBia?, pordProject?, projectManagerId, initialStatus, statusDate }`.
  - Validate reference uniqueness.
  - Validate projectManagerId refers to an enabled user with role PROJECT_MANAGER.
  - Create initial `ProjectStatusHistory` and `ProjectManagerHistory` entries.
  - Audit creation.
- `PUT /api/projects/{id}` (ADMIN or assigned PROJECT_MANAGER): update project fields.
  - ADMIN can update: name, reference, imputationCode, pordBia, pordProject.
  - PROJECT_MANAGER (assigned) can update: imputationCode, pordBia, pordProject.
  - Reject if project is CLOSED or CANCELED.
  - Validate reference uniqueness if changed.

**Status Management**

- `POST /api/projects/{id}/status` (ADMIN or assigned PROJECT_MANAGER):
  - Body: `{ status, businessDate }`.
  - Creates a new `ProjectStatusHistory` entry.
  - If new status is CLOSED or CANCELED: project becomes read-only.
  - If new status is DRAFT, BIA, or PROJECT: project becomes editable again.

**Project Manager Management**

- `POST /api/projects/{id}/project-manager` (ADMIN only):
  - Body: `{ projectManagerId }`.
  - Validates that the user has role PROJECT_MANAGER.
  - Closes current `ProjectManagerHistory` entry (sets endDate to today).
  - Creates a new `ProjectManagerHistory` entry.

**Due Date Management**

- `POST /api/projects/{id}/due-date` (ADMIN or assigned PROJECT_MANAGER):
  - Body: `{ dueDate }`.
  - Creates a new `DueDateHistory` entry.
  - Reject if project is CLOSED or CANCELED.

**Budget Lines**

- `POST /api/projects/{id}/budget-lines` (ADMIN or assigned PROJECT_MANAGER):
  - Body: `{ type, amount, date }`.
  - Reject if project is CLOSED or CANCELED.
- `PUT /api/projects/{id}/budget-lines/{lineId}` (ADMIN or assigned PROJECT_MANAGER):
  - Body: `{ type, amount, date }`.
  - Reject if project is CLOSED or CANCELED.
- `DELETE /api/projects/{id}/budget-lines/{lineId}` (ADMIN or assigned PROJECT_MANAGER):
  - Reject if project is CLOSED or CANCELED.

**Progression**

- `POST /api/projects/{id}/progressions` (ADMIN or assigned PROJECT_MANAGER):
  - Body: `{ value, progressionDate }`.
  - Validate `value` is between 0 and 100 inclusive (server-side `@Min(0) @Max(100)`).
  - Validate `progressionDate` is not null.
  - Reject if project is CLOSED or CANCELED.
  - Creates a new `ProjectProgression` entry with `recordedBy` = current user and `recordedAt` = now().

#### Service Layer

Create a `ProjectService` encapsulating:
- Reference uniqueness check.
- Project manager role validation (must be enabled PROJECT_MANAGER).
- Read-only enforcement (CLOSED/CANCELED).
- Authorization check: is the current user ADMIN or the assigned PROJECT_MANAGER?
- Total budget computation (sum of all budget lines).
- History management for status, project manager, due date, and progression.
- Current progression derivation: most recent entry ordered by `progressionDate` descending.

#### Security

- Extend existing security configuration to protect `/api/projects/**`:
  - `GET` endpoints: any authenticated user.
  - `POST /api/projects`: ADMIN only.
  - All other write endpoints: ADMIN or assigned PROJECT_MANAGER (enforced in service layer).
  - Return 401/403 with appropriate HTTP status codes.

#### DTOs

- `ProjectSummaryDto`: id, reference, name, currentStatus, currentProjectManager (username), currentDueDate, currentProgression (Integer, nullable), totalBudget.
- `ProjectDetailDto`: all fields + full history lists + budget lines + progression history.
- `CreateProjectDto`: name, reference, imputationCode, pordBia, pordProject, projectManagerId, initialStatus, statusDate.
- `UpdateProjectDto`: name, reference, imputationCode, pordBia, pordProject (role-filtered server-side).
- `StatusChangeDto`: status, businessDate.
- `ProjectManagerChangeDto`: projectManagerId.
- `DueDateChangeDto`: dueDate.
- `BudgetLineDto`: type, amount, date. (no pordReference)
- `BudgetLineResponseDto`: id + all BudgetLineDto fields + audit fields.
- `ProgressionDto`: value (Integer, @Min(0) @Max(100)), progressionDate (LocalDate).
- `ProgressionResponseDto`: id, value, progressionDate, recordedBy (username), recordedAt.
- `ProjectStatusHistoryDto`: id, status, businessDate, changedBy (username), changedAt.
- `ProjectManagerHistoryDto`: id, projectManager (username), startDate, endDate, assignedBy (username), assignedAt.
- `DueDateHistoryDto`: id, dueDate, changedBy (username), changedAt.

#### Flyway Migration

- File: `V3__UC-03-project-management.sql`
- Header comment: `-- Use case: UC-03`
- Creates tables: `project`, `project_status_history`, `project_manager_history`, `due_date_history`, `budget_line`, `project_progression`.
- `budget_line` table has NO `pord_reference` column.
- `project_progression` table: `id` (UUID PK), `project_id` (UUID FK), `value` (INTEGER NOT NULL CHECK value BETWEEN 0 AND 100), `progression_date` (DATE NOT NULL), `recorded_by` (UUID FK to app_user), `recorded_at` (TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()).
- Foreign keys to `app_user` where applicable.
- Indexes on `project.reference` (unique), `project_status_history.project_id`, `project_manager_history.project_id`, `due_date_history.project_id`, `budget_line.project_id`, `project_progression.project_id`.

```sql
-- Use case: UC-03

CREATE TABLE project (
    id            UUID         PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    reference     VARCHAR(100) NOT NULL UNIQUE,
    imputation_code VARCHAR(100) NOT NULL,
    pord_bia      VARCHAR(255),
    pord_project  VARCHAR(255),
    created_by    UUID         NOT NULL REFERENCES app_user(id),
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE project_status_history (
    id            UUID        PRIMARY KEY,
    project_id    UUID        NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    status        VARCHAR(50) NOT NULL,
    business_date DATE        NOT NULL,
    changed_by    UUID        NOT NULL REFERENCES app_user(id),
    changed_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_status_history_project ON project_status_history(project_id);

CREATE TABLE project_manager_history (
    id                 UUID NOT NULL PRIMARY KEY,
    project_id         UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    project_manager_id UUID NOT NULL REFERENCES app_user(id),
    start_date         DATE NOT NULL,
    end_date           DATE,
    assigned_by        UUID NOT NULL REFERENCES app_user(id),
    assigned_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_pm_history_project ON project_manager_history(project_id);

CREATE TABLE due_date_history (
    id         UUID NOT NULL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    due_date   DATE NOT NULL,
    changed_by UUID NOT NULL REFERENCES app_user(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_due_date_history_project ON due_date_history(project_id);

CREATE TABLE budget_line (
    id         UUID           PRIMARY KEY,
    project_id UUID           NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    type       VARCHAR(50)    NOT NULL,
    amount     NUMERIC(15, 2) NOT NULL,
    date       DATE           NOT NULL,
    created_by UUID           NOT NULL REFERENCES app_user(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID           REFERENCES app_user(id),
    updated_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_budget_line_project ON budget_line(project_id);

CREATE TABLE project_progression (
    id               UUID    PRIMARY KEY,
    project_id       UUID    NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    value            INTEGER NOT NULL CHECK (value >= 0 AND value <= 100),
    progression_date DATE    NOT NULL,
    recorded_by      UUID    NOT NULL REFERENCES app_user(id),
    recorded_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_progression_project ON project_progression(project_id);
```

---

### 2. Frontend

#### General Frontend Constraints

- All form labels, placeholders, field hints, error messages, button labels, section titles, and table headers must be written in **French**.
- Required field indicators use a **single asterisk `*`** in labels (e.g., `Référence *`). Never use double asterisk `**`.

#### Project Feature Module

Create a lazy-loaded feature module at route `/projects`.

##### Project List Page (`/projects`)

- Displays a Material table with columns: référence, nom, statut (badge/chip), chef de projet, échéance, progression (%), budget total.
- Sortable columns, filterable by status and project manager.
- "Créer un projet" button visible only for ADMIN.
- Row click navigates to project detail.

##### Project Detail Page (`/projects/:id`)

Sections:
1. **En-tête**: référence, nom, code Imputation, PORD BIA, PORD Projet — editable per role rules.
2. **Statut**: current status chip + "Modifier le statut" action (opens inline form or dialog: statut select + sélecteur de date). Full status history table below.
3. **Chef de projet**: current project manager display + "Modifier le chef de projet" button (ADMIN only). Full PM history table below.
4. **Échéance**: current due date + "Modifier l'échéance" action. Full due date history table below.
5. **Progression**: current progression value as percentage + "Ajouter une progression" button. Full progression history table below (columns: valeur, date de progression, enregistré par, enregistré le).
6. **Budget**: total budget display (computed). Budget lines table with add/edit/delete actions. Each line shows type, amount (formatted as currency), date.

##### Create Project Dialog / Page

All labels and errors in French. Required fields marked with `*` (single asterisk). Fields:
- Nom `*`
- Référence `*`
- Code Imputation `*`
- PORD BIA (optional)
- PORD Projet (optional)
- Chef de projet `*` (select, filtered to PROJECT_MANAGER role)
- Statut initial `*` (select)
- Date de statut `*` (date picker)

##### Budget Line Form (inline or dialog)

All labels and errors in French. Required fields marked with `*`. Fields:
- Type `*` (select: ENGAGEMENT_INITIAL, COMMANDE_COMPLEMENTAIRE, TRANSFERT)
- Montant `*` (number)
- Date `*` (date picker)

##### Progression Form (inline or dialog)

All labels and errors in French. Required fields marked with `*`. Fields:
- Progression `*` (integer input, 0–100, with hint "Valeur en pourcentage (0–100)")
- Date de progression `*` (date picker)

Error messages:
- Value < 0 or > 100: *"La progression doit être comprise entre 0 et 100."*
- Missing date: *"La date de progression est obligatoire."*

#### Services

- `ProjectService`:
  - `getProjects()` → `GET /api/projects`
  - `getProject(id)` → `GET /api/projects/{id}`
  - `createProject(payload)` → `POST /api/projects`
  - `updateProject(id, payload)` → `PUT /api/projects/{id}`
  - `changeStatus(id, payload)` → `POST /api/projects/{id}/status`
  - `changeProjectManager(id, payload)` → `POST /api/projects/{id}/project-manager`
  - `changeDueDate(id, payload)` → `POST /api/projects/{id}/due-date`
  - `addBudgetLine(id, payload)` → `POST /api/projects/{id}/budget-lines`
  - `updateBudgetLine(id, lineId, payload)` → `PUT /api/projects/{id}/budget-lines/{lineId}`
  - `deleteBudgetLine(id, lineId)` → `DELETE /api/projects/{id}/budget-lines/{lineId}`
  - `addProgression(id, payload)` → `POST /api/projects/{id}/progressions`

- Reuse `UserService.getUsers()` (filtered to PROJECT_MANAGER role) for PM selection lists.

#### Authorization

- Route `/projects` and `/projects/:id`: any authenticated user (protected by existing `authGuard`).
- UI controls (edit buttons, create button, add progression button) conditionally rendered based on current user role and project assignment.
- Server-side authorization is the source of truth; frontend hides unauthorized controls for UX only.

---

## Expected File Structure

```
backend/
├── src/main/java/.../
│   ├── entity/
│   │   ├── Project.java
│   │   ├── ProjectStatus.java                (enum)
│   │   ├── ProjectStatusHistory.java
│   │   ├── ProjectManagerHistory.java
│   │   ├── DueDateHistory.java
│   │   ├── BudgetLine.java
│   │   ├── BudgetLineType.java               (enum)
│   │   └── ProjectProgression.java
│   ├── repository/
│   │   ├── ProjectRepository.java
│   │   ├── ProjectStatusHistoryRepository.java
│   │   ├── ProjectManagerHistoryRepository.java
│   │   ├── DueDateHistoryRepository.java
│   │   ├── BudgetLineRepository.java
│   │   └── ProjectProgressionRepository.java
│   ├── dto/
│   │   ├── ProjectSummaryDto.java
│   │   ├── ProjectDetailDto.java
│   │   ├── CreateProjectDto.java
│   │   ├── UpdateProjectDto.java
│   │   ├── StatusChangeDto.java
│   │   ├── ProjectManagerChangeDto.java
│   │   ├── DueDateChangeDto.java
│   │   ├── BudgetLineDto.java
│   │   ├── BudgetLineResponseDto.java
│   │   ├── ProgressionDto.java
│   │   ├── ProgressionResponseDto.java
│   │   ├── ProjectStatusHistoryDto.java
│   │   ├── ProjectManagerHistoryDto.java
│   │   └── DueDateHistoryDto.java
│   ├── service/ProjectService.java
│   └── controller/ProjectController.java
└── src/main/resources/
    └── db/migration/V3__UC-03-project-management.sql

frontend/
└── src/app/features/projects/
    ├── projects.routes.ts
    ├── project-list/
    │   ├── project-list.component.ts
    │   ├── project-list.component.html
    │   └── project-list.component.scss
    ├── project-detail/
    │   ├── project-detail.component.ts
    │   ├── project-detail.component.html
    │   └── project-detail.component.scss
    ├── project-form/
    │   ├── project-form.component.ts
    │   ├── project-form.component.html
    │   └── project-form.component.scss
    ├── budget-line-form/
    │   ├── budget-line-form.component.ts
    │   ├── budget-line-form.component.html
    │   └── budget-line-form.component.scss
    └── progression-form/
        ├── progression-form.component.ts
        ├── progression-form.component.html
        └── progression-form.component.scss
```

---

## Validation Checklist

- [ ] ADMIN can create a project with all required fields.
- [ ] Project reference is unique; duplicate is rejected with a clear error.
- [ ] Only users with role PROJECT_MANAGER appear in the PM selection list.
- [ ] Status changes are recorded in history with the manual business date and author.
- [ ] Project manager changes close the previous history entry and open a new one.
- [ ] Due date changes are recorded in history with author and system timestamp.
- [ ] Budget lines can be added, edited, and deleted by ADMIN and assigned PROJECT_MANAGER.
- [ ] Budget lines have no pordReference field (removed from model, DTO, form, and table).
- [ ] Total budget is always the server-side sum of all budget lines.
- [ ] Progression entries can be added by ADMIN and assigned PROJECT_MANAGER.
- [ ] Progression value is validated server-side (0–100 inclusive); invalid values are rejected with 400.
- [ ] Progression history is append-only; current progression is the most recent entry by date.
- [ ] A CLOSED or CANCELED project rejects all modifications including progression entries, except a status change back to an active status.
- [ ] A non-assigned PROJECT_MANAGER cannot edit a project (403 from backend).
- [ ] All form labels, error messages, and UI text are in French.
- [ ] Required fields are marked with a single asterisk `*`.
- [ ] All endpoints return correct HTTP status codes (400/401/403/404/200/201).
- [ ] API responses never leak sensitive user data (no hashed passwords).
- [ ] Frontend guards prevent unauthorized access.
- [ ] Flyway migration V3 runs cleanly on a database that already has V1 and V2 applied.
