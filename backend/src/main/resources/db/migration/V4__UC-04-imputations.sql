-- Use case: UC-04

CREATE TABLE project_imputation (
    id               UUID           PRIMARY KEY,
    project_id       UUID           NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    imputation_date  DATE           NOT NULL,
    imputation_code  VARCHAR(100)   NOT NULL,
    task             TEXT           NOT NULL,
    person           VARCHAR(255)   NOT NULL,
    amount           NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    recorded_by      UUID           NOT NULL REFERENCES app_user(id),
    recorded_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_imputation_project ON project_imputation(project_id);
CREATE INDEX idx_imputation_date    ON project_imputation(project_id, imputation_date DESC);
