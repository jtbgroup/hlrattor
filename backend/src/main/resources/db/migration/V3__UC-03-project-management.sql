-- Use case: UC-03

CREATE TABLE project
(
    id             UUID         NOT NULL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    reference      VARCHAR(100) NOT NULL,
    sciforma_code  VARCHAR(100) NOT NULL,
    pord_bia       VARCHAR(100),
    pord_project   VARCHAR(100),
    created_by_id  UUID         NOT NULL REFERENCES app_user (id),
    created_at     TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_reference UNIQUE (reference)
);

CREATE INDEX idx_project_reference ON project (reference);

CREATE TABLE project_status_history
(
    id            UUID        NOT NULL PRIMARY KEY,
    project_id    UUID        NOT NULL REFERENCES project (id) ON DELETE CASCADE,
    status        VARCHAR(50) NOT NULL,
    business_date DATE        NOT NULL,
    changed_by_id UUID        NOT NULL REFERENCES app_user (id),
    changed_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_status_history_project_id ON project_status_history (project_id);

CREATE TABLE project_manager_history
(
    id                 UUID        NOT NULL PRIMARY KEY,
    project_id         UUID        NOT NULL REFERENCES project (id) ON DELETE CASCADE,
    project_manager_id UUID        NOT NULL REFERENCES app_user (id),
    start_date         DATE        NOT NULL,
    end_date           DATE,
    assigned_by_id     UUID        NOT NULL REFERENCES app_user (id),
    assigned_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_manager_history_project_id ON project_manager_history (project_id);

CREATE TABLE due_date_history
(
    id            UUID        NOT NULL PRIMARY KEY,
    project_id    UUID        NOT NULL REFERENCES project (id) ON DELETE CASCADE,
    due_date      DATE        NOT NULL,
    changed_by_id UUID        NOT NULL REFERENCES app_user (id),
    changed_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_due_date_history_project_id ON due_date_history (project_id);

CREATE TABLE budget_line
(
    id             UUID           NOT NULL PRIMARY KEY,
    project_id     UUID           NOT NULL REFERENCES project (id) ON DELETE CASCADE,
    type           VARCHAR(50)    NOT NULL,
    amount         NUMERIC(19, 2) NOT NULL,
    date           DATE           NOT NULL,
    pord_reference VARCHAR(100),
    created_by_id  UUID           NOT NULL REFERENCES app_user (id),
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by_id  UUID REFERENCES app_user (id),
    updated_at     TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_budget_line_project_id ON budget_line (project_id);