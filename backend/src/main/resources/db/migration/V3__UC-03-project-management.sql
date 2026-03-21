-- Use case: UC-03

CREATE TABLE project (
    id            UUID         PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    reference     VARCHAR(100) NOT NULL UNIQUE,
    sciforma_code VARCHAR(100) NOT NULL,
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
    id                UUID    PRIMARY KEY,
    project_id        UUID    NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    progression_value INTEGER NOT NULL CHECK (progression_value >= 0 AND progression_value <= 100),
    progression_date  DATE    NOT NULL,
    recorded_by       UUID    NOT NULL REFERENCES app_user(id),
    recorded_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_progression_project ON project_progression(project_id);