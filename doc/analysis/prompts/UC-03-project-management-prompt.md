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

---

## Data Model

### Project

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | Required |
| reference | String | Required, unique |
| sciformaCode | String | Required |
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
| pordReference | String | Optional, free text |
| createdBy | AppUser | Audit |
| createdAt | Instant | Audit |
| updatedBy | AppUser | Audit |
| updatedAt | Instant | Audit |

---

## What to Generate

### 1. Backend

#### Entities & Repositories

- `Project` entity with fields as described above.
- `ProjectStatusHistory` entity.
- `ProjectManagerHistory` entity.
- `DueDateHistory` entity.
- `BudgetLine` entity with `BudgetLineType` enum (`ENGAGEMENT_INITIAL`, `COMMANDE_COMPLEMENTAIRE`, `TRANSFERT`).
- `ProjectStatus` enum: `DRAFT`, `BIA`, `PROJECT`, `CANCELED`, `CLOSED`.
- Repositories for all entities extending `JpaRepository`.

#### Project API

Create a controller and service exposing the following endpoints under `/api/projects`:

**Project CRUD**

- `GET /api/projects` (authenticated): list all projects with current status, current project manager, current due date, and total budget.
- `GET /api/projects/{id}` (authenticated): get full project detail including all history entries and budget lines.
- `POST /api/projects` (ADMIN only): create a new project.
  - Body: `{ name, reference, sciformaCode, pordBia?, pordProject?, projectManagerId, initialStatus, statusDate }`.
  - Validate reference uniqueness.
  - Validate projectManagerId refers to an enabled user with role PROJECT_MANAGER.
  - Create initial `ProjectStatusHistory` and `ProjectManagerHistory` entries.
  - Audit creation.
- `PUT /api/projects/{id}` (ADMIN or assigned PROJECT_MANAGER): update project fields.
  - ADMIN can update: name, reference, sciformaCode, pordBia, pordProject.
  - PROJECT_MANAGER (assigned) can update: sciformaCode, pordBia, pordProject.
  - Reject if project is CLOSED or CANCELED (unless the request only changes status).
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
  - Body: `{ type, amount, date, pordReference? }`.
  - Reject if project is CLOSED or CANCELED.
- `PUT /api/projects/{id}/budget-lines/{lineId}` (ADMIN or assigned PROJECT_MANAGER):
  - Body: `{ type, amount, date, pordReference? }`.
  - Reject if project is CLOSED or CANCELED.
- `DELETE /api/projects/{id}/budget-lines/{lineId}` (ADMIN or assigned PROJECT_MANAGER):
  - Reject if project is CLOSED or CANCELED.

#### Service Layer

Create a `ProjectService` encapsulating:
- Reference uniqueness check.
- Project manager role validation (must be enabled PROJECT_MANAGER).
- Read-only enforcement (CLOSED/CANCELED).
- Authorization check: is the current user ADMIN or the assigned PROJECT_MANAGER?
- Total budget computation (sum of all budget lines).
- History management for status, project manager, and due date.

#### Security

- Extend existing security configuration to protect `/api/projects/**`:
  - `GET` endpoints: any authenticated user.
  - `POST /api/projects`: ADMIN only.
  - All other write endpoints: ADMIN or assigned PROJECT_MANAGER (enforced in service layer, not just security config).
  - Return 401/403 with appropriate HTTP status codes.

#### DTOs

- `ProjectSummaryDto`: id, reference, name, currentStatus, currentProjectManager (username), currentDueDate, totalBudget.
- `ProjectDetailDto`: all fields + full history lists + budget lines.
- `CreateProjectDto`: name, reference, sciformaCode, pordBia, pordProject, projectManagerId, initialStatus, statusDate.
- `UpdateProjectDto`: name, reference, sciformaCode, pordBia, pordProject (role-filtered server-side).
- `StatusChangeDto`: status, businessDate.
- `ProjectManagerChangeDto`: projectManagerId.
- `DueDateChangeDto`: dueDate.
- `BudgetLineDto`: type, amount, date, pordReference.
- `BudgetLineResponseDto`: id + all BudgetLineDto fields + audit fields.
- `ProjectStatusHistoryDto`: id, status, businessDate, changedBy (username), changedAt.
- `ProjectManagerHistoryDto`: id, projectManager (username), startDate, endDate, assignedBy (username), assignedAt.
- `DueDateHistoryDto`: id, dueDate, changedBy (username), changedAt.

#### Flyway Migration

- File: `V3__UC-03-project-management.sql`
- Header comment: `-- Use case: UC-03`
- Creates tables: `project`, `project_status_history`, `project_manager_history`, `due_date_history`, `budget_line`.
- Foreign keys to `app_user` where applicable.
- Indexes on `project.reference` (unique), `project_status_history.project_id`, `project_manager_history.project_id`, `due_date_history.project_id`, `budget_line.project_id`.

---

### 2. Frontend

#### Project Feature Module

Create a lazy-loaded feature module at route `/projects`.

##### Project List Page (`/projects`)

- Displays a Material table with columns: reference, name, status (badge/chip), project manager, due date, total budget.
- Sortable columns, filterable by status and project manager.
- "Create project" button visible only for ADMIN.
- Row click navigates to project detail.

##### Project Detail Page (`/projects/:id`)

Sections:
1. **Header**: reference, name, Sciforma code, PORD BIA, PORD Project — editable per role rules.
2. **Status**: current status chip + "Change status" action (opens inline form or dialog: status select + date picker). Full status history table below.
3. **Project Manager**: current project manager display + "Change project manager" button (ADMIN only, opens dialog with PM select). Full PM history table below.
4. **Due Date**: current due date + "Change due date" action. Full due date history table below.
5. **Budget**: total budget display (computed). Budget lines table with add/edit/delete actions. Each line shows type, amount (formatted as currency), date, PORD reference.

##### Create Project Dialog / Page

- Fields: name, reference, Sciforma code, PORD BIA (optional), PORD Project (optional), project manager (select, filtered to PROJECT_MANAGER role), initial status (select), status date (date picker).
- Frontend validation: required fields, reference format if applicable.

##### Budget Line Form (inline or dialog)

- Fields: type (select), amount (number), date (date picker), PORD reference (optional text).

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

- Reuse `UserService.getUsers()` (filtered to PROJECT_MANAGER role) for PM selection lists.

#### Authorization

- Route `/projects` and `/projects/:id`: any authenticated user (protected by existing `authGuard`).
- UI controls (edit buttons, create button) conditionally rendered based on current user role and project assignment.
- Server-side authorization is the source of truth; frontend hides unauthorized controls for UX only.

---

## Expected File Structure

```
backend/
├── src/main/java/.../
│   ├── entity/
│   │   ├── Project.java
│   │   ├── ProjectStatus.java          (enum)
│   │   ├── ProjectStatusHistory.java
│   │   ├── ProjectManagerHistory.java
│   │   ├── DueDateHistory.java
│   │   ├── BudgetLine.java
│   │   └── BudgetLineType.java         (enum)
│   ├── repository/
│   │   ├── ProjectRepository.java
│   │   ├── ProjectStatusHistoryRepository.java
│   │   ├── ProjectManagerHistoryRepository.java
│   │   ├── DueDateHistoryRepository.java
│   │   └── BudgetLineRepository.java
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
    └── budget-line-form/
        ├── budget-line-form.component.ts
        ├── budget-line-form.component.html
        └── budget-line-form.component.scss
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
- [ ] Total budget is always the server-side sum of all budget lines.
- [ ] A CLOSED or CANCELED project rejects all modifications except a status change back to an active status.
- [ ] A non-assigned PROJECT_MANAGER cannot edit a project (403 from backend).
- [ ] All endpoints return correct HTTP status codes (400/401/403/404/200/201).
- [ ] API responses never leak sensitive user data (no hashed passwords).
- [ ] Flyway migration V3 runs cleanly on a database that already has V1 and V2 applied.
