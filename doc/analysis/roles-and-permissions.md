# Roles & Permissions

## Summary

The application defines two roles: `ADMIN` and `PROJECT_MANAGER`. Access to features and data is controlled by role and, for project-related operations, by project assignment context.

A user with `enabled=false` cannot authenticate regardless of their role. Any active session for a disabled user is immediately invalidated.

## Roles

### ADMIN

A privileged user responsible for managing the application's users and projects.

- Can access all features without restriction.
- Is the only role that can create users, change user roles, and disable users.
- Is the only role that can create projects and change the project manager of a project.
- Cannot disable their own account (or the last remaining ADMIN account).

### PROJECT_MANAGER

A user responsible for one or more projects. Access to project data is split into two levels:

- **Global**: can view all projects and their details (read-only).
- **Contextual**: can edit a project only if they are the **currently assigned project manager** of that project. This assignment is tracked via the project manager history (see [UC-03](use-cases/UC-03-project-management.md)).

A PROJECT_MANAGER cannot manage users or create projects.

---

## Permissions Matrix

### User Management — [UC-02](use-cases/UC-02-user-management.md)

| Action | ADMIN | PROJECT_MANAGER |
|---|---|---|
| View user list | ✅ | ❌ |
| Create user | ✅ | ❌ |
| Edit user (role, status, name, email) | ✅ | ❌ |
| Disable user | ✅ | ❌ |
| Change own password | ✅ | ✅ |

### Project Management — [UC-03](use-cases/UC-03-project-management.md)

| Action | ADMIN | PROJECT_MANAGER (assigned) | PROJECT_MANAGER (not assigned) |
|---|---|---|---|
| View project list | ✅ | ✅ | ✅ |
| View project detail | ✅ | ✅ | ✅ |
| Create project | ✅ | ❌ | ❌ |
| Edit name / reference | ✅ | ❌ | ❌ |
| Edit Sciforma code / PORD | ✅ | ✅ | ❌ |
| Change project manager | ✅ | ❌ | ❌ |
| Change status | ✅ | ✅ | ❌ |
| Change due date | ✅ | ✅ | ❌ |
| Add / edit / delete budget lines | ✅ | ✅ | ❌ |

> A project in `CLOSED` or `CANCELED` status is read-only for all roles. The only permitted action is a status transition back to an active status (`DRAFT`, `BIA`, or `PROJECT`).

---

## Disabled Users

A user with `enabled=false`:

- Cannot authenticate, regardless of their role (see [UC-01](use-cases/UC-01-authentication.md)).
- Has any active session immediately invalidated at the time of disabling (see [UC-02](use-cases/UC-02-user-management.md)).
- Remains in the database and in historical records (project manager history, audit trails) but does not appear in selection lists (e.g., project manager picker).

---

## Role Assignment Rules

- A user's role is set at creation and can be changed by an ADMIN (see [UC-02](use-cases/UC-02-user-management.md)).
- Only users with role `PROJECT_MANAGER` are selectable as project manager on a project (see [UC-03](use-cases/UC-03-project-management.md)).
- There must always be at least one enabled ADMIN in the system.
