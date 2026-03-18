-- Use case: UC-02

CREATE TABLE IF NOT EXISTS user_audit (
    id           UUID         PRIMARY KEY,
    action       TEXT         NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    target_user  VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    details      TEXT
);

-- Use case: multi-role support
-- Migrates single-role column to a separate join table app_user_roles

-- Create the roles join table
CREATE TABLE app_user_roles (
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- Migrate existing roles from the single-column to the join table
INSERT INTO app_user_roles (user_id, role)
SELECT id, role FROM app_user;

-- Remove the old role column
ALTER TABLE app_user DROP COLUMN role;