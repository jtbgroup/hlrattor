# UC-04 - Imputation Management — Generation Prompt

## Context

This prompt is used to generate all the code and resources required to implement UC-04 (Imputation Management) in the hlrattor application.

### Stack

- **Backend**: Java 21, Spring Boot 3+, Spring Security (session-based, BCrypt 12), Spring Data JPA, Flyway, PostgreSQL 17+
- **Frontend**: Angular 19+, Angular Material, standalone components, lazy-loaded feature modules
- **Architecture**: Monorepo — backend serves the built frontend as static assets on port 8090 (production)

### Key Constraints

- Never use deprecated or legacy APIs.
- Spring Security config must not be modified — only new endpoints need to be secured via the existing configuration pattern.
- All write operations must be audited (`recordedBy`, `recordedAt`).
- Only ADMIN can create, edit, and delete imputations.
- All authenticated users (ADMIN and PROJECT_MANAGER) can read the global list.
- Imputations are managed through a dedicated standalone screen (`/imputations`) — not embedded inside a project detail page.
- The link to a project is resolved server-side by matching `imputationCode` against `project.sciformaCode`. The user never selects a project explicitly.
- The project FK is nullable: if no project matches the imputation code, the imputation is saved unlinked without error.
- The total of imputations is always computed server-side.
- All form labels, field hints, error messages, button labels, section titles, and table headers must be written in **French**.
- Required field indicators use a **single asterisk `*`** in labels. Never use double asterisk `**`.

---

## Data Model

### ProjectImputation

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| project | Project | FK, **nullable** — resolved server-side from imputationCode |
| imputationDate | LocalDate | Required |
| imputationCode | String | Required, free entry |
| task | String | Required, free text |
| person | String | Required, free text (external, not an AppUser) |
| amount | BigDecimal | Required, ≥ 0 |
| recordedBy | AppUser | FK, audit |
| recordedAt | Instant | System timestamp, audit |

---

## What to Generate

### 1. Backend

#### Entity & Repository

- `ProjectImputation` JPA entity:
  - `@ManyToOne(fetch = LAZY, optional = true)` to `Project` — nullable FK.
  - `@ManyToOne(fetch = LAZY, optional = false)` to `AppUser` for `recordedBy`.
  - `@Column(nullable = false)` on all required fields.
  - `@DecimalMin("0.0")` on `amount`.
  - No `@PrePersist` — `recordedAt` is set explicitly in the service.
- `ProjectImputationRepository` extending `JpaRepository`:
  - `List<ProjectImputation> findAllByOrderByImputationDateDesc()` — global list.
  - `List<ProjectImputation> findByProjectIdOrderByImputationDateDesc(UUID projectId)` — for project detail view (future use).

#### Imputation API

Standalone endpoints under `/api/imputations` (NOT nested under `/api/projects`):

- `GET /api/imputations` (authenticated — ADMIN and PROJECT_MANAGER):
  - Returns the full global list ordered by `imputationDate` descending.
  - Response includes computed `totalAmount`.
  - Optional query parameters for filtering: `imputationCode`, `person`, `dateFrom` (LocalDate), `dateTo` (LocalDate), `task`.

- `POST /api/imputations` (ADMIN only):
  - Body: `{ imputationDate, imputationCode, task, person, amount }`.
  - Validate all fields present and `amount >= 0`.
  - Resolve project FK: query `ProjectRepository.findBySciformaCode(imputationCode)` — set FK if found, leave null otherwise.
  - Persist with `recordedBy` = current user and `recordedAt` = `Instant.now()`.
  - Returns 201 with the created `ImputationResponseDto`.

- `PUT /api/imputations/{id}` (ADMIN only):
  - Body: `{ imputationDate, imputationCode, task, person, amount }`.
  - Same validations as POST.
  - Re-resolve project FK if `imputationCode` changed.
  - Returns 200 with the updated `ImputationResponseDto`.

- `DELETE /api/imputations/{id}` (ADMIN only):
  - Hard delete.
  - Returns 204 No Content.

#### DTOs

```java
// ImputationDto.java (request — create & update)
public record ImputationDto(
    @NotNull(message = "La date d'imputation est obligatoire.")
    LocalDate imputationDate,

    @NotBlank(message = "Le code d'imputation est obligatoire.")
    String imputationCode,

    @NotBlank(message = "La tâche est obligatoire.")
    String task,

    @NotBlank(message = "La personne est obligatoire.")
    String person,

    @NotNull(message = "Le montant est obligatoire.")
    @DecimalMin(value = "0.0", message = "Le montant doit être supérieur ou égal à zéro.")
    BigDecimal amount
) {}

// ImputationResponseDto.java
public record ImputationResponseDto(
    UUID id,
    LocalDate imputationDate,
    String imputationCode,
    String task,
    String person,
    BigDecimal amount,
    String recordedBy,
    Instant recordedAt
) {}

// ImputationListResponseDto.java
public record ImputationListResponseDto(
    List<ImputationResponseDto> imputations,
    BigDecimal totalAmount
) {}
```

#### Repository addition

Add the following method to `ProjectRepository`:

```java
Optional<Project> findBySciformaCode(String sciformaCode);
```

#### Service Layer — `ImputationService`

- `getImputations(filters)`: fetch all imputations (with optional filtering), compute `totalAmount`, map to DTOs.
- `addImputation(ImputationDto, username)`:
  - Resolve project: `projectRepository.findBySciformaCode(dto.imputationCode())` — nullable.
  - Set `recordedBy` from username, `recordedAt` = `Instant.now()`.
  - Save and return DTO.
- `updateImputation(UUID id, ImputationDto, username)`:
  - Load imputation or throw 404.
  - Re-resolve project FK.
  - Update fields and save.
- `deleteImputation(UUID id)`:
  - Load imputation or throw 404.
  - Hard delete.

#### Security

The existing `SecurityFilterChain` already protects `/api/**` for authenticated users. Add role-based restrictions:

```java
.requestMatchers(HttpMethod.GET, "/api/imputations/**").authenticated()
.requestMatchers(HttpMethod.POST, "/api/imputations/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.PUT, "/api/imputations/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.DELETE, "/api/imputations/**").hasRole("ADMIN")
```

#### Flyway Migration

- File: `V4__UC-04-imputations.sql`
- SQL header comment: `-- Use case: UC-04`

```sql
-- Use case: UC-04

CREATE TABLE project_imputation (
    id               UUID           PRIMARY KEY,
    project_id       UUID           REFERENCES project(id) ON DELETE SET NULL,
    imputation_date  DATE           NOT NULL,
    imputation_code  VARCHAR(100)   NOT NULL,
    task             TEXT           NOT NULL,
    person           VARCHAR(255)   NOT NULL,
    amount           NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    recorded_by      UUID           NOT NULL REFERENCES app_user(id),
    recorded_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_imputation_project  ON project_imputation(project_id);
CREATE INDEX idx_imputation_code     ON project_imputation(imputation_code);
CREATE INDEX idx_imputation_date     ON project_imputation(imputation_date DESC);
CREATE INDEX idx_imputation_person   ON project_imputation(person);
```

Note: `project_id` is nullable with `ON DELETE SET NULL` — if a project is deleted, imputations are kept but unlinked.

---

### 2. Frontend

#### Imputation Feature Module

Lazy-loaded at route `/imputations`, accessible to all authenticated users (protected by existing `authGuard`).

##### Imputation List Page (`/imputations`)

- Material table with columns: `Date`, `Code d'imputation`, `Tâche`, `Personne`, `Montant (€)`, `Actions`.
- Footer row: **Total : X,XX €** (formatted as currency, computed from the full list).
- Default sort: imputation date descending.
- Filter bar above the table with inputs for: code d'imputation, personne, tâche, date début, date fin.
- Empty state: *"Aucune imputation enregistrée."*
- "Ajouter une imputation" button: visible only for ADMIN.
- Edit / Delete actions per row: visible only for ADMIN.

##### Add / Edit Imputation Form (dialog)

All labels and errors in French. Required fields marked with `*`. Fields:

| Field | Label | Type | Validation |
|---|---|---|---|
| imputationDate | Date d'imputation `*` | Date picker | Required |
| imputationCode | Code d'imputation `*` | Text input | Required |
| task | Tâche `*` | Text input | Required |
| person | Personne `*` | Text input | Required |
| amount | Montant (€) `*` | Number input | Required, ≥ 0 |

Error messages:
- Missing required field: *"Ce champ est obligatoire."*
- Negative amount: *"Le montant doit être supérieur ou égal à zéro."*

**No project selector** — the project link is invisible to the user.

##### Delete Confirmation Dialog

- Message: *"Êtes-vous sûr de vouloir supprimer cette imputation ?"*
- Buttons: *"Annuler"* / *"Supprimer"*

#### Imputation Service

```typescript
export interface ImputationDto {
  imputationDate: string;     // ISO date
  imputationCode: string;
  task: string;
  person: string;
  amount: number;
}

export interface ImputationResponse {
  id: string;
  imputationDate: string;
  imputationCode: string;
  task: string;
  person: string;
  amount: number;
  recordedBy: string;
  recordedAt: string;
}

export interface ImputationListResponse {
  imputations: ImputationResponse[];
  totalAmount: number;
}

// Methods on ImputationService:
getImputations(filters?: ImputationFilters): Observable<ImputationListResponse>
addImputation(payload: ImputationDto): Observable<ImputationResponse>
updateImputation(id: string, payload: ImputationDto): Observable<ImputationResponse>
deleteImputation(id: string): Observable<void>
```

#### Navigation

Add an "Imputations" entry to the main navigation bar, visible to all authenticated users.

---

## Expected File Structure

```
backend/
├── src/main/java/.../
│   ├── entity/
│   │   └── ProjectImputation.java
│   ├── repository/
│   │   └── ProjectImputationRepository.java
│   │   (+ findBySciformaCode added to ProjectRepository)
│   ├── dto/
│   │   ├── ImputationDto.java
│   │   ├── ImputationResponseDto.java
│   │   └── ImputationListResponseDto.java
│   ├── service/
│   │   └── ImputationService.java
│   └── controller/
│       └── ImputationController.java
└── src/main/resources/
    └── db/migration/V4__UC-04-imputations.sql

frontend/
└── src/app/
    ├── app.routes.ts                        (add /imputations route)
    └── features/
        └── imputations/
            ├── imputations.routes.ts
            ├── imputation-list/
            │   ├── imputation-list.component.ts
            │   ├── imputation-list.component.html
            │   └── imputation-list.component.scss
            └── imputation-form/
                ├── imputation-form.component.ts
                ├── imputation-form.component.html
                └── imputation-form.component.scss
    └── core/services/
        └── imputation.service.ts
```

---

## Validation Checklist

- [ ] The imputation list is accessible at `/imputations` — NOT nested under a project route.
- [ ] Only ADMIN can add, edit, and delete imputations (POST/PUT/DELETE return 403 for PROJECT_MANAGER).
- [ ] ADMIN and PROJECT_MANAGER can read the global list (GET returns 200).
- [ ] All imputation fields are required; missing fields return 400.
- [ ] A negative amount is rejected with a 400 error.
- [ ] The project FK is resolved server-side from `imputationCode` matching `sciformaCode` — no project selector in the UI.
- [ ] If no project matches the imputation code, the imputation is saved with a null project FK (no error).
- [ ] If a project is deleted, its linked imputations remain with `project_id = NULL` (ON DELETE SET NULL).
- [ ] The total amount is always computed server-side and returned in the list response.
- [ ] Delete requires explicit user confirmation before execution.
- [ ] All endpoints return correct HTTP status codes (200/201/204/400/401/403/404).
- [ ] API responses never leak sensitive user data.
- [ ] All form labels, error messages, and UI text are in French.
- [ ] Required fields are marked with a single asterisk `*`.
- [ ] Flyway migration V4 runs cleanly on a database that already has V1, V2, and V3 applied.
