-- Use case: UC-02

CREATE TABLE IF NOT EXISTS user_audit (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action      TEXT NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    target_user  VARCHAR(100) NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    details      TEXT
);
